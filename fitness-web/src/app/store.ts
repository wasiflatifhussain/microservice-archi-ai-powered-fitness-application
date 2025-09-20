import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import activitiesReducer from "../features/activities/activitiesSlice";
import { setStoreDispatch } from "../features/auth/keycloak";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    activities: activitiesReducer,
  },
});

// Connect Keycloak to Redux store
setStoreDispatch(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
