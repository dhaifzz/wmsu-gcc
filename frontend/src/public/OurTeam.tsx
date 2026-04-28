import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Building2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cmsApi } from '../lib/api';

const MarqueeText = ({ text, className }: { text: string; className: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scrollAmount, setScrollAmount] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth) {
          setScrollAmount(textWidth - containerWidth + 10); // add small buffer
        } else {
          setScrollAmount(0);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className={`${className} overflow-hidden whitespace-nowrap`}>
      <motion.span
        ref={textRef}
        animate={scrollAmount > 0 ? { x: [0, -scrollAmount, 0] } : { x: 0 }}
        transition={{
          duration: Math.max(3, scrollAmount * 0.05),
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 2
        }}
        className="inline-block"
      >
        {text}
      </motion.span>
    </div>
  );
};

const OurTeam = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [teamContent, setTeamContent] = useState<any>({
    hero: {
      title: "Our Dedicated Team",
      description: "Meet the professionals behind the Guidance and Counseling Center dedicated to your growth and well-being."
    },
    mainCampus: {
      director: [
        { name: "Dr. Jane Doe", degree: "PhD in Psychology", dept: "Director, GCC" }
      ],
      counselors: [
        { name: "Dr. Maria Elena Santos", degree: "PhD in Guidance and Counseling", dept: "Main Campus - GCC" },
        { name: "Prof. Ricardo Dela Cruz", degree: "MA in Psychology", dept: "Main Campus - GCC" }
      ],
      coordinators: [
        { name: "Liza Marie Gomez", degree: "MAEd - Guidance", dept: "College of Education" },
        { name: "Antonio Luna", degree: "MS Psychology", dept: "College of Science & Math" },
        { name: "Elena Gilbert", degree: "MA in Counseling", dept: "College of Engineering" }
      ],
      staff: [
        { name: "Juan Ponce", degree: "BS Psychology", dept: "Support Services" },
        { name: "Maria Clara", degree: "BS Office Administration", dept: "Administrative Office" }
      ]
    },
    esuCampus: [
      { name: "Roberto Reyes", degree: "MA in Guidance", dept: "ESU Pagadian" },
      { name: "Sarah Geronimo", degree: "MAEd Counseling", dept: "ESU Aurora" },
      { name: "Piolo Pascual", degree: "MS Psychology", dept: "ESU Molave" },
      { name: "Angel Locsin", degree: "MA Guidance", dept: "ESU Alicia" }
    ]
  });

  useEffect(() => {
    const fetchContent = async () => {
      const result = await cmsApi.getContent('team');
      if (result.ok && result.data.hero) {
        const data = result.data;
        if (data.mainCampus && !data.mainCampus.director) data.mainCampus.director = [];
        setTeamContent(data);
      }
    };
    fetchContent();
  }, []);

  const DirectorCard = ({ member }: { member: any }) => (
    <div className="max-w-4xl w-full mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group">
      <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-white shadow-xl shrink-0 relative z-10 bg-slate-100">
        {member.profileImage ? (
          <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <User size={96} strokeWidth={1} />
          </div>
        )}
      </div>

        <div className="flex-1 text-center md:text-left relative z-10 space-y-4 min-w-0">
          <div className="space-y-1">
            <MarqueeText 
              text={member.name} 
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight" 
            />
            <MarqueeText 
              text={member.degree} 
              className="text-lg font-black text-emerald-600 uppercase tracking-widest" 
            />
          </div>
          
          <div className="h-1.5 w-24 bg-emerald-500 rounded-full mx-auto md:mx-0"></div>
          
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 max-w-full">
              <Building2 size={18} className="shrink-0" />
              <MarqueeText text={member.dept} className="text-sm font-bold" />
            </div>
          </div>
        </div>
    </div>
  );

  const MemberCard = ({ member, showDegree = true }: { member: any; showDegree?: boolean }) => (
    <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl transition-all group overflow-hidden flex flex-col items-center text-center w-full sm:w-[280px]">
      <div className="w-full aspect-square mb-6 rounded-full overflow-hidden bg-slate-100 relative border-4 border-white shadow-inner">
        {member.profileImage ? (
          <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
            <User size={64} strokeWidth={1} />
          </div>
        )}
      </div>

      <MarqueeText 
        text={member.name} 
        className="text-lg font-black text-slate-900 mb-1 leading-tight w-full" 
      />
      {showDegree && (
        <MarqueeText 
          text={member.degree} 
          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 w-full" 
        />
      )}

      <div className={`flex items-center gap-2 text-slate-500 bg-slate-50/50 px-3 py-2 rounded-xl w-full justify-center mt-auto border border-slate-100 overflow-hidden ${!showDegree ? 'mt-4' : ''}`}>
        <Building2 size={12} className="shrink-0" />
        <MarqueeText text={member.dept} className="text-[10px] font-bold" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 bg-emerald-900 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">{teamContent.hero.title}</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
            {teamContent.hero.description}
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button
            onClick={() => setActiveTab('main')}
            className={`px-8 py-5 rounded-lg font-black transition-all flex items-center justify-center gap-3 shadow-xl ${activeTab === 'main'
              ? 'bg-white text-emerald-700 scale-105 border-2 border-emerald-500'
              : 'bg-emerald-800 text-emerald-100 border-2 border-transparent hover:bg-emerald-700'
              }`}
          >
            <Building2 size={24} />
            Main Campus
          </button>
          <button
            onClick={() => setActiveTab('esu')}
            className={`px-8 py-5 rounded-lg font-black transition-all flex items-center justify-center gap-3 shadow-xl ${activeTab === 'esu'
              ? 'bg-white text-emerald-700 scale-105 border-2 border-emerald-500'
              : 'bg-emerald-800 text-emerald-100 border-2 border-transparent hover:bg-emerald-700'
              }`}
          >
            <MapPin size={24} />
            ESU Campuses
          </button>
        </div>

        {activeTab === 'main' ? (
          <div className="space-y-24">
            {/* Director */}
            {teamContent.mainCampus.director?.length > 0 && (
              <div className="mb-32">
                <div className="flex flex-col items-center gap-3 mb-16 text-center">
                  <div className="h-1.5 w-24 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Our Director</h2>
                </div>
                <div className="px-6">
                  {teamContent.mainCampus.director.map((m: any, i: number) => <DirectorCard key={i} member={m} />)}
                </div>
              </div>
            )}

            {/* Guidance Counselors */}
            <div>
              <div className="flex flex-col items-center gap-3 mb-12 text-center">
                <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Guidance Counselors</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                {teamContent.mainCampus.counselors.map((m: any, i: number) => <MemberCard key={i} member={m} />)}
              </div>
            </div>

            {/* Guidance Staff */}
            <div>
              <div className="flex flex-col items-center gap-3 mb-12 text-center">
                <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Guidance Staff</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                {teamContent.mainCampus.staff.map((m: any, i: number) => <MemberCard key={i} member={m} />)}
              </div>
            </div>

            {/* Guidance Coordinators */}
            <div>
              <div className="flex flex-col items-center gap-3 mb-12 text-center">
                <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Guidance Coordinators</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-8">
                {teamContent.mainCampus.coordinators.map((m: any, i: number) => <MemberCard key={i} member={m} />)}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col items-center gap-3 mb-12 text-center">
              <div className="h-1.5 w-16 bg-emerald-500 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Guidance Coordinators (ESU Campuses)</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {teamContent.esuCampus.map((m: any, i: number) => <MemberCard key={i} member={m} showDegree={false} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OurTeam;
