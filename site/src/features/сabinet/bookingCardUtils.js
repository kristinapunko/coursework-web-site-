import { differenceInDays, parseISO, startOfDay } from 'date-fns';

export const getDaysRemaining = (startDate, today = new Date()) => {
  if (!startDate) return null;

  const tourStart = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  if (Number.isNaN(tourStart.getTime())) return null;

  return differenceInDays(startOfDay(tourStart), startOfDay(today));
};

export const getUkrainianDayLabel = (days) => {
  const absoluteDays = Math.abs(days);
  const lastTwoDigits = absoluteDays % 100;
  const lastDigit = absoluteDays % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'днів';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дні';
  return 'днів';
};

export const canCancelBooking = (status, daysRemaining) => (
  status !== 'canceled'
  && daysRemaining !== null
  && daysRemaining >= 14
);

