import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EventsListPage from "../pages/events/EventListPage";
import EventGalleryPage from "../pages/events/EventGalleryPage";
import ProfilePage from "../pages/profile/profilepage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:eventId" element={<EventGalleryPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
