import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const auth = useAuth();
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const { login } = auth;
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password === confirmPassword) {
      login(email);
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Already have account */}
      <div className="w-1/2 bg-blue-500 flex flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-semibold mb-4">Welcome Back!</h2>
          <p className="mb-8 text-blue-100">Already have an account? Sign in to continue your journey...</p>
          <Link
            to="/login"
            className="inline-block py-3 px-8 border-2 border-white text-white text-sm font-semibold rounded-lg hover:bg-white hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 transition-colors"
          >
            SIGN IN
          </Link>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="w-1/2 flex flex-col items-center justify-center p-8 bg-white shadow-lg">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-6 text-center">Create Account</h1>
          
          {/* Social signup buttons */}
          <div className="flex gap-4 mb-6 justify-center">
            <button className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.46 15.46l-1.41 1.41L12 14.83l-4.05 4.04-1.41-1.41L10.58 13 6.54 8.95l1.41-1.41L12 11.17l4.05-4.04 1.41 1.41L13.42 13l4.04 4.05z"/>
              </svg>
            </button>
            <button className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M23.610 12.200 C 23.610 11.385 23.536 10.600 23.400 9.850 L 12.000 9.850 L 12.000 14.550 L 18.510 14.550 C 18.210 16.050 17.340 17.300 16.040 18.150 L 16.040 21.150 L 19.950 21.150 C 22.230 19.050 23.610 15.900 23.610 12.200"/>
                <path d="M12.000 24.000 C 15.240 24.000 17.955 22.920 19.950 21.150 L 16.040 18.150 C 14.955 18.900 13.590 19.320 12.000 19.320 C 8.880 19.320 6.240 17.190 5.285 14.250 L 1.245 14.250 L 1.245 17.340 C 3.225 21.240 7.305 24.000 12.000 24.000"/>
                <path d="M5.285 14.250 C 5.040 13.500 4.905 12.705 4.905 11.880 C 4.905 11.055 5.040 10.260 5.285 9.510 L 5.285 6.420 L 1.245 6.420 C 0.450 8.010 0.000 9.870 0.000 11.880 C 0.000 13.890 0.450 15.750 1.245 17.340 L 5.285 14.250"/>
                <path d="M12.000 4.440 C 13.770 4.440 15.345 5.010 16.580 6.190 L 20.025 2.745 C 17.940 1.050 15.240 0.000 12.000 0.000 C 7.305 0.000 3.225 2.760 1.245 6.420 L 5.285 9.510 C 6.240 6.570 8.880 4.440 12.000 4.440"/>
              </svg>
            </button>
          </div>

          <div className="text-center mb-6">
            <span className="text-gray-500 text-sm">Or sign up using E-Mail Address</span>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              SIGN UP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
