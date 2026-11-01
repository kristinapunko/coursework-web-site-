import { describe, expect, it } from 'vitest';
import { DEFAULT_TOUR_FILTERS } from './filterParams';
import { selectFilteredTours } from './toursSlice';

const tours = [
  {
    id: 1,
    name: 'Карпати автобусом',
    countries: 'Україна',
    cities: 'Київ, Львів',
    start_date: '2027-06-01',
    end_date: '2027-06-10',
    adults: 4,
    children: 2,
    hot_deal: true,
    promotion: false,
    price: '120000',
    departure_by: 'Автобус',
    food: 'BB',
  },
  {
    id: 2,
    name: 'Пляжна Туреччина',
    countries: 'Туреччина',
    cities: 'Одеса',
    start_date: '2027-07-01',
    end_date: '2027-07-08',
    adults: 2,
    children: 0,
    hot_deal: false,
    promotion: true,
    price: '95000',
    price_promotion: '70000',
    departure_by: 'Літак',
    food: 'AI',
  },
  {
    id: 3,
    name: 'Бюджетний Львів',
    countries: 'Україна',
    cities: 'Київ',
    start_date: '2027-06-05',
    end_date: '2027-06-07',
    adults: 3,
    children: 1,
    hot_deal: true,
    promotion: false,
    price: '25000',
    departure_by: 'Автобус',
    food: 'BB',
  },
];

const stateWithFilters = (filters) => ({
  tours: {
    tours,
    filters: {
      ...DEFAULT_TOUR_FILTERS,
      ...filters,
    },
  },
});

describe('selectFilteredTours', () => {
  it('combines destination, capacity, price, transport, food, and premium filters', () => {
    const state = stateWithFilters({
      countries: 'Україна',
      cities: 'Київ',
      adults: 2,
      children: 2,
      hasChildren: true,
      hotTours: true,
      minPrice: 100000,
      maxPrice: 130000,
      transport: 'Автобус',
      selectedFood: ['BB'],
      premiumTours: true,
      tourIds: [1, 3],
    });

    expect(selectFilteredTours(state)).toEqual([tours[0]]);
  });

  it('uses the promotional price and memoizes unchanged inputs', () => {
    const state = stateWithFilters({ promotion: true, maxPrice: 80000 });
    const firstResult = selectFilteredTours(state);

    expect(firstResult).toEqual([tours[1]]);
    expect(selectFilteredTours(state)).toBe(firstResult);
  });
});
