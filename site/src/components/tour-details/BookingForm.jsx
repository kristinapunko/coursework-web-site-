import { useState } from 'react';
import {
  createBookingInitialValues,
  normalizeBookingForm,
  validateBookingForm,
} from '../../features/сabinet/bookingValidation';

const FieldError = ({ children }) => (
  children ? <p className="mt-1 text-sm text-red-600" role="alert">{children}</p> : null
);

const BookingForm = ({ tour, user, onBack, onConfirmed, onSubmit }) => {
  const [values, setValues] = useState(() => createBookingInitialValues(tour, user));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, guests: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateBookingForm(values, tour);
    setErrors(validationErrors);
    setSubmitError('');
    if (Object.keys(validationErrors).length > 0) return;

    const bookingData = normalizeBookingForm(values);
    setSubmitting(true);
    try {
      const booking = await onSubmit(bookingData);
      onConfirmed({ ...bookingData, ...booking });
    } catch (error) {
      setSubmitError(String(error?.message || error || 'Не вдалося створити бронювання.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit} noValidate>
      <h2 className="text-xl text-center text-[#361d32] font-semibold">Дані бронювання</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm text-[#543c52]">
          Дата початку
          <input
            type="date"
            name="travel_start_date"
            min={tour.start_date}
            max={tour.end_date}
            value={values.travel_start_date}
            onChange={updateValue}
            className="mt-1 w-full rounded-lg border p-2"
          />
          <FieldError>{errors.travel_start_date}</FieldError>
        </label>
        <label className="text-sm text-[#543c52]">
          Дата завершення
          <input
            type="date"
            name="travel_end_date"
            min={tour.start_date}
            max={tour.end_date}
            value={values.travel_end_date}
            onChange={updateValue}
            className="mt-1 w-full rounded-lg border p-2"
          />
          <FieldError>{errors.travel_end_date}</FieldError>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-[#543c52]">
          Дорослі
          <input
            type="number"
            name="adults"
            min="1"
            value={values.adults}
            onChange={updateValue}
            className="mt-1 w-full rounded-lg border p-2"
          />
          <FieldError>{errors.adults}</FieldError>
        </label>
        <label className="text-sm text-[#543c52]">
          Діти
          <input
            type="number"
            name="children"
            min="0"
            value={values.children}
            onChange={updateValue}
            className="mt-1 w-full rounded-lg border p-2"
          />
          <FieldError>{errors.children}</FieldError>
        </label>
      </div>
      <FieldError>{errors.guests}</FieldError>

      <label className="text-sm text-[#543c52]">
        Контактна особа
        <input
          type="text"
          name="contact_name"
          value={values.contact_name}
          onChange={updateValue}
          className="mt-1 w-full rounded-lg border p-2"
        />
        <FieldError>{errors.contact_name}</FieldError>
      </label>
      <label className="text-sm text-[#543c52]">
        Email
        <input
          type="email"
          name="contact_email"
          value={values.contact_email}
          onChange={updateValue}
          className="mt-1 w-full rounded-lg border p-2"
        />
        <FieldError>{errors.contact_email}</FieldError>
      </label>
      <label className="text-sm text-[#543c52]">
        Телефон
        <input
          type="tel"
          name="contact_phone"
          value={values.contact_phone}
          onChange={updateValue}
          placeholder="+380 00 000 00 00"
          className="mt-1 w-full rounded-lg border p-2"
        />
        <FieldError>{errors.contact_phone}</FieldError>
      </label>

      {submitError && <p className="text-sm text-red-600" role="alert">{submitError}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-[#543c52] py-2 text-[#edd2cb] hover:bg-[#361d32] disabled:opacity-50"
      >
        {submitting ? 'Надсилання…' : 'Підтвердити бронювання'}
      </button>
      <button type="button" className="text-[#361d32] underline" onClick={onBack}>
        Назад до інформації
      </button>
    </form>
  );
};

export default BookingForm;
