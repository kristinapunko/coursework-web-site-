from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import CustomUser

from .models import TourDescription, TourFeedback


def create_tour(name="Kyiv weekend"):
    return TourDescription.objects.create(
        name=name,
        countries="Ukraine",
        cities="Kyiv",
        start_date=date.today() + timedelta(days=30),
        end_date=date.today() + timedelta(days=35),
        departure_from="Lviv",
        departure_by="Bus",
        return_from="Kyiv",
        food="Breakfast",
        adults=1,
        children=0,
        price="1000.00",
    )


class TourAPITests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="reviewer", email="reviewer@example.com", password="Strong-pass-2026!"
        )
        self.tour_one = create_tour()
        self.tour_two = create_tour("Odesa weekend")
        TourFeedback.objects.create(
            user=self.user, tour=self.tour_one, rating=5, feedback="Excellent"
        )

    def test_review_batch_endpoint_filters_tour_ids(self):
        response = self.client.get(reverse("review-list"), {"tour_ids": self.tour_one.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["tour"], self.tour_one.id)

    def test_tour_responses_include_review_summary(self):
        second_user = CustomUser.objects.create_user(
            username="second-reviewer",
            email="second-reviewer@example.com",
            password="Strong-pass-2026!",
        )
        TourFeedback.objects.create(
            user=second_user, tour=self.tour_one, rating=3, feedback="Good"
        )

        list_response = self.client.get(reverse("tour-description-list"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        tour_data = next(
            tour for tour in list_response.data if tour["id"] == self.tour_one.id
        )
        self.assertEqual(tour_data["review_count"], 2)
        self.assertEqual(tour_data["average_rating"], 4.0)

        detail_response = self.client.get(
            reverse("tour-description-detail", kwargs={"id": self.tour_two.id})
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["review_count"], 0)
        self.assertIsNone(detail_response.data["average_rating"])

    def test_review_create_ignores_payload_user_and_tour(self):
        other_user = CustomUser.objects.create_user(
            username="other", email="other@example.com", password="Strong-pass-2026!"
        )
        self.client.force_authenticate(other_user)
        response = self.client.post(
            reverse("review-list-create", kwargs={"tour_id": self.tour_two.id}),
            {"rating": 4, "feedback": "Good", "tour": self.tour_one.id, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        review = TourFeedback.objects.get(pk=response.data["id"])
        self.assertEqual(review.user, other_user)
        self.assertEqual(review.tour, self.tour_two)

    def test_review_rating_is_limited_to_five(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            reverse("review-list-create", kwargs={"tour_id": self.tour_two.id}),
            {"rating": 6, "feedback": "Invalid"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
