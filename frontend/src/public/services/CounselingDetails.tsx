import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageCircle, Shield, Clock, Calendar, CheckCircle, Phone, Copy, Check, X, Mail, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { cmsApi } from '../../lib/api';
import Loader from '../../components/loader/Loader';
import gccLogoAsset from '../../assets/logos/GCC.png';
import wmsuLogoAsset from '../../assets/logos/WMSU.png';

const CounselingDetails = () => {
  const [content, setContent] = useState<any>(null);
  const [homeContent, setHomeContent] = useState<any>(null);
  const [contactContent, setContactContent] = useState<any>(null);
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });
  const [showHotlineModal, setShowHotlineModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [counselingRes, homeRes, contactRes, logoRes] = await Promise.all([
          cmsApi.getContent('counseling'),
          cmsApi.getContent('home'),
          cmsApi.getContent('contact'),
          cmsApi.getContent('logos')
        ]);
        if (counselingRes.ok) setContent(counselingRes.data);
        if (homeRes.ok) setHomeContent(homeRes.data);
        if (contactRes.ok) setContactContent(contactRes.data);
        if (logoRes.ok && logoRes.data) {
          setLogos({
            wmsuLogo: logoRes.data.wmsuLogo || wmsuLogoAsset,
            gccLogo: logoRes.data.gccLogo || gccLogoAsset
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Prevent background page from scrolling when modal is open
  useEffect(() => {
    if (showHotlineModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showHotlineModal]);

  const hotlinePhone = content?.hotline?.phone || contactContent?.phone || "(062) 991-6446";
  const hotlineEmail = contactContent?.email || "gcc@wmsu.edu.ph";

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(hotlinePhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {isLoading || !content ? (
        <Loader type="counseling" />
      ) : (
        <>
          {/* Hero Section */}
          <div className="relative min-h-[450px] flex items-center justify-center overflow-hidden pt-32 pb-32">
            <div className="absolute inset-0 z-0">
              <img 
                src={homeContent?.support?.features?.[0]?.image || content?.hero?.image || '/placeholder.png'} 
                alt="Counseling" 
                className="w-full h-full object-cover blur-[2px] brightness-50" 
              />
              <div className="absolute inset-0 bg-emerald-900/60"></div>
            </div>
            
            <div className="container mx-auto px-6 relative z-10 text-center">
              <a href="/" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6 font-bold">
                <ArrowLeft size={20} /> Back to Home
              </a>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4">{content?.hero?.title}</h1>
              <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
                {content?.hero?.description}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
            <div className="grid lg:grid-cols-3 gap-10">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h2 className="text-3xl font-black text-slate-900 mb-6">About the Service</h2>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                    {content?.about?.description1}
                  </p>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {content?.about?.description2}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-100">
                      <Shield className="text-emerald-600 mb-4" size={32} />
                      <h3 className="text-xl font-bold text-slate-900 mb-2">100% Confidential</h3>
                      <p className="text-slate-600 text-sm">Everything discussed in our sessions stays within the room.</p>
                    </div>
                    <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-100">
                      <MessageCircle className="text-emerald-600 mb-4" size={32} />
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Expert Listeners</h3>
                      <p className="text-slate-600 text-sm">Licensed professionals dedicated to your mental wellness.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h2 className="text-3xl font-black text-slate-900 mb-6">Requirements</h2>
                  <ul className="space-y-4">
                    {content?.requirements?.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                        <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h2 className="text-3xl font-black text-slate-900 mb-8">How to Book</h2>
                  
                  <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {content?.howToBook?.map((step: any, i: number) => (
                      <div key={i} className="relative pl-12">
                        <div className="absolute left-0 top-0 w-9 h-9 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 font-black z-10">
                          {i + 1}
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1">{step.title}</h4>
                        <p className="text-slate-500 font-medium">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar / CTA */}
              <div className="space-y-8">
                <div className="bg-emerald-900 p-8 rounded-lg text-white shadow-2xl shadow-emerald-900/20">
                  <h3 className="text-2xl font-black mb-4">{content?.cta?.title}</h3>
                  <p className="text-emerald-100/80 mb-8 font-medium">
                    {content?.cta?.description}
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <Clock className="text-emerald-400" size={20} />
                      Mon - Fri: 8:00 AM - 5:00 PM
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <Calendar className="text-emerald-400" size={20} />
                      Appointment Required
                    </div>
                  </div>
                  <a href="/schedules" className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-center rounded-lg font-black transition-all shadow-lg flex items-center justify-center gap-2">
                    <Calendar size={18} /> View Live Schedules
                  </a>
                </div>
                
                <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50">
                  <h3 className="text-xl font-black text-slate-900 mb-4">{content?.hotline?.title || "Need Immediate Help?"}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    {content?.hotline?.description || "If you are in a crisis, please reach out to our emergency hotline available during office hours."}
                  </p>
                  <button 
                    onClick={() => setShowHotlineModal(true)}
                    className="w-full py-4 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-black rounded-lg transition-all flex items-center justify-center gap-2 group shadow-sm cursor-pointer"
                  >
                    <Phone size={18} className="transition-transform group-hover:scale-110" />
                    <span>Contact Hotline</span>
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    <span>Hotline:</span>
                    <span className="text-emerald-700 font-black">{hotlinePhone}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Hotline Modal (Sign Up Card Style & Responsive Container) */}
          {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
              {showHotlineModal && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-hidden"
                  onMouseDown={(e) => e.target === e.currentTarget && setShowHotlineModal(false)}
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative z-30 flex w-full max-w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] md:max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row my-auto border-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Left Panel - Visuals (matching Register.tsx left panel) */}
                    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-emerald-700 p-8 text-white md:flex md:w-5/12 lg:p-10 shrink-0">
                      {/* Decorative Spheres/Blobs matching Register.tsx */}
                      <div className="absolute -left-20 -top-16 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-40 blur-sm shadow-2xl"></div>
                      <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-700 opacity-50 blur-sm shadow-2xl"></div>
                      <div className="absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-gradient-to-t from-emerald-800 to-emerald-600 opacity-60 blur-md shadow-2xl"></div>

                      {/* Header in Left Panel */}
                      <div className="relative z-10">
                        {/* Logos close to each other like in Navbar */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center -space-x-2 shrink-0">
                            <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-11 w-11 object-contain drop-shadow-md z-10" />
                            <img src={logos.gccLogo} alt="GCC Logo" className="h-11 w-11 object-contain drop-shadow-md z-20" />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-lg font-black tracking-tighter text-white">
                              WMSU GCC
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-200">
                              Guidance & Counseling Center
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-800/80 text-emerald-200 px-3 py-1 rounded-full inline-block mb-3 border border-emerald-600/50">
                          Emergency & Crisis Help
                        </span>
                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                          We're Here For You.
                        </h2>
                        <p className="mt-3 text-xs lg:text-sm text-emerald-100/80 leading-relaxed font-medium">
                          If you are experiencing acute distress or need immediate psychological first aid, please connect with our guidance specialists.
                        </p>
                      </div>

                      {/* Office details in Left Panel */}
                      <div className="relative z-10 space-y-3 pt-6 border-t border-emerald-600/40 text-xs font-semibold text-emerald-100/90">
                        <div className="flex items-start gap-3">
                          <Clock size={16} className="text-emerald-300 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-white">Office Hours</p>
                            <p className="text-emerald-200/80">Mon – Fri: 8:00 AM – 5:00 PM</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-emerald-300 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-white">Office Location</p>
                            <p className="text-emerald-200/80">2nd Floor, Executive Bldg, WMSU</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Scrollable Wrapper (scrollbar is INSIDE the modal) */}
                    <div className="relative flex w-full flex-col bg-white md:w-7/12 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
                      {/* Decorative Sphere bottom right (matching Register.tsx line 619) */}
                      <div className="pointer-events-none absolute -bottom-20 -right-20 z-0 h-56 w-56 rounded-full bg-gradient-to-tl from-emerald-500 to-emerald-600 opacity-20 blur-xl"></div>

                      {/* Close button */}
                      <button 
                        onClick={() => setShowHotlineModal(false)}
                        className="absolute top-4 right-4 z-30 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>

                      {/* Scrollable Area - Internal Scrollbar */}
                      <div className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8">
                        {/* Mobile Branding - Logos close to each other like in Navbar */}
                        <div className="md:hidden mb-6 flex items-center justify-center gap-2.5">
                          <div className="flex items-center -space-x-2 shrink-0">
                            <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-10 w-10 object-contain drop-shadow-md z-10" />
                            <img src={logos.gccLogo} alt="GCC Logo" className="h-10 w-10 object-contain drop-shadow-md z-20" />
                          </div>
                          <div className="flex flex-col leading-tight text-left">
                            <span className="text-base font-black tracking-tighter text-emerald-950">
                              WMSU GCC
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
                              Guidance & Counseling Center
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block mb-2">
                            Direct Support Line
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">GCC Hotline</h3>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                            Connect directly with our counseling center during operational hours.
                          </p>
                        </div>

                        {/* Telephone Number Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-center shadow-xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Direct Hotline Number</p>
                          <p className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">{hotlinePhone}</p>
                          <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold text-slate-500">
                            <Clock size={14} className="text-emerald-600" />
                            <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <a 
                            href={`tel:${hotlinePhone.replace(/[^0-9+]/g, '')}`}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-md shadow-emerald-600/20 text-sm text-center cursor-pointer"
                          >
                            <Phone size={18} />
                            Call Now
                          </a>
                          <button
                            onClick={handleCopyNumber}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-black rounded-xl transition-all text-sm cursor-pointer"
                          >
                            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                            {copied ? "Copied!" : "Copy Number"}
                          </button>
                        </div>

                        {/* Emergency Note / Notice Box */}
                        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-4 mb-6">
                          <p className="text-xs font-bold text-amber-900 mb-1">Need After-Hours Help?</p>
                          <p className="text-[11px] text-amber-800/80 leading-relaxed">
                            For urgent crises outside office hours, you may also reach the National Center for Mental Health (NCMH) 24/7 Crisis Hotline at <strong className="font-black text-amber-900">1553</strong> or emergency services at <strong className="font-black text-amber-900">911</strong>.
                          </p>
                        </div>

                        {/* Direct Email & Location */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-emerald-600 shrink-0" />
                            <span>Email:</span>
                            <a href={`mailto:${hotlineEmail}`} className="text-emerald-700 font-bold hover:underline">
                              {hotlineEmail}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 md:hidden">
                            <MapPin size={14} className="text-emerald-600 shrink-0" />
                            <span>2nd Floor, Executive Building, WMSU</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default CounselingDetails;
