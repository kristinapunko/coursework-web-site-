export const createBookingInitialValues = (tour, user) => ({
  travel_start_date: tour.start_date || '',
  travel_end_date: tour.end_date || '',
  adults: 1,
  children: 0,
  contact_name: user?.username || '',
  contact_email: user?.email || '',
  contact_phone: '',
});

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validateBookingForm = (values, tour) => {
  const errors = {};
  const adults = Number(values.adults);
  const children = Number(values.children);
  const phoneDigits = String(values.contact_phone).replace(/\D/g, '');

  if (!values.travel_start_date) {
    errors.travel_start_date = 'Оберіть дату початку.';
  } else if (values.travel_start_date < tour.start_date) {
    errors.travel_start_date = 'Дата початку має бути в межах туру.';
  }

  if (!values.travel_end_date) {
    errors.travel_end_date = 'Оберіть дату завершення.';
  } else if (values.travel_end_date < values.travel_start_date) {
    errors.travel_end_date = 'Дата завершення не може бути раніше дати початку.';
  } else if (values.travel_end_date > tour.end_date) {
    errors.travel_end_date = 'Дата завершення має бути в межах туру.';
  }

  if (!Number.isInteger(adults) || adults < 1) {
    errors.adults = 'Потрібен щонайменше один дорослий.';
  }
  if (!Number.isInteger(children) || children < 0) {
    errors.children = 'Кількість дітей не може бути від’ємною.';
  }
  if (Number.isInteger(adults) && Number.isInteger(children) && adults + children > tour.available_seats) {
    errors.guests = `Доступно лише ${tour.available_seats} місць.`;
  }

  if (String(values.contact_name).trim().length < 2) {
    errors.contact_name = 'Вкажіть ім’я контактної особи.';
  }
  if (!isValidEmail(String(values.contact_email).trim())) {
    errors.contact_email = 'Вкажіть коректну електронну адресу.';
  }
  if (phoneDigits.length < 7) {
    errors.contact_phone = 'Вкажіть коректний номер телефону.';
  }

  return errors;
};

export const normalizeBookingForm = (values) => ({
  ...values,
  adults: Number(values.adults),
  children: Number(values.children),
  contact_name: values.contact_name.trim(),
  contact_email: values.contact_email.trim(),
  contact_phone: values.contact_phone.trim(),
});
