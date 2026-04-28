import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-8"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-5 w-96 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100/50 rounded-[2rem] border border-slate-200/60">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-14 w-36 bg-slate-200 rounded-2xl animate-pulse"></div>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-slate-200 rounded-md animate-pulse"></div>
            <div className="h-32 w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="h-4 w-40 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-48 w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-36 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-48 w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 w-48 bg-slate-200 rounded-md animate-pulse"></div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 flex-1 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
