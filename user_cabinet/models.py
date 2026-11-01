from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.models import CustomUser  
from tours.models import TourDescription 

# class Cart(models.Model):
#     user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='cart')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"Cart of {self.user.email}"

# class CartItem(models.Model):
#     cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
#     tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE)
#     added_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField(default=timezone.now() + timedelta(days=30))

#     class Meta:
#         unique_together = ('cart', 'tour')
#         ordering = ['-added_at']

class LikedTour(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='liked_tours')
    tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'tour'], name='unique_liked_tour')
        ]

class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Очікує підтвердження"),
        ("confirmed", "Підтверджено"),
        ("canceled", "Скасовано"),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="bookings")
    tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE, related_name="bookings")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # class Meta:
    #     unique_together = ("user", "tour")  # Один юзер не може бронювати один тур двічі

    def can_cancel(self):
        """Перевіряє, чи можна скасувати бронювання (не пізніше ніж за 2 тижні до туру)"""
        return (self.tour.start_date - timezone.now().date()) >= timedelta(days=14)

    def cancel_booking(self):
        """Скасовує бронювання, якщо це дозволено"""
        if self.can_cancel():
            self.status = "canceled"
            self.tour.available_seats += 1  # Повертаємо місце
            self.tour.save()
            self.save()
            return True
        return False

    def save(self, *args, **kwargs):
        """Перед збереженням бронювання перевіряємо, чи є місця"""
        if self.status == "pending":
            if self.tour.available_seats > 0:
                self.tour.available_seats -= 1  # Бронюємо місце
                self.tour.save()
            else:
                raise ValueError("Немає вільних місць на цей тур")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.id} - {self.status} ({self.user.email})"

# class Order(models.Model):
#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="orders")
#     tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE, related_name="orders")
#     created_at = models.DateTimeField(auto_now_add=True)
#     status = models.CharField(max_length=20, default="paid")  # Завжди "оплачене"
#     payment_id = models.CharField(max_length=100, blank=True, null=True)  # Ідентифікатор платежу Fondy

#     def confirm_booking(self):
#         """Підтверджує бронювання після оплати"""
#         if self.status == "pending":
#             self.status = "confirmed"
#             self.save()
#             return True
#         return False

#     def save(self, *args, **kwargs):
#         """Перед збереженням замовлення перевіряємо, чи є місця"""
#         if self._state.adding:  # тільки при створенні нового запису
#             if self.tour.available_seats > 0:
#                 self.tour.available_seats -= 1  # бронюємо місце
#                 self.tour.save()
#             else:
#                 raise ValueError("Немає вільних місць на цей тур")
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"Order {self.id} - {self.tour.name} ({self.user.email})"
    

# class BookingPayment(models.Model):
#     booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     is_paid = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def mark_as_paid(self):
#         self.is_paid = True
#         self.booking.status = "confirmed"
#         self.booking.save()
#         self.save()

#     def __str__(self):
#         return f"Оплата {self.id} для бронювання {self.booking.id}"

class BookingPayment(models.Model):
    booking = models.OneToOneField(
        Booking, 
        on_delete=models.CASCADE, 
        related_name="payment",
        null=True,  # Дозволити null для випадків без бронювання
        blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    liqpay_order_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    liqpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    liqpay_status = models.CharField(max_length=50, null=True, blank=True)
