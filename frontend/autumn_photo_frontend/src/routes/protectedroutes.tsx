import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const isAuth = useSelector((state:any) => state.auth.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" />;
}
