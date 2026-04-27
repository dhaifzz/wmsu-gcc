import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, GraduationCap, Building2, MapPin } from 'lucide-react';

const OurTeam = () => {
  const [activeTab, setActiveTab] = useState('main');

  const mainCampusData = {
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
  };

  const esuCampusData = [
    { name: "Roberto Reyes", degree: "MA in Guidance", dept: "ESU Pagadian" },
    { name: "Sarah Geronimo", degree: "MAEd Counseling", dept: "ESU Aurora" },
    { name: "Piolo Pascual", degree: "MS Psychology", dept: "ESU Molave" },
    { name: "Angel Locsin", degree: "MA Guidance", dept: "ESU Alicia" }
  ];

  const MemberCard = ({ member }: { member: any }) => (
    <div className="bg-white p-8 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
      
      <div className="flex flex-col items-center text-center">
        {/* Placeholder Photo */}
        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform">
          <User size={48} strokeWidth={1.5} />
        </div>
        
        <h4 className="text-xl font-black text-slate-900 mb-2">{member.name}</h4>
        
        <div className="flex items-center gap-2 text-emerald-600 mb-4">
          <GraduationCap size={16} />
          <span className="text-xs font-black uppercase tracking-wider">{member.degree}</span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-lg w-full justify-center">
          <Building2 size={14} />
          <span className="text-xs font-bold">{member.dept}</span>
        </div>
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
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Our Dedicated Team</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
            Meet the professionals behind the Guidance and Counseling Center dedicated to your growth and well-being.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button 
            onClick={() => setActiveTab('main')}
            className={`px-8 py-5 rounded-lg font-black transition-all flex items-center justify-center gap-3 shadow-xl ${
              activeTab === 'main' 
              ? 'bg-white text-emerald-700 scale-105 border-2 border-emerald-500' 
              : 'bg-emerald-800 text-emerald-100 border-2 border-transparent hover:bg-emerald-700'
            }`}
          >
            <Building2 size={24} />
            Main Campus
          </button>
          <button 
            onClick={() => setActiveTab('esu')}
            className={`px-8 py-5 rounded-lg font-black transition-all flex items-center justify-center gap-3 shadow-xl ${
              activeTab === 'esu' 
              ? 'bg-white text-emerald-700 scale-105 border-2 border-emerald-500' 
              : 'bg-emerald-800 text-emerald-100 border-2 border-transparent hover:bg-emerald-700'
            }`}
          >
            <MapPin size={24} />
            ESU Campuses
          </button>
        </div>

        {activeTab === 'main' ? (
          <div className="space-y-20">
            {/* Guidance Counselors */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900">Guidance Counselors</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mainCampusData.counselors.map((m, i) => <MemberCard key={i} member={m} />)}
              </div>
            </div>

            {/* Guidance Coordinators */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900">Guidance Coordinators</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mainCampusData.coordinators.map((m, i) => <MemberCard key={i} member={m} />)}
              </div>
            </div>

            {/* Support Staff */}
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900">Support Staff</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mainCampusData.staff.map((m, i) => <MemberCard key={i} member={m} />)}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
              <h2 className="text-3xl font-black text-slate-900">Guidance Coordinators (ESU Campuses)</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {esuCampusData.map((m, i) => <MemberCard key={i} member={m} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OurTeam;
