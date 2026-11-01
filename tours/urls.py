from django.urls import path

from .views import (
    AgencyReviewDetailView,
    AgencyReviewList,
    ReplyCreateView,
    ReplyDetailView,
    ReplyListView,
    ReviewDetailAPIView,
    ReviewListAPIView,
    ReviewListCreateAPIView,
    TourDescriptionDetailView,
    TourDescriptionListView,
    TourDetailListView,
    TourDetailView,
    TourPhotoListView,
)

urlpatterns = [
    path("", TourDescriptionListView.as_view(), name="tour-description-list"),
    path("<int:id>/", TourDescriptionDetailView.as_view(), name="tour-description-detail"),
    path("tour-details/", TourDetailListView.as_view(), name="tour-detail-list"),
    path("tour-details/<int:tour>/", TourDetailView.as_view(), name="tour-detail"),
    path("photos/", TourPhotoListView.as_view(), name="tour-photo-list"),
    path("reviews/", ReviewListAPIView.as_view(), name="review-list"),
    path("<int:tour_id>/reviews/", ReviewListCreateAPIView.as_view(), name="review-list-create"),
    path("reviews/<int:id>/", ReviewDetailAPIView.as_view(), name="review-detail"),
    path("agency-reviews/", AgencyReviewList.as_view(), name="agency-reviews"),
    path(
        "agency-reviews/<int:review_id>/",
        AgencyReviewDetailView.as_view(),
        name="agency-review-detail",
    ),
    path(
        "agency-reviews/<int:review_id>/replies/",
        ReplyDetailView.as_view(),
        name="reply-detail",
    ),
    path(
        "agency-reviews/<int:review_id>/replies/create/",
        ReplyCreateView.as_view(),
        name="reply-create",
    ),
    path("agency-reviews/replies/", ReplyListView.as_view(), name="reply-list"),
]
