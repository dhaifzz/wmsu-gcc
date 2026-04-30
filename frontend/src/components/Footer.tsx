import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { cmsApi } from '../lib/api';

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Footer = () => {
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });
  const [footerInfo, setFooterInfo] = useState({
    description: "Empowering WMSU students through professional guidance, psychological support, and career development services.",
    phone: "(062) 991-6446",
    email: "gcc@wmsu.edu.ph",
    address: "2nd Floor, Executive Building, WMSU Main Campus, Normal Road, Zamboanga City, 7000"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logoRes = await cmsApi.getContent('logos');
        if (logoRes.ok && logoRes.data) {
          setLogos({
            wmsuLogo: logoRes.data.wmsuLogo || wmsuLogoAsset,
            gccLogo: logoRes.data.gccLogo || gccLogoAsset
          });
        }

        const footerRes = await cmsApi.getContent('footer');
        const contactRes = await cmsApi.getContent('contact');

        if (footerRes.ok && contactRes.ok) {
          setFooterInfo({
            description: footerRes.data.description || footerInfo.description,
            phone: contactRes.data.phone || footerInfo.phone,
            email: contactRes.data.email || footerInfo.email,
            address: contactRes.data.address || footerInfo.address
          });
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
      }
    };
    fetchData();
  }, []);
  return (
    <footer className="bg-[#BD2D2D] text-rose-100 pt-24 pb-12 overflow-hidden relative">
      {/* Decorative Spheres (Ball Design) */}
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-br from-rose-600 to-rose-900 blur-3xl opacity-30"></div>
      <div className="absolute -right-32 -bottom-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-900 blur-[120px] opacity-20"></div>

      {/* Sharp Decorative Spheres matching Login design */}
      <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-2xl opacity-20 hidden lg:block"></div>
      <div className="absolute left-1/4 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-xl opacity-10"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                <img src={logos.wmsuLogo} alt="WMSU" className="h-10 w-10 object-contain" />
                <img src={logos.gccLogo} alt="GCC" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">WMSU GCC</span>
            </div>
            <p className="text-sm leading-relaxed mb-8 font-medium">
              {footerInfo.description}
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/wmsugcc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-rose-900/50 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-rose-800">
                <FacebookIcon size={18} />
              </a>
              <a href="mailto:gcc@wmsu.edu.ph" className="w-10 h-10 bg-rose-900/50 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-rose-800">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/team" className="hover:text-emerald-400 transition-colors">Our Team</Link></li>
              <li><Link to="/services/counseling" className="hover:text-emerald-400 transition-colors">Counseling</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Register Now</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-900/50 border border-rose-800 rounded-lg flex items-center justify-center shrink-0 text-emerald-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-rose-300/50 uppercase font-black mb-1">Call Us</p>
                  <p className="text-sm font-bold text-rose-50">{footerInfo.phone}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-900/50 border border-rose-800 rounded-lg flex items-center justify-center shrink-0 text-emerald-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-rose-300/50 uppercase font-black mb-1">Email Us</p>
                  <p className="text-sm font-bold text-rose-50">{footerInfo.email}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Office Location */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Office Location</h4>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-900/50 border border-rose-800 rounded-lg flex items-center justify-center shrink-0 text-emerald-400">
                <MapPin size={18} />
              </div>
              <p className="text-sm font-bold leading-relaxed text-rose-50">
                {footerInfo.address}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-rose-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-white/70">
            © {new Date().getFullYear()} WMSU Guidance and Counseling Center. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold text-white/70">
            <a href="/privacy-policy" className="hover:text-emerald-400">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-emerald-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
