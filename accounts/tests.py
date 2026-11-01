from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser


class AuthenticationAPITests(APITestCase):
    def test_registration_rejects_weak_password(self):
        response = self.client.post(
            reverse("register-user"),
            {
                "username": "traveler",
                "email": "traveler@example.com",
                "password1": "12345678",
                "password2": "12345678",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(CustomUser.objects.filter(email="traveler@example.com").exists())

    def test_registration_returns_tokens_and_safe_user_data(self):
        response = self.client.post(
            reverse("register-user"),
            {
                "username": "traveler",
                "email": "traveler@example.com",
                "password1": "Strong-pass-2026!",
                "password2": "Strong-pass-2026!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data["token"])
        self.assertNotIn("password1", response.data)
        self.assertFalse(response.data["is_staff"])

    def test_user_endpoint_requires_authentication(self):
        response = self.client.get(reverse("user-info"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
