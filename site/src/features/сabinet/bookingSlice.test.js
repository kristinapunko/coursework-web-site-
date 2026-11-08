import { describe, expect, it } from 'vitest';
import reducer, {
  cancelBooking,
  fetchBookings,
  sendBookingRequest,
} from './bookingSlice';

const stateWithError = {
  loading: false,
  bookingStatus: [{ id: 1, status: 'pending' }],
  error: 'Попередня помилка',
};

describe('booking async state', () => {
  it.each([
    sendBookingRequest.pending,
    fetchBookings.pending,
    cancelBooking.pending,
  ])('clears a stale error when a request starts', (pendingAction) => {
    const state = reducer(stateWithError, pendingAction('request-id'));

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('clears a stale error after bookings load successfully', () => {
    const bookings = [{ id: 2, status: 'confirmed' }];
    const state = reducer(
      stateWithError,
      fetchBookings.fulfilled(bookings, 'request-id'),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.bookingStatus).toEqual(bookings);
  });

  it('keeps the readable rejection message', () => {
    const state = reducer(
      stateWithError,
      fetchBookings.rejected(null, 'request-id', undefined, 'Сервер недоступний'),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Сервер недоступний');
  });
});
