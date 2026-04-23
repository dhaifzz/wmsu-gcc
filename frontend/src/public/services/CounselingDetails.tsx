import { ArrowLeft, MessageCircle, Shield, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import counselingImg from '../../assets/img/counseling-img.png';

const CounselingDetails = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[450px] flex items-center justify-center overflow-hidden pt-32 pb-32">
        <div className="absolute inset-0 z-0">
          <img src={counselingImg} alt="Counseling" className="w-full h-full object-cover blur-[2px] brightness-50" />
          <div className="absolute inset-0 bg-emerald-900/60"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6 font-bold">
            <ArrowLeft size={20} /> Back to Home
          </a>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">Professional Counseling</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
            A safe, confidential space for emotional growth and personal discovery.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">About the Service</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                Our counseling services are designed to provide students and outside clients with the professional support they need to navigate life's challenges. Whether you're dealing with academic stress, personal relationship issues, or mental health concerns, our certified counselors are here to listen and guide you.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                We believe that every individual has the potential for growth. Our approach is student-centered, compassionate, and strictly confidential.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                  <Shield className="text-emerald-600 mb-4" size={32} />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">100% Confidential</h3>
                  <p className="text-slate-600 text-sm">Everything discussed in our sessions stays within the room.</p>
                </div>
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                  <MessageCircle className="text-emerald-600 mb-4" size={32} />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Expert Listeners</h3>
                  <p className="text-slate-600 text-sm">Licensed professionals dedicated to your mental wellness.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Requirements</h2>
              <ul className="space-y-4">
                {[
                  "Official Booking Receipt (From the GCC Portal)",
                  "Personal Data Form (Must be completed before the session)",
                  "Counseling Form (Available at the GCC center)",
                  "Valid Student ID (For WMSU Students)",
                  "Appointment Schedule"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-8">How to Book</h2>
              
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  { title: "Book a Session", desc: "Schedule your consultation through our online portal or visit the center." },
                  { title: "Get Your Receipt", desc: "Download or print your official booking receipt as proof of appointment." },
                  { title: "Visit GCC Office", desc: "Go to the GCC Office in WMSU Main Campus with your requirements." },
                  { title: "Center Verification", desc: "Arrive at the GCC center at your scheduled time with your requirements." },
                  { title: "Meet Your Counselor", desc: "Engage in a professional, one-on-one session in a safe environment." }
                ].map((step, i) => (
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
            <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-900/20">
              <h3 className="text-2xl font-black mb-4">Book a Session</h3>
              <p className="text-emerald-100/80 mb-8 font-medium">
                Ready to talk? Schedule your consultation today and take the first step toward mental wellness.
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
              <a href="/register" className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-center rounded-2xl font-black transition-all shadow-lg">
                Schedule Now
              </a>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-black text-slate-900 mb-4">Need Immediate Help?</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">
                If you are in a crisis, please reach out to our emergency hotline available during office hours.
              </p>
              <button className="w-full py-4 border-2 border-emerald-600 text-emerald-700 font-black rounded-2xl hover:bg-emerald-50 transition-all">
                Contact Hotline
              </button>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CounselingDetails;
