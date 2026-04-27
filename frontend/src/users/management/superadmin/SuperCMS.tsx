import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Home,
  Info,
  MapPin,
  Phone,
  Save,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  Users,
  Database,
  AlignLeft,
  Building2,
  GraduationCap,
  Plus,
  Trash2,
  Briefcase,
  GripVertical,
  Palette
} from 'lucide-react';
import { showAlert } from '../../../components/modal-notification/sweetalert';
import { showToast } from '../../../components/modal-notification/toast';
import { cmsApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabaseClient';

const CMS = () => {
  const [activeSection, setActiveSection] = useState<string | null>('home');

  // Home Page Content State
  const [homeContent, setHomeContent] = useState({
    hero: {
      title: "Take care of your Mental Health",
      description: "The WMSU Guidance and Counseling Center provides a safe space for growth, empowerment, and emotional support. We are here to help you shine.",
      images: [null, null, null]
    },
    support: {
      title: "Support Services",
      subtitle: "Need Help? Start Here",
      description: "We provide comprehensive support services to help students navigate their academic journey and personal development.",
      features: [
        {
          title: "Counseling",
          path: "/services/counseling",
          description: "Counseling services are available for both students and outside clients. Appointments are required for consultations, which include the completion of the Personal Data Form and Counseling Form before sessions.",
          image: null
        },
        {
          title: "Assessment for Students",
          path: "/services/assessment",
          description: "Conducts assessments for students taking the DASS-21 Test (College) and DASS-Y Test (High School). Students must schedule an appointment and complete the required forms before the assessment.",
          image: null
        },
        {
          title: "Shifting Exam",
          path: "/services/shifting",
          description: "Students changing programs. Applicants must schedule an appointment and complete the required forms before taking the exam.",
          image: null
        }
      ]
    },
    growth: {
      title: "We're here to help you grow.",
      description: "Our center offers a variety of services tailored to meet the diverse needs of the WMSU student body. From mental health support to career planning, we've got you covered.",
      image: null,
      services: [
        { name: "Individual Counseling" },
        { name: "Career Guidance" },
        { name: "Crisis Intervention" },
        { name: "Peer Support" }
      ]
    }
  });

  const [aboutContent, setAboutContent] = useState({
    hero: {
      title: "About the Center",
      description: "The Guidance and Counseling Center at Western Mindanao State University is a vital support unit dedicated to addressing the psychological, emotional, and personal development needs of students and staff.",
      image: null
    },
    core: {
      vision: "By 2040, WMSU is a Smart Research University generating competent professionals and global citizens engendered by the knowledge from sciences and liberal education, empowering communities, promoting peace, harmony, and cultural diversity.",
      mission: "WMSU commits to create a vibrant atmosphere of learning where science, technology, innovation, research, the arts and humanities, and community engagement flourish, and produce world-class professionals committed to sustainable development and peace.",
      qualityPolicy: "The Western Mindanao State University is committed to deliver academic excellence, to produce globally competitive human resources, and to conduct innovative research for sustainable development beyond the ASEAN region. It is defined as a Smart Research University, that adapts to the changing landscape of the stakeholders' needs.\n\nWMSU also commits to continually enhance its Quality Management System by integrating risk-based thinking into all processes to achieve intended results and guarantee customer satisfaction in compliance with applicable quality assurance standards."
    },
    sidebar: {
      location: "2nd Floor, Executive Building",
      campus: "WMSU Main Campus, Normal Road",
      hours: "Monday - Friday, 8:00 AM - 5:00 PM",
      serving: "Students, Returnees, & Transferees"
    },
    contact: {
      phone: "(062) 991-6446",
      email: "gcc@wmsu.edu.ph"
    },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.916858546554!2d122.062033!3d6.9123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32504193639e78df%3A0x64700877997a66f7!2sWestern+Mindanao+State+University!5e0!3m2!1sen!2sph!4v1713862000000"
  });

  const [teamContent, setTeamContent] = useState({
    hero: {
      title: "Our Dedicated Team",
      description: "Meet the professionals behind the Guidance and Counseling Center dedicated to your growth and well-being."
    },
    mainCampus: {
      director: [
        { name: "Dr. Jane Doe", degree: "PhD in Psychology", dept: "Director, GCC", profileImage: null }
      ],
      counselors: [
        { name: "Dr. Maria Elena Santos", degree: "PhD in Guidance and Counseling", dept: "Main Campus - GCC", profileImage: null },
        { name: "Prof. Ricardo Dela Cruz", degree: "MA in Psychology", dept: "Main Campus - GCC", profileImage: null }
      ],
      coordinators: [
        { name: "Liza Marie Gomez", degree: "MAEd - Guidance", dept: "College of Education", profileImage: null },
        { name: "Antonio Luna", degree: "MS Psychology", dept: "College of Science & Math", profileImage: null },
        { name: "Elena Gilbert", degree: "MA in Counseling", dept: "College of Engineering", profileImage: null }
      ],
      staff: [
        { name: "Juan Ponce", degree: "BS Psychology", dept: "Support Services", profileImage: null },
        { name: "Maria Clara", degree: "BS Office Administration", dept: "Administrative Office", profileImage: null }
      ]
    },
    esuCampus: [
      { name: "Roberto Reyes", degree: "MA in Guidance", dept: "ESU Pagadian", profileImage: null },
      { name: "Sarah Geronimo", degree: "MAEd Counseling", dept: "ESU Aurora", profileImage: null },
      { name: "Piolo Pascual", degree: "MS Psychology", dept: "ESU Molave", profileImage: null },
      { name: "Angel Locsin", degree: "MA Guidance", dept: "ESU Alicia", profileImage: null }
    ]
  });

  const [contactContent, setContactContent] = useState({
    phone: "(062) 991-6446",
    email: "gcc@wmsu.edu.ph",
    address: "2nd Floor, Executive Building, WMSU Main Campus, Normal Road, Zamboanga City",
    facebook: "WMSU Guidance and Counseling Center",
    messenger: "m.me/wmsugcc"
  });

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: 'emerald',
    mode: 'light',
    accentStyle: 'rounded'
  });

  const [footerContent, setFooterContent] = useState({
    description: "Empowering WMSU students through professional guidance, psychological support, and career development services."
  });



  const [systemData, setSystemData] = useState({
    courses: [
      "BS in Computer Science",
      "BS in Information Technology",
      "BS in Psychology",
      "BS in Civil Engineering",
      "BS in Nursing",
      "BS in Education",
      "BS in Criminology",
      "BS in Accountancy"
    ],
    shsTracks: [
      "STEM (Science, Technology, Engineering, and Mathematics)",
      "ABM (Accountancy, Business, and Management)",
      "HUMSS (Humanities and Social Sciences)",
      "GAS (General Academic Strand)",
      "TVL (Technical-Vocational-Livelihood)"
    ],
    occupations: [
      "Student",
      "Faculty",
      "Staff",
      "Alumni",
      "Outside Client",
      "Professional",
      "Unemployed"
    ]
  });



  const colorThemes: Record<string, Record<string, string>> = {
    emerald: {
      50: "236 253 245", 100: "209 250 229", 200: "167 243 208", 300: "110 231 183",
      400: "52 211 153", 500: "16 185 129", 600: "5 150 105", 700: "4 120 87",
      800: "6 95 70", 900: "6 78 59"
    },
    teal: {
      50: "240 253 250", 100: "204 251 241", 200: "153 246 233", 300: "94 234 212",
      400: "45 212 191", 500: "20 184 166", 600: "13 148 136", 700: "15 118 110",
      800: "17 94 89", 900: "19 78 74"
    },
    indigo: {
      50: "238 242 255", 100: "224 231 255", 200: "199 210 254", 300: "165 180 252",
      400: "129 140 248", 500: "99 102 241", 600: "79 70 229", 700: "67 56 202",
      800: "55 48 163", 900: "49 46 129"
    },
    rose: {
      50: "255 241 242", 100: "255 228 230", 200: "254 205 211", 300: "253 164 175",
      400: "251 113 133", 500: "244 63 94", 600: "225 29 72", 700: "190 18 60",
      800: "159 18 57", 900: "136 19 55"
    }
  };

  const applyTheme = (color: string) => {
    const theme = colorThemes[color];
    if (!theme) return;

    Object.entries(theme).forEach(([shade, value]) => {
      document.documentElement.style.setProperty(`--primary-${shade}`, value);
    });
  };

  const [savedStates, setSavedStates] = useState<Record<string, any>>({});



  const fetchAllContent = async () => {
    const sectionsToFetch = ['home', 'about', 'team', 'contact', 'footer', 'theme', 'system'];
    const newSavedStates: Record<string, any> = {};

    for (const s of sectionsToFetch) {
      const result = await cmsApi.getContent(s);
      if (result.ok && result.data) {
        newSavedStates[s] = JSON.parse(JSON.stringify(result.data));
        switch (s) {
          case 'home': setHomeContent(result.data); break;
          case 'about': setAboutContent(result.data); break;
          case 'team': 
            const teamData = result.data;
            if (teamData.mainCampus && !teamData.mainCampus.director) {
              teamData.mainCampus.director = [];
            }
            setTeamContent(teamData); 
            break;
          case 'contact': setContactContent(result.data); break;
          case 'footer': setFooterContent(result.data); break;
          case 'theme':
            if (result.data.primaryColor) {
              setThemeSettings(result.data);
              applyTheme(result.data.primaryColor);
            }
            break;
          case 'system': setSystemData(result.data); break;
        }
      }
    }
    setSavedStates(newSavedStates);
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadContext, setUploadContext] = useState<{ section: string; path: (string | number)[]; index?: number } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadContext) return;

    try {
      showToast.info('Uploading image...');
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = `cms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cms-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cms-assets')
        .getPublicUrl(filePath);

      const { section, path, index } = uploadContext;

      if (section === 'home') {
        setHomeContent(prev => {
          const newContent = JSON.parse(JSON.stringify(prev));
          let current = newContent;
          for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
          }
          const lastKey = path[path.length - 1];
          if (typeof index === 'number') {
            current[lastKey][index] = publicUrl;
          } else {
            current[lastKey] = publicUrl;
          }
          return newContent;
        });
      } else if (section === 'team') {
        setTeamContent(prev => {
          const newContent = JSON.parse(JSON.stringify(prev));
          let current = newContent;
          for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
          }
          const lastKey = path[path.length - 1];
          if (typeof index === 'number') {
            current[lastKey][index] = publicUrl;
          } else {
            current[lastKey] = publicUrl;
          }
          return newContent;
        });
      } else if (section === 'about') {
        setAboutContent(prev => {
          const newContent = JSON.parse(JSON.stringify(prev));
          let current = newContent;
          for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
          }
          const lastKey = path[path.length - 1];
          current[lastKey] = publicUrl;
          return newContent;
        });
      }

      showToast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast.error(`Upload failed: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadContext(null);
    }
  };

  const triggerUpload = (section: string, path: (string | number)[], index?: number) => {
    setUploadContext({ section, path, index });
    fileInputRef.current?.click();
  };

  const discardSection = async (sectionId: string) => {
    const result = await showAlert.confirm(
      'Discard Changes',
      'Are you sure you want to discard all unsaved changes for this section?',
      'Discard',
      'Stay'
    );

    if (result.isConfirmed) {
      const res = await cmsApi.getContent(sectionId);
      if (res.ok && res.data) {
        switch (sectionId) {
          case 'home': setHomeContent(res.data); break;
          case 'about': setAboutContent(res.data); break;
          case 'team': 
            const data = res.data;
            if (data.mainCampus && !data.mainCampus.director) data.mainCampus.director = [];
            setTeamContent(data); 
            break;
          case 'contact': setContactContent(res.data); break;
          case 'footer': setFooterContent(res.data); break;
          case 'theme': setThemeSettings(res.data); applyTheme(res.data.primaryColor); break;
          case 'system': setSystemData(res.data); break;
        }
        showToast.info('Changes discarded.');
      }
    }
  };

  const hasChanges = (sectionId: string) => {
    const current = sectionId === 'home' ? homeContent :
      sectionId === 'about' ? aboutContent :
        sectionId === 'team' ? teamContent :
          sectionId === 'contact' ? contactContent :
            sectionId === 'footer' ? footerContent :
              sectionId === 'theme' ? themeSettings :
                sectionId === 'system' ? systemData : null;

    return JSON.stringify(current) !== JSON.stringify(savedStates[sectionId]);
  };

  const handleSave = async (section: string) => {
    const result = await showAlert.confirm(
      'Save Changes',
      `Are you sure you want to save the updates to the ${section} section?`,
      'Save',
      'Cancel'
    );

    if (result.isConfirmed) {
      let contentToSave;
      let sectionKey;

      switch (section) {
        case 'Home Page': contentToSave = homeContent; sectionKey = 'home'; break;
        case 'About Us': contentToSave = aboutContent; sectionKey = 'about'; break;
        case 'Our Team': contentToSave = teamContent; sectionKey = 'team'; break;
        case 'Contact Info': contentToSave = contactContent; sectionKey = 'contact'; break;
        case 'System Data': contentToSave = systemData; sectionKey = 'system'; break;
        case 'Footer': contentToSave = footerContent; sectionKey = 'footer'; break;
        case 'Theme Settings': contentToSave = themeSettings; sectionKey = 'theme'; break;
      }

      if (sectionKey) {
        const updateResult = await cmsApi.updateContent(sectionKey, contentToSave);
        if (updateResult.ok) {
          setSavedStates(prev => ({
            ...prev,
            [sectionKey]: JSON.parse(JSON.stringify(contentToSave))
          }));

          if (section === 'Theme Settings') {
            applyTheme(themeSettings.primaryColor);
          }
          showToast.success(`${section} updated successfully!`);
        } else {
          showToast.error(`Failed to update ${section}.`);
        }
      }
    }
  };

  const sections = [
    { id: 'home', title: 'Home Page', icon: Home, description: 'Manage hero text, images, and announcements.' },
    { id: 'about', title: 'About Us', icon: Info, description: 'Edit the mission, vision, and center history.' },
    { id: 'team', title: 'Our Team', icon: Users, description: 'Manage team members and counselors.' },
    { id: 'contact', title: 'Contact Info', icon: Phone, description: 'Update phone numbers, emails, and address.' },
    { id: 'system', title: 'System Data', icon: Database, description: 'Manage courses, SHS tracks, and occupations.' },
    { id: 'footer', title: 'Footer', icon: LayoutGrid, description: 'Manage footer brand text.' },
    { id: 'theme', title: 'Theme Settings', icon: Palette, description: 'Customize system colors and branding.' },
  ];

return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*"
      onChange={handleImageUpload}
    />
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Content Management</h2>
        <p className="text-slate-500 font-medium">Manage the public-facing content of the GCC Portal.</p>
      </div>
    </div>

    {/* Tabs Navigation */}
    <div className="flex flex-wrap gap-2 p-2 bg-slate-100/50 rounded-[2rem] border border-slate-200/60 backdrop-blur-sm">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${activeSection === section.id
            ? 'bg-white text-teal-600 shadow-lg shadow-slate-200/50 scale-[1.02]'
            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
            }`}
        >
          <section.icon size={20} className={activeSection === section.id ? 'text-teal-500' : ''} />
          <span className="text-sm tracking-tight">{section.title}</span>
          {activeSection === section.id && (
            <motion.div
              layoutId="activeTab"
              className="w-1.5 h-1.5 bg-teal-500 rounded-full"
            />
          )}
        </button>
      ))}
    </div>

    <AnimatePresence mode="wait">
      {activeSection === 'home' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Home Page Editor</h3>
              {hasChanges('home') ? (
                <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-full animate-pulse uppercase tracking-widest">Unsaved Changes</span>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest">Synced with DB</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('home')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Home Page')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-900 text-white rounded-xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* Hero Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Hero Section
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Title</label>
                    <input
                      type="text"
                      value={homeContent.hero.title || ''}
                      onChange={(e) => setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, title: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={homeContent.hero.description || ''}
                      onChange={(e) => setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, description: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                    ></textarea>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Hero Images (3 Required)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        onClick={() => triggerUpload('home', ['hero', 'images'], idx)}
                        className={`aspect-square bg-slate-100 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-teal-400 hover:text-teal-500 transition-colors cursor-pointer group relative overflow-hidden ${homeContent.hero.images[idx] !== savedStates.home?.hero?.images[idx] ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-300'
                          }`}
                      >
                        {homeContent.hero.images[idx] ? (
                          <>
                            <img src={homeContent.hero.images[idx] || ''} className="w-full h-full object-cover" alt="" />
                            {homeContent.hero.images[idx] !== savedStates.home?.hero?.images[idx] && (
                              <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[8px] font-black py-1 text-center">
                                UNSAVED VERSION
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-teal-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              CLICK TO CHANGE
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold">Image {idx + 1}</span>
                          </>
                        )}
                        {homeContent.hero.images[idx] && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon size={20} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Support Services */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlignLeft className="text-teal-500" size={20} />
                Support Services Section
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Section Title</label>
                  <input
                    type="text"
                    value={homeContent.support.title}
                    onChange={(e) => setHomeContent({
                      ...homeContent,
                      support: { ...homeContent.support, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={homeContent.support.subtitle}
                    onChange={(e) => setHomeContent({
                      ...homeContent,
                      support: { ...homeContent.support, subtitle: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    rows={2}
                    value={homeContent.support.description}
                    onChange={(e) => setHomeContent({
                      ...homeContent,
                      support: { ...homeContent.support, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Support Features (3 Items)</label>
                <div className="grid md:grid-cols-3 gap-4">
                  {homeContent.support.features.map((feature, idx) => (
                    <div key={idx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase">Title</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...homeContent.support.features];
                              newFeatures[idx].title = e.target.value;
                              setHomeContent({
                                ...homeContent,
                                support: { ...homeContent.support, features: newFeatures }
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase">Link Path</label>
                          <input
                            type="text"
                            value={feature.path}
                            onChange={(e) => {
                              const newFeatures = [...homeContent.support.features];
                              newFeatures[idx].path = e.target.value;
                              setHomeContent({
                                ...homeContent,
                                support: { ...homeContent.support, features: newFeatures }
                              });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Description</label>
                        <textarea
                          rows={3}
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...homeContent.support.features];
                            newFeatures[idx].description = e.target.value;
                            setHomeContent({
                              ...homeContent,
                              support: { ...homeContent.support, features: newFeatures }
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-medium text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                        ></textarea>
                      </div>
                      <div
                        className={`h-20 bg-slate-100 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group ${feature.image !== savedStates.home?.support?.features?.[idx]?.image ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-300'
                          }`}
                        onClick={() => triggerUpload('home', ['support', 'features', idx, 'image'])}
                      >
                        {feature.image ? (
                          <>
                            <img src={feature.image} className="w-full h-full object-cover" alt="" />
                            {feature.image !== savedStates.home?.support?.features?.[idx]?.image && (
                              <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[7px] font-black py-0.5 text-center">
                                UNSAVED
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <ImageIcon size={16} className="mb-1" />
                            <span className="text-[8px] font-bold">Add Image</span>
                          </>
                        )}
                        {feature.image && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Our Services Section (Growth Section) */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <LayoutGrid className="text-teal-500" size={20} />
                Our Services Section
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Section Title</label>
                    <input
                      type="text"
                      value={homeContent.growth.title}
                      onChange={(e) => setHomeContent({
                        ...homeContent,
                        growth: { ...homeContent.growth, title: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={homeContent.growth.description}
                      onChange={(e) => setHomeContent({
                        ...homeContent,
                        growth: { ...homeContent.growth, description: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Display Image</label>
                    <div
                      onClick={() => triggerUpload('home', ['growth', 'image'])}
                      className={`h-32 bg-slate-100 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-teal-400 hover:text-teal-500 transition-colors cursor-pointer group relative overflow-hidden ${homeContent.growth.image !== savedStates.home?.growth?.image ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-300'
                        }`}
                    >
                      {homeContent.growth.image ? (
                        <>
                          <img src={homeContent.growth.image} className="w-full h-full object-cover" alt="" />
                          {homeContent.growth.image !== savedStates.home?.growth?.image && (
                            <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[8px] font-black py-1 text-center">
                              UNSAVED VERSION
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <ImageIcon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Upload Services Image</span>
                        </>
                      )}
                      {homeContent.growth.image && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Cards (4 Items)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {homeContent.growth.services.map((service, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-teal-100 rounded-md flex items-center justify-center text-teal-600">
                            <span className="text-[10px] font-black">{idx + 1}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Service Title</span>
                        </div>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => {
                            const newServices = [...homeContent.growth.services];
                            newServices[idx].name = e.target.value;
                            setHomeContent({
                              ...homeContent,
                              growth: { ...homeContent.growth, services: newServices }
                            });
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'about' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">About Us Editor</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('about')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('About Us')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-900 text-white rounded-xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* Hero Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Hero Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={aboutContent.hero.title || ''}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      hero: { ...aboutContent.hero, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={aboutContent.hero.description || ''}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      hero: { ...aboutContent.hero, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Core Statements */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlignLeft className="text-teal-500" size={20} />
                Vision, Mission & Policy
              </h4>
              <div className="grid gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Our Vision</label>
                  <textarea
                    rows={3}
                    value={aboutContent.core.vision}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      core: { ...aboutContent.core, vision: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Our Mission</label>
                  <textarea
                    rows={3}
                    value={aboutContent.core.mission}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      core: { ...aboutContent.core, mission: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Quality Policy</label>
                  <textarea
                    rows={6}
                    value={aboutContent.core.qualityPolicy}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      core: { ...aboutContent.core, qualityPolicy: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="text-teal-500" size={20} />
                Office Information
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Office Location</label>
                  <input
                    type="text"
                    value={aboutContent.sidebar.location}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      sidebar: { ...aboutContent.sidebar, location: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Campus Address</label>
                  <input
                    type="text"
                    value={aboutContent.sidebar.campus}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      sidebar: { ...aboutContent.sidebar, campus: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Hours</label>
                  <input
                    type="text"
                    value={aboutContent.sidebar.hours}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      sidebar: { ...aboutContent.sidebar, hours: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Who We Serve</label>
                  <input
                    type="text"
                    value={aboutContent.sidebar.serving}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      sidebar: { ...aboutContent.sidebar, serving: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Google Maps Embed URL</label>
                  <textarea
                    rows={2}
                    value={aboutContent.mapUrl}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      mapUrl: e.target.value
                    })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'team' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Our Team Editor</h3>
            </div>
            <button
              onClick={() => handleSave('Our Team')}
              className="flex items-center gap-2 px-6 py-3 bg-teal-900 text-white rounded-xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>

          <div className="space-y-10">
            {/* Hero Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Hero Section
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={teamContent.hero.title}
                    onChange={(e) => setTeamContent({
                      ...teamContent,
                      hero: { ...teamContent.hero, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    rows={2}
                    value={teamContent.hero.description}
                    onChange={(e) => setTeamContent({
                      ...teamContent,
                      hero: { ...teamContent.hero, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Main Campus Team */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="text-teal-500" size={20} />
                  Main Campus Team
                </h4>
              </div>

              {/* Director */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Director</label>
                  <button
                    onClick={() => {
                      const newItems = [...teamContent.mainCampus.director, { name: "New Director", degree: "PhD/MA", dept: "Director, GCC", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Director
                  </button>
                </div>
                <Reorder.Group 
                  axis="y" 
                  values={teamContent.mainCampus.director || []} 
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newOrder } })}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {(teamContent.mainCampus.director || []).map((member, idx) => (
                    <Reorder.Item 
                      key={member.name + idx} 
                      value={member}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-teal-500 transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = teamContent.mainCampus.director.filter((_, i) => i !== idx);
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } });
                          }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div
                        onClick={() => triggerUpload('team', ['mainCampus', 'director', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.director?.[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                          }`}
                      >
                        {member.profileImage ? (
                          <>
                            <img src={member.profileImage} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon size={20} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-bold mt-1">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.director];
                            newItems[idx].name = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } });
                          }}
                          placeholder="Name"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.degree}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.director];
                            newItems[idx].degree = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } });
                          }}
                          placeholder="Degree"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.dept}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.director];
                            newItems[idx].dept = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } });
                          }}
                          placeholder="Department"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Counselors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Guidance Counselors</label>
                  <button
                    onClick={() => {
                      const newCounselors = [...teamContent.mainCampus.counselors, { name: "New Counselor", degree: "PhD/MA", dept: "Main Campus - GCC", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newCounselors } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Counselor
                  </button>
                </div>
                <Reorder.Group 
                  axis="y" 
                  values={teamContent.mainCampus.counselors} 
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newOrder } })}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {teamContent.mainCampus.counselors.map((member, idx) => (
                    <Reorder.Item 
                      key={member.name + idx} 
                      value={member}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-teal-500 transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <button
                          onClick={() => {
                            const newCounselors = teamContent.mainCampus.counselors.filter((_, i) => i !== idx);
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newCounselors } });
                          }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div
                        onClick={() => triggerUpload('team', ['mainCampus', 'counselors', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.counselors[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                          }`}
                      >
                        {member.profileImage ? (
                          <>
                            <img src={member.profileImage} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon size={20} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-bold mt-1">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.counselors];
                            newItems[idx].name = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newItems } });
                          }}
                          placeholder="Name"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.degree}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.counselors];
                            newItems[idx].degree = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newItems } });
                          }}
                          placeholder="Degree"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.dept}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.counselors];
                            newItems[idx].dept = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newItems } });
                          }}
                          placeholder="Department"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Guidance Staff */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Guidance Staff</label>
                  <button
                    onClick={() => {
                      const newItems = [...teamContent.mainCampus.staff, { name: "New Staff", degree: "BS/BA", dept: "Unit/Office", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newItems } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Staff
                  </button>
                </div>
                <Reorder.Group 
                  axis="y" 
                  values={teamContent.mainCampus.staff} 
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newOrder } })}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {teamContent.mainCampus.staff.map((member, idx) => (
                    <Reorder.Item 
                      key={member.name + idx} 
                      value={member}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-teal-500 transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = teamContent.mainCampus.staff.filter((_, i) => i !== idx);
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newItems } });
                          }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div
                        onClick={() => triggerUpload('team', ['mainCampus', 'staff', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.staff[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                          }`}
                      >
                        {member.profileImage ? (
                          <>
                            <img src={member.profileImage} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon size={20} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-bold mt-1">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.staff];
                            newItems[idx].name = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newItems } });
                          }}
                          placeholder="Name"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.degree}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.staff];
                            newItems[idx].degree = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newItems } });
                          }}
                          placeholder="Degree"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.dept}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.staff];
                            newItems[idx].dept = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newItems } });
                          }}
                          placeholder="Department"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Coordinators */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Guidance Coordinators</label>
                  <button
                    onClick={() => {
                      const newItems = [...teamContent.mainCampus.coordinators, { name: "New Coordinator", degree: "MA/MS", dept: "College/Dept", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newItems } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Coordinator
                  </button>
                </div>
                <Reorder.Group 
                  axis="y" 
                  values={teamContent.mainCampus.coordinators} 
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newOrder } })}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {teamContent.mainCampus.coordinators.map((member, idx) => (
                    <Reorder.Item 
                      key={member.name + idx} 
                      value={member}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-teal-500 transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = teamContent.mainCampus.coordinators.filter((_, i) => i !== idx);
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newItems } });
                          }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div
                        onClick={() => triggerUpload('team', ['mainCampus', 'coordinators', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.coordinators[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                          }`}
                      >
                        {member.profileImage ? (
                          <>
                            <img src={member.profileImage} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon size={20} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-bold mt-1">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.coordinators];
                            newItems[idx].name = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newItems } });
                          }}
                          placeholder="Name"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.degree}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.coordinators];
                            newItems[idx].degree = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newItems } });
                          }}
                          placeholder="Degree"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <input
                          type="text"
                          value={member.dept}
                          onChange={(e) => {
                            const newItems = [...teamContent.mainCampus.coordinators];
                            newItems[idx].dept = e.target.value;
                            setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newItems } });
                          }}
                          placeholder="Department"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>

            {/* ESU Campus Team */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="text-teal-500" size={20} />
                  ESU Campus Coordinators
                </h4>
                <button
                  onClick={() => {
                    const newItems = [...teamContent.esuCampus, { name: "New ESU Coordinator", degree: "MA/MS", dept: "ESU Location", profileImage: null }];
                    setTeamContent({ ...teamContent, esuCampus: newItems });
                  }}
                  className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                >
                  + Add ESU Member
                </button>
              </div>
              <Reorder.Group 
                axis="y" 
                values={teamContent.esuCampus} 
                onReorder={(newOrder) => setTeamContent({ ...teamContent, esuCampus: newOrder })}
                className="grid md:grid-cols-4 gap-4"
              >
                  {teamContent.esuCampus.map((member, idx) => (
                    <Reorder.Item 
                      key={member.name + idx} 
                      value={member}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 relative group cursor-default"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-teal-500 transition-colors">
                          <GripVertical size={14} />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = teamContent.esuCampus.filter((_, i) => i !== idx);
                            setTeamContent({ ...teamContent, esuCampus: newItems });
                          }}
                          className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold z-10"
                        >
                          ×
                        </button>
                      </div>
                      <div
                        onClick={() => triggerUpload('team', ['esuCampus', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.esuCampus[idx]?.profileImage ? 'border-amber-400' : 'border-slate-200'
                          }`}
                      >
                        {member.profileImage ? (
                          <img src={member.profileImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <>
                            <ImageIcon size={20} />
                            <span className="text-[8px] font-bold mt-1">Photo</span>
                          </>
                        )}
                      </div>
                      <input type="text" value={member.name} onChange={(e) => {
                        const newItems = [...teamContent.esuCampus];
                        newItems[idx].name = e.target.value;
                        setTeamContent({ ...teamContent, esuCampus: newItems });
                      }} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black text-slate-800 outline-none" />
                      <input type="text" value={member.dept} onChange={(e) => {
                        const newItems = [...teamContent.esuCampus];
                        newItems[idx].dept = e.target.value;
                        setTeamContent({ ...teamContent, esuCampus: newItems });
                      }} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-emerald-600 outline-none" />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
            </div>
          </div>
        </motion.div>
      )}


      {activeSection === 'contact' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Contact Info Editor</h3>
            </div>
            <button
              onClick={() => handleSave('Contact Info')}
              className="flex items-center gap-2 px-6 py-3 bg-teal-900 text-white rounded-xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>

          <div className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Phone className="text-teal-500" size={20} />
                  Primary Contact
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Office Phone Number</label>
                    <input
                      type="text"
                      value={contactContent.phone}
                      onChange={(e) => setContactContent({ ...contactContent, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Official Email Address</label>
                    <input
                      type="email"
                      value={contactContent.email}
                      onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MapPin className="text-teal-500" size={20} />
                  Location
                </h4>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Office Address</label>
                  <textarea
                    rows={4}
                    value={contactContent.address}
                    onChange={(e) => setContactContent({ ...contactContent, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-6 md:col-span-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ImageIcon className="text-teal-500" size={20} />
                  Social Media Links
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Facebook Page Name</label>
                    <input
                      type="text"
                      value={contactContent.facebook}
                      onChange={(e) => setContactContent({ ...contactContent, facebook: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Messenger Shortlink</label>
                    <input
                      type="text"
                      value={contactContent.messenger}
                      onChange={(e) => setContactContent({ ...contactContent, messenger: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'system' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">System Data Manager</h3>
            </div>
            <button
              onClick={() => handleSave('System Data')}
              className="flex items-center gap-2 px-6 py-3 bg-teal-900 text-white rounded-xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Courses Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="text-teal-500" size={20} />
                  Courses
                </h4>
                <button
                  onClick={() => setSystemData({ ...systemData, courses: [...systemData.courses, ""] })}
                  className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {systemData.courses.map((course, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <input
                      type="text"
                      value={course}
                      placeholder="Enter course name..."
                      onChange={(e) => {
                        const newCourses = [...systemData.courses];
                        newCourses[idx] = e.target.value;
                        setSystemData({ ...systemData, courses: newCourses });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        const newCourses = systemData.courses.filter((_, i) => i !== idx);
                        setSystemData({ ...systemData, courses: newCourses });
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SHS Tracks Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Database className="text-teal-500" size={20} />
                  SHS Tracks
                </h4>
                <button
                  onClick={() => setSystemData({ ...systemData, shsTracks: [...systemData.shsTracks, ""] })}
                  className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {systemData.shsTracks.map((track, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <input
                      type="text"
                      value={track}
                      placeholder="Enter track name..."
                      onChange={(e) => {
                        const newTracks = [...systemData.shsTracks];
                        newTracks[idx] = e.target.value;
                        setSystemData({ ...systemData, shsTracks: newTracks });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        const newTracks = systemData.shsTracks.filter((_, i) => i !== idx);
                        setSystemData({ ...systemData, shsTracks: newTracks });
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Occupations Column */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="text-teal-500" size={20} />
                  Occupations
                </h4>
                <button
                  onClick={() => setSystemData({ ...systemData, occupations: [...systemData.occupations, ""] })}
                  className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {systemData.occupations.map((occ, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <input
                      type="text"
                      value={occ}
                      placeholder="Enter occupation..."
                      onChange={(e) => {
                        const newOccs = [...systemData.occupations];
                        newOccs[idx] = e.target.value;
                        setSystemData({ ...systemData, occupations: newOccs });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        const newOccs = systemData.occupations.filter((_, i) => i !== idx);
                        setSystemData({ ...systemData, occupations: newOccs });
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {activeSection === 'footer' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Footer Editor</h3>
            </div>
            <button
              onClick={() => handleSave('Footer')}
              className="flex items-center gap-2 px-6 py-3 bg-teal-900 text-white rounded-xl font-black text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/20"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start mb-6">
              <Info className="text-amber-500 shrink-0 mt-1" size={20} />
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Note: Contact details (Phone, Email, Address) displayed in the footer are automatically synchronized with the <strong>Contact Info</strong> section. Use this tab only for footer-specific brand text.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Footer Brand Description</label>
                <textarea
                  rows={4}
                  value={footerContent.description}
                  onChange={(e) => setFooterContent({ ...footerContent, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  placeholder="Describe the center's mission in the footer..."
                ></textarea>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'theme' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Theme Settings</h3>
            </div>
            <button
              onClick={() => handleSave('Theme Settings')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg"
            >
              <Save size={16} />
              Apply Theme
            </button>
          </div>

          <div className="space-y-12">
            {/* Primary Color Selection */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Primary System Color</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
                  { id: 'teal', name: 'Teal Blue', bg: 'bg-teal-500', shadow: 'shadow-teal-200' },
                  { id: 'indigo', name: 'Royal Indigo', bg: 'bg-indigo-500', shadow: 'shadow-indigo-200' },
                  { id: 'rose', name: 'Rose Crimson', bg: 'bg-rose-500', shadow: 'shadow-rose-200' },
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setThemeSettings({ ...themeSettings, primaryColor: color.id })}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group ${themeSettings.primaryColor === color.id
                      ? `border-${color.id}-500 bg-${color.id}-50`
                      : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${color.bg} shadow-lg ${color.shadow} group-hover:scale-110 transition-transform`}></div>
                    <span className={`text-xs font-black ${themeSettings.primaryColor === color.id ? `text-${color.id}-700` : 'text-slate-500'}`}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Mode */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Appearance Mode</h4>
                <div className="flex gap-4">
                  {['light', 'dark', 'system'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setThemeSettings({ ...themeSettings, mode })}
                      className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${themeSettings.mode === mode
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Corner Style</h4>
                <div className="flex gap-4">
                  {['sharp', 'rounded', 'pill'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setThemeSettings({ ...themeSettings, accentStyle: style })}
                      className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${themeSettings.accentStyle === style
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="pt-8">
              <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 text-center">Live Preview</h4>
              <div className={`max-w-md mx-auto p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${themeSettings.primaryColor}-500/10 rounded-full blur-3xl`}></div>
                <div className="relative z-10 space-y-4">
                  <div className={`w-12 h-2 bg-${themeSettings.primaryColor}-500 rounded-full mb-4`}></div>
                  <h5 className="text-xl font-black text-slate-800 tracking-tight">System Interface Preview</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    This is how your primary selection will look across buttons, active states, and highlights.
                  </p>
                  <button className={`w-full py-3 bg-${themeSettings.primaryColor}-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-${themeSettings.primaryColor}-500/30`}>
                    Sample Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);
};

export default CMS;
