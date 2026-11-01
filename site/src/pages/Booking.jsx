import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelBooking, fetchBookings } from '../features/сabinet/bookingSlice';
import { fetchTours } from '../features/tours/toursSlice';
import { fetchTourDetails } from '../features/tours/tourDetailsSlice';
import { formatDate } from '../utils/utils';
import { Link } from 'react-router-dom';
import { HiCalendarDateRange } from "react-icons/hi2";
import { FiArrowRight, FiClock, FiImage } from "react-icons/fi";
import LiqPayButton from '../components/LiqPayButton';
import Loading from '../components/ui/Loading';

const Booking = () => {
    const dispatch = useDispatch();
    const bookings = useSelector((state) => state.booking.bookingStatus);
    const tours = useSelector((state) => state.tours.tours);
    const tourDetails = useSelector((state) => state.tourDetails.tourDetails);
    const userId = useSelector((state) => state.auth.user?.id);
    const loading = useSelector((state) => state.booking.loading);
    const error = useSelector((state) => state.booking.error);
    const [daysLeftMap, setDaysLeftMap] = useState({});

    useEffect(() => {
        if (userId) {
            dispatch(fetchBookings());
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (bookings.length > 0) {
            dispatch(fetchTours());
            dispatch(fetchTourDetails());
        }
    }, [dispatch, bookings]);

    useEffect(() => {
        if (bookings.length > 0) {
            const newDaysLeftMap = {};
            bookings.forEach((booking) => {
                const tour = tours.find((t) => t.id === booking.tour) || null;
                if (tour && tour.start_date) {
                    const today = new Date();
                    const tourDate = new Date(tour.start_date);
                    const timeDiff = tourDate - today;
                    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    newDaysLeftMap[booking.id] = daysDiff;
                }
            });
            setDaysLeftMap(newDaysLeftMap);
            
        }
    }, [bookings, tours]);

    const handleCancelBooking = (bookingId) => {
        const daysLeft = daysLeftMap[bookingId];
        if (daysLeft === undefined) {
            alert("Інформація про дату туру ще завантажується. Спробуйте ще раз.");
            return;
        }
        if (daysLeft < 14) {
            alert("Скасування неможливе менш ніж за 14 днів до початку туру.");
            return;
        }
        const isSure = confirm("Ви впевнені що хочите скасувати тур? Йобо буде неможливо відновити.");
        if (isSure) {
            dispatch(cancelBooking(bookingId))
                .unwrap()
                .catch((err) => {
                    console.error('Помилка при скасуванні:', err);
                });
        }

    };

    if (loading) return <Loading />;
    if (error) return <p>{error?.message || "Something went wrong"}</p>;

    if (!bookings || bookings.length === 0) {
        return (
            <div className="flex mx-auto bg-[#f1e8e6] w-[80%] rounded-2xl items-center justify-center h-60 mb-4">
                <div className="text-[#543c52] text-2xl font-medium">
                    У вас немає заброньованих турів
                </div>
            </div>
        );
    }


    return (
        <div className="container max-w-8xl mx-auto my-6 px-4">
            <h1 className="capitalize text-[#361d32] text-xl lg:text-3xl font-semibold mb-6">Ваші бронювання</h1>

            <div className="space-y-6">
                {bookings.map((booking) => {
                    const tour = tours.find((t) => t.id === booking.tour) || null;
                    const details = tourDetails.find((d) => d.tour === booking.tour) || null;
                    const isPastTour = tour && new Date(tour.start_date) < new Date();

                    return (
                        <div
                            key={booking.id}
                            className={`p-3 md:p-6 bg-white rounded-2xl border border-[#f1e8e6] shadow-sm hover:shadow-md transition-all ${
                                isPastTour ? 'opacity-50 pointer-events-none' : ''
                              }`}
                                                      >
                            <div className="flex flex-col lg:flex-row gap-3 md:gap-6">
                                <div className="lg:w-1/2 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-lg md:text-xl font-bold text-[#361d32]">
                                            {booking.tour_name}
                                        </h2>
                                        <span className={`px-3 py-1 rounded-full text-xs md:text-sm ${booking.status === 'pending'
                                                ? 'bg-amber-100 text-amber-800'
                                                : booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                            {booking.status === 'pending'
                                                ? 'Очікує підтвердження'
                                                : booking.status === 'confirmed'
                                                    ? 'Підтверджено'
                                                    : 'Скасовано'}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-[#543c52]">
                                            <HiCalendarDateRange className="mr-2 text-[#361d32]" />
                                            <span>Дата бронювання: {formatDate(booking.created_at)}</span>
                                        </div>

                                        {daysLeftMap[booking.id] !== undefined && (
                                            <div className="flex items-center">
                                                <FiClock className="mr-2 text-[#361d32]" />
                                                <span>
                                                    До туру залишилось: <strong>{!isPastTour ? daysLeftMap[booking.id] : 0}</strong> {
                                                        daysLeftMap[booking.id] === 1 ? 'день' :
                                                            daysLeftMap[booking.id] < 5 ? 'дні' : 'днів'
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        <Link
                                            to={`/tour/${booking.tour}`}
                                            className="inline-flex items-center justify-end text-[#543c52] hover:text-[#e04a42] transition-colors w-full mt-2"
                                        >
                                            Детальніше про тур <FiArrowRight className="ml-1" />
                                        </Link>
                                    </div>

                                    <div className="mt-3 md:mt-6 pt-4 border-t border-[#f1e8e6]">
                                        <p className="text-sm text-[#543c52] italic mb-4">
                                            Скасування можливе за 14 днів до початку туру
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                className={`flex-1 py-2 rounded-xl transition-colors ${booking.status === 'canceled' || booking.status === 'confirmed'
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#edd2cb] hover:bg-[#e8c9c1] text-[#543c52]'
                                                    }`}

                                                onClick={() => handleCancelBooking(booking.id)}
                                            >
                                                Скасувати
                                            </button>

                                            <div className="flex-1">
                                                <LiqPayButton bookingId={booking.id} disabled={booking.status !== 'pending'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-1/2">
                                    {details?.photos?.length > 0 ? (
                                        <div className="relative h-36 md:h-64 w-full overflow-hidden rounded-xl">
                                            <img
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                                src={details.photos[0].image}
                                                alt={`${booking.tour_name}`}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                        </div>
                                    ) : (
                                        <div className="h-64 w-full bg-gradient-to-br from-[#f1e8e6] to-[#edd2cb] rounded-xl flex items-center justify-center">
                                            <FiImage className="text-4xl text-[#543c52]/50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Booking;
