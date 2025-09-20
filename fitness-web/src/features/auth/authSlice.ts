import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { initKeycloak } from "./keycloak";

interface AuthState {
  isAuthenticated: boolean | null;
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
  bootstrapped: boolean;
}

const initialState: AuthState = {
  isAuthenticated: null,
  loading: false,
  error: null,
  registrationSuccess: false,
  bootstrapped: false,
};

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrapAuth",
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await initKeycloak();
      return isAuthenticated;
    } catch (error) {
      console.error("Bootstrap auth failed:", error);
      return rejectWithValue("bootstrap failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const response = await fetch(`${apiBaseUrl}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Registration failed with status ${response.status}`,
        }));
        return rejectWithValue(errorData.message || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      return rejectWithValue("Network error occurred");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.error = null;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetRegistrationState(state) {
      state.registrationSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // registration thunks
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isAuthenticated = Boolean(action.payload);
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.bootstrapped = true;
      });
  },
});

export const {
  setAuthenticated,
  clearAuth,
  setAuthError,
  setLoading,
  resetRegistrationState,
} = authSlice.actions;

export default authSlice.reducer;
