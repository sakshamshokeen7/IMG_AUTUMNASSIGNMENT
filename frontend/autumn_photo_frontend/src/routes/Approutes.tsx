import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import OTPVerifyPage from "../pages/auth/OtpVerifyPage";

import EventsPage from "../pages/events/EventsPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProfilePage from "../pages/profile/profilepage";
import AdminPanel from "../pages/admin/AdminPanel";
import PhotographerDashboard from "../pages/photographer/PhotographerDashboard";

import ProtectedRoute from "./protectedroutes";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OTPVerifyPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/photos/upload" element={<Navigate to="/photographer" replace />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/photographer" element={<PhotographerDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}
