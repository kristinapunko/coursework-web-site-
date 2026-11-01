from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from rest_framework import generics, permissions, serializers

from .models import AgencyReview, Reply, TourDescription, TourDetail, TourFeedback, TourPhoto
from .serializers import (
    AgencyReviewSerializer,
    ReplySerializer,
    TourDescriptionSerializer,
    TourDetailSerializer,
    TourPhotoSerializer,
    TourReviewSerializer,
)


TOURS_WITH_REVIEW_SUMMARY = TourDescription.objects.annotate(
    average_rating=Avg("reviews__rating"),
    review_count=Count("reviews", distinct=True),
)


class TourDescriptionListView(generics.ListAPIView):
    queryset = TOURS_WITH_REVIEW_SUMMARY.order_by("start_date", "id")
    serializer_class = TourDescriptionSerializer


class TourDescriptionDetailView(generics.RetrieveAPIView):
    queryset = TOURS_WITH_REVIEW_SUMMARY
    serializer_class = TourDescriptionSerializer
    lookup_field = "id"


class TourDetailListView(generics.ListAPIView):
    queryset = TourDetail.objects.select_related("tour").prefetch_related("photos")
    serializer_class = TourDetailSerializer


class TourDetailView(generics.RetrieveAPIView):
    queryset = TourDetail.objects.select_related("tour").prefetch_related("photos")
    serializer_class = TourDetailSerializer
    lookup_field = "tour"


class TourPhotoListView(generics.ListAPIView):
    queryset = TourPhoto.objects.select_related("tour_detail", "tour_detail__tour")
    serializer_class = TourPhotoSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS or obj.user_id == request.user.id


class ReviewListAPIView(generics.ListAPIView):
    """Return reviews in one request, optionally restricted with ?tour_ids=1,2,3."""

    serializer_class = TourReviewSerializer

    def get_queryset(self):
        queryset = TourFeedback.objects.select_related("user", "tour").order_by("-created_at")
        raw_ids = self.request.query_params.get("tour_ids", "")
        if not raw_ids:
            return queryset
        try:
            tour_ids = {int(value) for value in raw_ids.split(",") if value.strip()}
        except ValueError:
            return queryset.none()
        return queryset.filter(tour_id__in=tour_ids)


class ReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TourReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return TourFeedback.objects.select_related("user", "tour").filter(
            tour_id=self.kwargs["tour_id"]
        ).order_by("-created_at")

    def perform_create(self, serializer):
        tour = get_object_or_404(TourDescription, id=self.kwargs["tour_id"])
        if TourFeedback.objects.filter(user=self.request.user, tour=tour).exists():
            raise serializers.ValidationError(
                {"detail": "You have already reviewed this tour."}
            )
        serializer.save(user=self.request.user, tour=tour)


class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TourFeedback.objects.select_related("user", "tour")
    serializer_class = TourReviewSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = "id"


class AgencyReviewList(generics.ListCreateAPIView):
    queryset = AgencyReview.objects.select_related("user").order_by("-created_at")
    serializer_class = AgencyReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AgencyReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AgencyReview.objects.select_related("user")
    serializer_class = AgencyReviewSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_url_kwarg = "review_id"


class ReplyDetailView(generics.ListAPIView):
    serializer_class = ReplySerializer

    def get_queryset(self):
        return Reply.objects.select_related("user", "review").filter(
            review_id=self.kwargs["review_id"]
        )


class ReplyCreateView(generics.CreateAPIView):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        review = get_object_or_404(AgencyReview, id=self.kwargs["review_id"])
        serializer.save(review=review, user=self.request.user)


class ReplyListView(generics.ListAPIView):
    serializer_class = ReplySerializer
    queryset = Reply.objects.select_related("user", "review").order_by("created_at")
