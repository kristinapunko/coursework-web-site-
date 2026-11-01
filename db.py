import django
import os
from django.utils import timezone
from datetime import timedelta
from tours.models import TourDescription, TourDetail

# Налаштування Django (якщо запускаєш окремий скрипт)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
django.setup()

# Додаємо тур
tour1 = TourDescription.objects.create(
    name="Європейський тур",
    countries="Франція, Німеччина, Італія",
    cities="Париж, Берлін, Рим",
    start_date=timezone.now().date() + timedelta(days=10),
    end_date=timezone.now().date() + timedelta(days=20),
    departure_from="Київ",
    departure_by="Літак",
    return_from="Рим",
    food="Сніданки",
    price=1500.00,
    promotion=True,
    hot_deal=False,
    description="Незабутній тур по Європі з відвідуванням найкращих міст."
)

# Додаємо деталі туру
TourDetail.objects.create(
    tour=tour1,
    program="День 1: Париж - Ейфелева вежа. День 2: Берлін - Бранденбурзькі ворота. День 3: Рим - Колізей.",
    price=1500.00,
    services="Готель, Трансфер, Харчування",
    photo="tour_photos/europe.jpg",
    daily_program="План на кожен день розписаний детально.",
    number_of_places=30,
    is_thematic=True,
    festivals=True,
    beach_tour=False,
    winter_tour=False
)

print("✅ Мінімальні дані успішно додані!")
