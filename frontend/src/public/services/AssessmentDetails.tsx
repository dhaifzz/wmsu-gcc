import { ArrowLeft, ClipboardCheck, FileText, Target, HelpCircle, Info, Clock, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import assessmentImg from '../../assets/img/assessment-img.png';

const AssessmentDetails = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[450px] flex items-center justify-center overflow-hidden pt-32 pb-32">
        <div className="absolute inset-0 z-0">
          <img src={assessmentImg} alt="Assessment" className="w-full h-full object-cover blur-[2px] brightness-50" />
          <div className="absolute inset-0 bg-emerald-900/60"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6 font-bold">
            <ArrowLeft size={20} /> Back to Home
          </a>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">Student Assessments</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
            Helping you understand your mental well-being through professional testing.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Overview</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                The Guidance and Counseling Center conducts standardized psychological assessments to help students monitor their mental and emotional states. These tests are essential tools for self-awareness and early intervention.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div className="group p-8 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                  <div className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">DASS-21 Test</h3>
                  <p className="text-emerald-700 text-sm font-bold mb-4">For College Students</p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    A clinical scale used to measure negative emotional states of depression, anxiety, and stress.
                  </p>
                </div>
                
                <div className="group p-8 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                  <div className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                    <Target size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">DASS-Y Test</h3>
                  <p className="text-emerald-700 text-sm font-bold mb-4">For High School Students</p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Specially designed version for younger students to accurately capture their emotional experiences.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Info size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Step-by-Step Process</h2>
              </div>
              
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  { title: "Book Appointment", desc: "Schedule your assessment slot through the GCC portal or walk-in." },
                  { title: "Get Receipt", desc: "Obtain your official assessment receipt/acknowledgment after booking." },
                  { title: "Visit GCC Office", desc: "Go to the GCC Office in WMSU Main Campus with your requirements." },
                  { title: "Complete Forms", desc: "Fill out the required personal data and consent forms." },
                  { title: "Take the Test", desc: "Complete the assessment in a quiet, supervised environment." },
                  { title: "Consultation", desc: "Meet with a counselor to interpret and discuss your results." }
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

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50">
              <HelpCircle className="text-emerald-600 mb-4" size={32} />
              <h3 className="text-xl font-black text-slate-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">Is it graded?</p>
                  <p className="text-slate-500 text-xs">No, this is a psychological assessment, not an academic exam.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">How long does it take?</p>
                  <p className="text-slate-500 text-xs">Usually between 30 minutes to 1 hour.</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 p-8 rounded-lg text-white shadow-2xl shadow-emerald-900/20">
              <ClipboardCheck className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-2xl font-black mb-4">Start Assessment</h3>
              <p className="text-emerald-100/80 mb-8 font-medium">
                Ready to take the test? Ensure you have your requirements ready.
              </p>
              <div className="space-y-4 mb-8 text-white">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <Clock className="text-emerald-400" size={20} />
                  Mon - Fri: 8:00 AM - 5:00 PM
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <Calendar className="text-emerald-400" size={20} />
                  Appointment Required
                </div>
              </div>
              <a href="/register" className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-center rounded-lg font-black transition-all">
                Get Started
              </a>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AssessmentDetails;
