import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/client";

const initialState = {
  user: null,
  isLoggedIn: false,
  status: "idle",
  error: null,
};

const errorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return Array.isArray(data.detail) ? data.detail.join(" ") : data.detail;
  if (data && typeof data === "object") {
    const firstValue = Object.values(data)[0];
    return Array.isArray(firstValue) ? firstValue.join(" ") : String(firstValue);
  }
  return error.message || fallback;
};

const saveTokens = (token) => {
  localStorage.setItem("accessToken", token.access);
  localStorage.setItem("refreshToken", token.refresh);
};

const removeTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/login/", credentials);
      saveTokens(data.token);
      return { id: data.id, username: data.username, email: data.email, is_staff: data.is_staff };
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Login failed."));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/register/", formData);
      saveTokens(data.token);
      return { id: data.id, username: data.username, email: data.email, is_staff: data.is_staff };
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Registration failed."));
    }
  }
);

export const checkLoggedInUser = createAsyncThunk(
  "auth/checkLoggedInUser",
  async (_, { rejectWithValue }) => {
    if (!localStorage.getItem("accessToken")) {
      return rejectWithValue("Not authenticated.");
    }
    try {
      const { data } = await api.get("/api/user/");
      return data;
    } catch (error) {
      removeTokens();
      return rejectWithValue(errorMessage(error, "Session expired."));
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  const refresh = localStorage.getItem("refreshToken");
  try {
    if (refresh) await api.post("/api/logout/", { refresh });
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
      state.error = null;
    };
    const rejected = (state, action) => {
      state.status = "failed";
      state.user = null;
      state.isLoggedIn = false;
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
      .addCase(checkLoggedInUser.fulfilled, authenticated)
      .addCase(checkLoggedInUser.rejected, rejected)
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.isLoggedIn = false;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
