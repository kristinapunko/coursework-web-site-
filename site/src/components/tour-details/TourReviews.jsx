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
      <div className="flex gap-1 mt-1" aria-label={`Оцінка ${review.rating} з 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            size={16}
            aria-hidden="true"
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

const ReviewForm = ({ editingReview, formData, formError, hoveredRating, onCancel, onSubmit, setFormData, setHoveredRating }) => (
  <div className="mt-4 sm:mt-6 text-left bg-white p-3 sm:p-5 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold text-[#543c52] mb-2">
      {editingReview ? 'Редагувати відгук' : 'Додати відгук'}
    </h3>
    <label className="block text-sm font-medium text-[#543c52]" htmlFor="tour-review-comment">
      Ваш відгук
    </label>
    <textarea
      id="tour-review-comment"
      className="w-full mt-2 p-2 border-b-2 border-[#543c52]/50 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      value={formData.comment}
      onChange={(event) => setFormData({ ...formData, comment: event.target.value })}
    />
    <div className="flex gap-1 mt-2" role="group" aria-label="Оцінка туру">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          aria-label={`${star} з 5`}
          aria-pressed={formData.rating === star}
          className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setFormData({ ...formData, rating: star })}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <FaStar
            size={20}
            aria-hidden="true"
            className={star <= (hoveredRating || formData.rating) ? 'text-[#f55951]' : 'text-[#edd2cb]'}
          />
        </button>
      ))}
    </div>
    {formError && <p className="mt-2 text-sm text-red-600" role="alert">{formError}</p>}
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
  const [formError, setFormError] = useState('');
  const visibleReviews = reviews.filter((review) => String(review.tour) === String(tourId));

  useEffect(() => {
    dispatch(fetchReviews(tourId));
  }, [dispatch, tourId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (formData.rating === 0 || !formData.comment.trim()) {
      setFormError('Будь ласка, вкажіть рейтинг та коментар.');
      return;
    }

    try {
      if (editingReview) {
        await dispatch(updateReview({
          reviewId: editingReview.id,
          reviewData: {
            tour: editingReview.tour,
            rating: formData.rating,
            feedback: formData.comment,
          },
        })).unwrap();
        setEditingReview(null);
      } else {
        await dispatch(addReview({ tourId, reviewData: formData })).unwrap();
      }
      setFormData({ rating: 0, comment: '' });
    } catch (mutationError) {
      setFormError(String(mutationError || 'Не вдалося зберегти відгук.'));
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({ rating: review.rating, comment: review.feedback });
    setFormError('');
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      try {
        await dispatch(deleteReview({ reviewId })).unwrap();
      } catch (mutationError) {
        setFormError(String(mutationError || 'Не вдалося видалити відгук.'));
      }
    }
  };

  const handleCancel = () => {
    setEditingReview(null);
    setFormData({ rating: 0, comment: '' });
    setFormError('');
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
          formError={formError}
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
