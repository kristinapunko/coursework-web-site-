import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../api/client';
import { DEFAULT_DETAIL_FILTERS } from './filterParams';

const initialState = {
  loading: false,
  tourDetails: [],
  selectedTourDetails: null,
  filters: { ...DEFAULT_DETAIL_FILTERS },
  countries: [],
  error: "",
};

export const fetchTourDetails = createAsyncThunk(
  'tourDetails/fetchTourDetails', 
  async () => {
    const response = await api.get('/tours/tour-details/?format=json');
    return response.data;
  },
  {
    condition: (_, { getState }) => {
      const { loading, tourDetails } = getState().tourDetails;
      return !loading && tourDetails.length === 0;
    },
  }
);

export const fetchTourDetailsById = createAsyncThunk(
  'tourDetails/fetchTourDetailsById',
  async (id) => {
    const response = await api.get(`/tours/tour-details/${id}/?format=json`);
    return response.data;
  }
);

const tourDetailsSlice = createSlice({
  name: 'tourDetails',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...DEFAULT_DETAIL_FILTERS,
        ...action.payload 
      };
    },
    resetFilters: (state) => {
      state.filters = { ...DEFAULT_DETAIL_FILTERS };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTourDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTourDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.tourDetails = action.payload;
      })
      .addCase(fetchTourDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTourDetailsById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTourDetailsById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTourDetails = action.payload;
      })
      .addCase(fetchTourDetailsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

const filterTours = (tourDetails, filters) => {
  return tourDetails.filter(tour => {
    return !filters.thematicFilter || tour[filters.thematicFilter] === true;
  });
};

const selectTourDetails = (state) => state.tourDetails.tourDetails;
const selectTourDetailFilters = (state) => state.tourDetails.filters;

export const selectFilteredTourDetails = createSelector(
  [selectTourDetails, selectTourDetailFilters],
  filterTours
);

export const { setFilters, resetFilters, } = tourDetailsSlice.actions;
export default tourDetailsSlice.reducer;
