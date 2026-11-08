import { useRef, useState } from 'react';
import {
  createBookingInitialValues,
  normalizeBookingForm,
  validateBookingForm,
} from '../../features/сabinet/bookingValidation';
import BookingContactFields from './booking-form/BookingContactFields';
import BookingDateFields from './booking-form/BookingDateFields';
import BookingGuestFields from './booking-form/BookingGuestFields';
import { serializeDate } from './booking-form/bookingFormUtils';

const FIELD_ORDER = [
  'travel_start_date',
  'travel_end_date',
  'adults',
  'children',
  'contact_name',
  'contact_email',
  'contact_phone',
];

const BookingForm = ({ tour, user, onBack, onConfirmed, onSubmit }) => {
  const [values, setValues] = useState(() => createBookingInitialValues(tour, user));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fieldRefs = useRef({});

  const registerField = (name) => (node) => {
    fieldRefs.current[name] = node;
  };

  const updateDate = (name) => (date) => {
    setValues((current) => {
      const next = { ...current, [name]: serializeDate(date) };
      if (
        name === 'travel_start_date' &&
        next.travel_end_date &&
        next.travel_start_date > next.travel_end_date
      ) {
        next.travel_end_date = '';
      }
      return next;
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, guests: undefined }));
  };

  const focusFirstInvalidField = (validationErrors) => {
    const firstInvalidField =
      FIELD_ORDER.find((name) => validationErrors[name]) ||
      (validationErrors.guests ? 'adults' : null);
    const firstInvalidControl = fieldRefs.current[firstInvalidField];

    if (typeof firstInvalidControl?.setFocus === 'function') {
      firstInvalidControl.setFocus();
    } else {
      firstInvalidControl?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateBookingForm(values, tour);
    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) {
      focusFirstInvalidField(validationErrors);
      return;
    }

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
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <h2 className="text-center text-xl font-semibold text-[#361d32]">Дані бронювання</h2>

      <BookingDateFields
        tour={tour}
        values={values}
        errors={errors}
        onDateChange={updateDate}
        registerField={registerField}
      />
      <BookingGuestFields
        values={values}
        errors={errors}
        onChange={updateValue}
        registerField={registerField}
      />
      <BookingContactFields
        values={values}
        errors={errors}
        onChange={updateValue}
        registerField={registerField}
      />

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-[#543c52] py-2.5 font-medium text-[#edd2cb] transition hover:bg-[#361d32] disabled:opacity-50"
      >
        {submitting ? 'Надсилання…' : 'Підтвердити бронювання'}
      </button>
      <button type="button" className="text-sm text-[#361d32] underline" onClick={onBack}>
        Назад до інформації
      </button>
    </form>
  );
};

export default BookingForm;
