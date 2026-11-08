
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../utils/apiErrors';

const initialState = {
    loading: false,
    reviews: [],
    error: "",
};

export const addReview = createAsyncThunk(
    'reviews/addReview',
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
            return rejectWithValue(getApiErrorMessage(error, 'Не вдалося додати відгук.'));
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
      return rejectWithValue(getApiErrorMessage(error, 'Не вдалося завантажити відгуки.'));
    }
  },
  {
    condition: (_, { getState }) => !getState().reviews.loading,
  }
);

export const updateReview = createAsyncThunk(
    'reviews/updateReview',
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
            return rejectWithValue(getApiErrorMessage(error, 'Не вдалося оновити відгук.'));
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
        return rejectWithValue(getApiErrorMessage(error, 'Не вдалося видалити відгук.'));
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
            state.error = null;
            state.reviews = action.payload;
          })
          .addCase(fetchReviews.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
          })
          // Add review
          .addCase(addReview.fulfilled, (state, action) => {
            state.error = null;
            state.reviews.push(action.payload);
          })
          // Update review
          .addCase(updateReview.fulfilled, (state, action) => {
            state.error = null;
            const index = state.reviews.findIndex((r) => r.id === action.payload.id);
            if (index !== -1) {
              state.reviews[index] = action.payload;
            }
          })
          // Delete review
          .addCase(deleteReview.fulfilled, (state, action) => {
            state.reviews = state.reviews.filter((r) => r.id !== action.payload);
            state.error = null;
            state.loading = false;
          });
      },
    });

    export default reviewsSlice.reducer;
