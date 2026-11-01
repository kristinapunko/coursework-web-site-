# Інформаційна система туристичної агенції

Повноцінний вебзастосунок для пошуку турів, реєстрації користувачів, бронювання, відгуків, обраних пропозицій та онлайн-оплати через LiqPay.

**Поточний стан:** React SPA підключено до реального Django REST API; дані зберігаються у PostgreSQL або SQLite; автентифікація працює через JWT; для локальної розробки доступний трисервісний Docker Compose.

---

## Середовище та основні технології

| Рівень | Технології |
| --- | --- |
| Frontend | React 18, React Router 7, Redux Toolkit, Axios, Tailwind CSS, Vite 6 |
| Backend | Python 3.13, Django 5.1, Django REST Framework 3.15 |
| Автентифікація | Simple JWT: access/refresh токени та blacklist для виходу |
| Дані | PostgreSQL 17 у Docker; SQLite або PostgreSQL при нативному запуску |
| Платежі | LiqPay Checkout, підписані callback-запити та API перевірки статусу |
| Тестування | Django TestCase/DRF APITestCase, Vitest, Testing Library, ESLint |
| Інфраструктура | Docker, Docker Compose, окремі backend/frontend образи та volumes |

---

## Архітектура

Застосунок розділено на клієнтський, серверний та інфраструктурний рівні:

```text
Browser
  ↓
React pages and components
  ↓
Redux Toolkit slices and selectors
  ↓
Axios client + JWT Authorization header
  ↓
Django REST Framework views and serializers
  ↓
Django models and transaction rules
  ↓
PostgreSQL / SQLite

Django backend ──→ LiqPay status API
LiqPay server callback ──→ Django signed callback endpoint
```

### Frontend

* `site/src/pages/` — сторінки каталогу, туру, автентифікації, кабінету та відгуків.
* `site/src/components/` — повторно використовувані компоненти інтерфейсу й LiqPay-віджет.
* `site/src/features/` — Redux slices, async thunks, селектори, фільтри та правила бронювання.
* `site/src/api/client.js` — єдиний Axios-клієнт, додавання access-токена та автоматичне оновлення токена після `401`.

### Backend

* `accounts/` — користувачі, реєстрація, вхід, вихід та JWT.
* `tours/` — тури, деталі, фотографії, рейтинги, відгуки та відповіді адміністратора.
* `user_cabinet/` — обрані тури, бронювання, скасування та платежі.
* `core/` — налаштування Django, кореневі URL, CORS, база даних і LiqPay-конфігурація.

### Основні зв'язки даних

```text
CustomUser 1 ── * Booking * ── 1 TourDescription
Booking    1 ── 1 BookingPayment
CustomUser 1 ── * LikedTour * ── 1 TourDescription
TourDescription 1 ── 1 TourDetail 1 ── * TourPhoto
TourDescription 1 ── * TourFeedback * ── 1 CustomUser
CustomUser 1 ── * AgencyReview 1 ── * Reply
```

Бронювання має статус `pending`, `confirmed` або `canceled`. Активне бронювання користувача для одного туру є унікальним. Під час створення бронювання кількість доступних місць зменшується атомарно, а під час дозволеного скасування відновлюється.

### Docker Compose

| Сервіс | Призначення | Порт хоста | Постійні дані |
| --- | --- | --- | --- |
| `db` | PostgreSQL 17 із `pg_isready` healthcheck | не публікується | `postgres_data` |
| `backend` | Django dev server, автоматичні міграції | `8000` | `media_data` |
| `frontend` | Vite dev server із hot reload | `5173` | `frontend_node_modules` |

`backend` запускається лише після успішного healthcheck бази. Вихідний код монтується в контейнери, тому Django autoreloader і Vite hot reload реагують на локальні зміни.

---

## Запуск у Docker

### Вимоги

* Docker Desktop або Docker Engine;
* Docker Compose v2;
* запущений Docker Linux engine.

Якщо `.env` ще не існує, створіть його з прикладу:

```powershell
Copy-Item .env.example .env
```

Установіть власний `DJANGO_SECRET_KEY` і, за потреби, LiqPay-ключі. Значення PostgreSQL для локального Docker-середовища вже мають придатні для розробки defaults.

Побудова та запуск усіх сервісів:

```powershell
docker compose up --build
```

Після запуску доступні:

| Адреса | Призначення |
| --- | --- |
| `http://localhost:5173` | React frontend |
| `http://localhost:8000` | Django API |
| `http://localhost:8000/admin/` | Django admin |

Перевірка стану контейнерів:

```powershell
docker compose ps
docker compose exec db pg_isready -U tours -d tours
docker compose exec backend python manage.py check
```

Створення адміністратора:

```powershell
docker compose exec backend python manage.py createsuperuser
```

Перегляд логів:

```powershell
docker compose logs -f backend frontend db
```

Зупинення зі збереженням PostgreSQL і media:

```powershell
docker compose down
```

Повне видалення Docker-даних виконуйте лише тоді, коли вони більше не потрібні:

```powershell
docker compose down --volumes
```

---

## Нативний запуск без Docker

Нативний спосіб залишається повністю підтримуваною альтернативою. Якщо `DATABASE_URL` відсутній, Django використовує локальний `db.sqlite3`. Для PostgreSQL укажіть URL із `.env.example` і запустіть локальний сервер PostgreSQL.

### Backend

З кореня проєкту:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend буде доступний за адресою `http://127.0.0.1:8000`.

### Frontend

В окремому терміналі:

```powershell
cd site
npm install
npm run dev
```

Frontend буде доступний за адресою `http://localhost:5173`. URL API задається у `site/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Production-збірка frontend

```powershell
cd site
npm run build
npm run preview
```

Docker-конфігурація цього репозиторію призначена для розробки: backend використовує Django `runserver`, а frontend — Vite dev server. Для production потрібні окремі WSGI/ASGI-сервер, reverse proxy, production secrets і публічний HTTPS-домен.

---

## Змінні оточення

| Змінна | Призначення |
| --- | --- |
| `DJANGO_DEBUG` | Увімкнення режиму розробки |
| `DJANGO_SECRET_KEY` | Криптографічний ключ Django; не зберігати у Git |
| `DJANGO_ALLOWED_HOSTS` | Дозволені host names через кому |
| `DATABASE_URL` | PostgreSQL URL; якщо відсутній — використовується SQLite |
| `DB_SSLMODE` | Режим SSL для PostgreSQL |
| `POSTGRES_DB` | Назва Docker-бази |
| `POSTGRES_USER` | Користувач Docker-бази |
| `POSTGRES_PASSWORD` | Пароль Docker-бази |
| `CORS_ALLOWED_ORIGINS` | Дозволені frontend origins |
| `CSRF_TRUSTED_ORIGINS` | Довірені origins для CSRF |
| `VITE_API_URL` | Публічна адреса backend, яку використовує браузер |
| `LIQPAY_PUBLIC_KEY` | Публічний ключ LiqPay |
| `LIQPAY_PRIVATE_KEY` | Приватний ключ LiqPay; ніколи не передається frontend |
| `LIQPAY_SANDBOX` | Дозвіл тестового статусу `sandbox` |
| `LIQPAY_SERVER_URL` | Публічний HTTPS callback URL |
| `LIQPAY_RESULT_URL` | Сторінка повернення користувача після оплати |

Файл `.env` і всі похідні секретні файли ігноруються Git. Репозиторій містить лише `.env.example` без робочих секретів.

---

## Клієнтські маршрути

| Маршрут | Доступ | Призначення |
| --- | --- | --- |
| `/` | публічний | Головна сторінка та добірки турів |
| `/alltours` | публічний | Каталог, пошук, фільтри, сортування й пагінація |
| `/tour/:id` | публічний | Деталі туру, фотографії та відгуки |
| `/reviews` | публічний; створення після входу | Відгуки про агенцію |
| `/aboutus` | публічний | Інформація про агенцію |
| `/login` | публічний | Вхід |
| `/register` | публічний | Реєстрація |
| `/cabinet` | JWT | Кабінет користувача |
| `/cabinet/likedTours` | JWT | Обрані тури |
| `/cabinet/booking` | JWT | Бронювання, скасування та оплата |
| `*` | публічний | Сторінка 404 |

Захищені маршрути обгорнуті у `RequireAuth`. Якщо користувач не автентифікований, він перенаправляється на `/login` із запам'ятовуванням початкової адреси.

---

## REST API contract

### Загальні правила

* Локальний base URL: `http://127.0.0.1:8000`.
* Основний формат запитів і відповідей: `application/json`.
* Захищені endpoints очікують `Authorization: Bearer <access_token>`.
* Access token діє 15 хвилин, refresh token — 7 днів; refresh-токени обертаються та потрапляють у blacklist після заміни.
* Поля, позначені як серверні, ігноруються або відхиляються при спробі підміни клієнтом.
* Типові помилки DRF мають форму `{"field": ["message"]}` або `{"detail": "message"}`. Платіжні endpoints також можуть повертати `{"error": "message"}`.

### Автентифікація

| Метод | Endpoint | Доступ | Запит | Успішна відповідь |
| --- | --- | --- | --- | --- |
| `POST` | `/api/register/` | public | `username`, `email`, `password1`, `password2` | `201`; safe user fields і `token.access`, `token.refresh` |
| `POST` | `/api/login/` | public | `email`, `password` | `200`; user fields і пара JWT |
| `POST` | `/api/token/refresh/` | public | `refresh` | `200`; новий access та, при ротації, refresh |
| `POST` | `/api/logout/` | JWT | `refresh` | `205`; refresh token додано до blacklist |
| `GET` | `/api/user/` | JWT | — | `200`; `id`, `username`, `email`, `is_staff` |

Приклад входу:

```json
{
  "email": "customer@example.com",
  "password": "Strong-pass-2026!"
}
```

Скорочений приклад відповіді:

```json
{
  "id": 7,
  "username": "customer",
  "email": "customer@example.com",
  "is_staff": false,
  "token": {
    "access": "<jwt>",
    "refresh": "<jwt>"
  }
}
```

### Тури, фото та відгуки

| Метод | Endpoint | Доступ | Призначення |
| --- | --- | --- | --- |
| `GET` | `/tours/` | public | Список турів із `average_rating` і `review_count` |
| `GET` | `/tours/<id>/` | public | Один тур |
| `GET` | `/tours/tour-details/` | public | Усі деталі турів із вкладеними фото |
| `GET` | `/tours/tour-details/<tour_id>/` | public | Деталі конкретного туру |
| `GET` | `/tours/photos/` | public | Список фотографій |
| `GET` | `/tours/reviews/?tour_ids=1,2` | public | Batch-завантаження відгуків; `tour_ids` необов'язковий |
| `GET` | `/tours/<tour_id>/reviews/` | public | Відгуки конкретного туру |
| `POST` | `/tours/<tour_id>/reviews/` | JWT | Створення одного відгуку користувача для туру |
| `GET/PATCH/PUT/DELETE` | `/tours/reviews/<id>/` | read public; write owner | Перегляд або керування власним відгуком |
| `GET` | `/tours/agency-reviews/` | public | Список відгуків про агенцію |
| `POST` | `/tours/agency-reviews/` | JWT | Створення відгуку про агенцію |
| `GET/PATCH/PUT/DELETE` | `/tours/agency-reviews/<id>/` | read public; write owner | Перегляд або керування власним відгуком |
| `GET` | `/tours/agency-reviews/<id>/replies/` | public | Відповіді на відгук |
| `POST` | `/tours/agency-reviews/<id>/replies/create/` | admin | Відповідь адміністратора |
| `GET` | `/tours/agency-reviews/replies/` | public | Усі відповіді |

Основні поля туру:

```text
id, name, countries, cities, start_date, end_date,
departure_from, departure_by, return_from, food,
adults, children, price, promotion, price_promotion,
hot_deal, available_seats, average_rating, review_count
```

Рейтинг відгуку має бути цілим числом від 1 до 5. `user`, `tour` і `created_at` встановлюються сервером; клієнт не може призначити відгук іншому користувачу або туру.

### Кабінет і бронювання

| Метод | Endpoint | Доступ | Призначення |
| --- | --- | --- | --- |
| `POST` | `/cabinet/toggle-like/` | JWT | Додати або видалити тур з обраного; body: `{"tour": 1}` |
| `GET` | `/cabinet/liked-tours/` | JWT | Масив ID обраних турів |
| `GET` | `/cabinet/bookings/` | JWT | Бронювання поточного користувача |
| `POST` | `/cabinet/bookings/` | JWT | Створити бронювання |
| `GET` | `/cabinet/bookings/<id>/` | JWT owner | Отримати власне бронювання |
| `DELETE` | `/cabinet/bookings/<id>/` | JWT owner | Скасувати бронювання за правилами домену |

Приклад створення бронювання:

```json
{
  "tour": 12,
  "travel_start_date": "2026-12-10",
  "travel_end_date": "2026-12-17",
  "adults": 2,
  "children": 1,
  "contact_name": "Ірина Коваль",
  "contact_email": "iryna@example.com",
  "contact_phone": "+380501112233"
}
```

Сервер сам установлює `user`, `total_price`, `created_at` і початковий `status`. У відповіді поле `tour` є вкладеним скороченим об'єктом:

```json
{
  "id": 41,
  "tour": {
    "id": 12,
    "name": "Римські канікули",
    "start_date": "2026-12-10",
    "end_date": "2026-12-17",
    "image": "http://127.0.0.1:8000/media/example.jpg"
  },
  "tour_name": "Римські канікули",
  "total_price": "3000.00",
  "status": "pending",
  "can_cancel": true
}
```

Дата поїздки має входити у межі дат туру, кількість гостей не може перевищувати доступні місця, а номер телефону проходить серверну перевірку. Скасування дозволено не пізніше ніж за 14 днів до початку туру. `DELETE` виконує бізнес-скасування зі статусом `canceled`, а не фізичне видалення запису.

### LiqPay payment contract

| Метод | Endpoint | Доступ | Призначення |
| --- | --- | --- | --- |
| `GET` | `/cabinet/api/pay-liqpay/<booking_id>/` | JWT owner | Створити підписані `data` і `signature` для віджета |
| `POST` | `/cabinet/api/pay-liqpay/<booking_id>/confirm/` | JWT owner | Підтвердити успіх віджета через LiqPay status API |
| `POST` | `/cabinet/api/liqpay-callback/` | signed public callback | Серверний callback від LiqPay |
| `GET` | `/cabinet/api/payments/<payment_id>/status/` | JWT owner | Поточний стан платежу |

Локальний widget flow:

```text
Frontend requests signed checkout data
  ↓
LiqPay widget reports success or sandbox
  ↓
Frontend posts checkout data/signature and widget result
  ↓
Backend verifies signature, user, order_id and amount
  ↓
Backend independently requests current status from LiqPay
  ↓
BookingPayment.is_paid = true
BookingPayment.liqpay_status = "success"
Booking.status = "confirmed"
  ↓
Frontend reloads the booking list
```

Скорочений confirmation request:

```json
{
  "data": "<base64 checkout payload>",
  "signature": "<merchant signature>",
  "status": "sandbox",
  "order_id": "booking-41",
  "payment_id": "123456",
  "amount": "3000.00"
}
```

Backend не довіряє лише browser status: перед оновленням моделей він повторно перевіряє `order_id`, суму та фінальний статус у LiqPay. Оновлення `BookingPayment` і `Booking` виконується у транзакції з блокуванням payment row.

`LIQPAY_SERVER_URL` має бути публічною HTTPS-адресою. LiqPay не може звернутися до `localhost`; для повного callback flow потрібен deployment або HTTPS tunnel. Локальне підтвердження через віджет працює завдяки вихідному status-запиту backend до LiqPay.

### Коди стану

| Код | Значення у цьому API |
| --- | --- |
| `200/201` | Успішне читання або створення |
| `205` | Успішний logout |
| `400` | Некоректні поля, підпис, сума або order ID |
| `401` | Відсутній чи недійсний JWT |
| `403` | Недостатньо прав, наприклад відповідь не адміністратора |
| `404` | Ресурс відсутній або не належить користувачу |
| `409` | Конфлікт стану: скасоване бронювання або платіж ще не підтверджено |
| `502` | Не вдалося перевірити статус у LiqPay |
| `503` | LiqPay-ключі не налаштовані |

---

## Тестування

Остання повна перевірка: **2026-11-01**.

| Перевірка | Команда | Результат |
| --- | --- | --- |
| Django/DRF suite | `python manage.py test` | **19/19 passed** |
| React/Vitest suite | `npm run test:run` у `site/` | **29/29 passed**, 9 test files |
| Frontend lint | `npm run lint` у `site/` | **passed** |
| Frontend production build | `npm run build` у `site/` | **passed** |
| Compose schema | `docker compose config --quiet` | **passed**, 3 services і 3 volumes |

Для тестів backend без локального PostgreSQL у PowerShell можна тимчасово примусово використати SQLite:

```powershell
$env:DATABASE_URL=''
python manage.py test
```

Запуск frontend-перевірок:

```powershell
cd site
npm run test:run
npm run lint
npm run build
```

Backend-тести перевіряють:

* вимоги до паролів і безпечну JWT-відповідь;
* захист user endpoint;
* рейтинг, batch-запити та власника відгуку;
* серверне призначення власника і статусу бронювання;
* атомарне резервування та відновлення місць;
* вкладені дані туру та наявність media-файлів;
* LiqPay signature, amount/order validation, callback і widget confirmation;
* відмову від оновлення моделей, якщо LiqPay ще не підтвердив платіж.

Frontend-тести перевіряють:

* валідацію форми бронювання і стан автентифікації;
* фільтри, URL-параметри, сортування та пагінацію;
* Redux selectors і async state;
* правила 14-денного скасування;
* недоступність LiqPay, запуск віджета, confirmation POST і оновлення бронювань.

Процент coverage окремо не заявляється, оскільки coverage-звіт у поточному test script не генерується.

---

## Структура документації

Детальна документація, побудована за структурою `travel-agency`, розташована у каталозі `docs`:

### [`docs/project-plan.md`](docs/project-plan.md)

Описує проблему предметної області, ролі, сутності, функціональні та нефункціональні вимоги, користувацькі сценарії, бізнес-інваріанти, критерії приймання, ризики й подальші етапи.

### [`docs/component-architecture.md`](docs/component-architecture.md)

Описує frontend composition tree, карту Redux/local/URL state, event contracts, backend layers, transaction boundaries, API security boundary, LiqPay sequence, Docker runtime і тестову архітектуру.

Кореневий `README.md` залишається основним operational документом: setup, маршрути, повний REST API contract і актуальні результати тестів.

---

## Структура проєкту

```text
.
├── accounts/                 # користувачі та JWT endpoints
├── core/                     # Django settings і root URLs
├── tours/                    # тури, фото та відгуки
├── user_cabinet/             # обране, бронювання та платежі
├── site/                     # React/Vite frontend
│   └── src/
│       ├── api/
│       ├── components/
│       ├── features/
│       ├── layout/
│       └── pages/
├── docs/
│   ├── project-plan.md
│   └── component-architecture.md
├── docker/
│   └── backend-entrypoint.sh
├── compose.yaml
├── Dockerfile.backend
├── Dockerfile.frontend
├── manage.py
└── requirements.txt
```

---

## Поточний функціонал

* реєстрація, вхід, оновлення токена та logout;
* публічний каталог турів із фільтрами, сортуванням і пагінацією;
* сторінка деталей туру, програма, фото та рейтинги;
* відгуки про тури й агенцію з owner permissions;
* відповіді адміністратора на відгуки;
* обрані тури;
* створення і контроль доступності бронювань;
* скасування з 14-денним правилом;
* LiqPay sandbox/production checkout contract;
* негайне оновлення UI після підтвердження платежу;
* Docker Compose середовище з PostgreSQL і hot reload;
* автоматизовані backend та frontend тести.

---

## Обмеження поточної версії

* Docker stack є development-конфігурацією, а не production deployment.
* `server_url` LiqPay не працює через localhost без публічного HTTPS tunnel.
* Docker volumes і нативні `db.sqlite3`/`media` є окремими сховищами та не синхронізуються автоматично.
* OpenAPI/Swagger schema поки не генерується; актуальний ручний контракт наведено в цьому README.
* Реальні LiqPay credentials і production secrets повинні зберігатися лише у захищеному середовищі deployment-платформи.
