// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000",   // <--- FIXED
    prepareHeaders: (headers, { getState }) => {
  const token = (getState() as any).auth?.access;   // access token only

  if (token && token !== "undefined" && token !== "null") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
  }),
  tagTypes: ["Auth", "Events", "Photos", "Users"],
  endpoints: () => ({}),  // keep empty for now
});

export default api;
