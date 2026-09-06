import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { cmsApi } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });
  const location = useLocation();
  const { user, redirectPath } = useAuth();
  const isSolidNeeded = isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch logos from CMS
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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Team', path: '/team' },
    { name: 'Schedules', path: '/schedules' },
    { name: 'Blog', path: '/blog' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isSolidNeeded ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center">
              <img src={logos.wmsuLogo} alt="WMSU" className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-md" />
              <div className={`h-6 sm:h-7 w-[1.5px] mx-2 sm:mx-2.5 md:hidden transition-colors ${isSolidNeeded ? 'bg-slate-300' : 'bg-white/40'}`} />
              <img src={logos.gccLogo} alt="GCC" className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-md md:-ml-2" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className={`text-xl font-black tracking-tighter transition-colors ${isSolidNeeded ? 'text-emerald-900' : 'text-white'}`}>
                WMSU GCC
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isSolidNeeded ? 'text-emerald-600' : 'text-emerald-200'}`}>
                Guidance & Counseling Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-md font-bold transition-all hover:scale-105 ${isActive(link.path)
                  ? (isSolidNeeded ? 'text-emerald-600' : 'text-white border-b-2 border-emerald-400')
                  : (isSolidNeeded ? 'text-gray-600 hover:text-emerald-600' : 'text-emerald-50/80 hover:text-white')
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4">
              {user ? (
                <Link
                  to={redirectPath || '/'}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <User size={12} />
                  </div>
                  {user.firstName}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-md font-bold transition-colors ${isSolidNeeded ? 'text-emerald-900 hover:text-emerald-600' : 'text-white hover:text-emerald-200'}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full text-md font-black shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${isSolidNeeded ? 'text-emerald-900' : 'text-white'}`}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl transition-all duration-300 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-bold ${isActive(link.path) ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 grid grid-cols-2 gap-4 px-4">
            {user ? (
              <Link
                to={redirectPath || '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2 text-center py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <User size={16} /> Go to Dashboard ({user.firstName})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-3 text-sm font-bold text-emerald-900 border border-emerald-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
