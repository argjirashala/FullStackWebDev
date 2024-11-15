import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: 'success',
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification(state, action) {
      const { message, type } = action.payload;
      state.message = message;
      state.type = type || 'success';
    },
    clearNotification(state) {
      state.message = null;
      state.type = 'success';
    },
  },
});

export const { setNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
