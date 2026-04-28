import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Scaling, AlertCircle, ListChecks } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import shiftingImg from '../../assets/img/shifting-img.png';
import { cmsApi } from '../../lib/api';

const ShiftingDetails = () => {
  const [content, setContent] = useState<any>(null);
  const [homeContent, setHomeContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const [shiftingRes, homeRes] = await Promise.all([
        cmsApi.getContent('shifting'),
        cmsApi.getContent('home')
      ]);
      if (homeRes.ok) setHomeContent(homeRes.data);
      
      if (shiftingRes.ok && shiftingRes.data && Object.keys(shiftingRes.data).length > 0) {
        setContent(shiftingRes.data);
      } else {
        // Fallback default content
        setContent({
          hero: { title: "Shifting Examination", description: "Helping you find the right academic path for your future career.", image: null },
          about: { 
            description: "The Shifting Exam is a critical requirement for WMSU students who wish to transfer from one academic program to another. This assessment ensures that your aptitudes and interests align with the new course you intend to take.",
            note: "Applicants must schedule an appointment and complete all required forms before being allowed to take the exam."
          },
          requirements: [
            { title: "Booking Receipt", desc: "Digital or printed copy of your appointment confirmation." },
            { title: "2x2 Picture", desc: "Formal 2x2 colored picture with name tag (Selfies are not allowed)." },
            { title: "Downloadable Grades", desc: "A complete copy of all your previous semester's grades." },
            { title: "Latest COR", desc: "Your most recent Certificate of Registration (COR)." },
            { title: "Entrance Test Result", desc: "Original or certified copy of your college entrance test result." }
          ],
          steps: [
            { title: "Book Examination", desc: "Register and select a shifting exam date through the portal." },
            { title: "Get Your Receipt", desc: "Ensure you have your official booking receipt as proof of schedule." },
            { title: "Visit GCC Office", desc: "Go to the GCC Office in WMSU Main Campus with your requirements." },
            { title: "Document Submission", desc: "Submit all required documents to the GCC office for verification." },
            { title: "Take the Exam", desc: "Attend the shifting examination on your scheduled date and time." }
          ],
          cta: { title: "Apply for Shifting", description: "Make sure you have met the minimum GPA requirements of your target college before applying." },
          guidance: { title: "Career Guidance", description: "Not sure which course fits you best? Our counselors also offer career guidance sessions to help you make an informed decision." }
        });
      }
    };
    fetchContent();
  }, []);

  if (!content) return null;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[450px] flex items-center justify-center overflow-hidden pt-32 pb-32">
        <div className="absolute inset-0 z-0">
          <img src={homeContent?.support?.features?.[2]?.image || content?.hero?.image || shiftingImg} alt="Shifting Exam" className="w-full h-full object-cover blur-[2px] brightness-50" />
          <div className="absolute inset-0 bg-emerald-900/60"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <a href="/" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6 font-bold">
            <ArrowLeft size={20} /> Back to Home
          </a>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">{content.hero.title}</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
            {content.hero.description}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-6">Service Description</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                {content.about.description}
              </p>
              
              <div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <div className="flex gap-4">
                  <AlertCircle className="text-amber-500 shrink-0" size={24} />
                  <div>
                    <h4 className="text-amber-900 font-black mb-1">Important Note</h4>
                    <p className="text-amber-800 text-sm font-medium">
                      {content.about.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <ListChecks className="text-emerald-600" />
                Required Documents
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {content.requirements.map((req: any, i: number) => (
                  <div key={i} className="p-6 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all">
                    <h4 className="text-lg font-black text-slate-900 mb-2">{req.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{req.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-8">Examination Process</h2>
              
              <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {content.steps.map((step: any, i: number) => (
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
            <div className="bg-emerald-900 p-8 rounded-lg text-white shadow-2xl shadow-emerald-900/20">
              <BookOpen className="text-emerald-400 mb-4" size={32} />
              <h3 className="text-2xl font-black mb-4">{content.cta.title}</h3>
              <p className="text-emerald-100/80 mb-8 font-medium">
                {content.cta.description}
              </p>
              <a href="/register" className="block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-center rounded-lg font-black transition-all shadow-lg">
                Register to Book
              </a>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-4">
                <Scaling className="text-emerald-600" size={24} />
                <h3 className="text-xl font-black text-slate-900">{content.guidance.title}</h3>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                {content.guidance.description}
              </p>
              <button className="w-full py-4 bg-slate-100 text-slate-700 font-black rounded-lg hover:bg-slate-200 transition-all">
                Learn More about Careers
              </button>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShiftingDetails;
