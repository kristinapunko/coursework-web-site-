import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Filters from './Filters';
import toursReducer from '../features/tours/toursSlice';

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
};

const renderFilters = (initialEntry = '/alltours') => {
  const initialToursState = toursReducer(undefined, { type: 'test/init' });
  const store = configureStore({
    reducer: { tours: toursReducer },
    preloadedState: {
      tours: {
        ...initialToursState,
        tours: [{ id: 1 }],
        countries: ['Україна', 'Польща'],
        cities: ['Київ', 'Львів'],
      },
    },
  });

  return {
    store,
    user: userEvent.setup(),
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Filters />
          <LocationProbe />
        </MemoryRouter>
      </Provider>
    ),
  };
};

const currentParams = () => {
  const location = screen.getByTestId('location').textContent;
  return new URLSearchParams(location.split('?')[1] || '');
};

describe('Filters integration', () => {
  it('writes selected country and departure city to the URL parameters', async () => {
    const { user } = renderFilters();

    await user.click(screen.getByText('Всі країни'));
    await user.click(screen.getByText('Україна'));

    await waitFor(() => expect(currentParams().get('country')).toBe('Україна'));

    await user.click(screen.getByText('Всі міста'));
    await user.click(screen.getByText('Київ'));

    await waitFor(() => {
      expect(currentParams().get('country')).toBe('Україна');
      expect(currentParams().get('city')).toBe('Київ');
    });
  });

  it('submits a search term and resets all parameters', async () => {
    const { user } = renderFilters();

    await user.type(screen.getByPlaceholderText('Пошук...'), 'Карпати');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(currentParams().get('q')).toBe('Карпати'));

    await user.click(screen.getByRole('button', { name: /скинути фільтри/i }));
    await waitFor(() => expect(currentParams().toString()).toBe(''));
  });

  it('updates sorting beside the reset button and returns to page one', async () => {
    const { user } = renderFilters('/alltours?country=Україна&page=3');

    await user.click(screen.getByText('Дата: найближчі'));
    await user.click(screen.getByText('Ціна: від вищої'));

    await waitFor(() => {
      expect(currentParams().get('country')).toBe('Україна');
      expect(currentParams().get('sort')).toBe('price-desc');
      expect(currentParams().has('page')).toBe(false);
    });
  });
});
