const BookingConfirmation = ({ booking, tour, onClose }) => (
  <section className="rounded-2xl bg-[#f1e8e6] p-5 text-[#361d32]" role="status">
    <div className="mb-4 text-center text-4xl" aria-hidden="true">✓</div>
    <h2 className="text-center text-2xl font-semibold">Бронювання створено</h2>
    <p className="mt-2 text-center">Ми надіслали заявку на підтвердження.</p>
    <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
      <dt className="font-semibold">Тур</dt><dd>{tour.name}</dd>
      <dt className="font-semibold">Номер заявки</dt><dd>#{booking.id}</dd>
      <dt className="font-semibold">Дати</dt><dd>{booking.travel_start_date} — {booking.travel_end_date}</dd>
      <dt className="font-semibold">Гості</dt><dd>{booking.adults} дор., {booking.children} дит.</dd>
      <dt className="font-semibold">Контакт</dt><dd>{booking.contact_name}</dd>
      <dt className="font-semibold">Email</dt><dd>{booking.contact_email}</dd>
      <dt className="font-semibold">Телефон</dt><dd>{booking.contact_phone}</dd>
    </dl>
    <button
      type="button"
      onClick={onClose}
      className="mt-6 w-full rounded-2xl bg-[#543c52] py-2 text-white hover:bg-[#361d32]"
    >
      Готово
    </button>
  </section>
);

export default BookingConfirmation;
