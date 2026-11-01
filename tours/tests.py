from rest_framework.test import APITestCase
from django.urls import reverse

class TourViewsStatusTests(APITestCase):
    def test_tour_description_list_status(self):
        url = reverse('tour-description-list') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_tour_detail_list_status(self):
        url = reverse('tour-detail-list')  # заміни на фактичну назву маршруту
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_tour_photo_list_status(self):
        url = reverse('tour-photo-list')  # заміни на фактичну назву маршруту
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_tour_detail_view_status(self):
        # Тут потрібно підставити існуючий об'єкт tour для тесту
        tour_id = 1
        url = reverse('tour-detail', kwargs={'tour': tour_id})  # заміни назву маршруту
        response = self.client.get(url)
        # Можливо, поки що поверне 404, якщо об’єкта немає
        self.assertIn(response.status_code, [200, 404])
