import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListChecks,
  Search,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface PendingItem {
  id: string;
  student: string;
  level: string;
  type: string;
  date: string;
  time: string;
  status: string;
}

const typeColor: Record<string, string> = {
  Counseling: 'bg-blue-100 text-blue-700',
  Assessment: 'bg-teal-100 text-teal-700',
  Shifting: 'bg-rose-100 text-rose-700',
};

interface ApprovalQueueProps {
  queue: PendingItem[];
  loading: boolean;
  onApprove: (item: PendingItem) => void;
  onDecline: (item: PendingItem) => void;
}

export const ApprovalQueue = ({ queue, loading, onApprove, onDecline }: ApprovalQueueProps) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    return queue.filter(a =>
      a.student.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [queue, search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  
  // Ensure current page is valid when filtering changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (currentPage === 0 && totalPages > 0) {
    setCurrentPage(1);
  }

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <ListChecks size={20} className="text-amber-600" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">Pending Approvals</h4>
            <p className="text-slate-400 text-xs font-bold">{queue.length} appointment{queue.length !== 1 ? 's' : ''} awaiting your action</p>
          </div>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or type..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-100 rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold w-full sm:w-64 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 sm:p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-teal-500" />
          <span className="text-sm font-bold">Loading appointments…</span>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <div className="p-12 sm:p-16 text-center text-slate-400 italic text-sm">
                No pending appointments found.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {paginatedItems.map(appt => (
                  <motion.div
                    key={appt.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 hover:bg-slate-50/50 transition-colors gap-3 sm:gap-4"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-4 min-w-0">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 font-black shrink-0 text-sm">
                          {appt.student.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 truncate text-sm">{appt.student}</p>
                          <p className="text-slate-400 text-xs font-bold">{appt.level}</p>
                        </div>
                      </div>

                      <span className={`sm:hidden px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${typeColor[appt.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {appt.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                      <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${typeColor[appt.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {appt.type}
                      </span>

                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold shrink-0">
                        <Calendar size={13} />
                        <span>{appt.date}</span>
                        <Clock size={13} className="ml-1" />
                        <span>{appt.time}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onApprove(appt)}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-teal-200 hover:border-teal-600"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => onDecline(appt)}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-rose-200 hover:border-rose-600"
                        >
                          <XCircle size={14} />
                          Decline
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50 mt-auto">
              <span className="text-xs font-bold text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
