import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import authBg from '../assets/img/Auth-Background.jpg';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { authApi, cmsApi } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedToken, setResolvedToken] = useState<string | null>(null);
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });

  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // Get the recovery token — either from AuthContext (PASSWORD_RECOVERY event)
  // or directly from the Supabase session (for cases where the page loads fresh)
  useEffect(() => {
    const getToken = async () => {
      if (accessToken) {
        setResolvedToken(accessToken);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setResolvedToken(session.access_token);
        }
      }
    };
    getToken();
  }, [accessToken]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match.',
        confirmButtonColor: '#065f46'
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 8 characters long.',
        confirmButtonColor: '#065f46'
      });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must contain at least one uppercase letter.',
        confirmButtonColor: '#065f46'
      });
      return;
    }

    if (!/[0-9]/.test(password)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must contain at least one number.',
        confirmButtonColor: '#065f46'
      });
      return;
    }

    if (!resolvedToken) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Your reset link is invalid or has expired. Please request a new one.',
        confirmButtonColor: '#065f46'
      }).then(() => {
        navigate('/forgot-password');
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await authApi.resetPassword(password, resolvedToken!);
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your password has been reset successfully. You can now log in with your new password.',
          confirmButtonColor: '#065f46'
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: res.error || 'Failed to reset password. Please try again.',
          confirmButtonColor: '#065f46'
        });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again later.',
        confirmButtonColor: '#065f46'
      });
    } finally {
      setIsLoading(false);
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
        className="relative z-30 flex w-full max-w-[32rem] flex-col overflow-hidden rounded-lg bg-white shadow-2xl p-10 lg:p-14"
      >
        {/* Decorative Spheres */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-50/80 opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-50/50 opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Header Logos */}
          <div className="mb-10 flex gap-4 justify-center items-center">
            <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-16 w-16 object-contain drop-shadow-sm" />
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <img src={logos.gccLogo} alt="GCC Logo" className="h-16 w-16 object-contain drop-shadow-sm" />
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Reset Password</h2>
            <p className="text-slate-500 text-base font-medium leading-relaxed px-2">
              Create a new secure password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            <div className="relative flex items-center group">
              <div className="absolute left-5 text-emerald-600 transition-transform group-focus-within:scale-110">
                <Lock className="h-6 w-6" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-50 border border-slate-100 py-5 pl-14 pr-12 text-base font-bold text-slate-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative flex items-center group">
              <div className="absolute left-5 text-emerald-600 transition-transform group-focus-within:scale-110">
                <Lock className="h-6 w-6" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-50 border border-slate-100 py-5 pl-14 pr-12 text-base font-bold text-slate-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 rounded-lg bg-emerald-900 py-5 text-base font-black text-white shadow-xl shadow-emerald-950/20 transition-all hover:-translate-y-1 hover:bg-emerald-800 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-14 flex flex-col items-center gap-8 w-full">
            <div className="h-[1px] w-1/4 bg-slate-100"></div>
            <Link 
              to="/login" 
              className="group flex items-center gap-3 text-base font-black text-emerald-900 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1.5" />
              Back to Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div >
  );
}
