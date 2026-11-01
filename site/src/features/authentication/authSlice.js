import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/client";
import { getApiErrorMessage } from "../../utils/apiErrors";

const initialState = {
  user: null,
  isLoggedIn: false,
  initialized: false,
  status: "idle",
  error: null,
};

const saveTokens = (token) => {
  localStorage.setItem("accessToken", token.access);
  localStorage.setItem("refreshToken", token.refresh);
};

const removeTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const authenticatedUser = (data) => {
  if (!data?.token?.access || !data?.token?.refresh) {
    throw new Error("Authentication response did not include valid tokens.");
  }

  saveTokens(data.token);
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    is_staff: data.is_staff,
  };
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/login/", credentials);
      return authenticatedUser(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Login failed."));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/register/", formData);
      return authenticatedUser(data);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Registration failed."));
    }
  }
);

export const checkLoggedInUser = createAsyncThunk(
  "auth/checkLoggedInUser",
  async (_, { rejectWithValue }) => {
    const hasSession = localStorage.getItem("accessToken") || localStorage.getItem("refreshToken");
    if (!hasSession) {
      return null;
    }

    try {
      const { data } = await api.get("/api/user/");
      return data;
    } catch (error) {
      if (error.response?.status === 401) removeTokens();
      return rejectWithValue(getApiErrorMessage(error, "Session expired."));
    }
  },
  {
    condition: (_, { getState }) => {
      const { initialized, status } = getState().auth;
      return !initialized && status !== "loading";
    },
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  const refresh = localStorage.getItem("refreshToken");
  try {
    if (refresh) await api.post("/api/logout/", { refresh });
  } catch {
    // Local logout must succeed even if the API is offline or the token expired.
  } finally {
    removeTokens();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = "loading";
      state.error = null;
    };
    const authenticated = (state, action) => {
      state.status = "succeeded";
      state.user = action.payload;
      state.isLoggedIn = true;
      state.initialized = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = "failed";
      state.user = null;
      state.isLoggedIn = false;
      state.initialized = true;
      state.error = action.payload || action.error.message;
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, authenticated)
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, authenticated)
      .addCase(registerUser.rejected, rejected)
      .addCase(checkLoggedInUser.pending, pending)
      .addCase(checkLoggedInUser.fulfilled, (state, action) => {
        state.status = action.payload ? "succeeded" : "idle";
        state.user = action.payload;
        state.isLoggedIn = Boolean(action.payload);
        state.initialized = true;
        state.error = null;
      })
      .addCase(checkLoggedInUser.rejected, rejected)
      .addCase(logoutUser.pending, pending)
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.isLoggedIn = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.isLoggedIn = false;
        state.initialized = true;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
