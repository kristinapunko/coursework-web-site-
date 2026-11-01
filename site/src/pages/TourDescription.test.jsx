import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import toursReducer from '../features/tours/toursSlice';
import tourDetailsReducer from '../features/tours/tourDetailsSlice';
import authReducer from '../features/authentication/authSlice';
import likedToursReducer from '../features/сabinet/likedToursSlice';
import bookingReducer from '../features/сabinet/bookingSlice';
import reviewsReducer from '../features/tours/reviewsSlice';
import api from '../api/client';
import TourDescription from './TourDescription';

vi.mock('../api/client', () => ({
  API_BASE_URL: 'https://api.example.test',
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('../components/tour-details/TourGallery', () => ({
  default: () => <div data-testid="tour-gallery" />,
}));

vi.mock('../components/tour-details/TourReviews', () => ({
  default: () => <div data-testid="tour-reviews" />,
}));

const tourFixture = (availableSeats = 5) => ({
  id: 22,
  name: 'Тестовий тур',
  countries: 'Україна',
  cities: 'Львів',
  start_date: '2099-06-01',
  end_date: '2099-06-10',
  adults: 2,
  children: 1,
  available_seats: availableSeats,
  departure_by: 'Автобус',
  departure_from: 'Київ',
  return_from: 'Львів',
  food: 'BB',
  price: '25000',
  promotion: false,
});

const detailsFixture = {
  tour: 22,
  photos: [],
  program: 'День 1\nПрибуття',
  services: [],
  noservices: [],
};

const configureApi = (availableSeats = 5) => {
  api.get.mockImplementation((url) => {
    if (url === '/tours/22/?format=json') {
      return Promise.resolve({ data: tourFixture(availableSeats) });
    }
    if (url === '/tours/tour-details/22/?format=json') {
      return Promise.resolve({ data: detailsFixture });
    }
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
};

const createStore = ({ authenticated = false } = {}) => configureStore({
  reducer: {
    tours: toursReducer,
    tourDetails: tourDetailsReducer,
    auth: authReducer,
    likedTours: likedToursReducer,
    booking: bookingReducer,
    reviews: reviewsReducer,
  },
  preloadedState: {
    auth: {
      user: authenticated
        ? { id: 7, username: 'traveler', email: 'traveler@example.com' }
        : null,
      isLoggedIn: authenticated,
      initialized: true,
      status: authenticated ? 'succeeded' : 'idle',
      error: null,
    },
  },
});

const renderBookingFlow = ({ authenticated = false, availableSeats = 5 } = {}) => {
  configureApi(availableSeats);
  const store = createStore({ authenticated });
  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/tour/22']}>
          <Routes>
            <Route path="/tour/:id" element={<TourDescription />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  };
};

const openBookingForm = async (user) => {
  await user.click(await screen.findByRole('button', { name: 'Відправити заявку' }));
  return screen.getByRole('button', { name: 'Підтвердити бронювання' });
};

const enterPhone = async (user) => {
  await user.type(screen.getByLabelText('Телефон'), '+380501112233');
};

describe('TourDescription booking flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('validates contact fields before attempting to book', async () => {
    const { user } = renderBookingFlow({ authenticated: true });
    const submitButton = await openBookingForm(user);

    await user.clear(screen.getByLabelText('Email'));
    await user.click(submitButton);

    expect(screen.getByText('Вкажіть коректну електронну адресу.')).toBeInTheDocument();
    expect(screen.getByText('Вкажіть коректний номер телефону.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('validates authentication without dispatching', async () => {
    const unauthenticated = renderBookingFlow();
    const unauthenticatedSubmit = await openBookingForm(unauthenticated.user);
    await unauthenticated.user.type(screen.getByLabelText('Контактна особа'), 'Guest User');
    await unauthenticated.user.type(screen.getByLabelText('Email'), 'guest@example.com');
    await enterPhone(unauthenticated.user);
    await unauthenticated.user.click(unauthenticatedSubmit);

    expect(await screen.findByText('Будь ласка, увійдіть, щоб забронювати тур.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('validates available seats before dispatching', async () => {
    localStorage.setItem('accessToken', 'test-token');
    const { user } = renderBookingFlow({ authenticated: true, availableSeats: 0 });
    const submitButton = await openBookingForm(user);
    await enterPhone(user);

    await user.click(submitButton);

    expect(screen.getByText('Доступно лише 0 місць.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('dispatches validated data and displays the booking confirmation', async () => {
    localStorage.setItem('accessToken', 'test-token');
    const bookingResponse = {
      id: 101,
      user: 7,
      tour: 22,
      status: 'pending',
      travel_start_date: '2099-06-01',
      travel_end_date: '2099-06-10',
      adults: 1,
      children: 0,
      contact_name: 'traveler',
      contact_email: 'traveler@example.com',
      contact_phone: '+380501112233',
    };
    api.post.mockResolvedValue({ data: bookingResponse });
    const { store, user } = renderBookingFlow({ authenticated: true });
    const submitButton = await openBookingForm(user);
    await enterPhone(user);

    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/cabinet/bookings/', {
        tour: 22,
        travel_start_date: '2099-06-01',
        travel_end_date: '2099-06-10',
        adults: 1,
        children: 0,
        contact_name: 'traveler',
        contact_email: 'traveler@example.com',
        contact_phone: '+380501112233',
      });
    });
    expect(await screen.findByRole('heading', { name: 'Бронювання створено' })).toBeInTheDocument();
    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(store.getState().booking.bookingStatus).toContainEqual(bookingResponse);
  });
});
