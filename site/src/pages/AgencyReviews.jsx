import { useEffect, useState } from 'react';
import { FaStar, FaPen } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgencyReviews, fetchAgencyReply, addAgencyReview, addAgencyReply, deleteAgencyReview, updateAgencyReview } from '../features/tours/agencyReviewSlice';
import Loading from '../components/ui/Loading';
import Error from '../components/Error';
const AgencyReviews = () => {
  const dispatch = useDispatch();
  const { agencyReviews, reply, loading, error } = useSelector((state) => state.agencyReview);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    pros: '',
    cons: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [replyForm, setReplyForm] = useState({ reviewId: null, comment: '' });
  const [editingReview, setEditingReview] = useState(null); // Track the review being edited

  useEffect(() => {
    dispatch(fetchAgencyReviews());
    dispatch(fetchAgencyReply());
  }, [dispatch]);

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
      // Update existing review
      dispatch(updateAgencyReview({
        agencyReviewId: editingReview.id,
        reviewData: {
          rating: formData.rating,
          feedback: formData.comment,
          pros: formData.pros,
          cons: formData.cons,
        },
      }))
        .unwrap()
        .then(() => {
          setEditingReview(null);
          setFormData({ rating: 0, comment: '', pros: '', cons: '' });
        })
        .catch((err) => {
          console.error('Failed to update review:', err);
          alert(`Не вдалося оновити відгук: ${JSON.stringify(err)}`);
        });
    } else {
      dispatch(addAgencyReview({ reviewData: formData }))
        .unwrap()
        .then(() => {
          setFormData({ rating: 0, comment: '', pros: '', cons: '' });
        })
        .catch((err) => {
          console.error('Failed to add review:', err);
        });
    }
  };

  const handleReplyClick = (reviewId) => {
    setReplyForm({ reviewId, comment: '' });
  };

  const handleReplyChange = (e) => {
    setReplyForm({ ...replyForm, comment: e.target.value });
  };

  const handleReplySubmit = (e, agencyReviewId) => {
    e.preventDefault();
    if (!replyForm.comment.trim()) {
      alert('Будь ласка, введіть відповідь');
      return;
    }
    dispatch(addAgencyReply({ agencyReviewId, reviewData: { comment: replyForm.comment } }))
      .unwrap()
      .then(() => {
        setReplyForm({ reviewId: null, comment: '' });
      })
      .catch((err) => {
        console.error('Failed to add reply:', err);
        alert(`Не вдалося додати відповідь: ${JSON.stringify(err)}`);
      });
  };

  const handleReplyCancel = () => {
    setReplyForm({ reviewId: null, comment: '' });
  };

  const handleDelete = (agencyReviewId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      dispatch(deleteAgencyReview({ agencyReviewId }));
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      comment: review.feedback,
      pros: review.pros,
      cons: review.cons,
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setFormData({ rating: 0, comment: '', pros: '', cons: '' });
  };

  if (loading) return <Loading/>;
  if (error) return <Error /> ;


  return (
    <main>
      <h1 className="text-2xl md:text-3xl font-semibold text-[#361d32] text-center my-9 lg:my-12">
        Відгуки про турагенство
      </h1>
      {agencyReviews.length > 0 ? (
        agencyReviews.map((agencyReview) => (
          <div
            key={agencyReview.id}
            className="w-[90%] md:w-[80%] mx-auto p-4 sm:p-5 shadow-md bg-[#f1e8e6]/60 rounded-lg text-left border border-[#edd2cb]/50 mb-4"
          >
            <div className="flex justify-between mb-1">
              <p className="text-md sm:text-lg font-semibold text-[#361d32]">{agencyReview.user_name}</p>
              <p className="text-[#543c52] text-xs">
                {new Date(agencyReview.created_at).toLocaleString('uk-UA', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {user && user.id === agencyReview.user && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleEdit(agencyReview)}
                  className="text-xs text-[#543c52] hover:text-[#f55951]"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => handleDelete(agencyReview.id)}
                  className="text-xs text-[#543c52] hover:text-[#f55951]"
                >
                  Видалити
                </button>
              </div>
            )}
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={16}
                  className={star <= agencyReview.rating ? 'text-[#f55951]' : 'text-[#edd2cb]'}
                />
              ))}
            </div>
            <p className="text-[#543c52] mt-2 sm:mt-4">{agencyReview.feedback}</p>
            <div className="m-2">
              <p className="text-[#543c52] flex gap-2">
                <span className="text-[#361d32] font-semibold flex items-center gap-2">Переваги:</span>
                {agencyReview.pros}
              </p>
              <p className="text-[#543c52] flex gap-2">
                <span className="text-[#361d32] font-semibold flex items-center gap-2">Недоліки:</span>
                {agencyReview.cons}
              </p>
            </div>
            <div className="flex justify-end">
            {user?.is_staff && (<button
                onClick={() => handleReplyClick(agencyReview.id)}
                className="flex items-center gap-2 px-4 py-2 text-[#361d32] bg-[#f1e8e6] hover:bg-[#f55951] hover:text-white rounded-md transition-colors duration-200"
              >
                <FaPen size={16} />
                Відповісти
              </button>
            )}
            {!user && (
              <p className="text-center text-[#543c52] my-4">
                Увійдіть, щоб дати відповідь
              </p>
            )}
            </div>

            {replyForm.reviewId === agencyReview.id && (
              <div className="mt-4">
                <textarea
                  className="w-full p-2 border-b-2 border-[#543c52]/50 focus:outline-none rounded-md"
                  placeholder="Ваша відповідь"
                  value={replyForm.comment}
                  onChange={handleReplyChange}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={(e) => handleReplySubmit(e, agencyReview.id)}
                    className="px-4 py-2 bg-[#543c52] hover:bg-[#361d32] text-[#f1e8e6] rounded-md"
                  >
                    Надіслати
                  </button>
                  <button
                    onClick={handleReplyCancel}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-[#361d32] rounded-md"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}

            {reply[agencyReview.id] && reply[agencyReview.id].length > 0 ? (
              <div className="md:w-[80%] mx-auto my-6">
                <p className="text-[#f55951] text-center font-bold text-lg mt-2 sm:mt-4">Відповіді</p>
                {reply[agencyReview.id].map((rep) => (
                  <div key={rep.id} className="border-2 border-[#f1e8e6] rounded-md p-4 mt-2">
                    <div className="flex justify-between mb-1">
                      <p className="text-md sm:text-lg font-semibold text-[#361d32]">
                        {rep.user_name || 'Анонім'}
                      </p>
                      <p className="text-[#543c52] text-xs">
                        {new Date(rep.created_at).toLocaleString('uk-UA', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-[#543c52] mt-2 sm:mt-4">{rep.text || rep.feedback}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#543c52] mt-2">Немає відповіді</div>
            )}
          </div>
        ))
      ) : (
        <div>Немає відгуків</div>
      )}

      {user && (
        <div className="w-[90%] md:w-[80%] mx-auto mt-4 sm:mt-6 text-left bg-white p-3 sm:p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-[#543c52] mb-2">
            {editingReview ? 'Редагувати відгук' : 'Додати відгук'}
          </h3>
          <textarea
            className="w-full mt-2 p-2 border-b-2 border-[#543c52]/50 focus:outline-none rounded-md"
            placeholder="Ваш відгук"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          />
          <textarea
            className="w-full mt-2 p-2 border-b-2 border-[#543c52]/50 focus:outline-none rounded-md"
            placeholder="Переваги"
            value={formData.pros}
            onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
          />
          <textarea
            className="w-full mt-2 p-2 border-b-2 border-[#543c52]/50 focus:outline-none rounded-md"
            placeholder="Недоліки"
            value={formData.cons}
            onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
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
              onClick={handleSubmit}
              className="w-full bg-[#543c52] hover:bg-[#361d32] text-[#f1e8e6] p-2 rounded-2xl"
            >
              {editingReview ? 'Оновити' : 'Надіслати'}
            </button>
            {editingReview && (
              <button
                onClick={handleCancelEdit}
                className="w-full bg-gray-300 hover:bg-gray-400 text-[#361d32] p-2 rounded-2xl"
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
    </main>
  );
};

export default AgencyReviews;
