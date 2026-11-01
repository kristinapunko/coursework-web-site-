# Компонентна архітектура інформаційної системи туристичної агенції

## 1. Опис архітектури

Проєкт використовує багаторівневу client-server архітектуру з одностороннім потоком даних на frontend і явним REST-контрактом між React та Django.

```text
Presentation layer
React pages, layouts, reusable components
        ↓ events / props
Application state
Redux Toolkit slices, thunks, selectors, URL search params
        ↓ HTTP through one Axios client
API layer
Django URLs, DRF views, serializers, permissions
        ↓ validated commands and queries
Domain/data layer
Django models, constraints, transactions, PostgreSQL/SQLite
        ↓ external verification
LiqPay API
```

Основний принцип: UI не приймає остаточних рішень щодо власності, місць або оплати. Frontend покращує UX, але критичні інваріанти повторно перевіряє backend.

---

## 2. Файлова структура

```text
.
├── accounts/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests.py
├── core/
│   ├── settings.py
│   └── urls.py
├── tours/
├── user_cabinet/
├── site/
│   └── src/
│       ├── api/
│       ├── components/
│       │   ├── tour-details/
│       │   ├── tours/
│       │   └── ui/
│       ├── features/
│       │   ├── authentication/
│       │   ├── tours/
│       │   └── сabinet/
│       ├── layout/
│       ├── pages/
│       └── App.jsx
├── docs/
├── docker/
├── compose.yaml
├── Dockerfile.backend
└── Dockerfile.frontend
```

### Призначення основних директорій

| Директорія | Відповідальність |
| --- | --- |
| `accounts` | Identity, JWT lifecycle і current-user endpoint |
| `tours` | Каталог, detail/media read models, review permissions |
| `user_cabinet` | User-scoped state: likes, bookings, payments |
| `core` | Composition root Django і environment configuration |
| `site/src/api` | HTTP boundary frontend |
| `site/src/features` | Redux domain state, async operations, selectors |
| `site/src/components` | Повторно використовувані presentation components |
| `site/src/pages` | Route-level orchestration |

---

## 3. Дерево клієнтської композиції

```text
App
└── RouterProvider
    ├── RootLayout
    │   ├── Home
    │   │   ├── Slides
    │   │   ├── Filters
    │   │   ├── TourList
    │   │   └── thematic/popular sections
    │   ├── AllTours
    │   ├── TourDescription
    │   │   ├── TourSummary
    │   │   ├── BookingForm
    │   │   ├── BookingConfirmation
    │   │   └── Reviews
    │   ├── AgencyReviews
    │   ├── AboutusPage
    │   └── RequireAuth
    │       └── CabinetLayout
    │           ├── Cabinet / liked tours
    │           └── Booking
    │               └── LiqPayButton
    ├── AuthLayout
    │   ├── Login
    │   └── Register
    └── NotFound
```

Route-level сторінки координують data loading і mutation callbacks. Дрібні компоненти отримують мінімальні props і не знають URL backend.

---

## 4. Карта стану frontend

| Стан | Власник | Джерело | Основні споживачі |
| --- | --- | --- | --- |
| Auth user/tokens/status | `authentication/authSlice` + localStorage | `/api/*` | `App`, `RequireAuth`, auth pages |
| Tours collection | `tours/toursSlice` | `/tours/` | Home, filters, `AllTours` |
| Tour detail | `tourDetailsSlice` | `/tours/tour-details/*` | `TourDescription` |
| Tour reviews | `reviewsSlice` | `/tours/*/reviews/` | Tour page |
| Agency reviews | `agencyReviewSlice` | `/tours/agency-reviews/` | Reviews page |
| Bookings | `сabinet/bookingSlice` | `/cabinet/bookings/` | Booking page |
| Liked tour IDs | `сabinet/likedToursSlice` | `/cabinet/liked-tours/` | Cabinet and tour actions |
| Filter/sort/page | URL search params + selectors | Browser URL | Filters and catalog controls |
| Form draft/errors | Local component state | User input | Booking and auth forms |
| Widget open/confirm state | `LiqPayButton` local state | LiqPay events | Payment button feedback |

### Derived state

Фільтрований і пагінований каталог не копіюється в окремий mutable state. Typed URL parameters і tour collection передаються selectors, які обчислюють:

* відповідність destination/date/capacity/price filters;
* promotional effective price;
* thematic subset;
* sort order;
* page count і безпечний current page.

Це усуває розсинхронізацію між URL, filter controls і відображеним списком.

---

## 5. Контракти подій frontend

### `dispatch(fetchBookings())`

* Відправник: route `Booking` після входу або завершення оплати.
* Власник стану: `bookingSlice`.
* Ефект: `GET /cabinet/bookings/`, заміна user-scoped collection.

### `dispatch(sendBookingRequest({ tourId, bookingData }))`

* Відправник: `TourDescription` після успішної form validation.
* Ефект: `POST /cabinet/bookings/`.
* Результат: booking confirmation у UI та додавання запису до Redux state.

### `dispatch(cancelBooking(bookingId))`

* Відправник: Booking card після client-side 14-day check і `confirm`.
* Backend authority: повторно перевіряє правило та ownership.
* Результат: локальний status змінюється на `canceled` лише після успішної відповіді.

### `onPaymentComplete()`

* Відправник: `LiqPayButton` після успішного confirmation POST.
* Одержувач: route `Booking`.
* Ефект: повторний `fetchBookings()`, щоб UI отримав серверний `confirmed` status.

### Axios token refresh

1. Request interceptor додає access token.
2. Response interceptor перехоплює перший `401`, крім auth endpoints.
3. Один shared `refreshRequest` запобігає паралельним refresh calls.
4. Оригінальний request повторюється з новим access token.
5. Невдалий refresh очищає localStorage.

---

## 6. Архітектура backend

Кожен Django domain app використовує однаковий pipeline:

```text
URL pattern
  ↓
DRF view / viewset
  ↓ permissions + user-scoped queryset
Serializer
  ↓ validation + representation
Model / transaction service logic
  ↓
Database
```

### Межі відповідальності

| Рівень | Виконує | Не виконує |
| --- | --- | --- |
| URL | Маршрутизація і path params | Бізнес-логіка |
| View | Permissions, queryset scope, orchestration, HTTP status | UI formatting |
| Serializer | Field validation, read/write contract, nested representation | Зберігання secrets |
| Model | Інваріанти стану й atomic seat updates | HTTP responses |
| Settings | Environment parsing та integration config | Domain mutations |

### User-scoped querysets

Bookings і payments завжди фільтруються через `request.user`. Відсутність чужого запису повертає `404`, не розкриваючи факт його існування.

### Booking transaction

Під час створення booking model атомарно виконує conditional update:

```text
UPDATE tour
SET available_seats = available_seats - guest_count
WHERE id = tour_id AND available_seats >= guest_count
```

Якщо жоден рядок не оновлено, створення припиняється. Це захищає від overbooking за конкурентних запитів краще, ніж окрема read-then-write перевірка.

Під час скасування booking і tour блокуються/оновлюються у транзакції. Повторний виклик є idempotent.

---

## 7. API та security boundary

Повний HTTP contract розташовано в [`README.md`](../README.md#rest-api-contract).

Архітектурні правила API:

1. Frontend передає JWT у Bearer header, а не через query string.
2. Passwords є write-only і не повертаються serializer-ом.
3. `user`, booking `status`, price і timestamps є read-only/server-owned.
4. Owner permissions застосовуються і до queryset, і до object mutation.
5. Auth endpoints мають scoped throttling.
6. CORS origins задаються environment variables.
7. Private LiqPay key ніколи не потрапляє до frontend payload.

---

## 8. Архітектура платежу

### Server callback path

```text
LiqPay
  └── POST data + signature
      └── LiqPayCallbackView
          ├── recompute and constant-time compare signature
          ├── decode payload
          ├── validate order ID and amount
          └── atomic payment + booking update
```

### Local widget confirmation path

```text
LiqPayButton callback
  └── POST signed checkout data + widget result + JWT
      └── LiqPayConfirmView
          ├── authenticate booking owner
          ├── verify checkout signature/order/amount
          ├── POST signed status request to LiqPay API
          ├── verify provider order/amount/status
          └── select_for_update + atomic state transition
```

Widget status використовується як trigger, але не є доказом платежу. Остаточне рішення приймається лише після відповіді LiqPay або валідного signed server callback.

---

## 9. Docker runtime architecture

```text
Host browser
  ├── 127.0.0.1:5173 → frontend container
  └── 127.0.0.1:8000 → backend container

backend container
  └── db:5432 → PostgreSQL container

Volumes
  ├── postgres_data → /var/lib/postgresql/data
  ├── media_data → /app/media
  └── frontend_node_modules → /app/node_modules
```

Startup order:

1. PostgreSQL initializes its persistent directory.
2. `pg_isready` changes service state to healthy.
3. Backend entrypoint runs `python manage.py migrate --noinput`.
4. Django dev server starts with autoreload.
5. Vite starts independently with bind-mounted source and polling.

Root `.env` is used for Compose interpolation. Container-level `DATABASE_URL` intentionally points to hostname `db`, so a native `localhost` database URL cannot accidentally override the Docker connection.

---

## 10. Тестова архітектура

### Backend

DRF `APITestCase` перевіряє HTTP contract разом із database effects. LiqPay network status виклики mock-уються, але signature, order, amount і transaction behavior залишаються реальними.

### Frontend

Vitest і Testing Library тестують поведінку через доступний UI. API client та LiqPay SDK замінюються контрольованими mocks, що дозволяє перевірити payload і callback orchestration.

### Межі

* Unit/integration suites не замінюють end-to-end тест із реальним браузером і sandbox LiqPay.
* Docker image build та runtime smoke test мають виконуватися із запущеним Docker engine.
* Поточні результати й команди наведено в [`README.md`](../README.md#тестування).

---

## 11. Основні архітектурні рішення

1. **Redux Toolkit замість глобального Context.** Доменів і async transitions достатньо багато, тому slices забезпечують явну ізоляцію й тестованість.
2. **URL як джерело стану каталогу.** Фільтри можна копіювати, відновлювати після refresh і використовувати з browser navigation.
3. **Один Axios client.** Base URL, auth header і refresh behavior не дублюються в компонентах.
4. **Server authority.** UI validation не є security boundary.
5. **Atomic domain mutations.** Seat inventory і payment transitions захищені database transactions.
6. **Розділення public callback та authenticated confirmation.** Production і localhost flows мають різні trust boundaries.
7. **Development Compose без прихованої production claim.** Hot reload і runserver оптимізовані для розроблення; production deployment документовано як окремий етап.

---

## 12. Напрями розвитку

* OpenAPI schema та generated client types;
* end-to-end тести Playwright;
* background task для reconciliation незавершених payment statuses;
* production Docker targets, Gunicorn/Uvicorn і Nginx;
* CI pipeline для tests, lint, build і container scan;
* structured logging і monitoring;
* accessibility audit та performance budgets.
