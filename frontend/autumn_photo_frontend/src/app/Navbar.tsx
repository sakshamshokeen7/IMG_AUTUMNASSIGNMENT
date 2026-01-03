import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

export default function Navbar() {
  const isAuth = useSelector((state:any) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    try { dispatch({ type: "auth/logout" }); } catch(e){}
    navigate("/login");
  };

  return (
    <nav className="w-full bg-slate-900 text-white p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/events" className="text-xl font-bold">Events</Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuth && (
          <>
            <Link to="/profile" className="px-3 py-1 bg-indigo-600 rounded">Profile</Link>
            <Link to="/photos/upload" className="px-3 py-1 bg-indigo-600 rounded">Upload</Link>
            <button onClick={logout} className="px-3 py-1 bg-red-600 rounded">Logout</button>
          </>
        )}
        {!isAuth && (
          <Link to="/login" className="px-3 py-1 bg-indigo-600 rounded">Login</Link>
        )}
      </div>
    </nav>
  );
}
