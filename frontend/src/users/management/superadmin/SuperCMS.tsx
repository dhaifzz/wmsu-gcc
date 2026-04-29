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
  Plus,
  Trash2,
  Briefcase,
  GripVertical,
  Heart,
  CheckCircle,
  ClipboardCheck,
  BookOpen,
  FileText,
  Target,
  Activity,
  Brain,
  PenTool,
  Shield,
  HelpCircle
} from 'lucide-react';

const assessmentIconMap: Record<string, any> = {
  FileText,
  Target,
  ClipboardCheck,
  Activity,
  Brain,
  PenTool,
  Shield,
  Heart,
  HelpCircle,
  Info
};
import { showAlert } from '../../../components/modal-notification/sweetalert';
import { showToast } from '../../../components/modal-notification/toast';
import { cmsApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabaseClient';
import Loader from '../../../components/loader/Loader';

const CMS = () => {
  const [activeSection, setActiveSection] = useState<string | null>('home');
  const [isLoading, setIsLoading] = useState(true);

  // Content States (initially null, fetched from DB)
  const [homeContent, setHomeContent] = useState<any>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [teamContent, setTeamContent] = useState<any>(null);
  const [contactContent, setContactContent] = useState<any>(null);
  const [footerContent, setFooterContent] = useState<any>(null);
  const [systemData, setSystemData] = useState<any>(null);
  const [logoSettings, setLogoSettings] = useState<any>(null);
  const [counselingContent, setCounselingContent] = useState<any>(null);
  const [assessmentContent, setAssessmentContent] = useState<any>(null);
  const [shiftingContent, setShiftingContent] = useState<any>(null);

  const [savedStates, setSavedStates] = useState<Record<string, any>>({});



  const fetchAllContent = async () => {
    setIsLoading(true);
    const sectionsToFetch = ['home', 'about', 'team', 'contact', 'footer', 'system', 'logos', 'counseling', 'assessment', 'shifting'];
    const newSavedStates: Record<string, any> = {};

    try {
      const defaultCounseling = {
        hero: { title: "Professional Counseling", description: "A safe, confidential space for emotional growth and personal discovery.", image: null },
        about: { description1: "Our counseling services are designed to provide students and outside clients with the professional support they need to navigate life's challenges. Whether you're dealing with academic stress, personal relationship issues, or mental health concerns, our certified counselors are here to listen and guide you.", description2: "We believe that every individual has the potential for growth. Our approach is student-centered, compassionate, and strictly confidential." },
        requirements: ["Official Booking Receipt (From the GCC Portal)", "Personal Data Form (Must be completed before the session)", "Counseling Form (Available at the GCC center)", "Valid Student ID (For WMSU Students)", "Appointment Schedule"],
        howToBook: [
          { title: "Book a Session", desc: "Schedule your consultation through our online portal or visit the center." },
          { title: "Get Your Receipt", desc: "Download or print your official booking receipt as proof of appointment." },
          { title: "Visit GCC Office", desc: "Go to the GCC Office in WMSU Main Campus with your requirements." },
          { title: "Center Verification", desc: "Arrive at the GCC center at your scheduled time with your requirements." },
          { title: "Meet Your Counselor", desc: "Engage in a professional, one-on-one session in a safe environment." }
        ],
        cta: { title: "Book a Session", description: "Ready to talk? Schedule your consultation today and take the first step toward mental wellness." },
        hotline: { title: "Need Immediate Help?", description: "If you are in a crisis, please reach out to our emergency hotline available during office hours." }
      };

      const defaultAssessment = {
        hero: { title: "Student Assessments", description: "Helping you understand your mental well-being through professional testing.", image: null },
        about: { description1: "The Guidance and Counseling Center conducts standardized psychological assessments to help students monitor their mental and emotional states." },
        tests: [
          { title: "DASS-21 Test", target: "For College Students", desc: "A clinical scale used to measure negative emotional states of depression, anxiety, and stress.", icon: "FileText" },
          { title: "DASS-Y Test", target: "For High School Students", desc: "Specially designed version for younger students to accurately capture their emotional experiences.", icon: "Target" }
        ],
        steps: [
          { title: "Book Appointment", desc: "Schedule your assessment slot through the GCC portal or walk-in." },
          { title: "Get Receipt", desc: "Obtain your official assessment receipt/acknowledgment after booking." },
          { title: "Visit GCC Office", desc: "Go to the GCC Office in WMSU Main Campus with your requirements." },
          { title: "Complete Forms", desc: "Fill out the required personal data and consent forms." },
          { title: "Take the Test", desc: "Complete the assessment in a quiet, supervised environment." },
          { title: "Consultation", desc: "Meet with a counselor to interpret and discuss your results." }
        ],
        faqs: [
          { q: "Is it graded?", a: "No, this is a psychological assessment, not an academic exam." },
          { q: "How long does it take?", a: "Usually between 30 minutes to 1 hour." }
        ],
        cta: { title: "Start Assessment", description: "Ready to take the test? Ensure you have your requirements ready." }
      };

      const defaultShifting = {
        hero: { title: "Shifting Examination", description: "Helping you find the right academic path for your future career.", image: null },
        about: { 
          description: "The Shifting Exam is a critical requirement for WMSU students who wish to transfer from one academic program to another. This assessment ensures that your aptitudes and interests align with the new course you intend to take.",
          note: "Applicants must schedule an appointment and complete all required forms before being allowed to take the exam."
        },
        requirements: [
          { title: "Booking Receipt", desc: "Digital or printed copy of your appointment confirmation." },
          { title: "2x2 Picture", desc: "Formal 2x2 colored picture with name tag (Selfies are not allowed)." },
          { title: "Downloadable Grades", desc: "A complete copy of all your previous semester's grades." },
          { title: "Latest COR", desc: "Your most recent Certificate of Registration (COR)." },
          { title: "Entrance Test Result", desc: "Original or certified copy of your college entrance test result." }
        ],
        steps: [
          { title: "Book Examination", desc: "Register and select a shifting exam date through the portal." },
          { title: "Get Your Receipt", desc: "Ensure you have your official booking receipt as proof of schedule." },
          { title: "Visit GCC Office", desc: "Go to the GCC Office in WMSU Main Campus with your requirements." },
          { title: "Document Submission", desc: "Submit all required documents to the GCC office for verification." },
          { title: "Take the Exam", desc: "Attend the shifting examination on your scheduled date and time." }
        ],
        cta: { title: "Apply for Shifting", description: "Make sure you have met the minimum GPA requirements of your target college before applying." },
        guidance: { title: "Career Guidance", description: "Not sure which course fits you best? Our counselors also offer career guidance sessions to help you make an informed decision." }
      };

      const defaultSystem = {
        colleges: [
          {
            id: '1',
            name: "College of Law",
            courses: [{ name: "Bachelor of Laws", type: "Undergraduate" }]
          },
          {
            id: '2',
            name: "College of Agriculture",
            courses: [
              { name: "BS Agriculture", type: "Undergraduate" },
              { name: "BS Food Technology", type: "Undergraduate" },
              { name: "BS Agribusiness", type: "Undergraduate" },
              { name: "Bachelor of Agricultural Technology", type: "Undergraduate" },
              { name: "MS Agronomy", type: "Graduate" },
              { name: "Master in Food Processing and Management", type: "Graduate" }
            ]
          },
          {
            id: '3',
            name: "College of Liberal Arts",
            courses: [
              { name: "BS Accountancy", type: "Undergraduate" },
              { name: "BA History", type: "Undergraduate" },
              { name: "BA English", type: "Undergraduate" },
              { name: "BA Political Science", type: "Undergraduate" },
              { name: "BA Mass Communication – Journalism", type: "Undergraduate" },
              { name: "BA Mass Communication – Broadcasting", type: "Undergraduate" },
              { name: "BS Economics", type: "Undergraduate" },
              { name: "BS Psychology", type: "Undergraduate" },
              { name: "Ph.D. in Education", type: "Graduate" },
              { name: "MA Education", type: "Graduate" }
            ]
          },
          {
            id: '4',
            name: "College of Architecture",
            courses: [{ name: "BS Architecture", type: "Undergraduate" }]
          },
          {
            id: '5',
            name: "College of Nursing",
            courses: [
              { name: "BS Nursing", type: "Undergraduate" },
              { name: "MA Nursing – Nursing Education", type: "Graduate" },
              { name: "MA Nursing – Nursing Management", type: "Graduate" }
            ]
          },
          {
            id: '6',
            name: "College of Asian and Islamic Studies",
            courses: [{ name: "BA Asian Studies Major in ASEAN Community", type: "Undergraduate" }]
          },
          {
            id: '7',
            name: "College of Computing Studies",
            courses: [
              { name: "BS Computer Science", type: "Undergraduate" },
              { name: "BS Information Technology", type: "Undergraduate" },
              { name: "Associate in Computer Technology – Application Development", type: "Undergraduate" },
              { name: "Associate in Computer Technology – Networking", type: "Undergraduate" },
              { name: "Master in Information Technology", type: "Graduate" }
            ]
          },
          {
            id: '8',
            name: "College of Forestry and Environmental Studies",
            courses: [
              { name: "BS Forestry", type: "Undergraduate" },
              { name: "BS Agroforestry", type: "Undergraduate" },
              { name: "BS Environmental Science", type: "Undergraduate" }
            ]
          },
          {
            id: '9',
            name: "College of Criminal Justice Education",
            courses: [{ name: "BS Criminology", type: "Undergraduate" }]
          },
          {
            id: '10',
            name: "College of Home Economics",
            courses: [
              { name: "BS Home Economics", type: "Undergraduate" },
              { name: "BS Nutrition and Dietetics", type: "Undergraduate" },
              { name: "BS Hospitality Management", type: "Undergraduate" },
              { name: "MA Education – Home Economics", type: "Graduate" },
              { name: "MA Education – Nutrition and Health Education", type: "Graduate" }
            ]
          },
          {
            id: '11',
            name: "College of Engineering",
            courses: [
              { name: "BS Agricultural and Biosystems Engineering", type: "Undergraduate" },
              { name: "BS Civil Engineering", type: "Undergraduate" },
              { name: "BS Computer Engineering", type: "Undergraduate" },
              { name: "BS Electrical Engineering", type: "Undergraduate" },
              { name: "BS Electronics Engineering", type: "Undergraduate" },
              { name: "BS Environmental Engineering", type: "Undergraduate" },
              { name: "BS Geodetic Engineering", type: "Undergraduate" },
              { name: "BS Industrial Engineering", type: "Undergraduate" },
              { name: "BS Mechanical Engineering", type: "Undergraduate" },
              { name: "BS Sanitary Engineering", type: "Undergraduate" }
            ]
          },
          {
            id: '12',
            name: "College of Public Administration and Development Studies",
            courses: [
              { name: "Bachelor of Public Administration", type: "Undergraduate" },
              { name: "Master of Public Administration", type: "Graduate" }
            ]
          },
          {
            id: '13',
            name: "College of Sports Science and Physical Education",
            courses: [
              { name: "Bachelor of Physical Education", type: "Undergraduate" },
              { name: "BS Exercise and Sports Sciences", type: "Undergraduate" },
              { name: "Master in Physical Education", type: "Graduate" },
              { name: "Diploma in Physical Education", type: "Graduate" }
            ]
          },
          {
            id: '14',
            name: "College of Social Work and Community Development",
            courses: [
              { name: "BS Social Work", type: "Undergraduate" },
              { name: "BS Community Development", type: "Undergraduate" },
              { name: "MS Social Work", type: "Graduate" }
            ]
          },
          {
            id: '15',
            name: "College of Teacher Education",
            courses: [
              { name: "Bachelor of Culture and Arts Education", type: "Undergraduate" },
              { name: "Bachelor of Early Childhood Education", type: "Undergraduate" },
              { name: "Bachelor of Elementary Education", type: "Undergraduate" },
              { name: "Bachelor of Secondary Education", type: "Undergraduate" },
              { name: "Bachelor of Special Needs Education", type: "Undergraduate" }
            ]
          }
        ],
        occupations: ["Student", "Employee", "Self Employed", "Unemployed", "Prefer not to say"]
      };

      for (const s of sectionsToFetch) {
        const result = await cmsApi.getContent(s);
        
        let data = result.data;
        if (!result.ok || !data || Object.keys(data).length === 0) {
          if (s === 'counseling') data = defaultCounseling;
          else if (s === 'assessment') data = defaultAssessment;
          else if (s === 'shifting') data = defaultShifting;
          else if (s === 'system') data = defaultSystem;
        }

        if (data && Object.keys(data).length > 0) {
          newSavedStates[s] = JSON.parse(JSON.stringify(data));
          switch (s) {
            case 'home': setHomeContent(data); break;
            case 'about': setAboutContent(data); break;
            case 'team': 
              if (data.mainCampus && !data.mainCampus.director) data.mainCampus.director = [];
              setTeamContent(data); 
              break;
            case 'contact': setContactContent(data); break;
            case 'footer': setFooterContent(data); break;
            case 'system': 
              const refinedSystem = (data && data.colleges) ? data : defaultSystem;
              setSystemData(refinedSystem); 
              break;
            case 'logos': setLogoSettings(data); break;
            case 'counseling': setCounselingContent(data); break;
            case 'assessment': setAssessmentContent(data); break;
            case 'shifting': setShiftingContent(data); break;
          }
        }
      }
      setSavedStates(newSavedStates);
    } catch (error) {
      console.error("Error fetching CMS content:", error);
      showToast.error("Could not connect to the database. Please make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
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
      
      const updateContentState = (setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter((prev: any) => {
          const newContent = JSON.parse(JSON.stringify(prev));
          let current = newContent;
          for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
          }
          const lastKey = path[path.length - 1];
          if (typeof index === 'number') current[lastKey][index] = publicUrl;
          else current[lastKey] = publicUrl;
          return newContent;
        });
      };

      if (section === 'home') updateContentState(setHomeContent);
      else if (section === 'team') updateContentState(setTeamContent);
      else if (section === 'about') updateContentState(setAboutContent);
      else if (section === 'logos') updateContentState(setLogoSettings);
      else if (section === 'counseling') updateContentState(setCounselingContent);
      else if (section === 'assessment') updateContentState(setAssessmentContent);
      else if (section === 'shifting') updateContentState(setShiftingContent);

      // Synchronization logic
      if (section === 'home' && path.join('.') === 'support.features.0.image') {
        setCounselingContent((prev: any) => ({ ...prev, hero: { ...prev.hero, image: publicUrl } }));
      } else if (section === 'home' && path.join('.') === 'support.features.1.image') {
        setAssessmentContent((prev: any) => ({ ...prev, hero: { ...prev.hero, image: publicUrl } }));
      } else if (section === 'home' && path.join('.') === 'support.features.2.image') {
        setShiftingContent((prev: any) => ({ ...prev, hero: { ...prev.hero, image: publicUrl } }));
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
          case 'team': setTeamContent(res.data); break;
          case 'contact': setContactContent(res.data); break;
          case 'footer': setFooterContent(res.data); break;
          case 'system': setSystemData(res.data); break;
          case 'logos': setLogoSettings(res.data); break;
          case 'counseling': setCounselingContent(res.data); break;
          case 'assessment': setAssessmentContent(res.data); break;
          case 'shifting': setShiftingContent(res.data); break;
        }
        showToast.info('Changes discarded.');
      }
    }
  };

  const hasChanges = (sectionId: string) => {
    const contentMap: any = { 
      home: homeContent, 
      about: aboutContent, 
      team: teamContent, 
      contact: contactContent, 
      footer: footerContent, 
      system: systemData,
      logos: logoSettings,
      counseling: counselingContent,
      assessment: assessmentContent,
      shifting: shiftingContent
    };
    return JSON.stringify(contentMap[sectionId]) !== JSON.stringify(savedStates[sectionId]);
  };

  const handleSave = async (section: string) => {
    const result = await showAlert.confirm(
      'Save Changes',
      `Are you sure you want to save the updates to the ${section} section?`,
      'Save',
      'Cancel'
    );

    if (result.isConfirmed) {
      const mapping: any = { 
        'Home Page': { key: 'home', data: homeContent }, 
        'About Us': { key: 'about', data: aboutContent }, 
        'Our Team': { key: 'team', data: teamContent }, 
        'Contact Info': { key: 'contact', data: contactContent }, 
        'System Data': { key: 'system', data: systemData }, 
        'Footer': { key: 'footer', data: footerContent },
        'System Logos': { key: 'logos', data: logoSettings },
        'Counseling Service': { key: 'counseling', data: counselingContent },
        'Assessment Service': { key: 'assessment', data: assessmentContent },
        'Shifting Service': { key: 'shifting', data: shiftingContent }
      };
      const { key, data } = mapping[section];

      if (key) {
        const updateResult = await cmsApi.updateContent(key, data);
        if (updateResult.ok) {
          setSavedStates(prev => ({ ...prev, [key]: JSON.parse(JSON.stringify(data)) }));
          showToast.success(`${section} updated successfully!`);
        } else {
          showToast.error(`Failed to update ${section}.`);
        }
      }
    }
  };

  const sections = [
    { id: 'home', title: 'Home Page', icon: Home, description: 'Manage hero text, images, and announcements.' },
    { id: 'counseling', title: 'Counseling Service', icon: Heart, description: 'Manage counseling details & requirements.' },
    { id: 'assessment', title: 'Assessment Service', icon: ClipboardCheck, description: 'Manage assessment details & tests.' },
    { id: 'shifting', title: 'Shifting Service', icon: BookOpen, description: 'Manage shifting requirements & details.' },
    { id: 'about', title: 'About Us', icon: Info, description: 'Edit the mission, vision, and center history.' },
    { id: 'team', title: 'Our Team', icon: Users, description: 'Manage team members and counselors.' },
    { id: 'system', title: 'System Data', icon: Database, description: 'Manage available courses and occupations.' },
    { id: 'logos', title: 'System Logos', icon: ImageIcon, description: 'Manage university and center logos.' },
    { id: 'contact', title: 'Contact Info', icon: Phone, description: 'Update phone numbers, emails, and address.' },
    { id: 'footer', title: 'Footer', icon: LayoutGrid, description: 'Manage footer brand text.' },
  ];
  if (isLoading || !homeContent || !aboutContent || !teamContent || !contactContent || !footerContent || !systemData || !logoSettings || !counselingContent || !assessmentContent || !shiftingContent) {
    return <Loader />;
  }

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
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
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
                  {homeContent.support.features.map((feature: any, idx: number) => (
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
                    {homeContent.growth.services.map((service: any, idx: number) => (
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
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('team')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Our Team')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
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
                  {(teamContent.mainCampus.director || []).map((member: any, idx: number) => (
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
                             const newItems = teamContent.mainCampus.director.filter((_: any, i: number) => i !== idx);
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
                  {teamContent.mainCampus.counselors.map((member: any, idx: number) => (
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
                            const newCounselors = teamContent.mainCampus.counselors.filter((_: any, i: number) => i !== idx);
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
                  {teamContent.mainCampus.staff.map((member: any, idx: number) => (
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
                            const newItems = teamContent.mainCampus.staff.filter((_: any, i: number) => i !== idx);
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
                  {teamContent.mainCampus.coordinators.map((member: any, idx: number) => (
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
                            const newItems = teamContent.mainCampus.coordinators.filter((_: any, i: number) => i !== idx);
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
                  {teamContent.esuCampus.map((member: any, idx: number) => (
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
                            const newItems = teamContent.esuCampus.filter((_: any, i: number) => i !== idx);
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('contact')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Contact Info')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('system')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('System Data')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Colleges Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="text-teal-500" size={24} />
                  Colleges & Programs
                </h4>
                <button
                  onClick={() => {
                    const newColleges = [...(systemData.colleges || []), {
                      id: crypto.randomUUID(),
                      name: "New College",
                      courses: []
                    }];
                    setSystemData({ ...systemData, colleges: newColleges });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-all font-black text-xs"
                >
                  <Plus size={16} />
                  Add College
                </button>
              </div>

              <div className="grid gap-6">
                {(systemData.colleges || []).map((college: any, cIdx: number) => (
                  <div key={college.id || cIdx} className="bg-slate-50/50 rounded-[2rem] border border-slate-200 overflow-hidden">
                    <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={college.name}
                          onChange={(e) => {
                            const newColleges = [...systemData.colleges];
                            newColleges[cIdx].name = e.target.value;
                            setSystemData({ ...systemData, colleges: newColleges });
                          }}
                          placeholder="College Name (e.g. College of Computing Studies)"
                          className="w-full bg-transparent text-lg font-black text-slate-800 outline-none focus:text-teal-600 transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newColleges = systemData.colleges.filter((_: any, i: number) => i !== cIdx);
                          setSystemData({ ...systemData, colleges: newColleges });
                        }}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      {/* Undergraduate Programs */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Undergraduate Programs</span>
                          <button
                            onClick={() => {
                              const newColleges = [...systemData.colleges];
                              newColleges[cIdx].courses = [...(newColleges[cIdx].courses || []), { name: "", type: "Undergraduate" }];
                              setSystemData({ ...systemData, colleges: newColleges });
                            }}
                            className="p-1 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(college.courses || []).filter((c: any) => c.type === "Undergraduate").map((course: any, courseIdx: number) => (
                            <div key={courseIdx} className="flex gap-2 group">
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => {
                                  const newColleges = [...systemData.colleges];
                                  const actualIdx = newColleges[cIdx].courses.indexOf(course);
                                  newColleges[cIdx].courses[actualIdx].name = e.target.value;
                                  setSystemData({ ...systemData, colleges: newColleges });
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Course Name..."
                              />
                              <button
                                onClick={() => {
                                  const newColleges = [...systemData.colleges];
                                  newColleges[cIdx].courses = newColleges[cIdx].courses.filter((c: any) => c !== course);
                                  setSystemData({ ...systemData, colleges: newColleges });
                                }}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Graduate Programs */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Graduate Programs</span>
                          <button
                            onClick={() => {
                              const newColleges = [...systemData.colleges];
                              newColleges[cIdx].courses = [...(newColleges[cIdx].courses || []), { name: "", type: "Graduate" }];
                              setSystemData({ ...systemData, colleges: newColleges });
                            }}
                            className="p-1 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(college.courses || []).filter((c: any) => c.type === "Graduate").map((course: any, courseIdx: number) => (
                            <div key={courseIdx} className="flex gap-2 group">
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => {
                                  const newColleges = [...systemData.colleges];
                                  const actualIdx = newColleges[cIdx].courses.indexOf(course);
                                  newColleges[cIdx].courses[actualIdx].name = e.target.value;
                                  setSystemData({ ...systemData, colleges: newColleges });
                                }}
                                className="flex-1 bg-teal-50/30 border border-teal-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Program Name..."
                              />
                              <button
                                onClick={() => {
                                  const newColleges = [...systemData.colleges];
                                  newColleges[cIdx].courses = newColleges[cIdx].courses.filter((c: any) => c !== course);
                                  setSystemData({ ...systemData, colleges: newColleges });
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
                  </div>
                ))}
              </div>
            </div>

            {/* Occupations Section */}
            <div className="space-y-6 pt-10 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="text-teal-500" size={24} />
                  Occupations
                </h4>
                <button
                  onClick={() => setSystemData({ ...systemData, occupations: [...systemData.occupations, ""] })}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-all font-black text-xs"
                >
                  <Plus size={16} />
                  Add Occupation
                </button>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                {systemData.occupations.map((occ: string, idx: number) => (
                  <div key={idx} className="flex gap-2 group">
                    <input
                      type="text"
                      value={occ}
                      onChange={(e) => {
                        const newOccs = [...systemData.occupations];
                        newOccs[idx] = e.target.value;
                        setSystemData({ ...systemData, occupations: newOccs });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <button
                      onClick={() => {
                        const newOccs = systemData.occupations.filter((_: string, i: number) => i !== idx);
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('footer')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Footer')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
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
      {activeSection === 'logos' && logoSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">System Logos</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('logos')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('System Logos')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Logos
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* WMSU Logo */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">WMSU University Logo</label>
              <div
                onClick={() => triggerUpload('logos', ['wmsuLogo'])}
                className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-teal-400 transition-all group relative overflow-hidden"
              >
                {logoSettings.wmsuLogo ? (
                  <img src={logoSettings.wmsuLogo} className="w-full h-full object-contain p-8" alt="WMSU Logo" />
                ) : (
                  <div className="text-center">
                    <ImageIcon size={40} className="text-slate-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-400">Upload WMSU Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon size={24} className="text-white" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center italic">Recommended: Transparent PNG, 512x512px</p>
            </div>

            {/* GCC Logo */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">GCC Center Logo</label>
              <div
                onClick={() => triggerUpload('logos', ['gccLogo'])}
                className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-teal-400 transition-all group relative overflow-hidden"
              >
                {logoSettings.gccLogo ? (
                  <img src={logoSettings.gccLogo} className="w-full h-full object-contain p-8" alt="GCC Logo" />
                ) : (
                  <div className="text-center">
                    <ImageIcon size={40} className="text-slate-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-400">Upload GCC Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon size={24} className="text-white" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center italic">Recommended: Transparent PNG, 512x512px</p>
            </div>
          </div>
        </motion.div>
      )}
      {activeSection === 'counseling' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Counseling Service</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('counseling')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Counseling Service')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Service
              </button>
            </div>
          </div>

          <div className="space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Service Header
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Title</label>
                  <input
                    type="text"
                    value={counselingContent?.hero?.title || ''}
                    onChange={(e) => setCounselingContent({
                      ...counselingContent,
                      hero: { ...counselingContent.hero, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Description</label>
                  <textarea
                    rows={4}
                    value={counselingContent?.hero?.description || ''}
                    onChange={(e) => setCounselingContent({
                      ...counselingContent,
                      hero: { ...counselingContent.hero, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* About & Features */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="text-teal-500" size={20} />
                About the Service
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Content Para 1</label>
                  <textarea
                    rows={4}
                    value={counselingContent?.about?.description1 || ''}
                    onChange={(e) => setCounselingContent({
                      ...counselingContent,
                      about: { ...counselingContent.about, description1: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Content Para 2</label>
                  <textarea
                    rows={4}
                    value={counselingContent?.about?.description2 || ''}
                    onChange={(e) => setCounselingContent({
                      ...counselingContent,
                      about: { ...counselingContent.about, description2: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Requirements & How to Book */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle className="text-teal-500" size={20} />
                    Requirements
                  </h4>
                  <button
                    onClick={() => setCounselingContent({ ...counselingContent, requirements: [...counselingContent.requirements, "New Requirement"] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {counselingContent?.requirements?.map((req: string, idx: number) => (
                    <div key={idx} className="flex gap-2 group">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...counselingContent.requirements];
                          newReqs[idx] = e.target.value;
                          setCounselingContent({ ...counselingContent, requirements: newReqs });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => setCounselingContent({ ...counselingContent, requirements: counselingContent.requirements.filter((_: any, i: number) => i !== idx) })}
                        className="p-2 text-slate-300 hover:text-teal-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <LayoutGrid className="text-teal-500" size={20} />
                    How to Book Steps
                  </h4>
                  <button
                    onClick={() => setCounselingContent({ ...counselingContent, howToBook: [...counselingContent.howToBook, { title: "New Step", desc: "Description" }] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {counselingContent?.howToBook?.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button
                        onClick={() => setCounselingContent({ ...counselingContent, howToBook: counselingContent.howToBook.filter((_: any, i: number) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...counselingContent.howToBook];
                          newSteps[idx].title = e.target.value;
                          setCounselingContent({ ...counselingContent, howToBook: newSteps });
                        }}
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const newSteps = [...counselingContent.howToBook];
                          newSteps[idx].desc = e.target.value;
                          setCounselingContent({ ...counselingContent, howToBook: newSteps });
                        }}
                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-teal-900 rounded-[2rem] text-white">
                <h4 className="text-xl font-black mb-4">Book a Session Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={counselingContent?.cta?.title || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, cta: { ...counselingContent.cta, title: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={counselingContent?.cta?.description || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, cta: { ...counselingContent.cta, description: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-medium text-teal-100 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[2rem] border border-slate-200">
                <h4 className="text-xl font-black text-slate-900 mb-4">Immediate Help Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={counselingContent?.hotline?.title || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, hotline: { ...counselingContent.hotline, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={counselingContent?.hotline?.description || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, hotline: { ...counselingContent.hotline, description: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeSection === 'assessment' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Assessment Service</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('assessment')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Assessment Service')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Service
              </button>
            </div>
          </div>

          <div className="space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Service Header
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Title</label>
                  <input
                    type="text"
                    value={assessmentContent?.hero?.title || ''}
                    onChange={(e) => setAssessmentContent({
                      ...assessmentContent,
                      hero: { ...assessmentContent.hero, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Description</label>
                  <textarea
                    rows={4}
                    value={assessmentContent?.hero?.description || ''}
                    onChange={(e) => setAssessmentContent({
                      ...assessmentContent,
                      hero: { ...assessmentContent.hero, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="text-teal-500" size={20} />
                About the Service
              </h4>
              <div className="grid gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Content</label>
                  <textarea
                    rows={4}
                    value={assessmentContent?.about?.description1 || ''}
                    onChange={(e) => setAssessmentContent({
                      ...assessmentContent,
                      about: { ...assessmentContent.about, description1: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Tests & Steps */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="text-teal-500" size={20} />
                    Available Tests
                  </h4>
                  <button
                    onClick={() => setAssessmentContent({ ...assessmentContent, tests: [...(assessmentContent.tests || []), { title: "New Test", target: "Target Audience", desc: "Description", icon: "FileText" }] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {assessmentContent?.tests?.map((test: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button
                        onClick={() => setAssessmentContent({ ...assessmentContent, tests: assessmentContent.tests.filter((_: any, i: number) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={test.title}
                        onChange={(e) => {
                          const newTests = [...assessmentContent.tests];
                          newTests[idx].title = e.target.value;
                          setAssessmentContent({ ...assessmentContent, tests: newTests });
                        }}
                        placeholder="Test Title"
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                      />
                      <input
                        type="text"
                        value={test.target}
                        onChange={(e) => {
                          const newTests = [...assessmentContent.tests];
                          newTests[idx].target = e.target.value;
                          setAssessmentContent({ ...assessmentContent, tests: newTests });
                        }}
                        placeholder="Target Audience"
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-xs font-bold text-teal-700 outline-none focus:border-teal-500"
                      />
                      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-slate-200">
                        {(() => {
                          const IconComponent = assessmentIconMap[test.icon || 'FileText'] || FileText;
                          return (
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 shadow-sm border border-emerald-100">
                              <IconComponent size={20} />
                            </div>
                          );
                        })()}
                        <select
                          value={test.icon || 'FileText'}
                          onChange={(e) => {
                            const newTests = [...assessmentContent.tests];
                            newTests[idx].icon = e.target.value;
                            setAssessmentContent({ ...assessmentContent, tests: newTests });
                          }}
                          className="w-full bg-transparent text-xs font-bold text-slate-600 outline-none focus:border-teal-500 cursor-pointer"
                        >
                          <option value="FileText">Document Icon</option>
                          <option value="Target">Target Icon</option>
                          <option value="ClipboardCheck">Clipboard Check</option>
                          <option value="Activity">Activity Monitor</option>
                          <option value="Brain">Brain Icon</option>
                          <option value="PenTool">Pen Tool</option>
                          <option value="Shield">Shield Icon</option>
                          <option value="Heart">Heart Icon</option>
                          <option value="HelpCircle">Help Icon</option>
                          <option value="Info">Info Icon</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={test.desc}
                        onChange={(e) => {
                          const newTests = [...assessmentContent.tests];
                          newTests[idx].desc = e.target.value;
                          setAssessmentContent({ ...assessmentContent, tests: newTests });
                        }}
                        placeholder="Test Description"
                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <LayoutGrid className="text-teal-500" size={20} />
                    Process Steps
                  </h4>
                  <button
                    onClick={() => setAssessmentContent({ ...assessmentContent, steps: [...(assessmentContent.steps || []), { title: "New Step", desc: "Description" }] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {assessmentContent?.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button
                        onClick={() => setAssessmentContent({ ...assessmentContent, steps: assessmentContent.steps.filter((_: any, i: number) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...assessmentContent.steps];
                          newSteps[idx].title = e.target.value;
                          setAssessmentContent({ ...assessmentContent, steps: newSteps });
                        }}
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const newSteps = [...assessmentContent.steps];
                          newSteps[idx].desc = e.target.value;
                          setAssessmentContent({ ...assessmentContent, steps: newSteps });
                        }}
                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQs & CTAs */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Info className="text-teal-500" size={20} />
                    FAQs
                  </h4>
                  <button
                    onClick={() => setAssessmentContent({ ...assessmentContent, faqs: [...(assessmentContent.faqs || []), { q: "Question", a: "Answer" }] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {assessmentContent?.faqs?.map((faq: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button
                        onClick={() => setAssessmentContent({ ...assessmentContent, faqs: assessmentContent.faqs.filter((_: any, i: number) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const newFaqs = [...assessmentContent.faqs];
                          newFaqs[idx].q = e.target.value;
                          setAssessmentContent({ ...assessmentContent, faqs: newFaqs });
                        }}
                        placeholder="Question"
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const newFaqs = [...assessmentContent.faqs];
                          newFaqs[idx].a = e.target.value;
                          setAssessmentContent({ ...assessmentContent, faqs: newFaqs });
                        }}
                        placeholder="Answer"
                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-teal-900 rounded-[2rem] text-white self-start">
                <h4 className="text-xl font-black mb-4">Start Assessment CTA</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={assessmentContent?.cta?.title || ''}
                    onChange={(e) => setAssessmentContent({ ...assessmentContent, cta: { ...assessmentContent.cta, title: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={assessmentContent?.cta?.description || ''}
                    onChange={(e) => setAssessmentContent({ ...assessmentContent, cta: { ...assessmentContent.cta, description: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-medium text-teal-100 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'shifting' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Shifting Service</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('shifting')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Shifting Service')}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-black text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Save size={16} />
                Save Service
              </button>
            </div>
          </div>

          <div className="space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Service Header
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Title</label>
                  <input
                    type="text"
                    value={shiftingContent?.hero?.title || ''}
                    onChange={(e) => setShiftingContent({
                      ...shiftingContent,
                      hero: { ...shiftingContent.hero, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Service Description</label>
                  <textarea
                    rows={4}
                    value={shiftingContent?.hero?.description || ''}
                    onChange={(e) => setShiftingContent({
                      ...shiftingContent,
                      hero: { ...shiftingContent.hero, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Info className="text-teal-500" size={20} />
                About the Service
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Content</label>
                  <textarea
                    rows={4}
                    value={shiftingContent?.about?.description || ''}
                    onChange={(e) => setShiftingContent({
                      ...shiftingContent,
                      about: { ...shiftingContent.about, description: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Important Note</label>
                  <textarea
                    rows={4}
                    value={shiftingContent?.about?.note || ''}
                    onChange={(e) => setShiftingContent({
                      ...shiftingContent,
                      about: { ...shiftingContent.about, note: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Requirements & Steps */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle className="text-teal-500" size={20} />
                    Requirements
                  </h4>
                  <button
                    onClick={() => setShiftingContent({ ...shiftingContent, requirements: [...(shiftingContent.requirements || []), { title: "New Req", desc: "Desc" }] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {shiftingContent?.requirements?.map((req: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button
                        onClick={() => setShiftingContent({ ...shiftingContent, requirements: shiftingContent.requirements.filter((_: any, i: number) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={req.title}
                        onChange={(e) => {
                          const newReqs = [...shiftingContent.requirements];
                          newReqs[idx].title = e.target.value;
                          setShiftingContent({ ...shiftingContent, requirements: newReqs });
                        }}
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={2}
                        value={req.desc}
                        onChange={(e) => {
                          const newReqs = [...shiftingContent.requirements];
                          newReqs[idx].desc = e.target.value;
                          setShiftingContent({ ...shiftingContent, requirements: newReqs });
                        }}
                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <LayoutGrid className="text-teal-500" size={20} />
                    Process Steps
                  </h4>
                  <button
                    onClick={() => setShiftingContent({ ...shiftingContent, steps: [...(shiftingContent.steps || []), { title: "New Step", desc: "Description" }] })}
                    className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {shiftingContent?.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button
                        onClick={() => setShiftingContent({ ...shiftingContent, steps: shiftingContent.steps.filter((_: any, i: number) => i !== idx) })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-teal-100 text-teal-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...shiftingContent.steps];
                          newSteps[idx].title = e.target.value;
                          setShiftingContent({ ...shiftingContent, steps: newSteps });
                        }}
                        className="w-full bg-transparent border-b border-slate-200 pb-2 mb-2 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                      />
                      <textarea
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const newSteps = [...shiftingContent.steps];
                          newSteps[idx].desc = e.target.value;
                          setShiftingContent({ ...shiftingContent, steps: newSteps });
                        }}
                        className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-teal-900 rounded-[2rem] text-white">
                <h4 className="text-xl font-black mb-4">Apply for Shifting Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={shiftingContent?.cta?.title || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, cta: { ...shiftingContent.cta, title: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={shiftingContent?.cta?.description || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, cta: { ...shiftingContent.cta, description: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xs font-medium text-teal-100 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-8 bg-white rounded-[2rem] border border-slate-200">
                <h4 className="text-xl font-black text-slate-900 mb-4">Career Guidance Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={shiftingContent?.guidance?.title || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, guidance: { ...shiftingContent.guidance, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={shiftingContent?.guidance?.description || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, guidance: { ...shiftingContent.guidance, description: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-500 outline-none resize-none"
                  ></textarea>
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
