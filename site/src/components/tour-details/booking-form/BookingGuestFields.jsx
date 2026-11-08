import FieldError from './FieldError';

const inputClassName =
  'mt-1 w-full rounded-xl border border-[#361d32]/30 p-2 text-[#361d32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#361d32]';

const BookingGuestFields = ({ errors, onChange, registerField, values }) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <label className="text-sm text-[#543c52]">
        Дорослі
        <input
          type="number"
          name="adults"
          aria-label="Дорослі"
          ref={registerField('adults')}
          min="1"
          value={values.adults}
          onChange={onChange}
          aria-invalid={Boolean(errors.adults || errors.guests)}
          aria-describedby={
            [errors.adults && 'adults-error', errors.guests && 'guests-error']
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={inputClassName}
        />
        <FieldError id="adults-error">{errors.adults}</FieldError>
      </label>
      <label className="text-sm text-[#543c52]">
        Діти
        <input
          type="number"
          name="children"
          aria-label="Діти"
          ref={registerField('children')}
          min="0"
          value={values.children}
          onChange={onChange}
          aria-invalid={Boolean(errors.children || errors.guests)}
          aria-describedby={
            [errors.children && 'children-error', errors.guests && 'guests-error']
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={inputClassName}
        />
        <FieldError id="children-error">{errors.children}</FieldError>
      </label>
    </div>
    <FieldError id="guests-error">{errors.guests}</FieldError>
  </>
);

export default BookingGuestFields;
