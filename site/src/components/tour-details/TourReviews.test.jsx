import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer from '../../features/authentication/authSlice';
import reviewsReducer from '../../features/tours/reviewsSlice';
import api from '../../api/client';
import TourReviews from './TourReviews';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderReviews = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      reviews: reviewsReducer,
    },
    preloadedState: {
      auth: {
        user: { id: 7, username: 'traveler' },
        isLoggedIn: true,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
    },
  });

  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <TourReviews tourId="22" />
      </Provider>,
    ),
  };
};

describe('TourReviews form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('accessToken', 'test-token');
    api.get.mockResolvedValue({ data: [] });
  });

  it('uses keyboard-accessible rating buttons and an inline validation message', async () => {
    const { user } = renderReviews();

    await user.click(await screen.findByRole('button', { name: 'Надіслати' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Будь ласка, вкажіть рейтинг та коментар.');
    expect(screen.getByRole('button', { name: '5 з 5' })).toHaveAttribute('aria-pressed', 'false');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('preserves the review draft when saving fails', async () => {
    api.post.mockRejectedValue({
      response: { data: { feedback: ['Такий відгук уже існує.'] } },
    });
    const { user } = renderReviews();
    const comment = await screen.findByLabelText('Ваш відгук');

    await user.type(comment, 'Дуже цікавий тур');
    await user.click(screen.getByRole('button', { name: '5 з 5' }));
    await user.click(screen.getByRole('button', { name: 'Надіслати' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Такий відгук уже існує.');
    expect(comment).toHaveValue('Дуже цікавий тур');
    expect(screen.getByRole('button', { name: '5 з 5' })).toHaveAttribute('aria-pressed', 'true');
  });
});
