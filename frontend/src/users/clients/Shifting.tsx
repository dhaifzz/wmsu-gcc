import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Upload, 
  User, 
  BookOpen, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Clock
} from 'lucide-react';
import MarqueeText from '../../components/MarqueeText';
import { cmsApi } from '../../lib/api';

const ICON_MAP: any = {
  ImageIcon: ImageIcon,
  FileText: FileText,
  ClipboardCheck: ClipboardCheck,
  Clock: Clock,
  User: User,
  AlertCircle: AlertCircle
};

interface ShiftingProps {
  onBack: () => void;
  user: any;
}

const Shifting = ({ onBack, user }: ShiftingProps) => {
  const [formData, setFormData] = useState({
    targetCourse: '',
    reason: ''
  });
  const [docStep, setDocStep] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, []);

  const header = { title: "Shifting Examination", subtitle: "Helping you find the right academic path for your future career." };
  const academic = { title: "Academic Guidelines", subtitle: "Please provide your target course and reason for shifting." };
  const courses = [
    "BS Computer Science", "BS Information Technology", "BS Nursing", "BS Psychology",
    "BS Civil Engineering", "BS Mechanical Engineering", "BS Education", "BS Criminology",
    "BS Accountancy", "BS Business Administration", "BS Biology", "BS Social Work"
  ];
  const documents = [
    { label: "Booking Receipt", note: "Digital or printed copy of your appointment confirmation.", iconName: "ClipboardCheck" },
    { label: "2x2 Picture", note: "Formal 2x2 colored picture with name tag (Selfies are not allowed).", iconName: "ImageIcon" },
    { label: "Downloadable Grades", note: "A complete copy of all your previous semester's grades.", iconName: "FileText" },
    { label: "Latest COR", note: "Your most recent Certificate of Registration (COR).", iconName: "FileText" },
    { label: "Entrance Test Result", note: "Original or certified copy of your college entrance test result.", iconName: "ClipboardCheck" }
  ];
  const instructions = `Make sure you have met the minimum GPA requirements of your target college before applying. You are currently enrolled in ${user.course}.`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">{header.title}</h2>
          <p className="text-slate-500 font-medium text-sm">{header.subtitle}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Card */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Summary Card (Read Only) */}
          <div className="bg-emerald-900 rounded-lg p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center text-emerald-400 border border-white/10 shrink-0">
                <User size={48} />
              </div>
              <div className="text-center md:text-left flex-1">
                <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Authenticated Student</p>
                <h3 className="text-3xl font-black mb-3">{user.name}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">ID: {user.studentId}</span>
                  <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{user.type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{academic.title}</h3>
                <p className="text-slate-400 text-sm font-medium">{academic.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Current Course</label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 font-bold text-slate-400 flex items-center gap-3 overflow-hidden">
                  <GraduationCap size={18} className="shrink-0" />
                  <MarqueeText 
                    text={user.course} 
                    className="text-sm font-bold"
                    containerClassName="flex-1"
                  />
                </div>
              </div>

              <div className="hidden md:flex mt-4 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                <ArrowRight size={20} />
              </div>

              <div className="flex-1 w-full space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 ml-4">Course to Shift</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border-2 border-emerald-100 rounded-lg px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex-1 overflow-hidden">
                      {formData.targetCourse ? (
                        <MarqueeText 
                          text={formData.targetCourse} 
                          className="text-sm font-bold text-slate-900"
                          containerClassName="w-full"
                        />
                      ) : (
                        <span className="text-slate-300 text-sm font-bold">Select target course</span>
                      )}
                    </div>
                    <ChevronDown size={20} className={`text-emerald-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-2xl shadow-emerald-900/10 overflow-hidden max-h-[250px] overflow-y-auto scrollbar-hide"
                      >
                        {courses.filter(c => c !== user.course).map(course => (
                          <button
                            key={course}
                            onClick={() => {
                              setFormData({ ...formData, targetCourse: course });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0
                              ${formData.targetCourse === course 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-600'
                              }
                            `}
                          >
                            {course}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason to Shift</label>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Numbers or sentences allowed</span>
              </div>
              <textarea 
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Type your reason for shifting here..."
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300 resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div className="flex-1 flex justify-between items-center w-full">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Required Documents</h3>
                  <p className="text-slate-400 text-sm font-medium">Upload high-quality scans of your documents.</p>
                </div>
                <div className="hidden sm:block text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg">
                  Step {docStep + 1} of {documents.length}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={docStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex justify-center w-full"
                >
                    <div className="aspect-square w-[280px] p-8 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm mb-6 shrink-0">
                        {(() => {
                          const Icon = ICON_MAP[documents[docStep].iconName] || FileText;
                          return <Icon size={28} />;
                        })()}
                      </div>
                      <div className="mb-6">
                        <p className="text-sm font-black text-slate-900 mb-1 leading-tight">{documents[docStep].label}*</p>
                        <p className="text-[10px] text-slate-400 font-medium">{documents[docStep].note}</p>
                      </div>
                      <button className="w-full py-3.5 mt-auto bg-white border border-slate-200 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Upload size={14} /> Upload
                      </button>
                    </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setDocStep(Math.max(0, docStep - 1))}
                disabled={docStep === 0}
                className="px-6 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-500"
              >
                Previous
              </button>
              <button
                onClick={() => setDocStep(Math.min(documents.length - 1, docStep + 1))}
                disabled={docStep === documents.length - 1}
                className="px-6 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Progress & Tips */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-slate-900 rounded-lg p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <h3 className="font-black text-xl mb-8 relative z-10">Application Status</h3>
            
            <div className="space-y-6 relative z-10 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm">Identity Verified</p>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Automatic</p>
                </div>
              </div>
              <div className="flex items-start gap-4 opacity-30">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="font-bold text-sm text-white/50">Submission</p>
                  <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">Awaiting Files</p>
                </div>
              </div>
            </div>

            <button className="w-full py-5 bg-emerald-600 text-white rounded-lg font-black text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-950/40">
              Submit Application
            </button>
          </div>

          <div className="bg-emerald-50 rounded-lg p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4 text-emerald-700">
              <AlertCircle size={18} />
              <h4 className="font-black text-xs uppercase tracking-widest">Instructions</h4>
            </div>
            <p className="text-xs text-emerald-700/70 leading-relaxed font-medium">
              {instructions.split(user.course).map((part: string, i: number, arr: any[]) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <strong>{user.course}</strong>}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Shifting;
