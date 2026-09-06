import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { removeBackground } from "@imgly/background-removal";
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
  HelpCircle,
  Scale
} from 'lucide-react';

// ─── Sortable Team Grid (dnd-kit) ───────────────────────────────────────────

interface TeamMember {
  _id?: string;
  id?: string;
  name: string;
  degree?: string;
  dept?: string;
  profileImage?: string | null;
  [key: string]: any;
}

interface SortableTeamCardProps {
  member: TeamMember;
  children: (member: TeamMember, isDragging: boolean) => React.ReactNode;
}

function SortableTeamCard({ member, children }: SortableTeamCardProps) {
  const id = member._id || member.id || member.name;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: 'relative',
    zIndex: isDragging ? 0 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children(member, isDragging)}
    </div>
  );
}

interface SortableTeamGridProps {
  items: TeamMember[];
  onReorder: (newItems: TeamMember[]) => void;
  cols?: string;
  renderCard: (member: TeamMember, idx: number, isDragging: boolean) => React.ReactNode;
  renderOverlay: (member: TeamMember) => React.ReactNode;
}

function SortableTeamGrid({
  items,
  onReorder,
  cols = 'grid-cols-2 lg:grid-cols-4',
  renderCard,
  renderOverlay,
}: SortableTeamGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const ids = items.map((m) => m._id || m.id || m.name);
  const activeMember = activeId ? items.find((m) => (m._id || m.id || m.name) === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
    setActiveId(null);
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.35' } },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={`grid md:${cols} gap-4`}>
          {items.map((member, idx) => (
            <SortableTeamCard
              key={member._id || member.id || member.name + '_' + idx}
              member={member}
            >
              {(m, dragging) => renderCard(m, idx, dragging)}
            </SortableTeamCard>
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeMember ? (
          <div
            style={{
              transform: 'scale(1.08) rotate(3deg)',
              boxShadow: '0 30px 60px -12px rgba(13,148,136,0.45)',
              borderRadius: '12px',
              cursor: 'grabbing',
              pointerEvents: 'none',
            }}
          >
            {renderOverlay(activeMember)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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

const STANDARD_PRIVACY_CONTENT = {
  hero: { 
    title: "Privacy Policy", 
    description: "Your privacy is our priority. This policy outlines how the WMSU Guidance and Counseling Center (GCC) collects, uses, and protects your information." 
  },
  sections: [
    { title: "1. Data Collection", icon: "Lock", content: "The WMSU GCC collects personal and sensitive information through our online portal and physical forms. This includes: Personal identification (Name, ID, Birthdate), Contact details (Email, Phone, Address), Academic records and history, Health and psychological assessments, and Appointment and consultation logs." },
    { title: "2. Use of Information", icon: "Eye", content: "Your data is used exclusively for the purpose of providing guidance, counseling, and assessment services. We use this information to process appointment requests and shifting examinations, maintain accurate student counseling records as required by university policy, and analyze aggregated, non-identifiable data to improve our support programs." },
    { title: "3. Confidentiality", icon: "Shield", content: "Confidentiality is the cornerstone of counseling. Information shared during counseling sessions will not be disclosed to any third party without your explicit written consent, except in cases where there is a clear risk of harm to yourself or others, or as required by law (e.g., court order)." },
    { title: "4. Data Security", icon: "FileText", content: "We implement strict technical and organizational measures to protect your data against unauthorized access, loss, or alteration. All online data is encrypted and stored in secure cloud environments compliant with modern security standards." }
  ]
};

const STANDARD_TERMS_CONTENT = {
  hero: { 
    title: "Terms of Service", 
    description: "By accessing and using the WMSU GCC Portal, you agree to comply with and be bound by the following terms and conditions." 
  },
  sections: [
    { title: "1. Account Eligibility", icon: "Users", content: "The portal is intended for use by current students, faculty, and authorized staff of Western Mindanao State University, as well as registered outside clients seeking specific center services. You are responsible for maintaining the confidentiality of your account credentials." },
    { title: "2. Service Use & Conduct", icon: "CheckCircle", content: "Users agree to: Provide accurate and truthful information in all forms and assessments, use the portal exclusively for its intended guidance and academic purposes, respect the appointment schedules and the time of the center professionals, and abide by the University Student Code of Conduct in all interactions." },
    { title: "3. Appointment Policy", icon: "Clock", content: "Booking an appointment through the portal does not guarantee immediate service. All appointments are subject to verification and counselor availability. Failure to show up for multiple scheduled appointments without prior notice may result in temporary suspension of portal booking privileges." },
    { title: "4. Intellectual Property", icon: "FileText", content: "All content, assessments, logos, and materials provided on this portal are the property of WMSU and the Guidance and Counseling Center. Unauthorized reproduction, distribution, or commercial use of these materials is strictly prohibited." },
    { title: "5. Modifications", icon: "Gavel", content: "The WMSU GCC reserves the right to modify these terms at any time. Significant changes will be communicated through the portal notifications or university email." }
  ]
};
import { showAlert } from '../../../components/modal-notification/sweetalert';
import { showToast } from '../../../components/modal-notification/toast';
import { cmsApi } from '../../../lib/api';
import { supabase } from '../../../lib/supabaseClient';
import Loader from '../../../components/loader/Loader';
import { useAuth } from '../../../auth/AuthContext';

const ensureTeamMemberIds = (data: any) => {
  if (!data) return data;
  const clone = JSON.parse(JSON.stringify(data));
  const processList = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.map((item, idx) => ({
      ...item,
      _id: item._id || item.id || `member_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));
  };

  if (clone.mainCampus) {
    clone.mainCampus.director = processList(clone.mainCampus.director || []);
    clone.mainCampus.counselors = processList(clone.mainCampus.counselors || []);
    clone.mainCampus.staff = processList(clone.mainCampus.staff || []);
    clone.mainCampus.coordinators = processList(clone.mainCampus.coordinators || []);
  }
  if (clone.esuCampus) {
    clone.esuCampus = processList(clone.esuCampus || []);
  }
  return clone;
};

const CMS = () => {
  const { accessToken } = useAuth();
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
  const [privacyContent, setPrivacyContent] = useState<any>(null);
  const [termsContent, setTermsContent] = useState<any>(null);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const validateContactField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'phone':
        if (value && !/^[0-9()\-\s]+$/.test(value)) {
          error = 'Only numbers and phone symbols (() -) are allowed.';
        } else if (value && (value.length < 7 || value.length > 20)) {
          error = 'Phone number must be between 7 and 20 characters.';
        }
        break;
      case 'address':
        if (value && !/^[a-zA-Z0-9\s.,#()/\-]+$/.test(value)) {
          error = 'Only letters, numbers, and common address symbols are allowed.';
        }
        break;
      case 'facebook':
        if (value && !/^[a-zA-Z0-9\s&.\-]+$/.test(value)) {
          error = 'Only letters, numbers, spaces, and common symbols are allowed.';
        }
        break;
    }
    setContactErrors(prev => ({ ...prev, [name]: error }));
  };

  const sanitizeTeamInput = (val: string) => {
    return val.replace(/[^a-zA-Z0-9\s&.\-]/g, '');
  };

  const [savedStates, setSavedStates] = useState<Record<string, any>>({});



  // ─── Session cache (survives tab navigation, invalidated on save) ───────────
  const CMS_CACHE_KEY = 'gcc_cms_cache';
  const CMS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  const readCache = (): Record<string, any> | null => {
    try {
      const raw = sessionStorage.getItem(CMS_CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CMS_CACHE_TTL_MS) { sessionStorage.removeItem(CMS_CACHE_KEY); return null; }
      return data;
    } catch { return null; }
  };

  const writeCache = (data: Record<string, any>) => {
    try { sessionStorage.setItem(CMS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
  };

  const invalidateCacheSection = (section: string) => {
    try {
      const raw = sessionStorage.getItem(CMS_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      delete parsed.data[section];
      sessionStorage.setItem(CMS_CACHE_KEY, JSON.stringify(parsed));
    } catch {}
  };
  // ──────────────────────────────────────────────────────────────────────────────

  const fetchAllContent = async () => {
    setIsLoading(true);
    const sectionsToFetch = ['home', 'about', 'team', 'contact', 'footer', 'system', 'logos', 'counseling', 'assessment', 'shifting', 'privacy', 'terms'];
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

      const defaultPrivacy = STANDARD_PRIVACY_CONTENT;
      const defaultTerms = STANDARD_TERMS_CONTENT;

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

      // ── Check session cache first ─────────────────────────────────────────
      const cached = readCache();
      if (cached) {
        // Populate state from cache (instant)
        const applySection = (s: string, data: any) => {
          newSavedStates[s] = JSON.parse(JSON.stringify(data));
          switch (s) {
            case 'home': setHomeContent(data); break;
            case 'about': setAboutContent(data); break;
            case 'team':
              if (data.mainCampus && !data.mainCampus.director) data.mainCampus.director = [];
              setTeamContent(ensureTeamMemberIds(data)); break;
            case 'contact': setContactContent(data); break;
            case 'footer': setFooterContent(data); break;
            case 'system': setSystemData((data && data.colleges) ? data : defaultSystem); break;
            case 'logos': setLogoSettings(data); break;
            case 'counseling': setCounselingContent(data); break;
            case 'assessment': setAssessmentContent(data); break;
            case 'shifting': setShiftingContent(data); break;
            case 'privacy': setPrivacyContent(data); break;
            case 'terms': setTermsContent(data); break;
          }
        };
        for (const s of sectionsToFetch) {
          if (cached[s]) applySection(s, cached[s]);
        }
        setSavedStates(newSavedStates);
        setIsLoading(false);
        return;
      }

      // ── Fetch all sections in parallel ────────────────────────────────────
      const results = await Promise.all(sectionsToFetch.map(s => cmsApi.getContent(s)));
      const freshCache: Record<string, any> = {};

      results.forEach((result, i) => {
        const s = sectionsToFetch[i];
        let data = result.data;
        if (!result.ok || !data || Object.keys(data).length === 0) {
          if (s === 'counseling') data = defaultCounseling;
          else if (s === 'assessment') data = defaultAssessment;
          else if (s === 'shifting') data = defaultShifting;
          else if (s === 'system') data = defaultSystem;
          else if (s === 'privacy') data = defaultPrivacy;
          else if (s === 'terms') data = defaultTerms;
        }

        if (data && Object.keys(data).length > 0) {
          freshCache[s] = data;
          newSavedStates[s] = JSON.parse(JSON.stringify(data));
          switch (s) {
            case 'home': setHomeContent(data); break;
            case 'about': setAboutContent(data); break;
            case 'team':
              if (data.mainCampus && !data.mainCampus.director) data.mainCampus.director = [];
              setTeamContent(ensureTeamMemberIds(data)); break;
            case 'contact': setContactContent(data); break;
            case 'footer': setFooterContent(data); break;
            case 'system': setSystemData((data && data.colleges) ? data : defaultSystem); break;
            case 'logos': setLogoSettings(data); break;
            case 'counseling': setCounselingContent(data); break;
            case 'assessment': setAssessmentContent(data); break;
            case 'shifting': setShiftingContent(data); break;
            case 'privacy': setPrivacyContent(data); break;
            case 'terms': setTermsContent(data); break;
          }
        }
      });

      writeCache(freshCache);
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

  const processAllTeamImages = async () => {
    try {
      const allMembers: { category: string; list: any[] }[] = [
        { category: 'director', list: teamContent.mainCampus?.director || [] },
        { category: 'counselors', list: teamContent.mainCampus?.counselors || [] },
        { category: 'staff', list: teamContent.mainCampus?.staff || [] },
        { category: 'coordinators', list: teamContent.mainCampus?.coordinators || [] },
        { category: 'esuCampus', list: teamContent.esuCampus || [] }
      ];

      let totalToProcess = 0;
      allMembers.forEach(cat => {
        cat.list.forEach(member => {
          if (member.profileImage && member.profileImage.startsWith('http')) totalToProcess++;
        });
      });

      if (totalToProcess === 0) {
        showToast.info("No existing images found to process.");
        return;
      }

      const result = await showAlert.confirm(
        'Process All Photos?',
        `This will automatically remove backgrounds from all ${totalToProcess} currently saved team photos. This may take a few minutes.`,
        'Yes, Start Process',
        'Cancel'
      );

      if (!result.isConfirmed) return;

      showToast.info(`Starting batch processing...`, { duration: 5000 });
      
      const newTeamContent = JSON.parse(JSON.stringify(teamContent));
      let processedCount = 0;

      for (const catGroup of allMembers) {
        for (let i = 0; i < catGroup.list.length; i++) {
          const member = catGroup.list[i];
          if (member.profileImage && member.profileImage.startsWith('http')) {
            try {
              const response = await fetch(member.profileImage, { mode: 'cors' });
              if (!response.ok) throw new Error(`Fetch failed`);
              const blob = await response.blob();
              const file = new File([blob], `temp.png`, { type: 'image/png' });

              const processedBlob = await removeBackground(file, {
                publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
              });
              
              const fileName = `cms/auto-batch-${Date.now()}-${processedCount}.png`;
              const { error: uploadError } = await supabase.storage.from('cms-assets').upload(fileName, processedBlob);
              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage.from('cms-assets').getPublicUrl(fileName);

              if (catGroup.category === 'esuCampus') newTeamContent.esuCampus[i].profileImage = publicUrl;
              else newTeamContent.mainCampus[catGroup.category][i].profileImage = publicUrl;

              processedCount++;
              showToast.info(`Processed ${processedCount}/${totalToProcess}...`);
            } catch (err) {
              console.error(`Failed:`, err);
            }
          }
        }
      }

      setTeamContent(newTeamContent);
      showToast.success(`Finished! Updated ${processedCount} images. Remember to Save Changes.`);
    } catch (error) {
      showToast.error("Batch processing failed.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file || !uploadContext) return;

    try {
      const { section, path, index } = uploadContext;

      // Always-on Background Removal for Team section
      if (section === 'team') {
        const processingToast = showToast.info('AI is removing background...', { duration: 15000 });
        try {
          const blob = await removeBackground(file, {
            publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
          });
          file = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", { type: 'image/png' });
          showToast.success('Background removed!');
        } catch (bgError) {
          console.error("BG removal failed:", bgError);
          showToast.error("Background removal failed. Uploading original.");
        } finally {
          showToast.dismiss(processingToast);
        }
      }

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
          case 'privacy': setPrivacyContent(res.data); break;
          case 'terms': setTermsContent(res.data); break;
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
      shifting: shiftingContent,
      privacy: privacyContent,
      terms: termsContent
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
        'Shifting Service': { key: 'shifting', data: shiftingContent },
        'Privacy Policy': { key: 'privacy', data: privacyContent },
        'Terms of Service': { key: 'terms', data: termsContent }
      };
      let { key, data } = mapping[section];

      if (key === 'contact') {
        const hasErrors = Object.values(contactErrors).some(err => err !== '');
        if (hasErrors) {
          showToast.error("Please fix the validation errors before saving.");
          return;
        }
        data = {
          ...data,
          phone: data.phone.trim(),
          email: data.email.trim(),
          address: data.address.trim(),
          facebook: data.facebook.trim(),
          messenger: data.messenger.trim()
        };
        setContactContent(data);
      }

      if (key) {
        const updateResult = await cmsApi.updateContent(key, data, accessToken || undefined);
        if (updateResult.ok) {
          setSavedStates(prev => ({ ...prev, [key]: JSON.parse(JSON.stringify(data)) }));
          invalidateCacheSection(key); // drop only this section from cache
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
    { id: 'privacy', title: 'Privacy Policy', icon: Shield, description: 'Manage privacy and data protection rules.' },
    { id: 'terms', title: 'Terms of Service', icon: Scale, description: 'Manage user agreement and site rules.' },
    { id: 'footer', title: 'Footer', icon: LayoutGrid, description: 'Manage footer brand text.' },
  ];
  if (isLoading || !homeContent || !aboutContent || !teamContent || !contactContent || !footerContent || !systemData || !logoSettings || !counselingContent || !assessmentContent || !shiftingContent || !privacyContent || !termsContent) {
    return <Loader />;
  }

return (
  <>
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*"
      onChange={handleImageUpload}
    />
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Content Management</h2>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage the public-facing content of the GCC Portal.</p>
      </div>
    </div>

    {/* Tabs Navigation */}
    <div className="flex flex-wrap gap-2 p-2 bg-slate-100/50 rounded-lg border border-slate-200/60 backdrop-blur-sm">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`flex items-center gap-3 px-6 py-4 rounded-lg font-black transition-all duration-300 ${activeSection === section.id
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
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
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Home Page')}
                disabled={!hasChanges('home')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('home')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                        className={`aspect-square bg-slate-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-teal-400 hover:text-teal-500 transition-colors cursor-pointer group relative overflow-hidden ${homeContent.hero.images[idx] !== savedStates.home?.hero?.images[idx] ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-300'
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Support Features (3 Items)</label>
                <div className="grid md:grid-cols-3 gap-4">
                  {homeContent.support.features.map((feature: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
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
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
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
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none"
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
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-medium text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                        ></textarea>
                      </div>
                      <div
                        className={`h-20 bg-slate-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden group ${feature.image !== savedStates.home?.support?.features?.[idx]?.image ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-300'
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Main Display Image</label>
                    <div
                      onClick={() => triggerUpload('home', ['growth', 'image'])}
                      className={`h-32 bg-slate-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-teal-400 hover:text-teal-500 transition-colors cursor-pointer group relative overflow-hidden ${homeContent.growth.image !== savedStates.home?.growth?.image ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-300'
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
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-2">
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">About Us Editor</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('about')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('About Us')}
                disabled={!hasChanges('about')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('about')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[10px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
           <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Our Team Editor</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => processAllTeamImages()}
                className="px-4 py-3 bg-teal-50 text-teal-600 rounded-lg font-black text-xs hover:bg-teal-100 transition-all border border-teal-200 flex items-center gap-2"
              >
                <ImageIcon size={14} />
                Process All Existing Photos
              </button>
              <button
                onClick={() => discardSection('team')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Our Team')}
                disabled={!hasChanges('team')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('team')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                      const newItems = [...teamContent.mainCampus.director, { _id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: "New Director", degree: "PhD/MA", dept: "Director, GCC", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Director
                  </button>
                </div>
                <SortableTeamGrid
                  items={teamContent.mainCampus.director || []}
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newOrder } })}
                  cols="grid-cols-2 lg:grid-cols-4"
                  renderCard={(member, idx) => (
                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl space-y-3 relative group transition-all cursor-grab active:cursor-grabbing select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-teal-500">
                          <GripVertical size={16} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Drag</span>
                        </div>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); const newItems = teamContent.mainCampus.director.filter((_: any, i: number) => i !== idx); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: newItems } }); }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold hover:bg-red-200"
                        >×</button>
                      </div>
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => triggerUpload('team', ['mainCampus', 'director', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.director?.[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'}`}
                      >
                        {member.profileImage ? (<><img src={member.profileImage} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={20} className="text-white" /></div></>) : (<><ImageIcon size={24} /><span className="text-[8px] font-bold mt-1">Photo</span></>)}
                      </div>
                      <div className="space-y-2">
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.name} onChange={(e) => { const n = [...teamContent.mainCampus.director]; n[idx].name = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: n } }); }} placeholder="Name" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.degree} onChange={(e) => { const n = [...teamContent.mainCampus.director]; n[idx].degree = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: n } }); }} placeholder="Degree" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.dept} onChange={(e) => { const n = [...teamContent.mainCampus.director]; n[idx].dept = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, director: n } }); }} placeholder="Department" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                      </div>
                    </div>
                  )}
                  renderOverlay={(member) => (
                    <div className="bg-white p-4 rounded-2xl border-2 border-teal-400 shadow-2xl space-y-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-teal-500"><GripVertical size={16} /></div>
                      {member.profileImage ? <img src={member.profileImage} className="w-full aspect-square rounded-full object-cover" alt="" /> : <div className="w-full aspect-square rounded-full bg-teal-50 flex items-center justify-center"><ImageIcon size={24} className="text-teal-300" /></div>}
                      <p className="text-[10px] font-black text-slate-800 truncate">{member.name}</p>
                    </div>
                  )}
                />
              </div>

              {/* Counselors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Guidance Counselors</label>
                  <button
                    onClick={() => {
                      const newCounselors = [...teamContent.mainCampus.counselors, { _id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: "New Counselor", degree: "PhD/MA", dept: "Main Campus - GCC", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newCounselors } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Counselor
                  </button>
                </div>
                <SortableTeamGrid
                  items={teamContent.mainCampus.counselors || []}
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: newOrder } })}
                  cols="grid-cols-2 lg:grid-cols-4"
                  renderCard={(member, idx) => (
                    <div className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl space-y-3 relative group transition-all cursor-grab active:cursor-grabbing select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-teal-500">
                          <GripVertical size={16} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Drag</span>
                        </div>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); const n = teamContent.mainCampus.counselors.filter((_: any, i: number) => i !== idx); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: n } }); }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold hover:bg-red-200"
                        >×</button>
                      </div>
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => triggerUpload('team', ['mainCampus', 'counselors', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.counselors[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'}`}
                      >
                        {member.profileImage ? (<><img src={member.profileImage} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={20} className="text-white" /></div></>) : (<><ImageIcon size={24} /><span className="text-[8px] font-bold mt-1">Photo</span></>)}
                      </div>
                      <div className="space-y-2">
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.name} onChange={(e) => { const n = [...teamContent.mainCampus.counselors]; n[idx].name = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: n } }); }} placeholder="Name" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.degree} onChange={(e) => { const n = [...teamContent.mainCampus.counselors]; n[idx].degree = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: n } }); }} placeholder="Degree" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.dept} onChange={(e) => { const n = [...teamContent.mainCampus.counselors]; n[idx].dept = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, counselors: n } }); }} placeholder="Department" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                      </div>
                    </div>
                  )}
                  renderOverlay={(member) => (
                    <div className="bg-white p-4 rounded-xl border-2 border-teal-400 shadow-2xl space-y-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-teal-500"><GripVertical size={16} /></div>
                      {member.profileImage ? <img src={member.profileImage} className="w-full aspect-square rounded-full object-cover" alt="" /> : <div className="w-full aspect-square rounded-full bg-teal-50 flex items-center justify-center"><ImageIcon size={24} className="text-teal-300" /></div>}
                      <p className="text-[10px] font-black text-slate-800 truncate">{member.name}</p>
                    </div>
                  )}
                />
              </div>

              {/* Guidance Staff */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Guidance Staff</label>
                  <button
                    onClick={() => {
                      const newItems = [...teamContent.mainCampus.staff, { _id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: "New Staff", degree: "BS/BA", dept: "Unit/Office", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newItems } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Staff
                  </button>
                </div>
                <SortableTeamGrid
                  items={teamContent.mainCampus.staff || []}
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: newOrder } })}
                  cols="grid-cols-2 lg:grid-cols-4"
                  renderCard={(member, idx) => (
                    <div className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl space-y-3 relative group transition-all cursor-grab active:cursor-grabbing select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-teal-500">
                          <GripVertical size={16} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Drag</span>
                        </div>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); const n = teamContent.mainCampus.staff.filter((_: any, i: number) => i !== idx); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: n } }); }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold hover:bg-red-200"
                        >×</button>
                      </div>
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => triggerUpload('team', ['mainCampus', 'staff', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.staff[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'}`}
                      >
                        {member.profileImage ? (<><img src={member.profileImage} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={20} className="text-white" /></div></>) : (<><ImageIcon size={24} /><span className="text-[8px] font-bold mt-1">Photo</span></>)}
                      </div>
                      <div className="space-y-2">
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.name} onChange={(e) => { const n = [...teamContent.mainCampus.staff]; n[idx].name = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: n } }); }} placeholder="Name" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.degree} onChange={(e) => { const n = [...teamContent.mainCampus.staff]; n[idx].degree = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: n } }); }} placeholder="Degree" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.dept} onChange={(e) => { const n = [...teamContent.mainCampus.staff]; n[idx].dept = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, staff: n } }); }} placeholder="Department" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                      </div>
                    </div>
                  )}
                  renderOverlay={(member) => (
                    <div className="bg-white p-4 rounded-xl border-2 border-teal-400 shadow-2xl space-y-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-teal-500"><GripVertical size={16} /></div>
                      {member.profileImage ? <img src={member.profileImage} className="w-full aspect-square rounded-full object-cover" alt="" /> : <div className="w-full aspect-square rounded-full bg-teal-50 flex items-center justify-center"><ImageIcon size={24} className="text-teal-300" /></div>}
                      <p className="text-[10px] font-black text-slate-800 truncate">{member.name}</p>
                    </div>
                  )}
                />
              </div>

              {/* Coordinators */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Guidance Coordinators</label>
                  <button
                    onClick={() => {
                      const newItems = [...teamContent.mainCampus.coordinators, { _id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: "New Coordinator", degree: "MA/MS", dept: "College/Dept", profileImage: null }];
                      setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newItems } });
                    }}
                    className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                  >
                    + Add Coordinator
                  </button>
                </div>
                <SortableTeamGrid
                  items={teamContent.mainCampus.coordinators || []}
                  onReorder={(newOrder) => setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: newOrder } })}
                  cols="grid-cols-2 lg:grid-cols-4"
                  renderCard={(member, idx) => (
                    <div className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl space-y-3 relative group transition-all cursor-grab active:cursor-grabbing select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-teal-500">
                          <GripVertical size={16} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Drag</span>
                        </div>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); const n = teamContent.mainCampus.coordinators.filter((_: any, i: number) => i !== idx); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: n } }); }}
                          className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold hover:bg-red-200"
                        >×</button>
                      </div>
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => triggerUpload('team', ['mainCampus', 'coordinators', idx, 'profileImage'])}
                        className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.mainCampus?.coordinators[idx]?.profileImage ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'}`}
                      >
                        {member.profileImage ? (<><img src={member.profileImage} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={20} className="text-white" /></div></>) : (<><ImageIcon size={24} /><span className="text-[8px] font-bold mt-1">Photo</span></>)}
                      </div>
                      <div className="space-y-2">
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.name} onChange={(e) => { const n = [...teamContent.mainCampus.coordinators]; n[idx].name = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: n } }); }} placeholder="Name" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.degree} onChange={(e) => { const n = [...teamContent.mainCampus.coordinators]; n[idx].degree = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: n } }); }} placeholder="Degree" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-bold text-teal-600 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                        <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.dept} onChange={(e) => { const n = [...teamContent.mainCampus.coordinators]; n[idx].dept = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, mainCampus: { ...teamContent.mainCampus, coordinators: n } }); }} placeholder="Department" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-medium text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none cursor-text" />
                      </div>
                    </div>
                  )}
                  renderOverlay={(member) => (
                    <div className="bg-white p-4 rounded-xl border-2 border-teal-400 shadow-2xl space-y-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-teal-500"><GripVertical size={16} /></div>
                      {member.profileImage ? <img src={member.profileImage} className="w-full aspect-square rounded-full object-cover" alt="" /> : <div className="w-full aspect-square rounded-full bg-teal-50 flex items-center justify-center"><ImageIcon size={24} className="text-teal-300" /></div>}
                      <p className="text-[10px] font-black text-slate-800 truncate">{member.name}</p>
                    </div>
                  )}
                />
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
                    const newItems = [...teamContent.esuCampus, { _id: 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), name: "New ESU Coordinator", degree: "MA/MS", dept: "ESU Location", profileImage: null }];
                    setTeamContent({ ...teamContent, esuCampus: newItems });
                  }}
                  className="text-[10px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full transition-all"
                >
                  + Add ESU Member
                </button>
              </div>
              <SortableTeamGrid
                items={teamContent.esuCampus || []}
                onReorder={(newOrder) => setTeamContent({ ...teamContent, esuCampus: newOrder })}
                cols="grid-cols-4"
                renderCard={(member, idx) => (
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-xl space-y-2 relative group transition-all cursor-grab active:cursor-grabbing select-none">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-teal-500">
                        <GripVertical size={14} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">Drag</span>
                      </div>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); const n = teamContent.esuCampus.filter((_: any, i: number) => i !== idx); setTeamContent({ ...teamContent, esuCampus: n }); }}
                        className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold z-10 hover:bg-red-200"
                      >×</button>
                    </div>
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => triggerUpload('team', ['esuCampus', idx, 'profileImage'])}
                      className={`w-full aspect-square bg-white rounded-full border-2 border-dashed flex flex-col items-center justify-center text-slate-300 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors relative overflow-hidden group ${member.profileImage !== savedStates.team?.esuCampus[idx]?.profileImage ? 'border-amber-400' : 'border-slate-200'}`}
                    >
                      {member.profileImage ? <img src={member.profileImage} className="w-full h-full object-cover" alt="" /> : (<><ImageIcon size={20} /><span className="text-[8px] font-bold mt-1">Photo</span></>)}
                    </div>
                    <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.name} onChange={(e) => { const n = [...teamContent.esuCampus]; n[idx].name = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, esuCampus: n }); }} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-black text-slate-800 outline-none cursor-text" />
                    <input onPointerDown={(e) => e.stopPropagation()} type="text" value={member.dept} onChange={(e) => { const n = [...teamContent.esuCampus]; n[idx].dept = sanitizeTeamInput(e.target.value); setTeamContent({ ...teamContent, esuCampus: n }); }} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-bold text-emerald-600 outline-none cursor-text" />
                  </div>
                )}
                renderOverlay={(member) => (
                  <div className="bg-white p-4 rounded-xl border-2 border-teal-400 shadow-2xl space-y-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-teal-500"><GripVertical size={14} /></div>
                    {member.profileImage ? <img src={member.profileImage} className="w-full aspect-square rounded-full object-cover" alt="" /> : <div className="w-full aspect-square rounded-full bg-teal-50 flex items-center justify-center"><ImageIcon size={20} className="text-teal-300" /></div>}
                    <p className="text-[10px] font-black text-slate-800 truncate">{member.name}</p>
                  </div>
                )}
              />
            </div>
          </div>
        </motion.div>
      )}


      {activeSection === 'contact' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Contact Info Editor</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('contact')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Contact Info')}
                disabled={!hasChanges('contact') || Object.values(contactErrors).some(err => err !== '')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  (!hasChanges('contact') || Object.values(contactErrors).some(err => err !== ''))
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                      maxLength={20}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContactContent({ ...contactContent, phone: val });
                        validateContactField('phone', val);
                      }}
                      className={`w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${
                        contactErrors.phone ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-teal-500'
                      }`}
                    />
                    {contactErrors.phone && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1">{contactErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Official Email Address</label>
                    <input
                      type="email"
                      value={contactContent.email}
                      onChange={(e) => setContactContent({ ...contactContent, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setContactContent({ ...contactContent, address: val });
                      validateContactField('address', val);
                    }}
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all resize-none ${
                      contactErrors.address ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-teal-500'
                    }`}
                  ></textarea>
                  {contactErrors.address && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1">{contactErrors.address}</p>}
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setContactContent({ ...contactContent, facebook: val });
                        validateContactField('facebook', val);
                      }}
                      className={`w-full bg-slate-50 border rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${
                        contactErrors.facebook ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 focus:ring-2 focus:ring-teal-500'
                      }`}
                    />
                    {contactErrors.facebook && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1">{contactErrors.facebook}</p>}
                  </div>
                   <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Facebook Page Link</label>
                    <input
                      type="text"
                      value={contactContent.messenger}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContactContent({ ...contactContent, messenger: val });
                      }}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Privacy Policy Editor</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('privacy')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Privacy Policy')}
                disabled={!hasChanges('privacy')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('privacy')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Hero Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Policy Title</label>
                  <input
                    type="text"
                    value={privacyContent?.hero?.title || ''}
                    onChange={(e) => setPrivacyContent({ ...privacyContent, hero: { ...privacyContent.hero, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Policy Description</label>
                  <textarea
                    rows={3}
                    value={privacyContent?.hero?.description || ''}
                    onChange={(e) => setPrivacyContent({ ...privacyContent, hero: { ...privacyContent.hero, description: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Shield className="text-teal-500" size={20} />
                  Policy Sections
                </h4>
                <button
                  onClick={() => setPrivacyContent({ ...privacyContent, sections: [...(privacyContent.sections || []), { title: "New Section", content: "Description content...", icon: "Lock" }] })}
                  className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {privacyContent?.sections?.map((section: any, idx: number) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <button
                      onClick={() => setPrivacyContent({ ...privacyContent, sections: privacyContent.sections.filter((_: any, i: number) => i !== idx) })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      ×
                    </button>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSecs = [...privacyContent.sections];
                        newSecs[idx].title = e.target.value;
                        setPrivacyContent({ ...privacyContent, sections: newSecs });
                      }}
                      className="w-full bg-transparent border-b border-slate-200 pb-2 mb-3 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                    />
                    <textarea
                      rows={4}
                      value={section.content}
                      onChange={(e) => {
                        const newSecs = [...privacyContent.sections];
                        newSecs[idx].content = e.target.value;
                        setPrivacyContent({ ...privacyContent, sections: newSecs });
                      }}
                      className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'terms' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Terms of Service Editor</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('terms')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Terms of Service')}
                disabled={!hasChanges('terms')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('terms')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Type className="text-teal-500" size={20} />
                Hero Section
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Terms Title</label>
                  <input
                    type="text"
                    value={termsContent?.hero?.title || ''}
                    onChange={(e) => setTermsContent({ ...termsContent, hero: { ...termsContent.hero, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Terms Description</label>
                  <textarea
                    rows={3}
                    value={termsContent?.hero?.description || ''}
                    onChange={(e) => setTermsContent({ ...termsContent, hero: { ...termsContent.hero, description: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Scale className="text-teal-500" size={20} />
                  Agreement Clauses
                </h4>
                <button
                  onClick={() => setTermsContent({ ...termsContent, sections: [...(termsContent.sections || []), { title: "New Clause", content: "Content here...", icon: "CheckCircle" }] })}
                  className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {termsContent?.sections?.map((section: any, idx: number) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <button
                      onClick={() => setTermsContent({ ...termsContent, sections: termsContent.sections.filter((_: any, i: number) => i !== idx) })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                    >
                      ×
                    </button>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSecs = [...termsContent.sections];
                        newSecs[idx].title = e.target.value;
                        setTermsContent({ ...termsContent, sections: newSecs });
                      }}
                      className="w-full bg-transparent border-b border-slate-200 pb-2 mb-3 text-sm font-black text-slate-800 outline-none focus:border-teal-500"
                    />
                    <textarea
                      rows={4}
                      value={section.content}
                      onChange={(e) => {
                        const newSecs = [...termsContent.sections];
                        newSecs[idx].content = e.target.value;
                        setTermsContent({ ...termsContent, sections: newSecs });
                      }}
                      className="w-full bg-transparent text-xs font-medium text-slate-500 outline-none resize-none"
                    ></textarea>
                  </div>
                ))}
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">System Data Manager</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('system')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('System Data')}
                disabled={!hasChanges('system')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('system')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-all font-black text-xs"
                >
                  <Plus size={16} />
                  Add College
                </button>
              </div>

              <div className="grid gap-6">
                {(systemData.colleges || []).map((college: any, cIdx: number) => (
                  <div key={college.id || cIdx} className="bg-slate-50/50 rounded-lg border border-slate-200 overflow-hidden">
                    <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={college.name}
                          onChange={(e) => {
                            const filteredValue = e.target.value.replace(/[^a-zA-Z\s\-()&]/g, '');
                            const newColleges = [...systemData.colleges];
                            newColleges[cIdx].name = filteredValue;
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
                                  const filteredValue = e.target.value.replace(/[^a-zA-Z\s\-()&]/g, '');
                                  const newColleges = [...systemData.colleges];
                                  const actualIdx = newColleges[cIdx].courses.indexOf(course);
                                  newColleges[cIdx].courses[actualIdx].name = filteredValue;
                                  setSystemData({ ...systemData, colleges: newColleges });
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                                  const filteredValue = e.target.value.replace(/[^a-zA-Z\s\-()&]/g, '');
                                  const newColleges = [...systemData.colleges];
                                  const actualIdx = newColleges[cIdx].courses.indexOf(course);
                                  newColleges[cIdx].courses[actualIdx].name = filteredValue;
                                  setSystemData({ ...systemData, colleges: newColleges });
                                }}
                                className="flex-1 bg-teal-50/30 border border-teal-100 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-all font-black text-xs"
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
                        const filteredValue = e.target.value.replace(/[^a-zA-Z\s\-()&]/g, '');
                        const newOccs = [...systemData.occupations];
                        newOccs[idx] = filteredValue;
                        setSystemData({ ...systemData, occupations: newOccs });
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Footer Editor</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('footer')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Footer')}
                disabled={!hasChanges('footer')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('footer')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-amber-50 rounded-lg border border-amber-100 flex gap-4 items-start mb-6">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">System Logos</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => discardSection('logos')}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
               <button
                onClick={() => handleSave('System Logos')}
                disabled={!hasChanges('logos')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('logos')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-teal-400 transition-all group relative overflow-hidden"
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
                className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-teal-400 transition-all group relative overflow-hidden"
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Counseling Service</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('counseling')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Counseling Service')}
                disabled={!hasChanges('counseling')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('counseling')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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
              <div className="p-8 bg-teal-900 rounded-lg text-white">
                <h4 className="text-xl font-black mb-4">Book a Session Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={counselingContent?.cta?.title || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, cta: { ...counselingContent.cta, title: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={counselingContent?.cta?.description || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, cta: { ...counselingContent.cta, description: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-xs font-medium text-teal-100 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-8 bg-white rounded-lg border border-slate-200">
                <h4 className="text-xl font-black text-slate-900 mb-4">Immediate Help Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={counselingContent?.hotline?.title || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, hotline: { ...counselingContent.hotline, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={counselingContent?.hotline?.description || ''}
                    onChange={(e) => setCounselingContent({ ...counselingContent, hotline: { ...counselingContent.hotline, description: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-500 outline-none resize-none"
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Assessment Service</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('assessment')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => handleSave('Assessment Service')}
                disabled={!hasChanges('assessment')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('assessment')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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

              <div className="p-8 bg-teal-900 rounded-lg text-white self-start">
                <h4 className="text-xl font-black mb-4">Start Assessment CTA</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={assessmentContent?.cta?.title || ''}
                    onChange={(e) => setAssessmentContent({ ...assessmentContent, cta: { ...assessmentContent.cta, title: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={assessmentContent?.cta?.description || ''}
                    onChange={(e) => setAssessmentContent({ ...assessmentContent, cta: { ...assessmentContent.cta, description: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-xs font-medium text-teal-100 outline-none resize-none"
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
          className="bg-white p-10 rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800">Shifting Service</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => discardSection('shifting')}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-black text-sm hover:bg-slate-200 transition-all"
              >
                Discard
              </button>
               <button
                onClick={() => handleSave('Shifting Service')}
                disabled={!hasChanges('shifting')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm transition-all shadow-lg ${
                  !hasChanges('shifting')
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                }`}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
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
              <div className="p-8 bg-teal-900 rounded-lg text-white">
                <h4 className="text-xl font-black mb-4">Apply for Shifting Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={shiftingContent?.cta?.title || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, cta: { ...shiftingContent.cta, title: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={shiftingContent?.cta?.description || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, cta: { ...shiftingContent.cta, description: e.target.value } })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-xs font-medium text-teal-100 outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="p-8 bg-white rounded-lg border border-slate-200">
                <h4 className="text-xl font-black text-slate-900 mb-4">Career Guidance Sidebar</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={shiftingContent?.guidance?.title || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, guidance: { ...shiftingContent.guidance, title: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    rows={2}
                    value={shiftingContent?.guidance?.description || ''}
                    onChange={(e) => setShiftingContent({ ...shiftingContent, guidance: { ...shiftingContent.guidance, description: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-medium text-slate-500 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  </motion.div>
  </>
);
};

export default CMS;
