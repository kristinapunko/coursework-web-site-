import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import TourCard from '../components/ui/TourCard';
import Loading from '../components/ui/Loading';
import { fetchLikedTours, toggleLike } from '../features/сabinet/likedToursSlice';
import { fetchReviews } from '../features/tours/reviewsSlice';
import { fetchTourDetails } from '../features/tours/tourDetailsSlice';
import { fetchTours } from '../features/tours/toursSlice';

const Cabinet = () => {
  const dispatch = useDispatch();
  const likedTourIds = useSelector((state) => state.likedTours.likedTourIds);
  const likedLoading = useSelector((state) => state.likedTours.loading);
  const likedError = useSelector((state) => state.likedTours.error);
  const { tours, loading: toursLoading, error: toursError } = useSelector((state) => state.tours);
  const {
    tourDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useSelector((state) => state.tourDetails);
  const reviews = useSelector((state) => state.reviews.reviews);

  useEffect(() => {
    dispatch(fetchLikedTours());
    dispatch(fetchTours());
    dispatch(fetchTourDetails());
  }, [dispatch]);

  useEffect(() => {
    if (likedTourIds.length) dispatch(fetchReviews(likedTourIds));
  }, [dispatch, likedTourIds]);

  const toursById = useMemo(
    () => new Map(tours.map((tour) => [tour.id, tour])),
    [tours]
  );
  const detailsByTourId = useMemo(
    () => new Map(tourDetails.map((details) => [details.tour, details])),
    [tourDetails]
  );

  const handleToggleLike = (tourId) => {
    dispatch(toggleLike(tourId));
  };

  if (likedLoading || toursLoading || detailsLoading) return <Loading />;

  const error = likedError || toursError || detailsError;
  if (error) {
    return <div className="text-center text-red-600 py-8">Не вдалося завантажити улюблені тури.</div>;
  }

  if (!likedTourIds.length) {
    return (
      <div className="flex mx-auto bg-[#f1e8e6] w-[80%] rounded-2xl items-center justify-center h-60 mb-4">
        <div className="text-[#543c52] text-2xl font-medium">У вас немає улюблених турів</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="capitalize text-[#361d32] text-xl lg:text-3xl font-semibold mb-6">
        Улюблені тури
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedTourIds.map((tourId) => {
          const tour = toursById.get(tourId);
          const details = detailsByTourId.get(tourId);
          if (!tour || !details) return null;

          return (
            <TourCard
              key={tourId}
              tour={tour}
              details={details}
              reviews={reviews}
              onLikeClick={() => handleToggleLike(tourId)}
              isLiked
            />
          );
        })}
      </div>
    </div>
  );
};

export default Cabinet;
