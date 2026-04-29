import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Search, Filter, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import { appointmentApi, type HistoryItem } from '../../lib/api';

const History = () => {
  const theme = useTheme();
  const { accessToken } = useAuth();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken) return;
      try {
        const result = await appointmentApi.getAppointmentHistory(accessToken);
        if (result.ok && result.data.history) {
          setHistoryItems(result.data.history);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [accessToken]);

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>;
  }

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
              className="bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold w-64 focus:ring-2 focus:ring-slate-500 transition-all outline-none"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={theme.bg900}>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Student Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Level</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Service Type</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyItems.length > 0 ? historyItems.map((item) => (
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
                      item.type === 'Assessment' ? `${theme.bg50} ${theme.text600} ${theme.border200}` :
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
                        <CheckCircle2 size={16} className={theme.text600} />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                      <span className={`font-bold text-xs ${item.status === 'Completed' ? theme.text600 : 'text-rose-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className={`${theme.text600} text-[10px] font-black uppercase tracking-widest hover:underline`}>View Receipt</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-500 font-bold">
                    No history records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default History;
