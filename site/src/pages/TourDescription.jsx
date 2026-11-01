import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { Navigation, Thumbs } from 'swiper/modules';
import { useState } from 'react';
import {  FaBus} from "react-icons/fa";
import { useParams } from 'react-router-dom'
import { MdCalendarMonth, MdOutlineAccessTime, MdAllInclusive, MdPeopleAlt, MdOutlineFlightTakeoff, MdFlight, MdOutlineFlightLand } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTourById } from '../features/tours/toursSlice';
import {fetchTourDetailsById} from '../features/tours/tourDetailsSlice'
import { averageRating, formatDate, calculateDaysAndNights, normalizeStringList } from '../utils/utils'
import { useEffect } from 'react';
import CountOfPeople from '../components/ui/CountOfPeople';
import FormattedPrice from '../components/ui/FormattedPrice';
import LikeButton from '../components/ui/LikeButton';
import HotAndPromotionButton from '../components/ui/HotAndPromotionButton'
import { sendBookingRequest } from '../features/сabinet/bookingSlice';
import { fetchReviews, addReview, updateReview, deleteReview } from '../features/tours/reviewsSlice';
import { selectLikedTourIds, toggleLike } from '../features/сabinet/likedToursSlice';
import Loading from '../components/ui/Loading';
import ErrorPage from '../components/Error';

export default function TourDetails() {

  const [showForm, setShowForm] = useState(false);
  const { id } = useParams(); 
  const dispatch = useDispatch();
  const tour = useSelector((state) => state.tours);
  const tourDetailsId = useSelector((state) => state.tourDetails);
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const userId = useSelector((state) => state.auth.user?.id);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const likedTourIds = useSelector(selectLikedTourIds);
  const isLiked = likedTourIds.includes(tour.selectedTour?.id);
  const reviews = useSelector((state) => state.reviews.reviews);
  const selectedTourReviews = reviews.filter(
    (review) => String(review.tour) === String(tour.selectedTour?.id)
  );
  const rating = averageRating(selectedTourReviews);

  const today = new Date();
  let isActive = false;
  
  if (tour.selectedTour?.end_date) {
    const tourEndDate = new Date(tour.selectedTour.end_date);
    isActive = tourEndDate > today;
  }
  
 
 if (isNaN(Number(id))) {
  throw new Error('Invalid tour ID');
}

  function booking() {
    if (!isLoggedIn) {
      alert("Будь ласка, зареєструйтеся для бронювання");
    } else if (!tour.selectedTour) {
      alert("Помилка: Дані туру не завантажено");
    } else if (tour.selectedTour.available_seats <= 0) {
      alert("Немає вільних місць на цей тур");
    } else {
      const tourId = tour.selectedTour.id;
      dispatch(sendBookingRequest({ tourId, userId }))
        .unwrap()
        .then(() => {
          alert(`Бронювання успішно відправлено для користувача ${user.email}!`);
        })
        .catch((error) => {
          alert(`Помилка бронювання: ${error}`);
        });
    }
  }

  const handleToggleLike = (tourId) => {
    if (!isLoggedIn) {
      alert('Будь ласка, увійдіть до системи, щоб додавати тури до улюблених');
      return;
    }
     dispatch(toggleLike(tourId)).unwrap()
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchTourById(id));
      dispatch(fetchTourDetailsById(id));
    }
  }, [id, dispatch]);

  return (
    <>
    {(tour.loading || tourDetailsId.loading) && <Loading/>}

{!tour.loading && !tourDetailsId.loading && (tour.error || tourDetailsId.error) && (
  <h2 className='text-4xl font-semibold text-[#f55951] my-6 text-center'>Помилка: {tour.error || tourDetailsId.error}</h2>
)}

{!tour.loading && !tourDetailsId.loading && !tour.error && !tourDetailsId.error && tour.selectedTour && tourDetailsId.selectedTourDetails?.tour && (
  <div className="relative">
  {!isActive && (
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
      <p className="text-white text-4xl font-bold">Тур завершено</p>
    </div>
  )}
  <div className="container mx-auto p-2 md:p-4">
    <h1 className="text-2xl md:text-3xl font-bold text-[#361d32] text-center mb-2 md:mb-4">{tour.selectedTour.name}</h1>
      <p className="text-center text-[#543c52]">{tour.selectedTour.countries} ({tour.selectedTour.cities})</p>
      <div className="lg:flex lg:justify-between my-auto p-2 md:p-4">
  <div className="lg:w-2/3 w-full flex flex-col items-center">
    <Swiper
      navigation
      modules={[Navigation, Thumbs]}
      thumbs={{ swiper: thumbsSwiper }}
      className="w-full h-auto my-4 sm:my-6 rounded-2xl overflow-hidden"
    >
      {tourDetailsId.selectedTourDetails.photos.map((photo, index) => (
        <SwiperSlide key={index}>
          <img
            src={photo.image} 
            alt={`Tour image ${index + 1}`}
            decoding="async"
            className="w-full h-48 sm:h-64 md:h-80 object-cover"
          />
           <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        </SwiperSlide>
      ))}
    </Swiper>

    <Swiper
      navigation
      modules={[Navigation, Thumbs]}
      onSwiper={setThumbsSwiper}
      spaceBetween={10}
      slidesPerView={4}
      watchSlidesProgress
      className="w-full "
    >
      {tourDetailsId.selectedTourDetails.photos.map((photo, index) => (
        <SwiperSlide key={index}>
          <img
            src={photo.image} 
            alt={`Tour image ${index + 1}`}
            loading="lazy"
            decoding="async"
           className="w-full rounded-2xl h-9/10 md:h-24 object-cover cursor-pointer"          />
           <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>

  <div className="lg:w-1/3 w-full bg-white p-6 rounded-lg shadow-lg lg:ml-4">
     
      {showForm ? (
        <div className="flex justify-center items-center w-full">
        <form className="flex flex-col gap-4 md:gap-6 w-full max-w-lg px-4">
            <p className="text-md text-center text-[#361d32] mt-8">
          Що забронювати тур потрібно увійти або створити акаунт, якщо будуть вільні місця у турі вони відобразяться у вашому кабінеті, де тур модна буде оплатити
          </p>
            <p className="text-md text-center text-[#361d32] mb-4">
          При бронюванні запис можна відмінити за два тижні до дати туру
          </p>
          <div className='flex gap-2'>
            <button onClick={()=>booking()} type="button" className="flex justify-center items-center text-center w-full bg-[#543c52] hover:bg-[#361d32] text-[#edd2cb] py-2 rounded-2xl">
              Бронювати
            </button>
          </div>
          <button type="button" className="text-[#361d32] underline" onClick={() => setShowForm(false)}>
            Назад до інформації
          </button>
        </form>
        </div>
      ) : (<>
       <div className='flex justify-between mb-6'>
      <div className="flex justify-start gap-2 my-2 text-md">
      <span className="text-[#f55951] font-bold">{rating ?? '—'}</span>
      <span className="text-[#361d32]">({selectedTourReviews.length} відгуків)</span>

    </div>
  <div className='flex justify-end gap-2'>
    <div className=" top-3 right-3 flex flex-col gap-2">
          <LikeButton 
                    tour={tour.selectedTour.id}
                    onClick={(e)=>handleToggleLike(tour.selectedTour.id, e)}
                    liked={isLiked}
                  />
          
        </div>
        <HotAndPromotionButton tour={tour.selectedTour} containerClass = "top-12 right-3 flex flex-col gap-2" />
    </div>
      </div>
    <h2 className="text-xl sm:text-2xl text-center text-[#361d32] font-semibold mb-4">Інформація про тур</h2>
   
    <p className='text-sm sm:text-md text-[#543c52] flex gap-2'><span className='text-[#361d32] font-semibold flex items-center gap-2'>Дати туру:<MdCalendarMonth/></span>{formatDate(tour.selectedTour.start_date)} - {formatDate(tour.selectedTour.end_date)}</p>
    <p className='text-sm sm:text-md text-[#543c52] flex gap-2'><span className='text-[#361d32] font-semibold flex items-center gap-2'>Тривалість: <MdOutlineAccessTime/></span> {calculateDaysAndNights(tour.selectedTour.start_date, tour.selectedTour.end_date)}</p>
    <p className='text-sm sm:text-md text-[#543c52] flex gap-2'><span className='text-[#361d32] font-semibold flex items-center gap-2'>Харчування: <MdAllInclusive/></span> {tour.selectedTour.food}</p>
    <div className='text-sm sm:text-md text-[#543c52] flex gap-2'><span className='text-[#361d32] font-semibold flex items-center gap-2'>Туристи: <MdPeopleAlt/></span> <CountOfPeople tour={tour.selectedTour}/></div>
    <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
      <span className="text-[#361d32] font-semibold flex items-center gap-2">
        {tour.selectedTour.departure_by === "Автобус" ? (
          <>
            Проїзд: <FaBus className="text-[#361d32] text-sm" />
          </>
        ) : (
          <>
            Переліт: <MdFlight className="text-[#361d32]" />
          </>
        )}
      </span>
      {tour.selectedTour.departure_by != null  ? "Включено" : "Не включено"}
    </p>   
    <p className='text-sm sm:text-md text-[#543c52] flex gap-2'><span className='text-[#361d32] font-semibold flex items-center gap-2'>Початок: <MdOutlineFlightTakeoff/></span> {formatDate(tour.selectedTour.start_date)}, {tour.selectedTour.departure_from}</p>
    <p className='text-sm sm:text-md text-[#543c52] flex gap-2'><span className='text-[#361d32] font-semibold flex items-center gap-2'>Повернення: <MdOutlineFlightLand/></span> {formatDate(tour.selectedTour.end_date)}, {tour.selectedTour.return_from}</p>

    <h3 className="text-xl sm:text-2xl my-6 font-bold text-[#f55951]"><FormattedPrice tour={tour.selectedTour}/></h3>
    <button
      className="flex justify-center items-center text-center w-full mt-8 bg-[#543c52] hover:bg-[#361d32] text-[#edd2cb] py-2 rounded-2xl"
      onClick={() => setShowForm(true)}
    >
      Відправити заявку
    </button>
    </>
      )}
  </div>
</div>


<div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg shadow-xl">
  <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-2">
    Програма туру
  </h3>
  <h2 className="text-sm sm:text-md font-semibold text-[#543c52] mb-4">
    Тур на {calculateDaysAndNights(tour.selectedTour.start_date, tour.selectedTour.end_date)}.
  </h2>
      <div className='ml-6'>
  {tourDetailsId.selectedTourDetails.program.split("\n").map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("День")) {
      return (
        <h2 key={index} className="text-md font-semibold text-[#543c52] my-4 underline">
          {trimmedLine}
        </h2>
      );
    }
    return (
      <p key={index} className="text-[#543c52] ml-3">
        {trimmedLine}
      </p>
    );
  })}
  </div>
</div>
      <div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-4 sm:mb-8">Що входить в тур</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4 mt-2">
        {normalizeStringList(tourDetailsId.selectedTourDetails.services).map((service, index) => (
          <div key={index} className="flex items-center space-x-2 border border-[#361d32]/50 p-3 rounded-lg shadow-xl">
            <span>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
          </div>
        ))}

        </div>
      </div>
      <div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg">
        <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-4 sm:mb-8">Що не входить в тур</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4 mt-2">
        {normalizeStringList(tourDetailsId.selectedTourDetails.noservices).map((noservice, index) => (
          <div key={index} className="flex items-center space-x-2 border border-[#361d32]/50 p-3 rounded-lg shadow-xl">
            <span>{noservice.charAt(0).toUpperCase() + noservice.slice(1)}</span>
          </div>
        ))}
        </div>
      </div>

      <div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg  shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-4 sm:mb-8">Відгуки</h3>
      <Reviews tourId={id}/>
    </div>
    </div></div> )}
    </>
  );
}

const Reviews = ({ tourId }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const visibleReviews = reviews.filter(
    (review) => String(review.tour) === String(tourId)
  );
  
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
  });
  const [editingReview, setEditingReview] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    dispatch(fetchReviews(tourId));
  }, [dispatch, tourId]);

  const handleStarClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0 || !formData.comment.trim()) {
      alert('Будь ласка, вкажіть рейтинг та коментар');
      return;
    }

    if (editingReview) {
      dispatch(updateReview({
        reviewId: editingReview.id,
        reviewData: {
          tour: editingReview.tour,
          rating: formData.rating,
          feedback: formData.comment
        },        
      })).then(() => {
        setEditingReview(null);
        setFormData({ rating: 0, comment: '' });
      });
    } else {
      dispatch(addReview({ tourId, reviewData: formData }));
      setFormData({ rating: 0, comment: '' });
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      comment: review.feedback
    });
  };

  const handleDelete = (reviewId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      dispatch(deleteReview({ reviewId }));
    }
  };

  const handleCancel = () => {
    setEditingReview(null);
    setFormData({ rating: 0, comment: '' });
  };

  if (loading) return <Loading/>;
  if (error) return <ErrorPage />;


  return (
    <div>
      {visibleReviews.length > 0 ? (
        visibleReviews.map((review) => (
          <div
            key={review.id}
            className="p-4 sm:p-5 shadow-md bg-white rounded-lg text-left border border-[#543c52]/50 mb-4"
          >
            <div>
              <div className="flex justify-between mb-1">
                <div>
                  <p className="text-md sm:text-lg font-semibold text-[#361d32]">
                    {review.user_name}
                  </p>
                  {user && user.id === review.user && (
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => handleEdit(review)}
                        className="text-xs text-[#543c52] hover:text-[#f55951]"
                      >
                        Редагувати
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="text-xs text-[#543c52] hover:text-[#f55951]"
                      >
                        Видалити
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={16}
                      className={
                        star <= review.rating ? 'text-[#f55951]' : 'text-[#edd2cb]'
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-[#543c52] text-xs">
                {new Date(review.created_at).toLocaleString('uk-UA', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-[#543c52] mt-2 sm:mt-4">{review.feedback}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-[#543c52] my-4">Ще немає відгуків для цього туру</p>
      )}

      {user && (
        <div className="mt-4 sm:mt-6 text-left bg-white p-3 sm:p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-[#543c52] mb-2">
            {editingReview ? 'Редагувати відгук' : 'Додати відгук'}
          </h3>
          <textarea
            className="w-full mt-2 p-2 border-b-2 border-[#543c52]/50 focus:outline-none rounded-md"
            placeholder="Ваш відгук"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          />
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={20}
                className={
                  star <= (hoveredRating || formData.rating)
                    ? 'text-[#f55951] cursor-pointer'
                    : 'text-[#edd2cb] cursor-pointer'
                }
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className="w-full bg-[#543c52] hover:bg-[#361d32] text-[#f1e8e6] p-2 rounded-2xl"
              onClick={handleSubmit}
            >
              {editingReview ? 'Оновити' : 'Надіслати'}
            </button>
            {editingReview && (
              <button
                className="w-full bg-[#f1e8e6] hover:bg-[#edd2cb] text-[#543c52] p-2 rounded-2xl"
                onClick={handleCancel}
              >
                Скасувати
              </button>
            )}
          </div>
        </div>
      )}

      {!user && (
        <p className="text-center text-[#543c52] my-4">
          Увійдіть, щоб залишити свій відгук
        </p>
      )}
    </div>
  );
};
