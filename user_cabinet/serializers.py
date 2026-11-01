from rest_framework import serializers
from tours.serializers import existing_image_url

from .models import Booking, LikedTour


class BookingTourSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    start_date = serializers.DateField(read_only=True)
    end_date = serializers.DateField(read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        detail = next(iter(obj.details.all()), None)
        photo = next(iter(detail.photos.all()), None) if detail else None
        return existing_image_url(photo.image, self.context) if photo else None

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
        fields = ('id', 'tour', 'liked_at')
        read_only_fields = ('id', 'liked_at')

class BookingSerializer(serializers.ModelSerializer):
    tour_name = serializers.ReadOnlyField(source='tour.name')  # Додаємо ім'я туру
    can_cancel = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            'id', 'user', 'tour', 'tour_name', 'travel_start_date', 'travel_end_date',
            'adults', 'children', 'contact_name', 'contact_email', 'contact_phone',
            'total_price', 'created_at', 'status', 'can_cancel',
        )
        read_only_fields = ('id', 'user', 'tour_name', 'total_price', 'created_at', 'status', 'can_cancel')

    def validate_contact_phone(self, value):
        normalized = value.strip()
        allowed = set('+0123456789()- ')
        digits = sum(character.isdigit() for character in normalized)
        if not normalized or any(character not in allowed for character in normalized) or digits < 7:
            raise serializers.ValidationError('Enter a valid phone number.')
        return normalized

    def validate(self, attrs):
        tour = attrs.get('tour', getattr(self.instance, 'tour', None))
        start_date = attrs.get('travel_start_date')
        end_date = attrs.get('travel_end_date')
        adults = attrs.get('adults', 1)
        children = attrs.get('children', 0)

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'travel_end_date': 'End date must not be before start date.'
            })
        if tour and start_date and start_date < tour.start_date:
            raise serializers.ValidationError({
                'travel_start_date': 'Start date must be within the selected tour dates.'
            })
        if tour and end_date and end_date > tour.end_date:
            raise serializers.ValidationError({
                'travel_end_date': 'End date must be within the selected tour dates.'
            })
        if tour and adults + children > tour.available_seats:
            raise serializers.ValidationError({
                'guests': 'Not enough seats are available for this booking.'
            })
        return attrs

    def get_can_cancel(self, obj):
        return obj.can_cancel()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tour'] = BookingTourSerializer(
            instance.tour, context=self.context
        ).data
        return representation

# class OrderSerializer(serializers.ModelSerializer):
#     tour_name = serializers.ReadOnlyField(source='tour.name')

#     class Meta:
#         model = Order
#         fields = ['id', 'user', 'tour', 'tour_name', 'created_at', 'status']
