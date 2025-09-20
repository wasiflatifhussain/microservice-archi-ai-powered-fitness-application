import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import activitiesReducer from "../features/activities/activitiesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activitiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
