import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTourById } from '../features/tours/toursSlice';
import { fetchTourDetailsById } from '../features/tours/tourDetailsSlice';
import { sendBookingRequest } from '../features/сabinet/bookingSlice';
import { selectLikedTourIds, toggleLike } from '../features/сabinet/likedToursSlice';
import { averageRating } from '../utils/utils';
import Loading from '../components/ui/Loading';
import TourContent from '../components/tour-details/TourContent';
import TourGallery from '../components/tour-details/TourGallery';
import TourReviews from '../components/tour-details/TourReviews';
import TourSummary from '../components/tour-details/TourSummary';

const TourDescription = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const toursState = useSelector((state) => state.tours);
  const detailsState = useSelector((state) => state.tourDetails);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const likedTourIds = useSelector(selectLikedTourIds);
  const reviews = useSelector((state) => state.reviews.reviews);
  const tour = toursState.selectedTour;
  const details = detailsState.selectedTourDetails;
  const selectedTourReviews = reviews.filter(
    (review) => String(review.tour) === String(tour?.id)
  );
  const rating = averageRating(selectedTourReviews);
  const isLiked = likedTourIds.includes(tour?.id);
  const isActive = tour?.end_date ? new Date(tour.end_date) > new Date() : false;

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTourById(id));
    dispatch(fetchTourDetailsById(id));
  }, [id, dispatch]);

  if (Number.isNaN(Number(id))) {
    throw new Error('Invalid tour ID');
  }

  const handleBooking = (bookingData) => {
    if (!isLoggedIn) {
      return Promise.reject(new Error('Будь ласка, увійдіть, щоб забронювати тур.'));
    }
    if (!tour) {
      return Promise.reject(new Error('Дані туру ще не завантажено.'));
    }
    if (bookingData.adults + bookingData.children > tour.available_seats) {
      return Promise.reject(new Error('Недостатньо вільних місць на цей тур.'));
    }

    return dispatch(sendBookingRequest({ tourId: tour.id, bookingData })).unwrap();
  };

  const handleToggleLike = () => {
    if (!isLoggedIn) {
      alert('Будь ласка, увійдіть до системи, щоб додавати тури до улюблених');
      return;
    }
    dispatch(toggleLike(tour.id)).unwrap();
  };

  if (toursState.loading || detailsState.loading) return <Loading />;

  if (toursState.error || detailsState.error) {
    return (
      <h2 className="text-4xl font-semibold text-[#f55951] my-6 text-center">
        Помилка: {toursState.error || detailsState.error}
      </h2>
    );
  }

  if (!tour || !details?.tour) return null;

  return (
    <div className="relative">
      {!isActive && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <p className="text-white text-4xl font-bold">Тур завершено</p>
        </div>
      )}

      <div className="container mx-auto p-2 md:p-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#361d32] text-center mb-2 md:mb-4">
          {tour.name}
        </h1>
        <p className="text-center text-[#543c52]">{tour.countries} ({tour.cities})</p>

        <div className="lg:flex lg:justify-between my-auto p-2 md:p-4">
          <div className="lg:w-2/3 w-full flex flex-col items-center">
            <TourGallery photos={details.photos} tourName={tour.name} />
          </div>
          <div className="lg:w-1/3 w-full bg-white p-6 rounded-lg shadow-lg lg:ml-4">
            <TourSummary
              tour={tour}
              user={user}
              rating={rating}
              reviewCount={selectedTourReviews.length}
              isLiked={isLiked}
              onBook={handleBooking}
              onToggleLike={handleToggleLike}
            />
          </div>
        </div>

        <TourContent tour={tour} details={details} />

        <div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-4 sm:mb-8">
            Відгуки
          </h3>
          <TourReviews tourId={id} />
        </div>
      </div>
    </div>
  );
};

export default TourDescription;
