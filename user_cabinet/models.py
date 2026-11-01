from datetime import timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.db.models import F, Q
from django.utils import timezone

from accounts.models import CustomUser
from tours.models import TourDescription


class LikedTour(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="liked_tours")
    tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "tour"], name="unique_liked_tour")
        ]


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending confirmation"),
        ("confirmed", "Confirmed"),
        ("canceled", "Canceled"),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="bookings")
    tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE, related_name="bookings")
    travel_start_date = models.DateField()
    travel_end_date = models.DateField()
    adults = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    children = models.PositiveIntegerField(default=0)
    contact_name = models.CharField(max_length=150)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "tour"],
                condition=~Q(status="canceled"),
                name="unique_active_booking",
            )
        ]

    def can_cancel(self):
        return self.status != "canceled" and (
            self.tour.start_date - timezone.now().date()
        ) >= timedelta(days=14)

    @property
    def guest_count(self):
        return self.adults + self.children

    def cancel_booking(self):
        with transaction.atomic():
            booking = Booking.objects.select_for_update().select_related("tour").get(pk=self.pk)
            if booking.status == "canceled":
                self.status = "canceled"
                return True
            if not booking.can_cancel():
                return False

            TourDescription.objects.filter(pk=booking.tour_id).update(
                available_seats=F("available_seats") + booking.guest_count
            )
            Booking.objects.filter(pk=booking.pk).update(status="canceled")
            self.status = "canceled"
            return True

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self._state.adding and self.status != "canceled":
                if not self.total_price:
                    self.total_price = (
                        self.tour.price_promotion if self.tour.promotion else self.tour.price
                    )
                updated = TourDescription.objects.filter(
                    pk=self.tour_id, available_seats__gte=self.guest_count
                ).update(available_seats=F("available_seats") - self.guest_count)
                if not updated:
                    raise ValidationError("No seats are available for this tour.")
            super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.id} - {self.status} ({self.user.email})"


class BookingPayment(models.Model):
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="payment"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    liqpay_order_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    liqpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    liqpay_status = models.CharField(max_length=50, null=True, blank=True)
