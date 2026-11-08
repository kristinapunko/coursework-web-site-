import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../utils/apiErrors';

const initialState = {
  loading: false,
  agencyReviews: [],
  reply: {},
  error: "",
};

export const fetchAgencyReviews = createAsyncThunk(
  'agencyReviews/fetchAgencyReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tours/agency-reviews/');
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не вдалося завантажити відгуки.'));
    }
  }
);

export const fetchAgencyReply = createAsyncThunk(
  'reviews/fetchAgencyReply',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tours/agency-reviews/replies/');
      const repliesByReview = response.data.reduce((acc, reply) => {
        const reviewId = reply.review;
        if (!acc[reviewId]) acc[reviewId] = [];
        acc[reviewId].push(reply);
        return acc;
      }, {});
      return repliesByReview;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не вдалося завантажити відповіді.'));
    }
  }
);

export const addAgencyReview = createAsyncThunk(
  'agencyReviews/addAgencyReview',
  async ({ reviewData }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token found');
      const response = await api.post(
        '/tours/agency-reviews/',
        {
          rating: reviewData.rating,
          feedback: reviewData.comment,
          pros: reviewData.pros,
          cons: reviewData.cons,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не вдалося додати відгук.'));
    }
  }
);

export const addAgencyReply = createAsyncThunk(
  'reply/addAgencyReply',
  async ({ agencyReviewId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token found');
      
      const response = await api.post(
        `/tours/agency-reviews/${agencyReviewId}/replies/create/`,
        {   review: agencyReviewId,
            text: reviewData.comment }
      );
      return { reviewId: agencyReviewId, reply: response.data };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Не вдалося додати відповідь.'));
    }
  }
);

export const updateAgencyReview = createAsyncThunk(
    'agencyReviews/updateAgencyReview',
    async ({ agencyReviewId, reviewData }, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No token found');
  
        const response = await api.put(
          `/tours/agency-reviews/${agencyReviewId}/`,
          {
            rating: reviewData.rating,
            feedback: reviewData.feedback,
            pros: reviewData.pros,
            cons: reviewData.cons,
          }
        );
        return response.data;
      } catch (error) {
        return rejectWithValue(getApiErrorMessage(error, 'Не вдалося оновити відгук.'));
      }
    }
  );

export const deleteAgencyReview = createAsyncThunk(
    'agencyReviews/deleteAgencyReview', 
    async ({agencyReviewId}, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('No token found');

        await api.delete(`/tours/agency-reviews/${agencyReviewId}/`);
        return agencyReviewId; 
      } catch (error) {
        return rejectWithValue(getApiErrorMessage(error, 'Не вдалося видалити відгук.'));
      }
    }
  );

const reviewsSlice = createSlice({
  name: 'agencyReviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgencyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgencyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.agencyReviews = action.payload;
      })
      .addCase(fetchAgencyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAgencyReply.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAgencyReply.fulfilled, (state, action) => {
        state.loading = false;
        state.reply = action.payload;
      })
      .addCase(fetchAgencyReply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAgencyReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAgencyReview.fulfilled, (state, action) => {
        state.loading = false;
        state.agencyReviews.push(action.payload);
      })
      .addCase(addAgencyReview.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addAgencyReply.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAgencyReply.fulfilled, (state, action) => {
        state.loading = false;
        const { reviewId, reply } = action.payload;
        if (!state.reply[reviewId]) state.reply[reviewId] = [];
        state.reply[reviewId].push(reply);
      })
      .addCase(addAgencyReply.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateAgencyReview.fulfilled, (state, action) => {
        const index = state.agencyReviews.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
            state.agencyReviews[index] = action.payload;
        }
      })
      .addCase(deleteAgencyReview.fulfilled, (state, action) => {
        state.agencyReviews = state.agencyReviews.filter((r) => r.id !== action.payload);
        state.loading = false;
      });
  },
});

export default reviewsSlice.reducer;
