import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTourDetails } from '../features/tours/tourDetailsSlice';
import { checkLoggedInUser } from '../features/authentication/authSlice';
import TourCard from './ui/TourCard';
import { fetchLikedTours, toggleLike, selectLikedTourIds } from '../features/сabinet/likedToursSlice';
import { useLocation } from 'react-router-dom';
import { fetchReviews } from '../features/tours/reviewsSlice';
import Loading from './ui/Loading';

const TourList = ({ tours }) => {
  const [more, setMore] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();

  const { 
    tourDetails, 
    loading: detailsLoading, 
    filteredTours 
  } = useSelector((state) => state.tourDetails);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const likedTourIds = useSelector(selectLikedTourIds);

  useEffect(() => {
    dispatch(fetchTourDetails());
    const tourIds = tours.map(tour => tour.id);
    dispatch(fetchReviews(tourIds));
    if (isLoggedIn) {
      dispatch(fetchLikedTours());
    }
  }, [dispatch, isLoggedIn, tours]);
  
  const reviews = useSelector((state) => state.reviews.reviews);

  const handleToggleLike = (tourId) => {
    if (!isLoggedIn) {
      alert('Будь ласка, увійдіть до системи, щоб додавати тури до улюблених');
      return;
    }
    dispatch(toggleLike(tourId)).unwrap().catch((error) => {
      if (error.message.includes('401')) {
        localStorage.removeItem('accessToken');
        dispatch(checkLoggedInUser());
        alert('Сесія закінчилася. Будь ласка, увійдіть знову.');
      } else {
        alert('Сталася помилка. Будь ласка, спробуйте ще раз.');
      }
    });
  };

  const toursWithDetails = useMemo(() => {
    return tours.map(tour => {
      const details = tourDetails.find(d => d.tour === tour.id);
        return {
        ...tour,
        details,
        
      };
    });
  }, [tours, tourDetails]);

  const getToursToDisplay = () => {
    const isHomePage = location.pathname === '/';
    
    if (isHomePage) {
      return toursWithDetails;
    }
    
    if (filteredTours === null || filteredTours === undefined) {
      return toursWithDetails;
    }
    
    if (filteredTours.length === 0) {
      return [];
    }
    
    return toursWithDetails.filter(tour => 
      filteredTours.some(ft => ft.tour === tour.id)
    );
  };

  const toursToDisplay = useMemo(getToursToDisplay, [
    location.pathname, 
    filteredTours, 
    toursWithDetails
  ]);

  const isHomePage = location.pathname === '/';
  
  const displayedTours = isHomePage 
    ? (more ? toursToDisplay : toursToDisplay.slice(0, 6))
    : toursToDisplay;

    if (!isHomePage && toursToDisplay.length === 0) {
      return (
        <div className="w-84 flex flex-col items-center justify-center my-10 bg-[#f1e8e6] p-6 rounded-xl shadow-md">
          <svg
            className="w-16 h-16 text-[#f55951] mb-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 9.75L4.5 15m0 0l5.25 5.25M4.5 15H20.25"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-[#543c52] text-center">
            Нічого не знайдено за обраними критеріями
          </h2>
          <p className="text-[#361d32] text-center mt-2">
            Спробуйте змінити фільтри або спробуйте пізніше
          </p>
        </div>
      );
    }
    
    if (detailsLoading) return <Loading/>
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTours.map((tour) => {
          const isLiked = likedTourIds.includes(tour.id);
          return (
            <TourCard
              key={tour.id}
              tour={tour}
              details={tour.details}
              reviews={reviews}
              onLikeClick={(e) => handleToggleLike(tour.id, e)}
              isLiked={isLiked}
            />
          );
        })}
      </div>
      {isHomePage && (
        <div className="flex justify-center my-6">
          <button 
            type="button" 
            className="text-sm text-[#361d32] underline" 
            onClick={() => setMore(!more)}
          >
            {more ? 'Менше' : 'Більше'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TourList;
