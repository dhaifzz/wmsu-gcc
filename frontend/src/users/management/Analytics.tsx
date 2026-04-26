import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  BookOpen,
  Award,
  Medal
} from 'lucide-react';

const Analytics = () => {
  const stats = [
    { label: "Total Evaluations", value: "1,284", trend: "+12.5%", icon: BarChart3, color: "blue" },
    { label: "Completion Rate", value: "94.2%", trend: "+2.1%", icon: Activity, color: "emerald" },
    { label: "Avg. Processing Time", value: "1.5 Days", trend: "-15%", icon: TrendingUp, color: "purple" },
    { label: "Student Satisfaction", value: "4.8/5", trend: "+0.3", icon: Users, color: "amber" }
  ];

  const distribution = [
    { label: "Counseling", percent: 45, color: "bg-blue-500" },
    { label: "Assessment", percent: 35, color: "bg-emerald-500" },
    { label: "Shifting", percent: 20, color: "bg-rose-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Center Analytics</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Real-time performance metrics and distribution data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Export Data</button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
              <span className={`text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} flex items-center gap-1`}>
                <ArrowUpRight size={12} /> {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <PieChartIcon className="text-emerald-500" size={24} />
              Service Distribution
            </h3>
            <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>

          <div className="space-y-10">
            {distribution.map((item) => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                  <span className="text-sm font-black text-slate-900">{item.percent}%</span>
                </div>
                <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${item.color} rounded-full shadow-lg shadow-${item.color.split('-')[1]}-200/50`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 mb-1">Performance Insight</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Counseling sessions have increased by <strong>15%</strong> this month. Ensure that staff availability is optimized for the upcoming peak period.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-emerald-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20 border border-emerald-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
            <BookOpen className="text-emerald-400" size={24} />
            Top 5 Courses to Shift
          </h3>
          <div className="space-y-6 relative z-10">
            {[
              { course: 'BS Information Technology', count: 120, trend: '+15%' },
              { course: 'BS Computer Science', count: 85, trend: '+8%' },
              { course: 'BS Psychology', count: 64, trend: '+12%' },
              { course: 'BS Nursing', count: 50, trend: '-2%' },
              { course: 'BS Criminology', count: 42, trend: '+5%' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="text-center py-2 px-3 bg-white/10 rounded-2xl border border-white/10 h-fit min-w-[50px] flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <span className="text-lg font-black leading-none text-emerald-300 group-hover:text-white">#{idx + 1}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold leading-tight line-clamp-1">{item.course}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{item.count} Requests</span>
                    <span className={`text-[9px] font-black ${item.trend.startsWith('+') ? 'text-emerald-300' : 'text-rose-400'}`}>{item.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-white text-emerald-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
            View Full Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
            <Award className="text-emerald-500" size={24} />
            Top 5 Performing Staff
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Based on evaluations completed</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { name: 'Elena Rodriguez', role: 'Senior Counselor', count: 145, color: 'bg-amber-100 text-amber-600 border-amber-200' },
            { name: 'Roberto Gomez', role: 'Assessment Specialist', count: 132, color: 'bg-slate-100 text-slate-600 border-slate-200' },
            { name: 'Maria Clara', role: 'Guidance Staff', count: 98, color: 'bg-orange-50 text-orange-600 border-orange-100' },
            { name: 'Juan Luna', role: 'Guidance Staff', count: 87, color: 'bg-slate-50 text-slate-500 border-slate-100' },
            { name: 'Jose Rizal', role: 'Counselor', count: 76, color: 'bg-slate-50 text-slate-500 border-slate-100' }
          ].map((staff, idx) => (
            <div key={idx} className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 flex flex-col items-center text-center relative group hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
              <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-black text-xs ${staff.color}`}>
                #{idx + 1}
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-3 group-hover:scale-110 transition-transform">
                <Medal size={24} className={idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{staff.name}</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">{staff.role}</p>
              <div className="mt-auto w-full pt-3 border-t border-slate-200/50 group-hover:border-emerald-200/50">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{staff.count} Evaluated</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
