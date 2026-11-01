import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

const initialState = {
    loading: false,
    bookingStatus: [], 
    error: "",
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
            return rejectWithValue(error.response?.data?.detail || error.message || 'Booking request failed');
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
            return rejectWithValue(error.response?.data?.detail || error.message || 'Failed to fetch bookings');
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
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to cancel booking');
        }
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        resetStatus: (state) => {
            state.bookingStatus = [];
            state.error = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendBookingRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendBookingRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.bookingStatus.push(action.payload);
            })
            .addCase(sendBookingRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookingStatus = action.payload; 
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(cancelBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.loading = false;
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
