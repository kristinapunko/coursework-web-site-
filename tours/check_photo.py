import os

photo_path = "media/tour1"  # Шлях до зображення
if os.path.exists(photo_path):
    print("Фото доступне")
else:
    print("Фото не знайдено")
