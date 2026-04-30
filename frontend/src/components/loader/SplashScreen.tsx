import { motion } from 'framer-motion';
import wmsuLogo from '../../assets/logos/WMSU.png';
import gccLogo from '../../assets/logos/GCC.png';

import { useEffect, useState } from 'react';

// SplashScreen shows only on the first visit to the HomePage.
// It self-manages visibility using a sessionStorage flag to avoid
// flashing on subsequent navigations.
const SplashScreen = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplashHome');
    if (!hasShownSplash) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('hasShownSplashHome', 'true');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="flex items-center -space-x-4"
        >
          <img src={wmsuLogo} alt="WMSU" className="w-28 h-28 object-contain drop-shadow-2xl z-10" />
          <img src={gccLogo} alt="GCC" className="w-28 h-28 object-contain drop-shadow-2xl z-20" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">WMSU GCC</h2>
          <p className="text-emerald-600 font-bold tracking-[0.3em] text-sm mt-2">{new Date().getFullYear()}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
