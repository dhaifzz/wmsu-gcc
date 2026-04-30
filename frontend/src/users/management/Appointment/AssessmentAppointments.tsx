import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Search, Filter, Calendar as CalendarIcon, MoreHorizontal, FileText, CheckCircle2, X } from 'lucide-react';
import AssessmentEvaluationModal from '../../../components/management-modals/AssessmentEvaluationModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { appointmentApi } from '../../../lib/api';
import type { ManagementAppointmentItem } from '../../../lib/api';
import { useAuth } from '../../../auth/AuthContext';

const AssessmentAppointments = ({ role = 'staff' }: { role?: 'staff' | 'director' | 'admin' }) => {
  const { accessToken } = useAuth();
  const theme = useTheme();
  const [appointments, setAppointments] = useState<ManagementAppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<ManagementAppointmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await appointmentApi.getAssessmentManagementAppointments(accessToken);
      if (res.ok) {
        setAppointments(res.data.appointments);
      } else {
        console.error('Error fetching assessment management appointments:', res.error);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [accessToken]);

  const handleEvaluate = (app: ManagementAppointmentItem) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };


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
              <button className={`px-4 py-2.5 ${theme.bg50} ${theme.hoverBg600} ${theme.text600} hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${theme.border200} ${theme.hoverBorder600} flex items-center gap-2 shadow-sm`}>
                <CheckCircle2 size={14} />
                Accept All
              </button>
              <button className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600 flex items-center gap-2 shadow-sm">
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
              className={`bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 ${theme.focusRing} transition-all outline-none`}
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50" title="Filter">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-slate-500 font-bold text-sm">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-slate-500 font-bold text-sm">
                    No appointments found.
                  </td>
                </tr>
              ) : appointments.map((app) => (
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
                          {app.course}
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
                        className={`px-4 py-2 ${theme.bg600} text-white rounded-lg text-[10px] font-black uppercase tracking-widest ${theme.hoverBg700} transition-all flex items-center gap-2`}
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
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAppointments();
        }}
      />
    </motion.div>
  )
};

export default AssessmentAppointments;
