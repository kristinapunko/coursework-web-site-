import { describe, expect, it } from 'vitest';
import {
  canCancelBooking,
  getDaysRemaining,
  getUkrainianDayLabel,
} from './bookingCardUtils';

describe('booking card date helpers', () => {
  it('uses the tour start date and keeps the 14-day boundary cancellable', () => {
    const today = new Date(2027, 4, 1, 18, 30);

    expect(getDaysRemaining('2027-05-15', today)).toBe(14);
    expect(canCancelBooking('pending', 14)).toBe(true);
    expect(canCancelBooking('confirmed', 14)).toBe(true);
    expect(canCancelBooking('pending', 13)).toBe(false);
    expect(canCancelBooking('canceled', 14)).toBe(false);
  });

  it.each([
    [0, 'днів'],
    [1, 'день'],
    [2, 'дні'],
    [4, 'дні'],
    [5, 'днів'],
    [11, 'днів'],
    [21, 'день'],
  ])('pluralizes %i days as %s', (days, label) => {
    expect(getUkrainianDayLabel(days)).toBe(label);
  });
});

