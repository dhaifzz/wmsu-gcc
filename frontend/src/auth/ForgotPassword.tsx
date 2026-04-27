import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import authBg from '../assets/img/Auth-Background.jpg';
import gccLogo from '../assets/logos/GCC.png';
import wmsuLogo from '../assets/logos/WMSU.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
        {/* Decorative Spheres (Internal to card) */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-50/80 opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-50/50 opacity-30"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Header Logos */}
          <div className="mb-10 flex gap-4 justify-center items-center">
            <img src={wmsuLogo} alt="WMSU Logo" className="h-16 w-16 object-contain drop-shadow-sm" />
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <img src={gccLogo} alt="GCC Logo" className="h-16 w-16 object-contain drop-shadow-sm" />
          </div>

          {!isSubmitted ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Forgot Password?</h2>
                <p className="text-slate-500 text-base font-medium leading-relaxed px-2">
                  No worries! Enter your registered email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                <div className="relative flex items-center group">
                  <div className="absolute left-5 text-emerald-600 transition-transform group-focus-within:scale-110">
                    <Mail className="h-6 w-6" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg bg-slate-50 border border-slate-100 py-5 pl-14 pr-4 text-base font-bold text-slate-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-4 rounded-lg bg-emerald-900 py-5 text-base font-black text-white shadow-xl shadow-emerald-950/20 transition-all hover:-translate-y-1 hover:bg-emerald-800 active:translate-y-0 active:shadow-md"
                >
                  <Send className="h-5 w-5" />
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center w-full"
            >
              <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
                <Mail className="h-14 w-14" />
              </div>
              <h2 className="mb-4 text-4xl font-black text-slate-800 tracking-tight">Check your inbox</h2>
              <p className="mb-12 text-base text-slate-500 font-medium leading-relaxed">
                We've sent a password reset link to:<br/>
                <span className="font-black text-emerald-700 mt-3 block text-lg">{email}</span>
              </p>
              
              <button 
                onClick={() => setIsSubmitted(false)}
                className="w-full rounded-lg bg-slate-100 py-5 text-base font-bold text-slate-600 transition-all hover:bg-slate-200"
              >
                Try a different email
              </button>
            </motion.div>
          )}

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
