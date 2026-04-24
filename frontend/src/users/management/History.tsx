import { motion } from 'framer-motion';
import { Clock, Search, Filter, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';

const History = () => {
  const historyItems = [
    { id: 1, student: "Luna, Juan", level: "College", type: "Counseling", date: "May 20, 2024", status: "Completed" },
    { id: 2, student: "Clara, Maria", level: "High School", type: "Assessment", date: "May 18, 2024", status: "Cancelled" },
    { id: 3, student: "Rizal, Jose", level: "College", type: "Shifting", date: "May 15, 2024", status: "Completed" },
    { id: 4, student: "Bonifacio, Andres", level: "College", type: "Counseling", date: "May 12, 2024", status: "Completed" },
    { id: 5, student: "Mabini, Apolinario", level: "College", type: "Assessment", date: "May 10, 2024", status: "Cancelled" },
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
            <Clock className="text-slate-600" size={28} />
            Appointment History
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Review all completed and cancelled appointments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-slate-500 transition-all outline-none"
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
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Student Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Level</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Service Type</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyItems.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-sm text-slate-900">{item.student}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.level === 'College' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {item.level}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.type === 'Counseling' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      item.type === 'Assessment' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-purple-50 text-purple-600 border-purple-100'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CalendarIcon size={14} />
                      <span className="text-sm font-bold">{item.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {item.status === 'Completed' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                      <span className={`font-bold text-xs ${item.status === 'Completed' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">View File</button>
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

export default History;
