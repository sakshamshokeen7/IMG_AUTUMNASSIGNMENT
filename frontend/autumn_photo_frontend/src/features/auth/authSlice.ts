import { createSlice } from "@reduxjs/toolkit";

const access = localStorage.getItem("access");
const refresh = localStorage.getItem("refresh");
const email = localStorage.getItem("email");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!access,
    email: email || null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      localStorage.setItem("access", action.payload.access);
      localStorage.setItem("refresh", action.payload.refresh);
      localStorage.setItem("email", action.payload.email);

      state.isAuthenticated = true;
      state.email = action.payload.email;
    },
    logout: (state) => {
      localStorage.clear();
      state.isAuthenticated = false;
      state.email = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
