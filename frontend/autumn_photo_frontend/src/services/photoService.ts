import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const uploadMultiplePhotos = async (eventId: number, files: File[]) => {
  const form = new FormData();
  form.append("event_id", String(eventId));
  files.forEach((f) => form.append("files", f));

  const res = await API.post("/photos/upload/multiple/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export default { uploadMultiplePhotos };
