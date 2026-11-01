import { describe, expect, it } from 'vitest';
import { DEFAULT_DETAIL_FILTERS, DEFAULT_TOUR_FILTERS } from './filterParams';
import {
  selectPaginatedTours,
  selectSortedTours,
  selectTourPagination,
} from './tourSelectors';

const tours = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: `Tour ${index + 1}`,
  countries: 'Україна',
  cities: 'Київ',
  start_date: `2027-06-${String(index + 1).padStart(2, '0')}`,
  end_date: `2027-06-${String(index + 3).padStart(2, '0')}`,
  adults: 4,
  children: 0,
  hot_deal: false,
  promotion: index === 7,
  price: String((index + 1) * 1000),
  price_promotion: index === 7 ? '500' : '0',
  departure_by: 'Автобус',
  food: 'BB',
}));

const createState = ({ sort = 'date-asc', page = 1, theme = '' } = {}) => ({
  tours: {
    tours,
    filters: { ...DEFAULT_TOUR_FILTERS, sort, page },
  },
  tourDetails: {
    tourDetails: tours.map((tour) => ({
      tour: tour.id,
      beach_tour: tour.id % 2 === 0,
    })),
    filters: { ...DEFAULT_DETAIL_FILTERS, thematicFilter: theme },
  },
});

describe('tour sorting and pagination selectors', () => {
  it('sorts by the effective promotional price without mutating source data', () => {
    const state = createState({ sort: 'price-asc' });
    const originalOrder = state.tours.tours.map((tour) => tour.id);

    expect(selectSortedTours(state).map((tour) => tour.id)).toEqual([8, 1, 2, 3, 4, 5, 6, 7]);
    expect(state.tours.tours.map((tour) => tour.id)).toEqual(originalOrder);
  });

  it('supports descending date and duration sorting', () => {
    const byDate = createState({ sort: 'date-desc' });
    expect(selectSortedTours(byDate).map((tour) => tour.id)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);

    const byDuration = createState({ sort: 'duration-desc' });
    byDuration.tours.tours = byDuration.tours.tours.map((tour, index) => ({
      ...tour,
      end_date: `2027-06-${String((index + 1) * 2).padStart(2, '0')}`,
    }));
    expect(selectSortedTours(byDuration).map((tour) => tour.id)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('applies the thematic filter before calculating page metadata', () => {
    const state = createState({ theme: 'beach_tour' });

    expect(selectSortedTours(state).map((tour) => tour.id)).toEqual([2, 4, 6, 8]);
    expect(selectTourPagination(state)).toMatchObject({
      currentPage: 1,
      totalPages: 1,
      totalItems: 4,
    });
  });

  it('returns the requested page and clamps out-of-range pages', () => {
    const secondPage = createState({ page: 2 });
    expect(selectPaginatedTours(secondPage).map((tour) => tour.id)).toEqual([7, 8]);
    expect(selectTourPagination(secondPage).currentPage).toBe(2);

    const outOfRange = createState({ page: 99 });
    expect(selectTourPagination(outOfRange).currentPage).toBe(2);
    expect(selectPaginatedTours(outOfRange).map((tour) => tour.id)).toEqual([7, 8]);
  });
});
