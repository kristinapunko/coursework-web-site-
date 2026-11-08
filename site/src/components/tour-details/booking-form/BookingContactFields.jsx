import FieldError from './FieldError';

const inputClassName =
  'mt-1 w-full rounded-xl border border-[#361d32]/30 p-2 text-[#361d32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#361d32]';

const BookingContactFields = ({ errors, onChange, registerField, values }) => (
  <>
    <label className="text-sm text-[#543c52]">
      Контактна особа
      <input
        type="text"
        name="contact_name"
        aria-label="Контактна особа"
        ref={registerField('contact_name')}
        value={values.contact_name}
        onChange={onChange}
        aria-invalid={Boolean(errors.contact_name)}
        aria-describedby={errors.contact_name ? 'contact-name-error' : undefined}
        className={inputClassName}
      />
      <FieldError id="contact-name-error">{errors.contact_name}</FieldError>
    </label>

    <label className="text-sm text-[#543c52]">
      Email
      <input
        type="email"
        name="contact_email"
        aria-label="Email"
        ref={registerField('contact_email')}
        value={values.contact_email}
        onChange={onChange}
        aria-invalid={Boolean(errors.contact_email)}
        aria-describedby={errors.contact_email ? 'contact-email-error' : undefined}
        className={inputClassName}
      />
      <FieldError id="contact-email-error">{errors.contact_email}</FieldError>
    </label>

    <label className="text-sm text-[#543c52]">
      Телефон
      <input
        type="tel"
        name="contact_phone"
        aria-label="Телефон"
        ref={registerField('contact_phone')}
        value={values.contact_phone}
        onChange={onChange}
        placeholder="+380 00 000 00 00"
        aria-invalid={Boolean(errors.contact_phone)}
        aria-describedby={errors.contact_phone ? 'contact-phone-error' : undefined}
        className={inputClassName}
      />
      <FieldError id="contact-phone-error">{errors.contact_phone}</FieldError>
    </label>
  </>
);

export default BookingContactFields;
