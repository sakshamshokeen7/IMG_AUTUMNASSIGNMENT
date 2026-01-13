import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authservice";
import { loginSuccess } from "../../features/auth/authSlice";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import omniportLogo from "./omniport.png"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
  const res = await loginUser({ email, password });

  dispatch(loginSuccess(res)); 
  navigate("/events");     
} 
catch (err: any) {
  setError(err.response?.data?.detail || "Invalid credentials");
}

  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20" />
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-20 w-72 h-72 bg-black-500 blur-3xl rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white-500 blur-3xl rounded-full" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-green-500 shadow-xl mx-auto mb-6">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Login to continue</p>
          </div>
          {error && (
            <div className="p-4 mb-5 text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <Eye size={12} /> : <EyeOff size={13} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded text-indigo-600" /> Remember Me
            </label>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Signing in..." : <>Sign In <ArrowRight size={18}/></>}
            </button>
            <div className="mt-4">
  <a
    href="http://localhost:8000/api/accounts/omniport/login/"
    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
  >
    <img
      src={omniportLogo}
      alt="Omniport"
      className="w-6 h-6"
    />
    <span className="font-medium">Continue with Omniport</span>
  </a>
</div>


          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?
            <Link to="/register" className="text-indigo-600 font-medium ml-1 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-[45%] bg-green-600 justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="text-center max-w-lg space-y-6 z-10">
          <h2 className="text-5xl font-bold">Viora</h2>
          <p className="text-black-200 text-lg">
            Upload, explore and enjoy beautiful campus memories.
          </p>
        </div>
      </div>
    </div>
  );
}
