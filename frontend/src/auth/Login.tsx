import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import authBg from '../assets/img/Auth-Background.jpg';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { authApi, cmsApi } from '../lib/api';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { showToast } from '../components/modal-notification/toast';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await cmsApi.getContent('logos');
        if (res.ok && res.data) {
          setLogos({
            wmsuLogo: res.data.wmsuLogo || wmsuLogoAsset,
            gccLogo: res.data.gccLogo || gccLogoAsset
          });
        }
      } catch (error) {
        console.error('Failed to fetch logos:', error);
      }
    };
    fetchLogos();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for email confirmation redirect
  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      showToast.success('Email confirmed successfully! You can now sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (!['wmsu.edu.ph', 'gmail.com'].includes(domain)) {
      showToast.error('Only @wmsu.edu.ph or @gmail.com emails are allowed.');
      return;
    }

    setLoading(true);

    try {
      // Call backend login endpoint
      const result = await authApi.login({ email, password });

      if (!result.ok) {
        const errorData = result.data as unknown as { error: string };
        showToast.error(errorData.error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      const { session, user, redirectPath } = result.data;

      // Set the Supabase session locally so AuthProvider can track it
      if (session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      // Update auth context
      setAuthData(user, session.access_token, redirectPath);

      // Navigate to the role-based dashboard
      showToast.success('Welcome back!');
      navigate(redirectPath, { replace: true });
    } catch {
      showToast.error('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat p-4 sm:p-6"
      style={{ backgroundImage: `url(${authBg})`, perspective: '1000px' }}>

      {/* Background Overlay */}
      <div className="absolute inset-0 z-10 bg-[#047857]/75"></div>

      {/* Main Card Container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-30 flex w-full max-w-4xl max-h-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:flex-row"
      >
        {/* Back to Home Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 md:top-6 md:left-8 z-50 flex items-center gap-2 text-sm font-bold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-800 bg-white rounded-lg px-4 py-2.5 shadow-md group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Left Panel - Visuals */}
        <div className="relative hidden w-full flex-col justify-center overflow-hidden bg-emerald-600 p-10 md:flex md:w-1/2 lg:p-16">
          {/* Decorative Spheres/Blobs matching the design */}
          <div className="absolute -left-32 -top-16 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl"></div>
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-2xl"></div>
          <div className="absolute -bottom-20 right-4 h-80 w-80 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-2xl"></div>

          <div className="relative z-10 mt-auto mb-auto">
            <div className="mb-8 flex gap-4">
              <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-24 w-24 object-contain drop-shadow-md" />
              <img src={logos.gccLogo} alt="GCC Logo" className="h-24 w-24 object-contain drop-shadow-md" />
            </div>
            <h1 className="mb-2 text-5xl font-bold tracking-wider text-white drop-shadow-sm">Welcome!</h1>
            <h2 className="mb-8 text-md font-bold tracking-wider text-emerald-100">WMSU GCC Portal</h2>
            <p className="text-sm text-emerald-50 max-w-sm">
              GCC is a booking platform for counseling, student assessments, and course shifting services.
            </p>
          </div>
        </div>

        {/* Right Panel - Wrapper */}
        <div className="relative flex w-full flex-col bg-white md:w-1/2 overflow-hidden">

          {/* Decorative Sphere bottom right (Outside scroll area so it doesn't expand scrollable space) */}
          <div className="pointer-events-none absolute -bottom-24 -right-24 z-0 h-64 w-64 rounded-full bg-gradient-to-tl from-emerald-500 to-emerald-600 opacity-90 shadow-2xl"></div>

          {/* Scrollable Area */}
          <div className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden">
            <div className="flex min-h-full flex-col justify-center p-8 lg:p-16">
              <div className="mx-auto w-full max-w-sm">
                <div className="md:hidden mb-6 mt-14 flex gap-4 justify-center">
                  <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-14 w-14 object-contain" />
                  <img src={logos.gccLogo} alt="GCC Logo" className="h-14 w-14 object-contain" />
                </div>

                <h2 className="mb-2 text-4xl font-bold text-gray-800">Sign in</h2>
                <p className="mb-8 text-xs text-gray-500 font-medium">Book counseling, assessments, and course shifts with ease at GCC.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Username Input */}
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-700">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-gray-700">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-20 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-emerald-800 hover:text-emerald-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Options */}
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 checked:border-emerald-600 checked:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all"
                        />
                        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-gray-500">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Sign in button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                </form>

                <div className="mt-8 text-center text-sm text-gray-700">
                  Don't have an account? <Link to="/register" className="ml-1 text-emerald-900 hover:underline font-bold">Sign Up</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
