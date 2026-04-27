import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Search, Filter, Calendar as CalendarIcon, MoreHorizontal, FileText, CheckCircle2, X } from 'lucide-react';
import AssessmentEvaluationModal from '../../../components/management-modals/AssessmentEvaluationModal';
import { useTheme } from '../../../contexts/ThemeContext';

const AssessmentAppointments = ({ role = 'staff' }: { role?: 'staff' | 'director' | 'admin' }) => {
  const theme = useTheme();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEvaluate = (app: any) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };
  const appointments = [
    { id: 1, student: "Juan Luna", level: "College", course: "BSCS", studentId: "2021-00456", time: "08:00 AM - 09:00 AM", date: "May 24, 2024", test: "DASS-21 Test", status: role === 'director' ? "Evaluated" : "Pending", evaluatedBy: "Elena Rodriguez" },
    { id: 2, student: "Maria Clara", level: "High School", grade: "12", track: "Academic", studentId: "2021-00789", time: "09:00 AM - 10:00 AM", date: "May 24, 2024", test: "DASS-Y Test", status: "Approved", evaluatedBy: "Elena Rodriguez" },
    { id: 3, student: "Dr. Jose Rizal", level: "Faculty", department: "College of Science", studentId: "FAC-99123", time: "10:00 AM - 11:00 AM", date: "May 24, 2024", test: "DASS-21 Test", status: role === 'director' ? "Evaluated" : "Pending", evaluatedBy: "Roberto Gomez" },
    { id: 4, student: "Mabini, Apolinario", level: "Outside Client", occupation: "Freelance Lawyer", studentId: "EXT-88555", time: "11:00 AM - 12:00 PM", date: "May 25, 2024", test: "DASS-21 Test", status: role === 'director' ? "Evaluated" : "Pending", evaluatedBy: "Elena Rodriguez" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <ClipboardCheck className={theme.text600} size={28} />
            {role === 'director' ? 'Assessment Approvals' : 'Assessment Appointments'}
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {role === 'director' 
              ? 'Finalize and approve staff-evaluated assessment sessions.' 
              : 'Review testing requirements, prepare materials, and conduct evaluations.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {role === 'director' && (
            <div className="flex items-center gap-2 mr-2">
              <button className={`px-4 py-2.5 ${theme.bg50} ${theme.hoverBg600} ${theme.text600} hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${theme.border200} ${theme.hoverBorder600} flex items-center gap-2 shadow-sm`}>
                <CheckCircle2 size={14} />
                Accept All
              </button>
              <button className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600 flex items-center gap-2 shadow-sm">
                <X size={14} />
                Decline All
              </button>
            </div>
          )}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by student or test..."
              className={`bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 ${theme.focusRing} transition-all outline-none`}
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50" title="Filter">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={theme.bg900}>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Requestor Info</th>
                {role === 'director' ? (
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Evaluated By</th>
                ) : (
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Level / Dept</th>
                )}
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Test Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Schedule</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((app) => (
                <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-sm text-slate-900">{app.student}</p>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{app.studentId}</p>
                  </td>
                  {role === 'director' ? (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className={`w-7 h-7 ${theme.bg50} rounded-lg flex items-center justify-center ${theme.text600} border ${theme.border200}`}>
                           <ClipboardCheck size={12} />
                         </div>
                         <p className="text-xs font-bold text-slate-700">{app.evaluatedBy || 'Pending'}</p>
                      </div>
                    </td>
                  ) : (
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${app.level === 'College' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            app.level === 'High School' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              app.level === 'Faculty' ? `${theme.bg50} ${theme.text600} ${theme.border200}` :
                                'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                          {app.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 ml-1">
                          {app.level === 'College' ? app.course :
                            app.level === 'High School' ? (['11', '12'].includes(app.grade || '') ? `${app.track} (G${app.grade})` : `Grade ${app.grade}`) :
                              app.level === 'Faculty' ? app.department :
                                app.occupation}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-sm font-bold">{app.test}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CalendarIcon size={14} className="text-slate-400" />
                      <p className="text-sm font-bold lowercase">{app.time}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium ml-6">{app.date}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Approved' ? theme.bg600 : 'bg-amber-500'}`}></div>
                      <span className="font-bold text-xs text-slate-700">{app.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEvaluate(app)}
                        className={`px-4 py-2 ${theme.bg600} text-white rounded-xl text-[10px] font-black uppercase tracking-widest ${theme.hoverBg700} transition-all flex items-center gap-2`}
                      >
                        <ClipboardCheck size={14} />
                        {role === 'director' ? 'Final Review' : 'Review'}
                      </button>
                      {role !== 'director' && (
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-lg border border-slate-100">
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AssessmentEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
        role={role}
      />
    </motion.div>
  )
};

export default AssessmentAppointments;
