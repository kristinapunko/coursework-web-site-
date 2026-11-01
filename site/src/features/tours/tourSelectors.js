import { createSelector } from '@reduxjs/toolkit';
import { selectFilteredTours } from './toursSlice';

export const TOURS_PER_PAGE = 6;

const selectThematicFilter = (state) => state.tourDetails.filters.thematicFilter;
const selectTourDetails = (state) => state.tourDetails.tourDetails;
const selectSort = (state) => state.tours.filters.sort;
const selectRequestedPage = (state) => state.tours.filters.page;

const effectivePrice = (tour) => Number(
  tour.promotion ? tour.price_promotion : tour.price
);

const duration = (tour) => (
  new Date(tour.end_date).getTime() - new Date(tour.start_date).getTime()
);

export const selectThematicTours = createSelector(
  [selectFilteredTours, selectTourDetails, selectThematicFilter],
  (tours, details, thematicFilter) => {
    if (!thematicFilter) return [...tours];

    const matchingIds = new Set(
      details
        .filter((detail) => detail[thematicFilter] === true)
        .map((detail) => detail.tour)
    );
    return tours.filter((tour) => matchingIds.has(tour.id));
  }
);

export const selectSortedTours = createSelector(
  [selectThematicTours, selectSort],
  (tours, sort) => {
    const sortedTours = [...tours];
    const comparators = {
      'date-asc': (left, right) => new Date(left.start_date) - new Date(right.start_date),
      'date-desc': (left, right) => new Date(right.start_date) - new Date(left.start_date),
      'price-asc': (left, right) => effectivePrice(left) - effectivePrice(right),
      'price-desc': (left, right) => effectivePrice(right) - effectivePrice(left),
      'duration-asc': (left, right) => duration(left) - duration(right),
      'duration-desc': (left, right) => duration(right) - duration(left),
    };

    return sortedTours.sort((left, right) => {
      const comparison = (comparators[sort] || comparators['date-asc'])(left, right);
      return comparison || left.id - right.id;
    });
  }
);

export const selectTourPagination = createSelector(
  [selectSortedTours, selectRequestedPage],
  (tours, requestedPage) => {
    const totalItems = tours.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / TOURS_PER_PAGE));
    const currentPage = Math.min(Math.max(Number(requestedPage) || 1, 1), totalPages);

    return {
      currentPage,
      totalPages,
      totalItems,
      pageSize: TOURS_PER_PAGE,
    };
  }
);

export const selectPaginatedTours = createSelector(
  [selectSortedTours, selectTourPagination],
  (tours, { currentPage, pageSize }) => {
    const start = (currentPage - 1) * pageSize;
    return tours.slice(start, start + pageSize);
  }
);
