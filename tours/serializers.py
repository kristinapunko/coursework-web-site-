from rest_framework import serializers
from .models import TourDescription, TourDetail, TourPhoto, TourFeedback, AgencyReview, Reply

class TourDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourDescription
        fields = '__all__'  

class TourPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourPhoto
        fields = ['id', 'image']

class TourDetailSerializer(serializers.ModelSerializer):
    photos = TourPhotoSerializer(many=True, read_only=True)  
    class Meta:
        model = TourDetail
        fields = '__all__'

class TourReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')  
    class Meta:
        model = TourFeedback
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class AgencyReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')  
    class Meta:
        model = AgencyReview
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class ReplySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Reply
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class ReplySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Reply
        fields = '__all__'