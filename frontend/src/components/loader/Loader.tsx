import { motion } from 'framer-motion';

interface LoaderProps {
  type?: 'dashboard' | 'counseling' | 'shifting' | 'assessment' | 'legal';
}

const Loader = ({ type = 'dashboard' }: LoaderProps) => {
  // Common solid colors
  const darkEmerald = "bg-emerald-900";
  const lineEmerald = "bg-emerald-800";
  const lightEmerald = "bg-emerald-700";
  const slate100 = "bg-slate-100";
  const slate200 = "bg-slate-200";
  const slate300 = "bg-slate-300";

  if (type !== 'dashboard') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full bg-slate-50"
      >
        {/* Hero Skeleton - Solid Dark Emerald */}
        <div className={`relative h-[450px] ${darkEmerald} flex items-center justify-center pt-32 pb-32`}>
          <div className="container mx-auto px-6 text-center space-y-6">
            <div className={`h-4 w-32 ${lightEmerald} rounded-lg animate-pulse mx-auto`}></div>
            <div className={`h-16 w-3/4 ${lineEmerald} rounded-lg animate-pulse mx-auto`}></div>
            <div className={`h-6 w-1/2 ${lineEmerald} rounded-lg animate-pulse mx-auto`}></div>
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="container mx-auto px-6 -mt-16 relative z-20 pb-24">
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* Main Content */}
            <div className={`${type === 'legal' ? 'lg:col-span-3 max-w-4xl mx-auto' : 'lg:col-span-2'} space-y-8 w-full`}>
              
              {/* Type Specific Section 1 */}
              <div className={`bg-white p-10 ${type === 'legal' ? 'rounded-[2.5rem] md:p-16' : 'rounded-lg'} shadow-xl shadow-slate-200 border border-slate-100 space-y-6`}>
                <div className={`h-8 w-48 ${slate300} rounded-lg animate-pulse`}></div>
                <div className="space-y-3">
                  <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                  <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                  <div className={`h-4 w-3/4 ${slate100} rounded-lg animate-pulse`}></div>
                </div>
                
                {/* Specific Grid for Shifting/Assessment */}
                {(type === 'shifting' || type === 'assessment') && (
                  <div className="grid md:grid-cols-2 gap-6 pt-6">
                    <div className={`h-32 ${slate100} rounded-lg animate-pulse border border-slate-50`}></div>
                    <div className={`h-32 ${slate100} rounded-lg animate-pulse border border-slate-50`}></div>
                  </div>
                )}

                {/* Legal extra sections inside the same card */}
                {type === 'legal' && (
                  <div className="space-y-12 pt-12">
                     {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-4">
                        <div className={`h-8 w-48 ${slate300} rounded-lg animate-pulse`}></div>
                        <div className="space-y-2">
                          <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                          <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                          <div className={`h-4 w-2/3 ${slate100} rounded-lg animate-pulse`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Type Specific Section 2 (Requirements/Tests) */}
              {type !== 'legal' && (
                <div className={`bg-white p-10 rounded-lg shadow-xl shadow-slate-200 border border-slate-100 space-y-6`}>
                  <div className={`h-8 w-48 ${slate300} rounded-lg animate-pulse`}></div>
                  {type === 'counseling' ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className={`w-6 h-6 bg-emerald-600 rounded-full animate-pulse`}></div>
                          <div className={`h-6 w-full ${slate100} rounded-lg animate-pulse`}></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-24 ${slate100} rounded-lg animate-pulse`}></div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Type Specific Section 3 (Process Steps) */}
              {type !== 'legal' && (
                <div className={`bg-white p-10 rounded-lg shadow-xl shadow-slate-200 border border-slate-100 space-y-8`}>
                  <div className={`h-8 w-48 ${slate300} rounded-lg animate-pulse`}></div>
                  <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative pl-12 space-y-2">
                        <div className={`absolute left-0 top-0 w-9 h-9 bg-white border-2 border-emerald-600 rounded-full animate-pulse`}></div>
                        <div className={`h-6 w-48 ${slate200} rounded-lg animate-pulse`}></div>
                        <div className={`h-4 w-full ${slate100} rounded-lg animate-pulse`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Skeleton - Only if not legal */}
            {type !== 'legal' && (
              <div className="space-y-8">
                {/* Primary Sidebar Card */}
                <div className={`${type === 'assessment' ? 'bg-white' : 'bg-emerald-900'} p-8 rounded-lg border ${type === 'assessment' ? 'border-slate-100' : 'border-emerald-800'} space-y-6 shadow-xl`}>
                  <div className={`w-12 h-12 ${type === 'assessment' ? 'bg-emerald-600' : 'bg-emerald-700'} rounded-lg animate-pulse`}></div>
                  <div className={`h-8 w-3/4 ${type === 'assessment' ? slate300 : 'bg-emerald-700'} rounded-lg animate-pulse`}></div>
                  <div className={`h-20 w-full ${type === 'assessment' ? slate100 : 'bg-emerald-800'} rounded-lg animate-pulse`}></div>
                  <div className={`h-12 w-full ${type === 'assessment' ? 'bg-emerald-600' : 'bg-emerald-500'} rounded-lg animate-pulse`}></div>
                </div>

                {/* Secondary Sidebar Card (Hotline/Guidance/FAQ) */}
                <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-xl shadow-slate-200 space-y-4">
                  <div className={`h-6 w-32 ${slate300} rounded-lg animate-pulse`}></div>
                  <div className={`h-12 w-full ${slate100} rounded-lg animate-pulse`}></div>
                  <div className={`h-10 w-full ${slate100} rounded-lg animate-pulse`}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

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
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-300 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-12 w-80 bg-slate-300 rounded-lg animate-pulse"></div>
        <div className="h-5 w-96 bg-slate-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Stats Row Skeleton */}
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

      {/* Services Section Skeleton */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-300 rounded-lg animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 rounded-lg border border-slate-200 bg-white shadow-sm space-y-6">
              <div className="w-14 h-14 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-6 w-32 bg-slate-300 rounded-lg animate-pulse"></div>
                <div className="h-4 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="h-4 w-2/3 bg-slate-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-4 w-24 bg-slate-200 rounded-lg animate-pulse pt-4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Skeleton - Solid Slate */}
      <div className="bg-slate-200 rounded-lg p-10 relative overflow-hidden h-64 flex items-center">
        <div className="w-full grid md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-6">
            <div className="h-10 w-64 bg-slate-300 rounded-lg animate-pulse"></div>
            <div className="h-16 w-full bg-slate-300 rounded-lg animate-pulse"></div>
            <div className="flex gap-4">
               <div className="h-6 w-40 bg-slate-400 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="h-full w-full bg-white rounded-lg animate-pulse border border-slate-300"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;