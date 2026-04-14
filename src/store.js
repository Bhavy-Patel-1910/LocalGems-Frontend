import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import talentReducer from './features/talent/talentSlice';
import bookingReducer from './features/booking/bookingSlice';
import messageReducer from './features/message/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    talent: talentReducer,
    bookings: bookingReducer,
    messages: messageReducer,
  },
});
