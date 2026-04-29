import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-10"
    >
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-12 w-80 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-5 w-96 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Section Skeleton */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 rounded-lg border border-slate-100 bg-white shadow-sm space-y-6">
              <div className="w-14 h-14 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="h-4 w-full bg-slate-50 rounded-lg animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-50 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-4 w-24 bg-slate-100 rounded-lg animate-pulse pt-4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Skeleton */}
      <div className="bg-slate-100 rounded-lg p-10 relative overflow-hidden h-64 flex items-center">
        <div className="w-full grid md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-6">
            <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-16 w-full bg-slate-200/50 rounded-lg animate-pulse"></div>
            <div className="flex gap-4">
               <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="h-full w-full bg-white/20 rounded-lg animate-pulse border border-white/20"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
