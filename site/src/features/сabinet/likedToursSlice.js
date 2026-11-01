import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchLikedTours = createAsyncThunk(
  'likedTours/fetchLikedTours',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await api.get('/cabinet/liked-tours/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleLike = createAsyncThunk(
  'likedTours/toggleLike',
  async (tourId, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await api.post('/cabinet/toggle-like/', { tour: tourId });
      return { tourId, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const likedToursSlice = createSlice({
  name: 'likedTours',
  initialState: {
    likedTourIds: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearLikedTours(state) {
      state.likedTourIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikedTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikedTours.fulfilled, (state, action) => {
        state.loading = false;
        state.likedTourIds = action.payload;
      })
      .addCase(fetchLikedTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.likedTourIds = [];
      })
      .addCase(toggleLike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        const { tourId, status } = action.payload;
        if (status === 'liked') {
          state.likedTourIds.push(tourId);
        } else if (status === 'unliked') {
          state.likedTourIds = state.likedTourIds.filter((id) => id !== tourId);
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearLikedTours } = likedToursSlice.actions;
export default likedToursSlice.reducer;

export const selectLikedTourIds = (state) => state.likedTours.likedTourIds;
export const selectLikedToursLoading = (state) => state.likedTours.loading;
export const selectLikedToursError = (state) => state.likedTours.error;
