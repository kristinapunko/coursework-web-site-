# tours/urls.py
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    TourDescriptionListView, 
    TourDescriptionDetailView,
    TourDetailListView, 
    TourPhotoListView, 
    TourDetailView,
    TourDescriptionListView,
    ReviewListCreateAPIView,
    ReviewDetailAPIView,
    AgencyReviewList,
    AgencyReviewDetail,
    AgencyReviewDetailView,
    ReplyDetailView, 
    ReplyCreateView,
    ReplyListView
)

urlpatterns = [
    path('', TourDescriptionListView.as_view(), name='get_tours'), 
    path('<int:id>/', TourDescriptionDetailView.as_view(), name='get_tour_by_id'),
    path('tour_details/', TourDetailListView.as_view() , name='get_tour_details'),  
    path('tour_details/<int:tour>/', TourDetailView.as_view(), name='get_tour_details'),

    path('tours/<int:tour_id>/reviews/', ReviewListCreateAPIView.as_view(), name='review-list-create'),
    path('reviews/<int:id>/', ReviewDetailAPIView.as_view(), name='review-detail'),

    path('agency-reviews', AgencyReviewList.as_view(), name='agency-reviews'),
    path('agency-reviews/<int:review_id>/', AgencyReviewDetailView.as_view(), name='agency-review-detail'), 

    path('agency-reviews/<int:review_id>/reply/', ReplyDetailView.as_view(), name='reply-detail'),
    path('agency-reviews/<int:review_id>/reply/create/', ReplyCreateView.as_view(), name='reply-create'),
     path('tours/agency-reviews/replies/', ReplyListView.as_view(), name='reply-list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
