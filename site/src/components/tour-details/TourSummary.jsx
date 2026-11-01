import { useState } from 'react';
import { FaBus } from 'react-icons/fa';
import {
  MdAllInclusive,
  MdCalendarMonth,
  MdFlight,
  MdOutlineAccessTime,
  MdOutlineFlightLand,
  MdOutlineFlightTakeoff,
  MdPeopleAlt,
} from 'react-icons/md';
import { calculateDaysAndNights, formatDate } from '../../utils/utils';
import CountOfPeople from '../ui/CountOfPeople';
import FormattedPrice from '../ui/FormattedPrice';
import HotAndPromotionButton from '../ui/HotAndPromotionButton';
import LikeButton from '../ui/LikeButton';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';

const TourSummary = ({ tour, user, rating, reviewCount, isLiked, onBook, onToggleLike }) => {
  const [showForm, setShowForm] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  if (confirmation) {
    return (
      <BookingConfirmation
        booking={confirmation}
        tour={tour}
        onClose={() => {
          setConfirmation(null);
          setShowForm(false);
        }}
      />
    );
  }

  if (showForm) {
    return (
      <BookingForm
        tour={tour}
        user={user}
        onBack={() => setShowForm(false)}
        onSubmit={onBook}
        onConfirmed={setConfirmation}
      />
    );
  }

  return (
    <>
      <div className="flex justify-between mb-6">
        <div className="flex justify-start gap-2 my-2 text-md">
          <span className="text-[#f55951] font-bold">{rating ?? '—'}</span>
          <span className="text-[#361d32]">({reviewCount} відгуків)</span>
        </div>
        <div className="flex justify-end gap-2">
          <div className="top-3 right-3 flex flex-col gap-2">
            <LikeButton tour={tour.id} onClick={onToggleLike} liked={isLiked} />
          </div>
          <HotAndPromotionButton tour={tour} containerClass="top-12 right-3 flex flex-col gap-2" />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl text-center text-[#361d32] font-semibold mb-4">
        Інформація про тур
      </h2>
      <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">Дати туру:<MdCalendarMonth /></span>
        {formatDate(tour.start_date)} - {formatDate(tour.end_date)}
      </p>
      <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">Тривалість: <MdOutlineAccessTime /></span>
        {calculateDaysAndNights(tour.start_date, tour.end_date)}
      </p>
      <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">Харчування: <MdAllInclusive /></span>
        {tour.food}
      </p>
      <div className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">Туристи: <MdPeopleAlt /></span>
        <CountOfPeople tour={tour} />
      </div>
      <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">
          {tour.departure_by === 'Автобус' ? (
            <>Проїзд: <FaBus className="text-[#361d32] text-sm" /></>
          ) : (
            <>Переліт: <MdFlight className="text-[#361d32]" /></>
          )}
        </span>
        {tour.departure_by != null ? 'Включено' : 'Не включено'}
      </p>
      <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">Початок: <MdOutlineFlightTakeoff /></span>
        {formatDate(tour.start_date)}, {tour.departure_from}
      </p>
      <p className="text-sm sm:text-md text-[#543c52] flex gap-2">
        <span className="text-[#361d32] font-semibold flex items-center gap-2">Повернення: <MdOutlineFlightLand /></span>
        {formatDate(tour.end_date)}, {tour.return_from}
      </p>

      <h3 className="text-xl sm:text-2xl my-6 font-bold text-[#f55951]">
        <FormattedPrice tour={tour} />
      </h3>
      <button
        className="flex justify-center items-center text-center w-full mt-8 bg-[#543c52] hover:bg-[#361d32] text-[#edd2cb] py-2 rounded-2xl"
        onClick={() => setShowForm(true)}
      >
        Відправити заявку
      </button>
    </>
  );
};

export default TourSummary;
