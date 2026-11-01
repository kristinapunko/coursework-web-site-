from django.urls import path
from .views import  ToggleLikeView, LikedToursListView, BookingViewSet, LiqPayButtonView, LiqPayCallbackView, LiqPayConfirmView, PaymentStatusView
from . import views

urlpatterns = [
    # path('cart/', CartCreateView.as_view(), name='cart-create'),
    # path('cart-item/', CartItemCreateView.as_view(), name='cart-item-create'),
    # path('cart-item/<int:pk>/', CartItemDeleteView.as_view(), name='cart-item-delete'),
    
    path('toggle-like/', ToggleLikeView.as_view(), name='toggle-like'),
    path('liked-tours/', LikedToursListView.as_view(), name='liked-tours-list'),

    path('bookings/', BookingViewSet.as_view({'get': 'list', 'post': 'create'}), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='booking-detail'),
    
    # path('orders/', OrderViewSet.as_view({'get': 'list'}), name='order-list'),
    # path('orders/<int:pk>/', OrderViewSet.as_view({'get': 'retrieve'}), name='order-detail'),

    # path('api/pay-liqpay/<int:booking_id>/', views.generate_liqpay_button, name='liqpay-button'),
    # path('api/liqpay-callback/', views.liqpay_callback, name='liqpay-callback'),
    # path('api/payments/<int:payment_id>/status/', views.payment_status, name='payment-status'), 

    path('api/pay-liqpay/<int:booking_id>/', LiqPayButtonView.as_view(), name='liqpay-button'),
    path('api/pay-liqpay/<int:booking_id>/confirm/', LiqPayConfirmView.as_view(), name='liqpay-confirm'),
    path('api/liqpay-callback/', LiqPayCallbackView.as_view(), name='liqpay-callback'),
    path('api/payments/<int:payment_id>/status/', PaymentStatusView.as_view(), name='payment-status'), 
]
