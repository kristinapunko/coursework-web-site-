import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import {
  addReview,
  deleteReview,
  fetchReviews,
  updateReview,
} from '../../features/tours/reviewsSlice';
import ErrorPage from '../Error';
import Loading from '../ui/Loading';

const ReviewCard = ({ review, canEdit, onDelete, onEdit }) => (
  <div className="p-4 sm:p-5 shadow-md bg-white rounded-lg text-left border border-[#543c52]/50 mb-4">
    <div className="flex justify-between mb-1">
      <div>
        <p className="text-md sm:text-lg font-semibold text-[#361d32]">{review.user_name}</p>
        {canEdit && (
          <div className="flex gap-2 mt-1">
            <button onClick={onEdit} className="text-xs text-[#543c52] hover:text-[#f55951]">
              Редагувати
            </button>
            <button onClick={onDelete} className="text-xs text-[#543c52] hover:text-[#f55951]">
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
            className={star <= review.rating ? 'text-[#f55951]' : 'text-[#edd2cb]'}
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
);

const ReviewForm = ({ editingReview, formData, hoveredRating, onCancel, onSubmit, setFormData, setHoveredRating }) => (
  <div className="mt-4 sm:mt-6 text-left bg-white p-3 sm:p-5 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-[#543c52] mb-2">
      {editingReview ? 'Редагувати відгук' : 'Додати відгук'}
    </h3>
    <textarea
      className="w-full mt-2 p-2 border-b-2 border-[#543c52]/50 focus:outline-none rounded-md"
      placeholder="Ваш відгук"
      value={formData.comment}
      onChange={(event) => setFormData({ ...formData, comment: event.target.value })}
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
          onClick={() => setFormData({ ...formData, rating: star })}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      ))}
    </div>
    <div className="flex gap-2 mt-3">
      <button
        className="w-full bg-[#543c52] hover:bg-[#361d32] text-[#f1e8e6] p-2 rounded-2xl"
        onClick={onSubmit}
      >
        {editingReview ? 'Оновити' : 'Надіслати'}
      </button>
      {editingReview && (
        <button
          className="w-full bg-[#f1e8e6] hover:bg-[#edd2cb] text-[#543c52] p-2 rounded-2xl"
          onClick={onCancel}
        >
          Скасувати
        </button>
      )}
    </div>
  </div>
);

const TourReviews = ({ tourId }) => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ rating: 0, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const visibleReviews = reviews.filter((review) => String(review.tour) === String(tourId));

  useEffect(() => {
    dispatch(fetchReviews(tourId));
  }, [dispatch, tourId]);

  const handleSubmit = (event) => {
    event.preventDefault();
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
          feedback: formData.comment,
        },
      })).then(() => {
        setEditingReview(null);
        setFormData({ rating: 0, comment: '' });
      });
      return;
    }

    dispatch(addReview({ tourId, reviewData: formData }));
    setFormData({ rating: 0, comment: '' });
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({ rating: review.rating, comment: review.feedback });
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

  if (loading) return <Loading />;
  if (error) return <ErrorPage />;

  return (
    <div>
      {visibleReviews.length > 0 ? (
        visibleReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canEdit={user?.id === review.user}
            onEdit={() => handleEdit(review)}
            onDelete={() => handleDelete(review.id)}
          />
        ))
      ) : (
        <p className="text-center text-[#543c52] my-4">Ще немає відгуків для цього туру</p>
      )}

      {user ? (
        <ReviewForm
          editingReview={editingReview}
          formData={formData}
          hoveredRating={hoveredRating}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          setFormData={setFormData}
          setHoveredRating={setHoveredRating}
        />
      ) : (
        <p className="text-center text-[#543c52] my-4">Увійдіть, щоб залишити свій відгук</p>
      )}
    </div>
  );
};

export default TourReviews;
