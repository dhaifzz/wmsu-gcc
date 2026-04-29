import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { cmsApi } from '../../lib/api';
import Loader from '../../components/loader/Loader';


const iconMap: Record<string, any> = {
  Lock: Lock,
  Eye: Eye,
  Shield: Shield,
  FileText: FileText
};

const PrivacyPolicy = () => {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await cmsApi.getContent('privacy');
        if (res.ok && res.data && Object.keys(res.data).length > 0) {
          setContent(res.data);
        } else {
          // Default content fallback
          setContent({
            hero: {
              title: "Privacy Policy",
              description: "Your privacy is our priority. This policy outlines how the WMSU Guidance and Counseling Center (GCC) collects, uses, and protects your information."
            },
            sections: [
              { title: "1. Data Collection", icon: "Lock", content: "The WMSU GCC collects personal and sensitive information through our online portal and physical forms. This includes: Personal identification (Name, ID, Birthdate), Contact details (Email, Phone, Address), Academic records and history, Health and psychological assessments, and Appointment and consultation logs." },
              { title: "2. Use of Information", icon: "Eye", content: "Your data is used exclusively for the purpose of providing guidance, counseling, and assessment services. We use this information to process appointment requests and shifting examinations, maintain accurate student counseling records as required by university policy, and analyze aggregated, non-identifiable data to improve our support programs." },
              { title: "3. Confidentiality", icon: "Shield", content: "Confidentiality is the cornerstone of counseling. Information shared during counseling sessions will not be disclosed to any third party without your explicit written consent, except in cases where there is a clear risk of harm to yourself or others, or as required by law (e.g., court order)." },
              { title: "4. Data Security", icon: "FileText", content: "We implement strict technical and organizational measures to protect your data against unauthorized access, loss, or alteration. All online data is encrypted and stored in secure cloud environments compliant with modern security standards." }
            ]
          });
        }
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-100/50 to-transparent z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-[120px] z-0"></div>

      <Navbar />
      
      <main className="flex-1 pb-20 relative z-10">
        {isLoading || !content ? (
          <Loader type="legal" />
        ) : (
          <>
            {/* Hero Section */}
            <div className="bg-emerald-900 pt-40 pb-32 mb-[-64px]">
              <div className="container mx-auto px-6 text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <a href="/" className="inline-flex items-center gap-2 text-emerald-300 hover:text-white transition-colors mb-8 font-bold group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                  </a>
                  <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                    {content?.hero?.title}
                  </h1>
                  <p className="text-emerald-100/80 font-medium max-w-2xl mx-auto leading-relaxed">
                    {content?.hero?.description}
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">

                {/* Content Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 border border-emerald-100 shadow-2xl shadow-emerald-200/20"
                >
                  <div className="prose prose-slate max-w-none">
                    {content?.sections?.map((section: any, idx: number) => {
                      const Icon = iconMap[section.icon] || Shield;
                      return (
                        <section key={idx} className="mb-12 last:mb-0">
                          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                              <Icon size={20} />
                            </div>
                            {section.title}
                          </h2>
                          <p className="text-slate-600 font-medium leading-relaxed">
                            {section.content}
                          </p>
                        </section>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
