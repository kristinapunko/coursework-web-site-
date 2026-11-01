import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

const initialState = {
  loading: false,
  tourDetails: [],
  selectedTourDetails: null,
  filters: {
    thematicFilter: "",
    beach_tour: false,
    festivals: false,
    winter_tour: false,
    extreme_tour: false,
    natural_tour: false,
    gastronomic_tour: false
  },
  filteredTours: [],
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
        ...initialState.filters, 
        ...action.payload 
      };
      state.filteredTours = filterTours(state.tourDetails, state.filters);      
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredTours = state.tourDetails;
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
        state.filteredTours = filterTours(action.payload, state.filters);
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
  if (!filters.thematicFilter) return tourDetails;
  
  return tourDetails.filter(tour => {
    return tour[filters.thematicFilter] === true;
  });
};

export const { setFilters, resetFilters, } = tourDetailsSlice.actions;
export default tourDetailsSlice.reducer;
