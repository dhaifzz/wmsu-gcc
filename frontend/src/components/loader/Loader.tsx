import { motion } from 'framer-motion';

interface LoaderProps {
  type?: 'dashboard' | 'counseling' | 'shifting' | 'assessment' | 'legal' | 'management-schedule' | 'management-table' | 'shifting-client' | 'assessment-client' | 'counseling-client';
}

const Loader = ({ type = 'dashboard' }: LoaderProps) => {
  // Common solid colors
  const darkEmerald = "bg-emerald-900";
  const lineEmerald = "bg-emerald-800";
  const lightEmerald = "bg-emerald-700";
  const slate100 = "bg-slate-100";
  const slate300 = "bg-slate-300";

  // Public/Hero-style Loaders (Legal, Public Shifting, Public Assessment)
  if (type === 'legal' || type === 'shifting' || type === 'assessment' || type === 'counseling') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full min-h-screen bg-transparent"
      >
        <div className={`relative h-[450px] ${darkEmerald} flex items-center justify-center pt-32 pb-32`}>
          <div className="container mx-auto px-6 text-center space-y-6">
            <div className={`h-4 w-32 ${lightEmerald} rounded-lg animate-pulse mx-auto`}></div>
            <div className={`h-16 w-3/4 ${lineEmerald} rounded-lg animate-pulse mx-auto`}></div>
            <div className={`h-6 w-1/2 ${lineEmerald} rounded-lg animate-pulse mx-auto`}></div>
          </div>
        </div>

        <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className={`${type === 'legal' ? 'lg:col-span-3 max-w-4xl mx-auto' : 'lg:col-span-2'} space-y-8 w-full`}>
              <div className={`bg-white p-10 ${type === 'legal' ? 'rounded-[2.5rem] md:p-16' : 'rounded-lg'} shadow-xl shadow-slate-200 border border-slate-100 space-y-6`}>
                <div className={`h-8 w-48 ${slate300} rounded-lg animate-pulse`}></div>
                <div className="space-y-3">
                  <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                  <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                  <div className={`h-4 w-3/4 ${slate100} rounded-lg animate-pulse`}></div>
                </div>
                {(type === 'shifting' || type === 'assessment' || type === 'counseling') && (
                  <div className="grid md:grid-cols-2 gap-6 pt-6">
                    <div className={`h-32 ${slate100} rounded-lg animate-pulse border border-slate-50`}></div>
                    <div className={`h-32 ${slate100} rounded-lg animate-pulse border border-slate-50`}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Dashboard/Client-style Loaders (No Hero Section)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-10"
    >
      {type === 'management-schedule' ? (
        <div className="grid xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-16 bg-emerald-950 animate-pulse"></div>
              <div className="grid grid-cols-7 gap-px bg-slate-100">
                {[...Array(35)].map((_, i) => (
                  <div key={i} className="h-32 bg-white animate-pulse p-4 space-y-4">
                    <div className="h-4 w-4 bg-slate-100 rounded"></div>
                    <div className="h-3 w-16 bg-slate-50 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="xl:col-span-4 space-y-6">
             <div className="h-16 bg-emerald-900 rounded-lg animate-pulse"></div>
             <div className="bg-white rounded-lg border border-slate-200 p-6 h-96 animate-pulse"></div>
          </div>
        </div>
      ) : type === 'management-table' ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-4">
              <div className="h-10 w-80 bg-slate-300 rounded-lg animate-pulse"></div>
              <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-14 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm space-y-3">
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-10 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="h-12 w-full md:w-96 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="h-12 w-full md:w-32 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="h-12 w-full md:w-32 bg-slate-100 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-16 bg-emerald-950 animate-pulse"></div>
            <div className="divide-y divide-slate-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 flex items-center gap-8">
                  {/* User Details */}
                  <div className="flex items-center gap-4 flex-[2]">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse shrink-0"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-3 w-48 bg-slate-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                  {/* Role */}
                  <div className="flex-1 hidden md:block">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                  {/* Status */}
                  <div className="flex-1 hidden md:block">
                    <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                  </div>
                  {/* Actions */}
                  <div className="w-20 flex justify-end">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : type === 'shifting-client' ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse"></div>
             <div className="space-y-2">
                <div className="h-10 w-64 bg-slate-300 rounded-lg animate-pulse"></div>
                <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse"></div>
             </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg animate-pulse"></div>
                      <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-2">
                           <div className="h-3 w-20 bg-slate-100 rounded ml-4 animate-pulse"></div>
                           <div className="h-14 bg-slate-50 rounded-lg animate-pulse"></div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                   <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg animate-pulse"></div>
                      <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
                   </div>
                   <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-pulse"></div>
                      ))}
                   </div>
                </div>
             </div>
             <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                   <div className="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
                      ))}
                   </div>
                </div>
                <div className="bg-emerald-900 p-8 rounded-2xl space-y-6">
                   <div className="w-12 h-12 bg-emerald-700 rounded-xl animate-pulse"></div>
                   <div className="h-6 w-3/4 bg-emerald-700 rounded animate-pulse"></div>
                   <div className="h-24 bg-emerald-800 rounded-xl animate-pulse"></div>
                   <div className="h-14 bg-emerald-500 rounded-xl animate-pulse"></div>
                </div>
             </div>
          </div>
        </div>
      ) : type === 'assessment-client' || type === 'counseling-client' ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse"></div>
             <div className="space-y-2">
                <div className="h-10 w-64 bg-slate-300 rounded-lg animate-pulse"></div>
                <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse"></div>
             </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <div className="h-8 w-48 bg-slate-300 rounded animate-pulse"></div>
                   <div className="flex gap-2">
                      <div className="w-10 h-10 bg-slate-100 rounded animate-pulse"></div>
                      <div className="w-10 h-10 bg-slate-100 rounded animate-pulse"></div>
                   </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                   {[...Array(35)].map((_, i) => (
                     <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse"></div>
                   ))}
                </div>
             </div>
             <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-lg animate-pulse"></div>
                      <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
                   </div>
                   <div className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                   <div className="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
                   <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                           <div className="w-10 h-10 bg-slate-100 rounded animate-pulse"></div>
                           <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse"></div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-300 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-12 w-80 bg-slate-300 rounded-lg animate-pulse"></div>
            <div className="h-5 w-96 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-100 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Loader;
