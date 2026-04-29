import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Shield, Lock, Eye, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-emerald-100/50 to-transparent z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-[120px] z-0"></div>

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
                Privacy Policy
              </h1>
              <p className="text-emerald-100/80 font-medium max-w-2xl mx-auto leading-relaxed">
                Your privacy is our priority. This policy outlines how the WMSU Guidance and Counseling Center (GCC) collects, uses, and protects your information.
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
                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Lock size={20} />
                    </div>
                    1. Data Collection
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed mb-4">
                    The WMSU GCC collects personal and sensitive information through our online portal and physical forms. This includes:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
                    {[
                      "Personal identification (Name, ID, Birthdate)",
                      "Contact details (Email, Phone, Address)",
                      "Academic records and history",
                      "Health and psychological assessments",
                      "Appointment and consultation logs"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl text-sm font-bold text-slate-700 border border-slate-100">
                        <ChevronRight size={14} className="text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Eye size={20} />
                    </div>
                    2. Use of Information
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Your data is used exclusively for the purpose of providing guidance, counseling, and assessment services. We use this information to:
                  </p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                      Process appointment requests and shifting examinations.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                      Maintain accurate student counseling records as required by university policy.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0"></span>
                      Analyze aggregated, non-identifiable data to improve our support programs.
                    </li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    3. Confidentiality
                  </h2>
                  <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl">
                    <p className="text-rose-900 text-sm font-bold leading-relaxed mb-0">
                      Confidentiality is the cornerstone of counseling. Information shared during counseling sessions will not be disclosed to any third party without your explicit written consent, except in cases where there is a clear risk of harm to yourself or others, or as required by law (e.g., court order).
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    4. Data Security
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    We implement strict technical and organizational measures to protect your data against unauthorized access, loss, or alteration. All online data is encrypted and stored in secure cloud environments compliant with modern security standards.
                  </p>
                </section>
              </div>


            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
