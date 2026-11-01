from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from accounts.models import CustomUser


class TourDescription(models.Model):
    name = models.CharField(max_length=255)
    countries = models.CharField(max_length=255)
    cities = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    departure_from = models.CharField(max_length=100)
    departure_by = models.CharField(max_length=100)
    return_from = models.CharField(max_length=100)
    food = models.CharField(max_length=100)
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    promotion = models.BooleanField(default=False)
    price_promotion = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hot_deal = models.BooleanField(default=False)
    available_seats = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.name


class TourDetail(models.Model):
    tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE, related_name="details")
    program = models.TextField()
    services = models.JSONField(default=list)
    noservices = models.JSONField(default=list)
    festivals = models.BooleanField(default=False)
    beach_tour = models.BooleanField(default=False)
    winter_tour = models.BooleanField(default=False)
    extreme_tour = models.BooleanField(default=False)
    natural_tour = models.BooleanField(default=False)
    gastronomic_tour = models.BooleanField(default=False)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["tour"], name="unique_tour_detail")]

    def __str__(self):
        return f"Details for {self.tour.name}"


class TourPhoto(models.Model):
    tour_detail = models.ForeignKey(TourDetail, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField()

    def __str__(self):
        return f"Photo for {self.tour_detail.tour.name}"


class TourFeedback(models.Model):
    tour = models.ForeignKey(TourDescription, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="tour_reviews")
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tour", "user"], name="unique_tour_review_per_user"
            )
        ]

    def __str__(self):
        return f"Review for {self.tour.name} by {self.user.username}"


class AgencyReview(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="agency_reviews")
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    pros = models.TextField(blank=True)
    cons = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agency review by {self.user.username}"


class Reply(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="agency_replies")
    review = models.ForeignKey(AgencyReview, related_name="replies", on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
