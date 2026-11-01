
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

const initialState = {
    loading: false,
    reviews: [],
    error: "",
};

export const addReview = createAsyncThunk(
    'reviwes/addReview',
    async ({ tourId, reviewData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');
            if (!tourId) throw new Error('Tour ID is missing');

            const response = await api.post(
              `/tours/${tourId}/reviews/`,
              { tour: tourId,
                rating: reviewData.rating,
                feedback: reviewData.comment, 
               }
          );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message || 'Booking request failed');
        }
    }
);


export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (tourIds, { rejectWithValue }) => {
    try {
      const ids = (Array.isArray(tourIds) ? tourIds : [tourIds]).filter(Boolean);
      if (!ids.length) return [];
      const response = await api.get('/tours/reviews/', {
        params: { tour_ids: [...new Set(ids)].join(',') },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
  {
    condition: (_, { getState }) => !getState().reviews.loading,
  }
);

export const updateReview = createAsyncThunk(
    'reviwes/updateReview',
    async ({reviewId, reviewData}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');

            const response = await api.put(
              `/tours/reviews/${reviewId}/`,
                  {
                      rating: reviewData.rating,
                      feedback: reviewData.feedback,
                 }
          );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to update review');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'reviews/deleteReview', 
    async ({ reviewId }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No token found');
  
        await api.delete(`/tours/reviews/${reviewId}/`);
        return reviewId; 
      } catch (error) {
        return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to delete review');
      }
    }
  );
  

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch reviews
        builder
          .addCase(fetchReviews.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchReviews.fulfilled, (state, action) => {
            state.loading = false;
            state.reviews = action.payload;
          })
          .addCase(fetchReviews.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Add review
          .addCase(addReview.fulfilled, (state, action) => {
            state.reviews.push(action.payload);
          })
          // Update review
          .addCase(updateReview.fulfilled, (state, action) => {
            const index = state.reviews.findIndex((r) => r.id === action.payload.id);
            if (index !== -1) {
              state.reviews[index] = action.payload;
            }
          })
          // Delete review
          .addCase(deleteReview.fulfilled, (state, action) => {
            state.reviews = state.reviews.filter((r) => r.id !== action.payload);
  state.loading = false;
          });
      },
    });

    export default reviewsSlice.reducer;
