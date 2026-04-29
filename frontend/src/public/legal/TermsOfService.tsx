import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Gavel, CheckCircle, AlertTriangle, FileText, UserCheck, ArrowLeft, Shield, Eye, Scale, Clock, Users } from 'lucide-react';
import { cmsApi } from '../../lib/api';
import Loader from '../../components/loader/Loader';

const iconMap: Record<string, any> = {
  Gavel: Gavel,
  CheckCircle: CheckCircle,
  AlertTriangle: AlertTriangle,
  FileText: FileText,
  UserCheck: UserCheck,
  Shield: Shield,
  Eye: Eye,
  Scale: Scale,
  Clock: Clock,
  Users: Users
};

const TermsOfService = () => {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await cmsApi.getContent('terms');
        if (res.ok && res.data && Object.keys(res.data).length > 0) {
          setContent(res.data);
        } else {
          // Default content fallback
          setContent({
            hero: {
              title: "Terms of Service",
              description: "By accessing and using the WMSU GCC Portal, you agree to comply with and be bound by the following terms and conditions."
            },
            sections: [
              { title: "1. Account Eligibility", icon: "Users", content: "The portal is intended for use by current students, faculty, and authorized staff of Western Mindanao State University, as well as registered outside clients seeking specific center services. You are responsible for maintaining the confidentiality of your account credentials." },
              { title: "2. Service Use & Conduct", icon: "CheckCircle", content: "Users agree to: Provide accurate and truthful information in all forms and assessments, use the portal exclusively for its intended guidance and academic purposes, respect the appointment schedules and the time of the center professionals, and abide by the University Student Code of Conduct in all interactions." },
              { title: "3. Appointment Policy", icon: "Clock", content: "Booking an appointment through the portal does not guarantee immediate service. All appointments are subject to verification and counselor availability. Failure to show up for multiple scheduled appointments without prior notice may result in temporary suspension of portal booking privileges." },
              { title: "4. Intellectual Property", icon: "FileText", content: "All content, assessments, logos, and materials provided on this portal are the property of WMSU and the Guidance and Counseling Center. Unauthorized reproduction, distribution, or commercial use of these materials is strictly prohibited." },
              { title: "5. Modifications", icon: "Gavel", content: "The WMSU GCC reserves the right to modify these terms at any time. Significant changes will be communicated through the portal notifications or university email." }
            ]
          });
        }
      } catch (error) {
        console.error("Error fetching terms of service:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-emerald-100/50 to-transparent z-0"></div>
      <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[150px] z-0"></div>
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl z-0"></div>

      <Navbar />
      
      <main className="flex-1 pb-20 relative z-10">
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
                {content.hero.title}
              </h1>
              <p className="text-emerald-100/80 font-medium max-w-2xl mx-auto leading-relaxed">
                {content.hero.description}
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
                {content.sections.map((section: any, idx: number) => {
                  const Icon = iconMap[section.icon] || Gavel;
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
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
