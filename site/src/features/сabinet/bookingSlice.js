import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { getApiErrorMessage } from '../../utils/apiErrors';

const initialState = {
    loading: false,
    bookingStatus: [], 
    error: null,
};

export const sendBookingRequest = createAsyncThunk(
    'booking/sendBookingRequest',
    async ({ tourId, bookingData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');
            if (!tourId) throw new Error('Tour ID is missing');

            const response = await api.post('/cabinet/bookings/', {
                tour: tourId,
                ...bookingData,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Не вдалося створити бронювання.'));
        }
    }
);

export const fetchBookings = createAsyncThunk(
    'booking/fetchBookings',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');

            const response = await api.get('/cabinet/bookings/');
            return response.data;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Не вдалося завантажити бронювання.'));
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'booking/cancelBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');

            const response = await api.delete(`/cabinet/bookings/${bookingId}/`);
            return { bookingId, message: response.data.message }; // Повертаємо ID для оновлення стану
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error, 'Не вдалося скасувати бронювання.'));
        }
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        resetStatus: (state) => {
            state.bookingStatus = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendBookingRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendBookingRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.bookingStatus.push(action.payload);
            })
            .addCase(sendBookingRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.bookingStatus = action.payload; 
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(cancelBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.bookingStatus = state.bookingStatus.map((booking) =>
                    booking.id === action.payload.bookingId
                        ? { ...booking, status: 'canceled' }
                        : booking
                );
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { resetStatus } = bookingSlice.actions;
export default bookingSlice.reducer;
