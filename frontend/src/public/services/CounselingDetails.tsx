import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Shield, Clock, Calendar, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { cmsApi } from '../../lib/api';
import Loader from '../../components/loader/Loader';


const CounselingDetails = () => {
  const [content, setContent] = useState<any>(null);
  const [homeContent, setHomeContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [counselingRes, homeRes] = await Promise.all([
          cmsApi.getContent('counseling'),
          cmsApi.getContent('home')
        ]);
        if (counselingRes.ok) setContent(counselingRes.data);
        if (homeRes.ok) setHomeContent(homeRes.data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

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
                  <h3 className="text-xl font-black text-slate-900 mb-4">{content?.hotline?.title}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    {content?.hotline?.description}
                  </p>
                  <button className="w-full py-4 border-2 border-emerald-600 text-emerald-700 font-black rounded-lg hover:bg-emerald-50 transition-all">
                    Contact Hotline
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default CounselingDetails;
