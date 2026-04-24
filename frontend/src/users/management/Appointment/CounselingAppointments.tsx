import { motion } from 'framer-motion';
import { MessageCircle, Search, Filter, Calendar as CalendarIcon, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';

const CounselingAppointments = () => {
  const appointments = [
    { id: 1, student: "Juan Luna", level: "College", course: "BSCS", studentId: "2021-00456", time: "08:00 AM - 09:00 AM", date: "May 24, 2024", status: "Pending" },
    { id: 2, student: "Maria Clara", level: "High School", grade: "12", track: "Academic", studentId: "2021-00789", time: "10:30 AM - 11:30 AM", date: "May 24, 2024", status: "Approved" },
    { id: 3, student: "Dr. Jose Rizal", level: "Faculty", department: "College of Science", studentId: "FAC-99123", time: "02:00 PM - 03:00 PM", date: "May 24, 2024", status: "Pending" },
    { id: 4, student: "Mabini, Apolinario", level: "Outside Client", occupation: "Freelance Lawyer", studentId: "EXT-88555", time: "04:00 PM - 05:00 PM", date: "May 25, 2024", status: "Pending" },
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
            <MessageCircle className="text-blue-500" size={28} />
            Counseling Appointments
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and review student, faculty, and outside client counseling requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search appointments..." 
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-emerald-900">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Requestor Info</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Level / Dept</th>
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
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit ${
                        app.level === 'College' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        app.level === 'High School' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        app.level === 'Faculty' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
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
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-700">
                      <CalendarIcon size={14} className="text-slate-400" />
                      <p className="text-sm font-bold lowercase">{app.time}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium ml-6">{app.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="font-bold text-xs text-slate-700">{app.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <CheckCircle2 size={16} />
                      </button>
                      <button className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                        <XCircle size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default CounselingAppointments;
