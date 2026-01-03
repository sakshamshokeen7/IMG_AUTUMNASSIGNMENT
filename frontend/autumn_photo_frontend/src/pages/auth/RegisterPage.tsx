import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { registerUser } from "../../services/authservice";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
  const names = name.trim().split(" ");
  const first_name = names[0];
  const last_name = names.slice(1).join(" ") || "";

  const res = await registerUser({ email, password, first_name, last_name });

  alert(res.message);
  navigate("/verify-otp", { state: { email } });

} catch (err: any) {
  const data = err.response?.data;
  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    setError(data[firstKey]?.[0] || "Registration failed");
  } else {
    setError("Registration failed");
  }
}
finally {
  setLoading(false);
}
    };
  return (
    <div className="min-h-screen w-screen flex">
      <div className="flex-1 flex items-center justify-center relative bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-80 z-0" />

        <form
          onSubmit={handleRegister}
          className="relative z-10 w-full max-w-md p-8 space-y-6"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <Sparkles size={30} className="text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500">Join the autumn photography community</p>
          </div>

          {error && (
            <div className="p-3 text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 caret-indigo-600"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 caret-indigo-600"
                placeholder="you@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 caret-indigo-600"
                placeholder="Choose a strong password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 flex justify-center gap-2 items-center disabled:opacity-60"
          >
            {loading ? "Creating..." : <>Register <ArrowRight size={20} /></>}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?
            <Link to="/login" className="text-indigo-600 font-medium ml-1">
              Login
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:flex w-[45%] items-center justify-center text-white bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <div className="max-w-md p-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Join Autumn Gallery</h2>
          <p className="text-lg opacity-90">
            Register, upload & relive the best college memories.
          </p>
        </div>
      </div>
    </div>
  );
}