import axios from "./axiosinstances";

export const getNotifications = async () => {
  const res = await axios.get("/api/notifications/");
  return res.data;
};

export const markNotificationRead = async (id: number) => {
  await axios.post(`/api/notifications/${id}/read/`);
};
