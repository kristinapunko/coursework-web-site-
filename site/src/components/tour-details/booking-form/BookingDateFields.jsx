import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale/uk';
import 'react-datepicker/dist/react-datepicker.css';
import FieldError from './FieldError';

registerLocale('uk', uk);

const MONTHS_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const parseDate = (value) => (value ? parseISO(value) : null);

const DateInput = forwardRef(
  ({ value, onClick, placeholder, id, hasError, ariaLabelledBy, ariaDescribedBy }, ref) => (
    <button
      type="button"
      id={id}
      ref={ref}
      value={value || ''}
      onClick={onClick}
      aria-labelledby={ariaLabelledBy}
      aria-invalid={hasError ? 'true' : 'false'}
      aria-describedby={ariaDescribedBy}
      className={`mt-1 flex w-full items-center justify-between rounded-xl border !bg-white px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#361d32] ${
        hasError
          ? 'border-red-500 text-red-900'
          : 'border-[#361d32]/30 text-[#361d32] hover:border-[#361d32]'
      }`}
    >
      <span className={value ? 'font-medium text-[#361d32]' : 'text-[#543c52]/60'}>
        {value || placeholder}
      </span>
      <svg
        className="h-4 w-4 shrink-0 text-[#361d32]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </button>
  )
);
DateInput.displayName = 'DateInput';

const BookingDateFields = ({ errors, onDateChange, registerField, tour, values }) => {
  const startDate = parseDate(values.travel_start_date);
  const endDate = parseDate(values.travel_end_date);
  const minTourDate = parseDate(tour.start_date);
  const maxTourDate = parseDate(tour.end_date);

  const getDayClassName = (date) => {
    const isDisabled =
      (minTourDate && date < minTourDate) || (maxTourDate && date > maxTourDate);

    if (isDisabled) {
      return '!bg-transparent !text-[#361d32]/25 !cursor-not-allowed !w-9 !h-9 !leading-9 !rounded-lg !m-0.5 !shadow-none';
    }

    if ((startDate && isSameDay(date, startDate)) || (endDate && isSameDay(date, endDate))) {
      return '!bg-[#361d32] !text-[#edd2cb] !font-bold !w-9 !h-9 !leading-9 !rounded-lg !m-0.5 !shadow-sm';
    }

    const inRange =
      startDate &&
      endDate &&
      startDate <= endDate &&
      isWithinInterval(date, { start: startDate, end: endDate });

    if (inRange) {
      return '!bg-[#543c52] !text-[#edd2cb] !font-semibold hover:!bg-[#361d32] !w-9 !h-9 !leading-9 !rounded-lg !m-0.5';
    }

    return '!bg-[#edd2cb]/45 !text-[#361d32] !font-semibold hover:!bg-[#543c52] hover:!text-[#edd2cb] !w-9 !h-9 !leading-9 !rounded-lg !m-0.5 transition-colors';
  };

  const commonProps = {
    locale: 'uk',
    dateFormat: 'dd.MM.yyyy',
    showPopperArrow: false,
    popperPlacement: 'bottom-start',
    wrapperClassName: 'w-full',
    calendarClassName:
      '!font-sans !rounded-2xl !border !border-[#361d32]/20 !bg-white !p-0 !shadow-xl overflow-hidden [&>div>.react-datepicker__header]:!bg-white [&>div>.react-datepicker__header]:!border-b [&>div>.react-datepicker__header]:!border-[#361d32]/15 [&>div>.react-datepicker__header]:!pt-0 [&>div>.react-datepicker__header]:!pb-0 [&_.react-datepicker__month]:!m-0 [&_.react-datepicker__month]:!p-2 [&_.react-datepicker__day-names]:!bg-white [&_.react-datepicker__day-names]:!flex [&_.react-datepicker__day-names]:!justify-between [&_.react-datepicker__day-names]:!px-2 [&_.react-datepicker__day-names]:!pb-2 [&_.react-datepicker__day-names]:!m-0',
    weekDayClassName: () => '!text-[#543c52] !font-semibold !text-xs !w-9 !text-center',
    dayClassName: getDayClassName,
    renderCustomHeader: ({
      date,
      decreaseMonth,
      increaseMonth,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled,
    }) => (
      <div className="flex items-center justify-between !bg-white px-3 pt-3 pb-2 text-[#361d32]">
        <button
          type="button"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          aria-label="Попередній місяць"
          className="flex h-7 w-7 items-center justify-center rounded-lg !bg-[#edd2cb]/45 text-[#361d32] transition hover:!bg-[#edd2cb] disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-sm font-semibold tracking-wide text-[#361d32]">
          {MONTHS_UK[date.getMonth()]} {date.getFullYear()}
        </span>
        <button
          type="button"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          aria-label="Наступний місяць"
          className="flex h-7 w-7 items-center justify-center rounded-lg !bg-[#edd2cb]/45 text-[#361d32] transition hover:!bg-[#edd2cb] disabled:opacity-30"
        >
          ›
        </button>
      </div>
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col text-sm text-[#543c52]">
        <label id="travel-start-date-label" htmlFor="travel-start-date">
          Дата початку
        </label>
        <DatePicker
          {...commonProps}
          name="travel_start_date"
          ref={registerField('travel_start_date')}
          selected={startDate}
          startDate={startDate}
          endDate={endDate}
          minDate={minTourDate}
          maxDate={maxTourDate}
          onChange={onDateChange('travel_start_date')}
          selectsStart
          customInput={
            <DateInput
              id="travel-start-date"
              placeholder="Оберіть дату"
              hasError={Boolean(errors.travel_start_date)}
              ariaLabelledBy="travel-start-date-label"
              ariaDescribedBy={errors.travel_start_date ? 'travel-start-date-error' : undefined}
            />
          }
        />
        <FieldError id="travel-start-date-error">{errors.travel_start_date}</FieldError>
      </div>

      <div className="flex flex-col text-sm text-[#543c52]">
        <label id="travel-end-date-label" htmlFor="travel-end-date">
          Дата завершення
        </label>
        <DatePicker
          {...commonProps}
          name="travel_end_date"
          ref={registerField('travel_end_date')}
          selected={endDate}
          startDate={startDate}
          endDate={endDate}
          minDate={startDate || minTourDate}
          maxDate={maxTourDate}
          onChange={onDateChange('travel_end_date')}
          selectsEnd
          customInput={
            <DateInput
              id="travel-end-date"
              placeholder="Оберіть дату"
              hasError={Boolean(errors.travel_end_date)}
              ariaLabelledBy="travel-end-date-label"
              ariaDescribedBy={errors.travel_end_date ? 'travel-end-date-error' : undefined}
            />
          }
        />
        <FieldError id="travel-end-date-error">{errors.travel_end_date}</FieldError>
      </div>
    </div>
  );
};

export default BookingDateFields;
