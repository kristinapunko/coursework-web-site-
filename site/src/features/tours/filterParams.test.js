import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DETAIL_FILTERS,
  DEFAULT_TOUR_FILTERS,
  parseTourFilterParams,
  serializeTourFilterParams,
} from './filterParams';

describe('tour filter URL parameters', () => {
  it('parses typed, repeated, and thematic parameters', () => {
    const result = parseTourFilterParams(
      '?q=beach&country=Україна&city=Київ&start=2027-06-01&end=2027-06-10' +
      '&adults=2&children=1&withChildren=1&hot=1&promotion=1&minPrice=1000' +
      '&maxPrice=5000&transport=Автобус&food=BB&food=AI&premium=1&tour=4&tour=9' +
      '&theme=beach_tour'
    );

    expect(result.main).toEqual({
      ...DEFAULT_TOUR_FILTERS,
      searchQuery: 'beach',
      countries: 'Україна',
      cities: 'Київ',
      startDate: '2027-06-01',
      endDate: '2027-06-10',
      adults: 2,
      children: 1,
      hasChildren: true,
      hotTours: true,
      promotion: true,
      minPrice: 1000,
      maxPrice: 5000,
      transport: 'Автобус',
      selectedFood: ['BB', 'AI'],
      premiumTours: true,
      tourIds: [4, 9],
    });
    expect(result.details).toEqual({
      ...DEFAULT_DETAIL_FILTERS,
      thematicFilter: 'beach_tour',
      beach_tour: true,
    });
  });

  it('rejects invalid dates, counts, tour IDs, and themes', () => {
    const result = parseTourFilterParams(
      '?start=2027-02-30&end=not-a-date&adults=0&children=-1&tour=x&tour=-2' +
      '&theme=unknown&sort=unsupported&page=0'
    );

    expect(result.main.startDate).toBeNull();
    expect(result.main.endDate).toBeNull();
    expect(result.main.adults).toBeNull();
    expect(result.main.children).toBeNull();
    expect(result.main.tourIds).toEqual([]);
    expect(result.main.sort).toBe('date-asc');
    expect(result.main.page).toBe(1);
    expect(result.details).toEqual(DEFAULT_DETAIL_FILTERS);
  });

  it('serializes meaningful values, deduplicates arrays, and round-trips', () => {
    const params = serializeTourFilterParams({
      main: {
        ...DEFAULT_TOUR_FILTERS,
        searchQuery: '  Alps  ',
        countries: 'Швейцарія',
        selectedFood: ['BB', 'BB', 'AI'],
        tourIds: [3, 3, 8, -1],
        hotTours: true,
        minPrice: 0,
        sort: 'price-desc',
        page: 3,
      },
      details: {
        ...DEFAULT_DETAIL_FILTERS,
        thematicFilter: 'winter_tour',
      },
    });

    expect(params.get('q')).toBe('Alps');
    expect(params.get('country')).toBe('Швейцарія');
    expect(params.getAll('food')).toEqual(['BB', 'AI']);
    expect(params.getAll('tour')).toEqual(['3', '8']);
    expect(params.get('hot')).toBe('1');
    expect(params.has('minPrice')).toBe(false);
    expect(params.get('theme')).toBe('winter_tour');
    expect(params.get('sort')).toBe('price-desc');
    expect(params.get('page')).toBe('3');

    const parsed = parseTourFilterParams(params);
    expect(parsed.main.searchQuery).toBe('Alps');
    expect(parsed.main.selectedFood).toEqual(['BB', 'AI']);
    expect(parsed.main.tourIds).toEqual([3, 8]);
    expect(parsed.details.winter_tour).toBe(true);
    expect(parsed.main.sort).toBe('price-desc');
    expect(parsed.main.page).toBe(3);
  });
});
