import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Eye, ShieldCheck, MapPin, Clock, Users, GraduationCap, Phone, Mail } from 'lucide-react';
import { cmsApi } from '../lib/api';

const AboutUs = () => {
  const [aboutContent, setAboutContent] = useState<any>({
    hero: {
      title: "About the Center",
      description: "The Guidance and Counseling Center at Western Mindanao State University is a vital support unit dedicated to addressing the psychological, emotional, and personal development needs of students and staff."
    },
    core: {
      vision: "By 2040, WMSU is a Smart Research University generating competent professionals and global citizens engendered by the knowledge from sciences and liberal education, empowering communities, promoting peace, harmony, and cultural diversity.",
      mission: "WMSU commits to create a vibrant atmosphere of learning where science, technology, innovation, research, the arts and humanities, and community engagement flourish, and produce world-class professionals committed to sustainable development and peace.",
      qualityPolicy: "The Western Mindanao State University is committed to deliver academic excellence, to produce globally competitive human resources, and to conduct innovative research for sustainable development beyond the ASEAN region. It is defined as a Smart Research University, that adapts to the changing landscape of the stakeholders' needs.\n\nWMSU also commits to continually enhance its Quality Management System by integrating risk-based thinking into all processes to achieve intended results and guarantee customer satisfaction in compliance with applicable quality assurance standards."
    },
    sidebar: {
      location: "2nd Floor, Executive Building",
      campus: "WMSU Main Campus, Normal Road",
      hours: "Monday - Friday, 8:00 AM - 5:00 PM",
      serving: "Students, Returnees, & Transferees"
    },
    contact: {
      phone: "(062) 991-6446",
      email: "gcc@wmsu.edu.ph"
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.916858546554!2d122.062033!3d6.9123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32504193639e78df%3A0x64700877997a66f7!2sWestern+Mindanao+State+University!5e0!3m2!1sen!2sph!4v1713862000000"
  });

  useEffect(() => {
    const fetchContent = async () => {
      const result = await cmsApi.getContent('about');
      if (result.ok && result.data.hero) {
        setAboutContent(result.data);
      }
    };
    fetchContent();
  }, []);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-emerald-900">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">{aboutContent.hero.title}</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto font-medium">
            {aboutContent.hero.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Core Values / Vision-Mission */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Eye size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Our Vision</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed font-bold">
                {aboutContent.core.vision}
              </p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Target size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Our Mission</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed font-bold">
                {aboutContent.core.mission}
              </p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Quality Policy</h2>
              </div>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-bold">
                {aboutContent.core.qualityPolicy.split('\n\n').map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Location & Hours */}
            <div className="bg-emerald-700 p-8 rounded-lg text-white shadow-2xl shadow-emerald-900/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-2xl font-black mb-8">Visit Us</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <MapPin className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-300 uppercase font-black mb-1">Office Location</p>
                    <p className="text-sm font-bold">{aboutContent.sidebar.location}</p>
                    <p className="text-xs text-emerald-100/60 font-medium">{aboutContent.sidebar.campus}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <Clock className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-300 uppercase font-black mb-1">Service Hours</p>
                    <p className="text-sm font-bold">{aboutContent.sidebar.hours.split(',')[0]}</p>
                    <p className="text-xs text-emerald-100/60 font-medium">{aboutContent.sidebar.hours.split(',')[1] || ''}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <Users className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-300 uppercase font-black mb-1">Who we serve</p>
                    <p className="text-sm font-bold leading-tight">{aboutContent.sidebar.serving}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map & Waze Navigation */}
            <div className="bg-white p-4 rounded-lg shadow-xl border border-slate-100 overflow-hidden">
              <iframe
                src={aboutContent.mapUrl}
                className="w-full h-[250px] rounded-lg mb-4"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="WMSU Location"
              ></iframe>
              <a
                href="https://www.waze.com/en-GB/live-map/directions/western-mindanao-state-university-normal-road-zamboanga-city?to=place.w.80019525.799933107.8020098"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#33ccff] hover:bg-[#2bb8e6] text-white font-black rounded-lg transition-all shadow-lg"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Waze_logo.svg" alt="Waze" className="w-6 h-6 invert brightness-0" />
                Navigate with Waze
              </a>
            </div>

            {/* Services Quick Call */}
            <div className="bg-emerald-50 p-8 rounded-lg border border-emerald-100">
              <GraduationCap className="text-emerald-600 mb-4" size={32} />
              <h3 className="text-xl font-black text-slate-900 mb-4">Our Services</h3>
              <ul className="space-y-3 text-sm font-bold text-slate-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Counseling
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Psychological Assessment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Career Services
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Shifting Assistance
                </li>
              </ul>
            </div>
          </div>

        </div>
        {/* Pill Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-900 rounded-lg p-1 shadow-2xl shadow-emerald-900/20 overflow-hidden relative group max-w-5xl mx-auto">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            {/* Phone Part */}
            <div className="py-4 px-10 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20 shrink-0">
                <Phone size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-0.5 opacity-70">Call Our Office</h3>
                <p className="text-lg lg:text-xl font-black tracking-tight text-white leading-none">{aboutContent.contact.phone}</p>
              </div>
            </div>

            {/* Email Part */}
            <div className="py-4 px-10 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/10 shrink-0">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-0.5 opacity-70">Official Email</h3>
                <p className="text-lg lg:text-xl font-black tracking-tight text-white break-all leading-none">{aboutContent.contact.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
