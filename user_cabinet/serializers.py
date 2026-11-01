from rest_framework import serializers
from .models import  LikedTour, Booking

# class CartSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Cart
#         fields = '__all__'

# class CartItemSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CartItem
#         fields = '__all__'

class LikedTourSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikedTour
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    tour_name = serializers.ReadOnlyField(source='tour.name')  # Додаємо ім'я туру
    can_cancel = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'

    def get_can_cancel(self, obj):
        return obj.can_cancel()

# class OrderSerializer(serializers.ModelSerializer):
#     tour_name = serializers.ReadOnlyField(source='tour.name')

#     class Meta:
#         model = Order
#         fields = ['id', 'user', 'tour', 'tour_name', 'created_at', 'status']