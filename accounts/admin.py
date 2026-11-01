from django.contrib import admin
from .models import CustomUser
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.contrib.auth.admin import UserAdmin

@admin.register(CustomUser)
class CustomAdminUser(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    model = CustomUser

from django.contrib import admin
from tours.models import TourDescription, TourDetail, TourPhoto, TourFeedback,AgencyReview, Reply


class TourPhotoInline(admin.TabularInline):
    model = TourPhoto
    extra = 1


class TourDetailInline(admin.StackedInline):
    model = TourDetail
    extra = 1


@admin.register(TourDescription)
class TourDescriptionAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'countries', 'start_date', 'end_date', 'promotion', 'hot_deal')
    search_fields = ('name', 'countries', 'cities')
    inlines = [TourDetailInline]


@admin.register(TourDetail)
class TourDetailAdmin(admin.ModelAdmin):
    list_display = ('tour', 'festivals', 'beach_tour', 'winter_tour', 'extreme_tour', 'natural_tour', 'gastronomic_tour')
    inlines = [TourPhotoInline]


@admin.register(TourPhoto)
class TourPhotoAdmin(admin.ModelAdmin):
    list_display = ('tour_detail', 'image')

@admin.register(TourFeedback)
class TourFeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'tour', 'rating', 'created_at')
    search_fields = ('user__username', 'tour__name')
    list_filter = ('rating', 'created_at')


@admin.register(AgencyReview)
class AgencyReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('rating', 'created_at')


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ('review', 'user', 'created_at')
    search_fields = ('review__user__username', 'user__username')
    list_filter = ('created_at',)

from user_cabinet.models import LikedTour, Booking, BookingPayment


@admin.register(LikedTour)
class LikedTourAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tour')
    search_fields = ('user__email', 'tour__name')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'tour', 'status', 'created_at')
    search_fields = ('user__email', 'tour__name')
    list_filter = ('status', 'created_at')

@admin.register(BookingPayment)
class BookingPaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'is_paid', 'liqpay_status')
    search_fields = ('booking__user__email',)
    list_filter = ('is_paid', 'liqpay_status')