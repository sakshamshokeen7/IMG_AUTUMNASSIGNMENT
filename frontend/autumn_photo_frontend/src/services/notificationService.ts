import axios from "./axiosinstances";

export const getNotifications = async () => {
  const res = await axios.get("/notifications/");
  return res.data;
};

export const markNotificationRead = async (id: number) => {
  await axios.post(`/notifications/${id}/read/`);
};
