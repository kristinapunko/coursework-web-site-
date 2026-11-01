from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import TourDescription, TourDetail, TourPhoto, TourFeedback, TourDescription
from .serializers import TourDescriptionSerializer, TourDetailSerializer, AgencyReviewSerializer, ReplySerializer, TourReviewSerializer, TourPhotoSerializer
from rest_framework import serializers, status
from .models import TourDetail, TourPhoto, AgencyReview, Reply
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.views import APIView

class TourDescriptionListView(generics.ListAPIView):
    queryset = TourDescription.objects.all()
    serializer_class = TourDescriptionSerializer

class TourDetailListView(generics.ListAPIView):
    queryset = TourDetail.objects.all()
    serializer_class = TourDetailSerializer

class TourPhotoListView(generics.ListAPIView):
    queryset = TourPhoto.objects.all()
    serializer_class = TourPhotoSerializer

class TourDetailView(generics.RetrieveAPIView):
    queryset = TourDetail.objects.all()
    serializer_class = TourDetailSerializer
    lookup_field = 'tour'

class TourDescriptionDetailView(generics.RetrieveAPIView):
    queryset = TourDescription.objects.all()
    serializer_class = TourDescriptionSerializer
    lookup_field = 'id'

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class ReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TourReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        tour_id = self.kwargs['tour_id']
        return TourFeedback.objects.filter(tour_id=tour_id).order_by('-created_at')

    def perform_create(self, serializer):
        tour = get_object_or_404(TourDescription, id=self.kwargs['tour_id'])
        serializer.save(user=self.request.user, tour=tour)

class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TourReviewSerializer
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        return TourFeedback.objects.all()
    

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        # if not serializer.is_valid():
        #     print(serializer.errors)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    

class AgencyReviewList(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        queryset = AgencyReview.objects.all().order_by('-created_at')
        serializer = AgencyReviewSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AgencyReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyReviewDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def put(self, request, review_id):
        try:
            review = AgencyReview.objects.get(pk=review_id)
        except AgencyReview.DoesNotExist:
            return Response({"error": "AgencyReview not found"}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializer = AgencyReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, review_id):
        try:
            review = AgencyReview.objects.get(pk=review_id)
        except AgencyReview.DoesNotExist:
            return Response({"error": "AgencyReview not found"}, status=status.HTTP_404_NOT_FOUND)

        if review.user != request.user:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        review.delete()
        return Response({"message": "AgencyReview deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class AgencyReviewDetail(generics.RetrieveAPIView):
    queryset = AgencyReview.objects.all()
    serializer_class = AgencyReviewSerializer
    lookup_field = 'review_id' 


class ReplyDetailView(generics.RetrieveAPIView):
    serializer_class = ReplySerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        review_id = self.kwargs['review_id']
        return get_object_or_404(Reply, review_id=review_id)

class ReplyCreateView(generics.CreateAPIView):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        review = get_object_or_404(AgencyReview, id=self.kwargs['review_id'])
        serializer.save(review=review, user=self.request.user)


class ReplyListView(generics.ListAPIView):
    serializer_class = ReplySerializer

    def get_queryset(self):
        review_id = self.kwargs.get('review_id')
        if review_id is not None:
            return Reply.objects.filter(review_id=review_id)
        return Reply.objects.all()