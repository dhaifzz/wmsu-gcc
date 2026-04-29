import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Gavel, CheckCircle, AlertTriangle, FileText, UserCheck, ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16 text-center"
            >
              <a href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors mb-8 font-bold group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </a>
              <div className="block"></div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">

                <Gavel size={14} />
                User Agreement
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                Terms of Service
              </h1>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                By accessing and using the WMSU GCC Portal, you agree to comply with and be bound by the following terms and conditions.
              </p>
            </motion.div>

            {/* Content Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
              <div className="prose prose-slate max-w-none">
                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <UserCheck size={20} />
                    </div>
                    1. Account Eligibility
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    The portal is intended for use by current students, faculty, and authorized staff of Western Mindanao State University, as well as registered outside clients seeking specific center services. You are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    2. Service Use & Conduct
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed mb-4">
                    Users agree to:
                  </p>
                  <ul className="space-y-4 list-none p-0">
                    {[
                      "Provide accurate and truthful information in all forms and assessments.",
                      "Use the portal exclusively for its intended guidance and academic purposes.",
                      "Respect the appointment schedules and the time of the center professionals.",
                      "Abide by the University Student Code of Conduct in all interactions."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700">
                        <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </div>
                    3. Appointment Policy
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Booking an appointment through the portal does not guarantee immediate service. All appointments are subject to verification and counselor availability. Failure to show up for multiple scheduled appointments without prior notice may result in temporary suspension of portal booking privileges.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    4. Intellectual Property
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    All content, assessments, logos, and materials provided on this portal are the property of WMSU and the Guidance and Counseling Center. Unauthorized reproduction, distribution, or commercial use of these materials is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                      <Gavel size={20} />
                    </div>
                    5. Modifications
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    The WMSU GCC reserves the right to modify these terms at any time. Significant changes will be communicated through the portal notifications or university email.
                  </p>
                </section>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
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
