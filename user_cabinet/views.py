import base64
import hashlib
import hmac
import json
import logging
from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from tours.models import TourDescription

from .models import Booking, BookingPayment, LikedTour
from .serializers import BookingSerializer, LikedTourSerializer

logger = logging.getLogger(__name__)


def liqpay_signature(data):
    private_key = settings.LIQPAY_PRIVATE_KEY.strip()
    payload = f"{private_key}{data}{private_key}"
    return base64.b64encode(hashlib.sha1(payload.encode("utf-8")).digest()).decode("ascii")


def is_public_liqpay_url(value):
    """Only send URLs that LiqPay can reach and validate."""
    if not value:
        return False

    parsed = urlparse(value.strip())
    hostname = (parsed.hostname or "").lower()
    return (
        parsed.scheme == "https"
        and bool(hostname)
        and hostname not in {"localhost", "127.0.0.1", "0.0.0.0"}
        and not hostname.endswith(".localhost")
        and hostname != "example.com"
        and not hostname.endswith(".example.com")
    )


class ToggleLikeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        tour_id = request.data.get("tour")
        if not tour_id:
            return Response({"tour": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        tour = get_object_or_404(TourDescription, id=tour_id)
        liked_tour = LikedTour.objects.filter(user=request.user, tour=tour).first()
        if liked_tour:
            liked_tour.delete()
            return Response({"status": "unliked"})

        try:
            LikedTour.objects.create(user=request.user, tour=tour)
        except IntegrityError:
            return Response({"status": "liked"})
        return Response({"status": "liked"}, status=status.HTTP_201_CREATED)


class LikedToursListView(generics.ListAPIView):
    serializer_class = LikedTourSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LikedTour.objects.filter(user=self.request.user).select_related("tour")

    def list(self, request, *args, **kwargs):
        tour_ids = self.get_queryset().values_list("tour_id", flat=True)
        return Response(list(tour_ids))


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("tour")
            .prefetch_related("tour__details__photos")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"detail": exc.messages}) from exc
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"detail": "You already have an active booking for this tour."}
            ) from exc

    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.cancel_booking():
            return Response({"message": "Booking canceled."}, status=status.HTTP_200_OK)
        return Response(
            {"error": "Booking can no longer be canceled."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LiqPayButtonView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        if not all([settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY]):
            return Response(
                {"error": "Payment provider is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        booking = get_object_or_404(
            Booking.objects.select_related("tour"), pk=booking_id, user=request.user
        )
        if booking.status == "canceled":
            return Response({"error": "Canceled bookings cannot be paid."}, status=409)

        payment, _ = BookingPayment.objects.get_or_create(
            booking=booking, defaults={"amount": booking.total_price}
        )
        params = {
            "action": "pay",
            "amount": f"{payment.amount:.2f}",
            "currency": "UAH",
            "description": f"Payment for booking #{booking.id}",
            "order_id": f"booking-{booking.id}",
            "version": "3",
            "sandbox": "1" if settings.LIQPAY_SANDBOX else "0",
            "public_key": settings.LIQPAY_PUBLIC_KEY.strip(),
        }
        if is_public_liqpay_url(settings.LIQPAY_SERVER_URL):
            params["server_url"] = settings.LIQPAY_SERVER_URL.strip()
        if is_public_liqpay_url(settings.LIQPAY_RESULT_URL):
            params["result_url"] = settings.LIQPAY_RESULT_URL.strip()
        payload_json = json.dumps(params, separators=(",", ":"), ensure_ascii=False)
        if settings.DEBUG:
            # Temporary sandbox diagnostic. The private key is never included here.
            print(f"LiqPay payment payload: {payload_json}")
        data = base64.b64encode(
            payload_json.encode("utf-8")
        ).decode("ascii")
        return Response({"data": data, "signature": liqpay_signature(data)})


class LiqPayCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data.get("data")
        signature = request.data.get("signature")
        if not data or not signature:
            return Response(
                {"error": "Missing data or signature."}, status=status.HTTP_400_BAD_REQUEST
            )
        if not settings.LIQPAY_PRIVATE_KEY:
            return Response(
                {"error": "Payment provider is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if not hmac.compare_digest(signature, liqpay_signature(data)):
            return Response({"error": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_data = json.loads(base64.b64decode(data, validate=True).decode("utf-8"))
            order_id = decoded_data["order_id"]
            callback_amount = Decimal(str(decoded_data["amount"]))
        except (KeyError, ValueError, TypeError, InvalidOperation, json.JSONDecodeError):
            return Response({"error": "Invalid callback payload."}, status=status.HTTP_400_BAD_REQUEST)

        if not order_id.startswith("booking-"):
            return Response({"error": "Invalid order ID."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            booking_id = int(order_id.removeprefix("booking-"))
        except ValueError:
            return Response({"error": "Invalid order ID."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            payment = (
                BookingPayment.objects.select_for_update()
                .select_related("booking")
                .filter(booking_id=booking_id)
                .first()
            )
            if not payment:
                return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)
            if callback_amount != payment.amount:
                return Response({"error": "Payment amount mismatch."}, status=status.HTTP_400_BAD_REQUEST)

            payment_status = str(decoded_data.get("status", "")).lower()
            successful_statuses = {"success"}
            if settings.LIQPAY_SANDBOX:
                successful_statuses.add("sandbox")

            payment.liqpay_status = payment_status
            payment.liqpay_payment_id = decoded_data.get("payment_id")
            payment.liqpay_order_id = order_id
            if payment_status in successful_statuses:
                payment.is_paid = True
                Booking.objects.filter(pk=payment.booking_id, status="pending").update(
                    status="confirmed"
                )
            payment.save(
                update_fields=[
                    "liqpay_status",
                    "liqpay_payment_id",
                    "liqpay_order_id",
                    "is_paid",
                ]
            )

        return Response({"status": "ok"})


class PaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_id):
        payment = get_object_or_404(
            BookingPayment.objects.select_related("booking"),
            pk=payment_id,
            booking__user=request.user,
        )
        return Response(
            {
                "is_paid": payment.is_paid,
                "status": payment.liqpay_status,
                "amount": str(payment.amount),
                "booking_id": payment.booking_id,
            }
        )
