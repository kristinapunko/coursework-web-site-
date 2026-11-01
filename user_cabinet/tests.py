import base64
import hashlib
import json
import tempfile
from decimal import Decimal
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser
from tours.models import TourDetail, TourPhoto
from tours.tests import create_tour

from .models import Booking, BookingPayment
from .views import liqpay_signature


class BookingAPITests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="customer", email="customer@example.com", password="Strong-pass-2026!"
        )
        self.other_user = CustomUser.objects.create_user(
            username="other", email="other-booker@example.com", password="Strong-pass-2026!"
        )
        self.tour = create_tour()
        self.client.force_authenticate(self.user)

    def booking_payload(self, **overrides):
        payload = {
            "tour": self.tour.id,
            "travel_start_date": self.tour.start_date.isoformat(),
            "travel_end_date": self.tour.end_date.isoformat(),
            "adults": 1,
            "children": 0,
            "contact_name": "Customer",
            "contact_email": "customer@example.com",
            "contact_phone": "+380501112233",
        }
        payload.update(overrides)
        return payload

    def create_booking(self, **overrides):
        values = {
            "user": self.user,
            "tour": self.tour,
            "travel_start_date": self.tour.start_date,
            "travel_end_date": self.tour.end_date,
            "contact_name": "Customer",
            "contact_email": "customer@example.com",
            "contact_phone": "+380501112233",
        }
        values.update(overrides)
        return Booking.objects.create(**values)

    def test_client_cannot_set_booking_owner_or_status(self):
        response = self.client.post(
            reverse("booking-list-create"),
            self.booking_payload(user=self.other_user.id, status="confirmed"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get(pk=response.data["id"])
        self.assertEqual(booking.user, self.user)
        self.assertEqual(booking.status, "pending")
        self.assertEqual(booking.total_price, Decimal("1000.00"))
        self.tour.refresh_from_db()
        self.assertEqual(self.tour.available_seats, 9)

    def test_booking_response_contains_nested_tour_date_and_image(self):
        detail = TourDetail.objects.create(
            tour=self.tour,
            program="Day 1",
            services=[],
            noservices=[],
        )
        with tempfile.TemporaryDirectory() as media_root, self.settings(MEDIA_ROOT=media_root):
            photo = TourPhoto.objects.create(
                tour_detail=detail,
                image=SimpleUploadedFile(
                    "test-tour.jpg", b"test-image-content", content_type="image/jpeg"
                ),
            )
            booking = self.create_booking()
            response = self.client.get(reverse("booking-list-create"))

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            booking_data = next(item for item in response.data if item["id"] == booking.id)
            self.assertEqual(booking_data["tour"]["id"], self.tour.id)
            self.assertEqual(
                booking_data["tour"]["start_date"], self.tour.start_date.isoformat()
            )
            self.assertTrue(
                booking_data["tour"]["image"].endswith(f"/media/{photo.image.name}")
            )

            photo.image.name = "76.jpg"
            photo.save(update_fields=["image"])
            missing_image_response = self.client.get(reverse("booking-list-create"))
            self.assertIsNone(missing_image_response.data[0]["tour"]["image"])

    def test_saving_pending_booking_again_does_not_reserve_another_seat(self):
        booking = self.create_booking()
        booking.save()
        self.tour.refresh_from_db()
        self.assertEqual(self.tour.available_seats, 9)

    def test_cancel_is_idempotent_and_restores_one_seat(self):
        booking = self.create_booking()
        self.assertTrue(booking.cancel_booking())
        self.assertTrue(booking.cancel_booking())
        self.tour.refresh_from_db()
        self.assertEqual(self.tour.available_seats, 10)

    def test_booking_fails_when_no_seats_remain(self):
        self.tour.available_seats = 0
        self.tour.save(update_fields=["available_seats"])
        response = self.client.post(
            reverse("booking-list-create"), self.booking_payload(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    LIQPAY_PUBLIC_KEY="sandbox_i23808240640",
    LIQPAY_PRIVATE_KEY="sandbox_DsFsyNgCKv9OtRRwpz64rnUasbrLceMORcIQkyHD",
    LIQPAY_SANDBOX=True,
    LIQPAY_SERVER_URL="https://api.example.com/cabinet/api/liqpay-callback/",
)
class LiqPayCallbackTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="payer", email="payer@example.com", password="Strong-pass-2026!"
        )
        self.tour = create_tour()
        self.booking = Booking.objects.create(
            user=self.user,
            tour=self.tour,
            travel_start_date=self.tour.start_date,
            travel_end_date=self.tour.end_date,
            contact_name="Payer",
            contact_email="payer@example.com",
            contact_phone="+380501112233",
        )
        self.payment = BookingPayment.objects.create(
            booking=self.booking, amount=self.booking.total_price
        )

    def callback_data(self, amount="1000.00"):
        payload = {
            "order_id": f"booking-{self.booking.id}",
            "payment_id": "payment-123",
            "status": "sandbox",
            "amount": amount,
        }
        return base64.b64encode(json.dumps(payload).encode()).decode()

    def checkout_data(self, amount="1000.00"):
        payload = {
            "action": "pay",
            "version": "3",
            "public_key": settings.LIQPAY_PUBLIC_KEY,
            "order_id": f"booking-{self.booking.id}",
            "amount": amount,
            "currency": "UAH",
        }
        return base64.b64encode(json.dumps(payload).encode()).decode()

    def test_checkout_payload_uses_sandbox_key_and_valid_signature(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(
            reverse("liqpay-button", kwargs={"booking_id": self.booking.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        encoded_data = response.data["data"]
        payload = json.loads(base64.b64decode(encoded_data).decode("utf-8"))
        self.assertEqual(payload["sandbox"], "1")
        self.assertEqual(payload["public_key"], "sandbox_i23808240640")
        self.assertNotIn("server_url", payload)
        self.assertNotIn("result_url", payload)

        private_key = settings.LIQPAY_PRIVATE_KEY.strip()
        expected_signature = base64.b64encode(
            hashlib.sha1(
                f"{private_key}{encoded_data}{private_key}".encode("utf-8")
            ).digest()
        ).decode("ascii")
        self.assertEqual(response.data["signature"], expected_signature)

    @override_settings(LIQPAY_PRIVATE_KEY="  sandbox-private-key  ")
    def test_signature_strips_private_key_whitespace(self):
        data = "encoded-data"
        expected = base64.b64encode(
            hashlib.sha1(
                f"sandbox-private-key{data}sandbox-private-key".encode("utf-8")
            ).digest()
        ).decode("ascii")

        self.assertEqual(liqpay_signature(data), expected)

    def test_callback_rejects_forged_signature(self):
        response = self.client.post(
            reverse("liqpay-callback"),
            {"data": self.callback_data(), "signature": "forged"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.payment.refresh_from_db()
        self.assertFalse(self.payment.is_paid)

    def test_callback_rejects_amount_mismatch(self):
        data = self.callback_data("1.00")
        response = self.client.post(
            reverse("liqpay-callback"),
            {"data": data, "signature": liqpay_signature(data)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_callback_confirms_booking(self):
        data = self.callback_data()
        response = self.client.post(
            reverse("liqpay-callback"),
            {"data": data, "signature": liqpay_signature(data)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.payment.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertTrue(self.payment.is_paid)
        self.assertEqual(self.payment.liqpay_status, "success")
        self.assertEqual(self.booking.status, "confirmed")

    @patch("user_cabinet.views.fetch_liqpay_payment_status")
    def test_widget_confirmation_verifies_with_liqpay_and_confirms_booking(
        self, fetch_status
    ):
        self.client.force_authenticate(self.user)
        fetch_status.return_value = {
            "order_id": f"booking-{self.booking.id}",
            "payment_id": "payment-123",
            "public_key": settings.LIQPAY_PUBLIC_KEY,
            "status": "sandbox",
            "amount": "1000.00",
        }
        data = self.checkout_data()

        response = self.client.post(
            reverse("liqpay-confirm", kwargs={"booking_id": self.booking.id}),
            {
                "data": data,
                "signature": liqpay_signature(data),
                "status": "sandbox",
                "order_id": f"booking-{self.booking.id}",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        fetch_status.assert_called_once_with(f"booking-{self.booking.id}")
        self.payment.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertTrue(self.payment.is_paid)
        self.assertEqual(self.payment.liqpay_status, "success")
        self.assertEqual(self.booking.status, "confirmed")

    @patch("user_cabinet.views.fetch_liqpay_payment_status")
    def test_widget_confirmation_rejects_unconfirmed_provider_status(self, fetch_status):
        self.client.force_authenticate(self.user)
        fetch_status.return_value = {
            "order_id": f"booking-{self.booking.id}",
            "public_key": settings.LIQPAY_PUBLIC_KEY,
            "status": "processing",
            "amount": "1000.00",
        }
        data = self.checkout_data()

        response = self.client.post(
            reverse("liqpay-confirm", kwargs={"booking_id": self.booking.id}),
            {
                "data": data,
                "signature": liqpay_signature(data),
                "status": "sandbox",
                "order_id": f"booking-{self.booking.id}",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.payment.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertFalse(self.payment.is_paid)
        self.assertEqual(self.booking.status, "pending")
