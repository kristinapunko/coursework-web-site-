from rest_framework import generics, permissions, status, viewsets, serializers
from rest_framework.response import Response
from .models import  LikedTour, Booking, BookingPayment
from .serializers import  LikedTourSerializer, BookingSerializer
from tours.models import TourDescription
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
import logging, hashlib, json, base64
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.decorators import method_decorator

logger = logging.getLogger(__name__)


# class CartCreateView(generics.CreateAPIView):
#     serializer_class = CartSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         serializer.save(user=self.request.user)

# class CartItemCreateView(generics.CreateAPIView):
#     serializer_class = CartItemSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         cart, created = Cart.objects.get_or_create(user=self.request.user)
#         serializer.save(cart=cart)
# class CartItemDeleteView(generics.DestroyAPIView):
#     serializer_class = CartItemSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         return CartItem.objects.filter(cart__user=self.request.user)

class ToggleLikeView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        logger.info(f"ToggleLike request from user: {request.user.email}")
        logger.info(f"Request data: {request.data}")
        
        try:
            tour_id = request.data.get('tour')
            if not tour_id:
                logger.error("No tour ID provided")
                return Response(
                    {'error': 'Tour ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            tour = get_object_or_404(TourDescription, id=tour_id)
            logger.info(f"Found tour: {tour.id} - {tour.name}")
            
            liked_tour = LikedTour.objects.filter(
                user=request.user,
                tour=tour
            ).first()
            
            if liked_tour:
                liked_tour.delete()
                logger.info("Like removed")
                return Response({'status': 'unliked'})
            else:
                LikedTour.objects.create(user=request.user, tour=tour)
                logger.info("Like added")
                return Response({'status': 'liked'})
                
        except Exception as e:
            logger.error(f"Error in ToggleLikeView: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LikedToursListView(generics.ListAPIView):
    serializer_class = LikedTourSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return LikedTour.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        tour_ids = queryset.values_list('tour__id', flat=True)
        return Response(list(tour_ids))

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        logger.info(f"Request user: {self.request.user}")
        bookings = Booking.objects.filter(user=self.request.user)
        logger.info(f"Bookings found: {bookings.count()}")
        return bookings

    def perform_create(self, serializer):
        logger.info(f"Request user: {self.request.user}")
        logger.info(f"Headers: {self.request.headers}")
        logger.info(f"Request data: {self.request.data}") 
        tour_id = self.request.data.get('tour')
        if Booking.objects.filter(user=self.request.user, tour_id=tour_id).exists():
            raise serializers.ValidationError({"detail": "Ви вже забронювали цей тур"})
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.can_cancel():
            booking.cancel_booking()
            return Response({"message": "Бронювання скасовано"}, status=status.HTTP_200_OK)
        return Response({"error": "Скасувати бронювання вже не можна"}, status=status.HTTP_400_BAD_REQUEST)


class LiqPayButtonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
            payment, created = BookingPayment.objects.get_or_create(
                booking=booking,
                defaults={'amount': booking.tour.price}
            )

            params = {
            "action": "pay",
            "amount": f"{float(payment.amount):.2f}", 
            "currency": "UAH",
            "description": f"Оплата за бронювання туру №{booking.id}",
            "order_id": f"booking-{booking.id}",
            "version": "3",
            "sandbox": 1,
            "server_url": "https://8feb-213-109-233-8.ngrok-free.app/cabinet/api/liqpay-callback/",
            "result_url": "http://localhost:5173/",
            "public_key": settings.LIQPAY_PUBLIC_KEY
        }

            data = base64.b64encode(json.dumps(params).encode('utf-8')).decode('utf-8')
            private_key = settings.LIQPAY_PRIVATE_KEY
            sign_string = private_key + data + private_key
            signature = base64.b64encode(hashlib.sha1(sign_string.encode('utf-8')).digest()).decode('utf-8')

            return Response({
                "data": data,
                "signature": signature,
                "public_key": settings.LIQPAY_PUBLIC_KEY
            })

        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or access denied"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"LiqPayButtonView error: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class LiqPayCallbackView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        data = request.POST.get('data')
        signature = request.POST.get('signature')

        logger.info(f"LiqPay Callback data={data}, signature={signature}")

        if not data:
            return Response({"error": "Missing data"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_json = base64.b64decode(data).decode('utf-8')
            decoded_data = json.loads(decoded_json)

            order_id = decoded_data.get("order_id")
            payment_id = decoded_data.get("payment_id")
            status_payment = decoded_data.get("status", "").lower()
            amount = decoded_data.get("amount")

            if order_id and order_id.startswith("booking-"):
                booking_id = int(order_id.split('-')[1])
                payment = BookingPayment.objects.filter(booking_id=booking_id).first()
            else:
                payment = BookingPayment.objects.filter(
                    Q(liqpay_order_id=order_id) | Q(liqpay_payment_id=payment_id)
                ).first()

            if not payment:
                return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

            payment.liqpay_status = status_payment
            payment.liqpay_payment_id = payment_id
            payment.liqpay_order_id = order_id

            if status_payment in ("success", "sandbox"):
                payment.is_paid = True
                if payment.booking:
                    payment.booking.status = "confirmed"
                    payment.booking.save()

            payment.save()

        except Exception as e:
            logger.error(f"LiqPay callback processing error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "ok"})


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = BookingPayment.objects.get(pk=payment_id, booking__user=request.user)
            return Response({
                'is_paid': payment.is_paid,
                'status': payment.liqpay_status,
                'amount': str(payment.amount),
                'booking_id': payment.booking.id if payment.booking else None
            })
        except BookingPayment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
