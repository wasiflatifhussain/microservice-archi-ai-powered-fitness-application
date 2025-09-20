import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ActivityResponse } from "../../types/activity";

interface ActivitiesState {
  byId: Record<string, ActivityResponse>;
}

const initialState: ActivitiesState = { byId: {} };

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    upsert(state, action: PayloadAction<ActivityResponse>) {
      const a = action.payload;
      state.byId[a.id] = a;
    },
  },
});

export const { upsert } = activitiesSlice.actions;
export default activitiesSlice.reducer;
