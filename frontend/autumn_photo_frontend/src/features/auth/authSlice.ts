import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../services/authservice";

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }) => {
    const res = await loginUser(data);
    localStorage.setItem("access_token", res.access);
    return res;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: { email: string; password: string; full_name: string }) => {
    return await registerUser(data);
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.error = "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
