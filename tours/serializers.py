from rest_framework import serializers

from .models import AgencyReview, Reply, TourDescription, TourDetail, TourFeedback, TourPhoto


def existing_image_url(image, context=None):
    if not image or not image.name:
        return None

    try:
        if not image.storage.exists(image.name):
            return None
        image_url = image.url
    except (OSError, ValueError):
        return None

    request = (context or {}).get("request")
    return request.build_absolute_uri(image_url) if request else image_url


class TourDescriptionSerializer(serializers.ModelSerializer):
    average_rating = serializers.FloatField(read_only=True, allow_null=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = TourDescription
        fields = [
            "id",
            "name",
            "countries",
            "cities",
            "start_date",
            "end_date",
            "departure_from",
            "departure_by",
            "return_from",
            "food",
            "adults",
            "children",
            "price",
            "promotion",
            "price_promotion",
            "hot_deal",
            "available_seats",
            "average_rating",
            "review_count",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date must not be before start date."})

        promotion = attrs.get("promotion", getattr(self.instance, "promotion", False))
        promotional_price = attrs.get(
            "price_promotion", getattr(self.instance, "price_promotion", 0)
        )
        regular_price = attrs.get("price", getattr(self.instance, "price", None))
        if promotion and promotional_price <= 0:
            raise serializers.ValidationError(
                {"price_promotion": "A promotion must have a positive promotional price."}
            )
        if promotion and regular_price is not None and promotional_price >= regular_price:
            raise serializers.ValidationError(
                {"price_promotion": "Promotional price must be lower than the regular price."}
            )
        return attrs


class TourPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TourPhoto
        fields = ["id", "image"]

    def get_image(self, obj):
        return existing_image_url(obj.image, self.context)


class TourDetailSerializer(serializers.ModelSerializer):
    photos = TourPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = TourDetail
        fields = "__all__"


class TourReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = TourFeedback
        fields = "__all__"
        read_only_fields = ["user", "tour", "created_at"]


class AgencyReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = AgencyReview
        fields = "__all__"
        read_only_fields = ["user", "created_at"]


class ReplySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Reply
        fields = "__all__"
        read_only_fields = ["user", "review", "created_at"]
