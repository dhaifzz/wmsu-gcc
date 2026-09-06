import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import phAddresses from '../ph_addresses.json';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserCircle,
  Calendar,
  Briefcase,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  Phone,
  MapPin,
  Map,
  ArrowLeft,
  ChevronDown,
  Loader2,
  Search,
  Check,
  CheckCircle2,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authBg from '../assets/img/Auth-Background.jpg';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { authApi, cmsApi } from '../lib/api';
import { showToast } from '../components/modal-notification/toast';
import { showAlert } from '../components/modal-notification/sweetalert';

type AcademicCourse = {
  name: string;
  type: string;
};

type AcademicCollege = {
  id: string | number;
  name: string;
  courses: AcademicCourse[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string =>
  typeof value === 'string';

const normalizeAcademicData = (payload: unknown) => {
  const payloadObject = isRecord(payload) ? payload : {};
  const source = isRecord(payloadObject.data)
    ? payloadObject.data
    : isRecord(payloadObject.content)
    ? payloadObject.content
    : isRecord(payloadObject.system)
    ? payloadObject.system
    : payloadObject;

  const rawColleges = Array.isArray(source.colleges) ? source.colleges : [];
  const rawOccupations = Array.isArray(source.occupations) ? source.occupations : [];

  const normalizedColleges = rawColleges
    .map((col, index) => {
      if (!isRecord(col)) return null;

      const parsedCourses = Array.isArray(col.courses) ? col.courses : [];
      const normalizedCourses = parsedCourses
        .map((course) => {
          if (!isRecord(course)) return null;

          const name = isString(course.name)
            ? course.name
            : isString(course.course_name)
            ? course.course_name
            : '';
          const type = isString(course.type)
            ? course.type
            : isString(course.program_type)
            ? course.program_type
            : 'Undergraduate';

          return name.trim()
            ? { name: name.trim(), type: type.trim() || 'Undergraduate' }
            : null;
        })
        .filter((course): course is AcademicCourse => course !== null);

      const name = isString(col.name)
        ? col.name
        : isString(col.college_name)
        ? col.college_name
        : '';
      if (!name.trim()) return null;

      const id = isString(col.id)
        ? col.id
        : typeof col.id === 'number'
        ? col.id
        : index;

      return {
        id,
        name: name.trim(),
        courses: normalizedCourses
      };
    })
    .filter((col): col is AcademicCollege => col !== null);

  const normalizedOccupations = rawOccupations
    .map((occ) => {
      if (isString(occ)) return occ.trim();
      if (isRecord(occ) && isString(occ.occupation_name)) return occ.occupation_name.trim();
      return '';
    })
    .filter((occ): occ is string => occ !== '');

  return {
    colleges: normalizedColleges,
    occupations: normalizedOccupations
  };
};

const validateAndNormalizePhone = (phone: string): { normalized: string; error: string | null } => {
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleanPhone)) {
    return { normalized: '', error: 'Phone number must contain only digits.' };
  }

  if (!cleanPhone.startsWith('09')) {
    return { normalized: '', error: 'Phone number must start with 09.' };
  }

  if (cleanPhone.length !== 11) {
    return { normalized: '', error: 'Phone number must be exactly 11 digits.' };
  }

  return { normalized: cleanPhone, error: null };
};

const TERMS_SECTIONS = [
  {
    title: "1. Account Eligibility and Creation",
    content: "The Western Mindanao State University Guidance and Counseling Center (WMSU GCC) Portal is designated for current students, incoming/shifting applicants, faculty members, university personnel, and authorized community clients. By registering, you affirm that all information provided during registration is accurate, true, and complete. Impersonation or falsification of identity is strictly prohibited."
  },
  {
    title: "2. Confidentiality and Counseling Ethics",
    content: "All counseling consultations, mental health records, psychometric assessment results, and personal disclosures are held in strict professional confidence under the Code of Ethics for Guidance Counselors and the Philippine Guidance and Counseling Act of 2004 (RA 9258). Information shared within the center or via this portal will not be disclosed to any outside party without your explicit written authorization, except in life-threatening emergencies, imminent danger of self-harm or harm to others, or when mandated by a court of law."
  },
  {
    title: "3. Republic Act No. 10173 (Data Privacy Act of 2012)",
    content: "In adherence to Republic Act No. 10173, the WMSU Guidance and Counseling Center collects, processes, and stores personal and sensitive personal information (such as name, contact details, academic program, assessment scores, and appointment history) solely for counseling assistance, student welfare monitoring, institutional reporting in non-identifiable aggregate forms, and referral services. Your data is encrypted and protected with university security standards."
  },
  {
    title: "4. User Conduct and Portal Etiquette",
    content: "You agree to use this portal only for lawful and intended purposes, including booking guidance appointments, scheduling shifting exams, and accessing counselor services. You must refrain from uploading malicious files, attempting unauthorized system access, or communicating in an abusive, harassing, or disrespectful manner toward guidance staff or counselors. Violations may result in immediate account revocation and disciplinary action under the WMSU Student/Employee Handbook."
  },
  {
    title: "5. Appointments and Cancellation Policy",
    content: "Submitting an appointment request is subject to counselor confirmation and schedule availability. Users are requested to arrive promptly for scheduled consultations. In the event of unforeseen conflicts, cancellations or rescheduling requests must be submitted through the portal at least 24 hours in advance to allow available slots to be extended to other students in need."
  },
  {
    title: "6. User Declaration and Voluntary Consent",
    content: "By proceeding with registration and clicking 'I Agree & Create Account', you certify under penalty of university administrative policy that you are the lawful owner of the credentials submitted, and that you voluntarily, knowingly, and freely give your full consent to the processing of your data and agreement to all terms, policies, and guidelines stated above."
  }
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });

  const [colleges, setColleges] = useState<AcademicCollege[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [occupations, setOccupations] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [street, setStreet] = useState('');

  const [sex, setSex] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [occupation, setOccupation] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [occSearch, setOccSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const ALL_CITIES = useMemo(() => {
    const keys = Object.keys(phAddresses);
    return keys.sort((a, b) => {
      if (a === 'Zamboanga City') return -1;
      if (b === 'Zamboanga City') return 1;
      return a.localeCompare(b);
    });
  }, []);

  const [barangaySearch, setBarangaySearch] = useState('');

  const filteredCities = ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

  const filteredBarangays = useMemo(() => {
    if (!city || !phAddresses[city as keyof typeof phAddresses]) return [];
    const list = phAddresses[city as keyof typeof phAddresses];
    return list.filter(b => 
      b.toLowerCase().includes(barangaySearch.toLowerCase())
    );
  }, [city, barangaySearch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logoRes, academicRes] = await Promise.all([
          cmsApi.getContent('logos'),
          cmsApi.getAcademicData()
        ]);
        
        if (logoRes.ok && logoRes.data) {
          setLogos({
            wmsuLogo: logoRes.data.wmsuLogo || wmsuLogoAsset,
            gccLogo: logoRes.data.gccLogo || gccLogoAsset
          });
        }

        if (academicRes.ok && academicRes.data) {
          const parsed = normalizeAcademicData(academicRes.data);
          setColleges(parsed.colleges);
          setOccupations(parsed.occupations);
        } else {
          const systemRes = await cmsApi.getContent('system');
          if (systemRes.ok && systemRes.data) {
            const parsed = normalizeAcademicData(systemRes.data);
            setColleges(parsed.colleges);
            setOccupations(parsed.occupations);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);
  const [isDropdownOpen, setIsDropdownOpen] = useState<{ [key: string]: boolean }>({
    sex: false,
    gradeLevel: false,
    occupation: false,
    course: false,
    college: false,
    city: false,
    barangay: false
  });

  const filteredUndergrad = useMemo(() => {
    if (!selectedCollege) return [];
    const col = colleges.find((college) => college.name === selectedCollege);
    return (col?.courses || [])
      .filter((course) => course.type === 'Undergraduate')
      .map((course) => course.name)
      .filter((name: string) => name.toLowerCase().includes(courseSearch.toLowerCase()))
      .sort();
  }, [selectedCollege, colleges, courseSearch]);

  const filteredGrad = useMemo(() => {
    if (!selectedCollege) return [];
    const col = colleges.find((college) => college.name === selectedCollege);
    return (col?.courses || [])
      .filter((course) => course.type === 'Graduate')
      .map((course) => course.name)
      .filter((name: string) => name.toLowerCase().includes(courseSearch.toLowerCase()))
      .sort();
  }, [selectedCollege, colleges, courseSearch]);

  const toggleDropdown = (key: string) => {
    setIsDropdownOpen(prev => {
      const newState = !prev[key as keyof typeof isDropdownOpen];
      if (newState) {
        // Reset search when opening
        if (key === 'college') setCollegeSearch('');
        if (key === 'course') setCourseSearch('');
        if (key === 'occupation') setOccSearch('');
        if (key === 'city') setCitySearch('');
        if (key === 'barangay') setBarangaySearch('');
      }
      return { ...prev, [key]: newState };
    });
  };

  const closeDropdowns = () => {
    setIsDropdownOpen({ sex: false, gradeLevel: false, occupation: false, course: false, college: false, city: false, barangay: false });
    setCollegeSearch('');
    setCourseSearch('');
    setOccSearch('');
  };


  const [isWMSU, setIsWMSU] = useState<boolean>(true);

  const [school, setSchool] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [course, setCourse] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [track, setTrack] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [lrn, setLrn] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const WMSU_OCCUPATIONS = ['Student', 'WMSU Employee'];
  const occupationOptions = isWMSU ? WMSU_OCCUPATIONS : occupations;
  const isFaculty = isWMSU && occupation === 'WMSU Employee';
  const shouldShowEducationStep = occupation === 'Student';
  const filteredOccs = occupationOptions.filter(o => o.toLowerCase().includes(occSearch.toLowerCase()));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset scroll position when step changes
  useEffect(() => {
    const scrollContainer = document.getElementById('register-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [step]);

  const isEmailDomainInvalid = useMemo(() => {
    if (!email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase() || '';
    if (!domain) return false;
    if (isWMSU) return domain !== 'wmsu.edu.ph';
    return !['wmsu.edu.ph', 'gmail.com'].includes(domain);
  }, [email, isWMSU]);

  const passwordRules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const validateStep1 = (): boolean => {
    if (!email.trim()) { showToast.error('Email is required.'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { showToast.error('Please enter a valid email address.'); return false; }
    
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (isWMSU && domain !== 'wmsu.edu.ph') {
      showToast.error('Please use your valid school email address (@wmsu.edu.ph).');
      return false;
    }
    
    if (!isWMSU && !['wmsu.edu.ph', 'gmail.com'].includes(domain)) {
      showToast.error('Only @wmsu.edu.ph or @gmail.com emails are allowed.');
      return false;
    }

    if (!password) { showToast.error('Password is required.'); return false; }
    if (password.length < 8) { showToast.error('Password must be at least 8 characters.'); return false; }
    if (!/[A-Z]/.test(password)) { showToast.error('Password must contain at least one uppercase letter.'); return false; }
    if (!/[0-9]/.test(password)) { showToast.error('Password must contain at least one number.'); return false; }
    if (!confirmPassword) { showToast.error('Please re-enter your password.'); return false; }
    if (password !== confirmPassword) { showToast.error('Passwords do not match.'); return false; }
    
    return true;
  };

  const handleNextStep1 = (): boolean => {
    if (!validateStep1()) return false;
    closeDropdowns();
    setStep(2);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!firstName.trim()) { showToast.error('First name is required.'); return false; }
    if (!lastName.trim()) { showToast.error('Last name is required.'); return false; }
    if (!contactNumber.trim()) { showToast.error('Contact number is required.'); return false; }
    
    const { normalized, error } = validateAndNormalizePhone(contactNumber);
    if (error) {
      showToast.error(error);
      return false;
    }
    
    // Update to normalized format
    setContactNumber(normalized);
    if (!city.trim()) { showToast.error('City is required.'); return false; }
    if (!barangay.trim()) { showToast.error('Barangay is required.'); return false; }
    
    return true;
  };

  const handleNextStep2 = (): boolean => {
    if (!validateStep2()) return false;
    closeDropdowns();
    setStep(3);
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!sex) { showToast.error('Please select your sex.'); return false; }
    if (!birthdate) { showToast.error('Birthdate is required.'); return false; }
    if (!occupation) { showToast.error('Please select your occupation.'); return false; }
    if (isWMSU && isFaculty && !employeeId.trim()) { showToast.error('Employee ID is required.'); return false; }
    if (isWMSU && isFaculty && !/^\d{6}$/.test(employeeId.trim())) { showToast.error('Employee ID must be exactly 6 digits.'); return false; }
    
    return true;
  };

  const handleNextStep3 = (): boolean => {
    if (!validateStep3()) return false;
    closeDropdowns();
    setStep(4);
    return true;
  };

  const validateStep4 = (): boolean => {
    if (!educationLevel) { showToast.error('Please select an education level.'); return false; }
    if (educationLevel === 'College' && !selectedCollege) { showToast.error('Please select a college.'); return false; }
    if (educationLevel === 'College' && !course.trim()) { showToast.error('Course is required.'); return false; }
    if (educationLevel === 'College' && isWMSU && !schoolId.trim()) { showToast.error('School ID is required.'); return false; }
    if (educationLevel === 'College' && isWMSU && !/^\d{9}$/.test(schoolId.trim())) { showToast.error('School ID must be exactly 9 digits.'); return false; }
    if (educationLevel === 'High School' && !gradeLevel) { showToast.error('Grade level is required.'); return false; }
    if (educationLevel === 'High School' && isWMSU && !lrn.trim()) { showToast.error('LRN is required.'); return false; }
    if (educationLevel === 'High School' && isWMSU && !/^\d{12}$/.test(lrn.trim())) { showToast.error('LRN must be exactly 12 digits.'); return false; }
    if (educationLevel === 'High School' && ['11', '12'].includes(gradeLevel) && !track) { showToast.error('Please select a track.'); return false; }
    if (!isWMSU && !school.trim()) { showToast.error('School name is required.'); return false; }
    return true;
  };

  useEffect(() => {
    if (showTermsModal) {
      document.body.style.overflow = 'hidden';
      setHasScrolledTerms(false);
      const timer = setTimeout(() => {
        if (termsScrollRef.current) {
          termsScrollRef.current.scrollTop = 0;
          const { scrollHeight, clientHeight } = termsScrollRef.current;
          if (scrollHeight <= clientHeight + 10) {
            setHasScrolledTerms(true);
          }
        }
      }, 150);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showTermsModal]);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setHasScrolledTerms(true);
    }
  };

  const scrollToBottomTerms = () => {
    if (termsScrollRef.current) {
      termsScrollRef.current.scrollTo({
        top: termsScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep1();
      return;
    }

    if (step === 2) {
      handleNextStep2();
      return;
    }

    if (step === 3) {
      if (shouldShowEducationStep) {
        handleNextStep3();
        return;
      }
      if (!validateStep3()) return;
    }

    if (step === 4 && shouldShowEducationStep && !validateStep4()) return;

    if (!validateStep1()) { setStep(1); return; }
    if (!validateStep2()) { setStep(2); return; }
    if (!validateStep3()) { setStep(3); return; }
    if (shouldShowEducationStep && !validateStep4()) { setStep(4); return; }

    if (!agreedTerms) {
      showToast.error('Please agree to the Terms and Conditions before completing sign up.');
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.register({
        email,
        password,
        firstName,
        middleName: middleInitial,
        lastName,
        contactNumber,
        city,
        barangay,
        street,
        sex,
        birthdate,
        isWMSU,
        isFaculty,
        department: '',
        occupation,
        educationLevel,
        school: !isWMSU ? school : '',
        course,
        gradeLevel,
        track,
        schoolId: (educationLevel === 'College' && schoolId) ? parseInt(schoolId, 10) : null,
        lrn: (educationLevel === 'High School' && lrn) ? parseInt(lrn, 10) : null,
        employeeId: (isFaculty && employeeId) ? parseInt(employeeId, 10) : null
      });

      if (!result.ok) {
        const errData = result.data as unknown as { error: string };
        showToast.error(errData.error || 'Registration failed. Please try again.');
        return;
      }

      // Show SweetAlert email confirmation modal
      const alertResult = await showAlert.emailConfirmation(email);
      if (alertResult.isConfirmed) {
        navigate('/login');
      }
    } catch {
      showToast.error('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate max date for 12+ years old
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat p-4 sm:p-6"
      style={{ backgroundImage: `url(${authBg})`, perspective: '1000px' }}>

      {/* Background Overlay */}
      <div className="absolute inset-0 z-10 bg-[#047857]/75"></div>

      {/* Main Card Container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-30 flex w-full max-w-[1000px] max-h-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:flex-row"
      >
        {/* Back to Home Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 md:top-6 md:left-8 z-50 flex items-center gap-2 text-sm font-bold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-800 bg-white rounded-lg px-4 py-2.5 shadow-md group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Left Panel - Visuals */}
        <div className="relative hidden w-full flex-col justify-center overflow-hidden bg-emerald-600 p-10 md:flex md:w-1/2 lg:p-16">
          {/* Decorative Spheres/Blobs matching the design */}
          <div className="absolute -left-32 -top-16 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl"></div>
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-2xl"></div>
          <div className="absolute -bottom-20 right-4 h-80 w-80 rounded-full bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-2xl"></div>

          <div className="relative z-10 mt-auto mb-auto">
            <div className="mb-8 flex gap-4">
              <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-24 w-24 object-contain drop-shadow-md" />
              <img src={logos.gccLogo} alt="GCC Logo" className="h-24 w-24 object-contain drop-shadow-md" />
            </div>
            <h1 className="mb-2 text-5xl font-bold tracking-wider text-white drop-shadow-sm">Join Us!</h1>
            <h2 className="mb-8 text-md font-bold tracking-wider text-emerald-100"> Portal</h2>
            <p className="text-sm text-emerald-50 max-w-sm">
              Create an account to book counseling, student assessments, and course shifting services.
            </p>
          </div>
        </div>

        {/* Right Panel - Wrapper */}
        <div className="relative flex w-full flex-col bg-white md:w-1/2 overflow-hidden">

          {/* Decorative Sphere bottom right (Outside scroll area so it doesn't expand scrollable space) */}
          <div className="pointer-events-none absolute -bottom-24 -right-24 z-0 h-64 w-64 rounded-full bg-gradient-to-tl from-emerald-500 to-emerald-600 opacity-90 shadow-2xl"></div>

          {/* Scrollable Area */}
          <div id="register-scroll-container" className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden">
            <div className="flex min-h-full flex-col justify-center p-8 lg:p-16">
              <div className="mx-auto w-full max-w-sm">
                <div className="md:hidden mb-6 mt-14 flex items-center justify-center">
                  <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-14 w-14 object-contain" />
                  <div className="h-8 w-[1.5px] bg-slate-300 mx-4" />
                  <img src={logos.gccLogo} alt="GCC Logo" className="h-14 w-14 object-contain" />
                </div>

                <h2 className="mb-2 text-4xl font-bold text-gray-800">Sign up</h2>
                <p className="mb-6 text-xs text-gray-500 font-medium">Create your account to get started with GCC.</p>

                {/* WMSU Check (Only in Step 1) */}
                {step === 1 && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="mb-2 text-sm font-bold text-gray-700">Are you from WMSU?</p>
                    <div className="flex w-full rounded-lg bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsWMSU(true);
                          setOccupation('');
                          setEmployeeId('');
                          setEducationLevel('');
                          setSelectedCollege('');
                          setCourse('');
                          setGradeLevel('');
                          setTrack('');
                          setSchoolId('');
                          setLrn('');
                          setOccSearch('');
                        }}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isWMSU === true ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Yes, I am
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWMSU(false);
                          setOccupation('');
                          setEmployeeId('');
                          setEducationLevel('');
                          setSelectedCollege('');
                          setCourse('');
                          setGradeLevel('');
                          setTrack('');
                          setSchoolId('');
                          setLrn('');
                          setOccSearch('');
                        }}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isWMSU === false ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        No, I'm not
                      </button>
                    </div>
                  </div>
                )}

                {/* Stepper Progress */}
                <div className="mb-6 flex items-center justify-between px-0">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors duration-300 ${step >= 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-emerald-700' : 'text-gray-400'}`}>Account</span>
                  </div>
                  <div className={`h-1 flex-1 mx-1 rounded transition-colors duration-300 mb-4 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors duration-300 ${step >= 2 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-emerald-700' : 'text-gray-400'}`}>Personal</span>
                  </div>
                  <div className={`h-1 flex-1 mx-1 rounded transition-colors duration-300 mb-4 ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors duration-300 ${step >= 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>3</div>
                    <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${step >= 3 ? 'text-emerald-700' : 'text-gray-400'}`}>Details</span>
                  </div>
                  {shouldShowEducationStep && (
                    <>
                      <div className={`h-1 flex-1 mx-1 rounded transition-colors duration-300 mb-4 ${step >= 4 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors duration-300 ${step >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>4</div>
                        <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${step >= 4 ? 'text-emerald-700' : 'text-gray-400'}`}>Education</span>
                      </div>
                    </>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* STEP 1: Account Details */}
                  {step === 1 && (
                    <div className="flex flex-col gap-4">
                      {/* Email Input */}
                      <div className="relative flex flex-col gap-1">
                        <div className="relative flex items-center">
                          <div className="absolute left-4 text-gray-700">
                            <User className="h-5 w-5" />
                          </div>
                          <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                              isEmailDomainInvalid
                                ? 'focus:ring-rose-500 ring-2 ring-rose-500/50 bg-rose-50/50'
                                : 'focus:ring-emerald-600'
                            }`}
                          />
                        </div>

                        {isEmailDomainInvalid && (
                          <p className="text-xs font-bold text-rose-500 ml-2 animate-in fade-in duration-200">
                            {isWMSU ? 'Please use your valid school email address (@wmsu.edu.ph).' : 'Only @wmsu.edu.ph or @gmail.com emails are allowed.'}
                          </p>
                        )}
                      </div>

                      {/* Password Input */}
                      <div className="relative flex flex-col gap-1">
                        <div className="relative flex items-center">
                          <div className="absolute left-4 text-gray-700">
                            <Lock className="h-5 w-5" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-20 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 text-emerald-800 hover:text-emerald-600 focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {password.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-[11px] font-bold ml-2 mt-1">
                            <span className={passwordRules.minLength ? 'text-emerald-600' : 'text-rose-500'}>
                              {passwordRules.minLength ? '✓' : '✕'} 8+ chars
                            </span>
                            <span className={passwordRules.hasUpper ? 'text-emerald-600' : 'text-rose-500'}>
                              {passwordRules.hasUpper ? '✓' : '✕'} 1 uppercase
                            </span>
                            <span className={passwordRules.hasNumber ? 'text-emerald-600' : 'text-rose-500'}>
                              {passwordRules.hasNumber ? '✓' : '✕'} 1 number
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password Input */}
                      <div className="relative flex flex-col gap-1">
                        <div className="relative flex items-center">
                          <div className="absolute left-4 text-gray-700">
                            <Lock className="h-5 w-5" />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-20 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 text-emerald-800 hover:text-emerald-600 focus:outline-none"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {confirmPassword.length > 0 && (
                          <p className={`text-xs font-bold ml-2 animate-in fade-in duration-200 ${
                            password === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {password === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Name Details */}
                  {step === 2 && (
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        {/* First Name */}
                        <div className="relative flex flex-1 items-center">
                          <div className="absolute left-4 text-gray-700">
                            <UserCircle className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                              const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                              setFirstName(capitalized);
                            }}
                            required
                            className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                        </div>

                        {/* Middle Name */}
                        <div className="relative flex flex-1 items-center">
                          <input
                            type="text"
                            placeholder="Middle Name (optional)"
                            value={middleInitial}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                              const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                              setMiddleInitial(capitalized);
                            }}
                            className="w-full rounded-lg bg-gray-100 py-4 px-4 text-center text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-700">
                          <UserCircle className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                            const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                            setLastName(capitalized);
                          }}
                          required
                          className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      {/* Contact Number */}
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-700">
                          <Phone className="h-5 w-5" />
                        </div>
                          <input
                            type="text"
                            placeholder="Contact Number (e.g. 09123456789)"
                            value={contactNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length > 0 && val[0] !== '0') return;
                              if (val.length > 1 && val[1] !== '9') return;
                              if (val.length <= 11) setContactNumber(val);
                            }}
                            required
                            className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                      </div>

                      {/* Address Grid: City and Barangay */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* City Selection */}
                        <div className="relative group">
                          <div className={`w-full flex items-center bg-gray-100 transition-all border-2 rounded-lg overflow-hidden ${isDropdownOpen.city ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'}`}>
                            <div className="pl-4 text-gray-700 flex items-center justify-center">
                              <Building className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Select City"
                                value={isDropdownOpen.city ? citySearch : (city || '')}
                                onFocus={() => {
                                  setIsDropdownOpen(prev => ({ ...prev, city: true }));
                                  setCitySearch('');
                                }}
                                onChange={(e) => setCitySearch(e.target.value)}
                                className="w-full bg-transparent py-4 pl-3 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none"
                              />
                            </div>
                            <div className="pr-4 pointer-events-none">
                              <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.city ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {isDropdownOpen.city && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
                              >
                                <div className="overflow-y-auto custom-scrollbar">
                                  {filteredCities.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        setCity(opt);
                                        setBarangay(''); 
                                        setIsDropdownOpen(prev => ({ ...prev, city: false }));
                                        setCitySearch('');
                                      }}
                                      className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${city === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                  {filteredCities.length === 0 && (
                                    <div className="p-4 text-center text-slate-400 text-xs italic">No cities found</div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Barangay Selection */}
                        <div className="relative group">
                          <div className={`w-full flex items-center transition-all border-2 rounded-lg overflow-hidden ${!city ? 'bg-gray-50 cursor-not-allowed opacity-50 border-transparent' : isDropdownOpen.barangay ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'bg-gray-100 border-transparent'}`}>
                            <div className="pl-4 text-gray-700 flex items-center justify-center">
                              <Map className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder={city ? "Select or Type Barangay" : "Select city first"}
                                disabled={!city}
                                value={isDropdownOpen.barangay ? barangaySearch : (barangay || '')}
                                onFocus={() => {
                                  if (city) {
                                    setIsDropdownOpen(prev => ({ ...prev, barangay: true }));
                                    setBarangaySearch('');
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBarangaySearch(val);
                                  if (city !== 'Zamboanga City') {
                                    setBarangay(val);
                                  }
                                }}
                                className="w-full bg-transparent py-4 pl-3 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
                              />
                            </div>
                            <div className="pr-4 pointer-events-none">
                              <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.barangay ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          <AnimatePresence>
                            {isDropdownOpen.barangay && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
                              >
                                <div className="overflow-y-auto custom-scrollbar">
                                  {filteredBarangays.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        setBarangay(opt);
                                        setIsDropdownOpen(prev => ({ ...prev, barangay: false }));
                                        setBarangaySearch('');
                                      }}
                                      className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${barangay === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                  {filteredBarangays.length === 0 && (
                                    <div className="p-4 text-center">
                                      <p className="text-[10px] font-bold text-slate-400 italic">
                                        {city ? 'No matching barangays found' : 'Select a city first'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Street */}
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-700">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Street / House No. (Optional)"
                          value={street}
                          onChange={(e) => setStreet(e.target.value.replace(/[^a-zA-Z0-9\s.,#-]/g, ''))}
                          className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Additional Details */}
                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      {/* Sex */}
                      <div className="relative">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Sex</label>
                        <div className="relative flex items-center">
                          <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                            <Users className="h-5 w-5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDropdown('sex')}
                            className={`w-full flex items-center justify-between rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.sex ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'}`}
                          >
                            <span className={sex ? 'text-slate-800' : 'text-gray-400'}>
                              {sex || 'Select Sex'}
                            </span>
                            <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.sex ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen.sex && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                              >
                                {['Male', 'Female', 'Prefer not to say'].map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                      setSex(option);
                                      toggleDropdown('sex');
                                    }}
                                    className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${sex === option ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Birthdate */}
                      <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Birthdate</label>
                        <div className="relative flex items-center">
                          <div className="absolute left-4 text-gray-700">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <input
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            max={maxDate}
                            required
                            className={`w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${birthdate ? 'text-gray-700' : 'text-gray-400'}`}
                          />
                        </div>
                      </div>

                      {/* Occupation */}
                      <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">
                          Occupation
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDropdown('occupation')}
                            className={`w-full flex items-center justify-between bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.occupation ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'}`}
                          >
                            <span className={occupation ? 'text-slate-800' : 'text-gray-400'}>
                              {occupation || 'Select Occupation'}
                            </span>
                            <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.occupation ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen.occupation && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
                              >
                                {/* Search Input */}
                                <div className="p-3 border-b border-slate-50">
                                  <div className="relative flex items-center">
                                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Search occupation..."
                                      value={occSearch}
                                      onChange={(e) => setOccSearch(e.target.value)}
                                      className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                      autoFocus
                                    />
                                  </div>
                                </div>

                                <div className="overflow-y-auto custom-scrollbar">
                                  {filteredOccs.map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => {
                                        setOccupation(option);
                                        if (option !== 'WMSU Employee') {
                                          setEmployeeId('');
                                        }
                                        if (option !== 'Student') {
                                          setEducationLevel('');
                                          setSelectedCollege('');
                                          setCourse('');
                                          setGradeLevel('');
                                          setTrack('');
                                          setSchoolId('');
                                          setLrn('');
                                        }
                                        toggleDropdown('occupation');
                                        setOccSearch('');
                                      }}
                                      className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${occupation === option ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                  {filteredOccs.length === 0 && (
                                    <div className="p-4 text-center">
                                      <p className="text-xs font-bold text-slate-400">No results found</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Employee ID for WMSU Employee */}
                      {isWMSU && isFaculty && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Employee ID (6 Digits)</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 text-gray-700">
                              <Lock className="h-5 w-5" />
                            </div>
                            <input
                              type="text"
                              placeholder="Employee ID"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              required
                              className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* STEP 4: Education Details */}
                  {step === 4 && shouldShowEducationStep && (
                    <div className="flex flex-col gap-4">

                      {/* School */}
                      {!isWMSU && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300 mb-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">School Name</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 text-gray-700 opacity-60">
                              <Building className="h-5 w-5" />
                            </div>
                            <input
                              type="text"
                              placeholder="School Name"
                              value={school}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                                const capitalized = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                                setSchool(capitalized);
                              }}
                              required
                              className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Education Level Selection */}
                      <div className="mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="mb-2 text-sm font-bold text-gray-700">Education Level</p>
                        <div className="flex w-full rounded-lg bg-gray-100 p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEducationLevel('High School');
                              setCourse('');
                            }}
                            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${educationLevel === 'High School' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            High School
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEducationLevel('College');
                              setGradeLevel('');
                            }}
                            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${educationLevel === 'College' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            College
                          </button>
                        </div>
                      </div>

                      {/* College Selection */}
                      {educationLevel === 'College' && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300 mb-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">College</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                              <Building className="h-5 w-5" />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDropdown('college')}
                              className={`w-full flex items-center justify-between bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.college ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'} rounded-lg`}
                            >
                              <span className={selectedCollege ? 'text-slate-800' : 'text-gray-400'}>
                                {selectedCollege || 'Select College'}
                              </span>
                              <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.college ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {isDropdownOpen.college && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
                                >
                                  <div className="overflow-y-auto custom-scrollbar">
                                    {/* Search Input for College */}
                                    <div className="p-3 border-b border-slate-50">
                                      <div className="relative flex items-center">
                                        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                        <input
                                          type="text"
                                          placeholder="Search college..."
                                          value={collegeSearch}
                                          onChange={(e) => setCollegeSearch(e.target.value)}
                                          className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                          autoFocus
                                        />
                                      </div>
                                    </div>

                                    {colleges
                                      .filter(col => col.name.toLowerCase().includes(collegeSearch.toLowerCase()))
                                      .map((col) => (
                                        <button
                                          key={col.name}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCollege(col.name);
                                            setCourse('');
                                            toggleDropdown('college');
                                            setCollegeSearch('');
                                          }}
                                          className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${selectedCollege === col.name ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                        >
                                          {col.name}
                                        </button>
                                      ))}
                                    {colleges.filter(col => col.name.toLowerCase().includes(collegeSearch.toLowerCase())).length === 0 && (
                                      <div className="p-4 text-center">
                                        <p className="text-xs font-bold text-slate-400">No results found</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Course Selection */}
                      {educationLevel === 'College' && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Course</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <button
                              type="button"
                              disabled={!selectedCollege}
                              onClick={() => toggleDropdown('course')}
                              className={`w-full flex items-center justify-between py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.course ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'} rounded-lg ${!selectedCollege ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'bg-gray-100'}`}
                            >
                              <span className={course ? 'text-slate-800' : 'text-gray-400'}>
                                {course || (selectedCollege ? 'Select Course' : 'Select college first')}
                              </span>
                              <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.course ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {isDropdownOpen.course && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]"
                                >
                                  <div className="p-3 border-b border-slate-50">
                                    <div className="relative flex items-center">
                                      <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                      <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={courseSearch}
                                        onChange={(e) => setCourseSearch(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                        autoFocus
                                      />
                                    </div>
                                  </div>

                                  <div className="overflow-y-auto custom-scrollbar pb-2">
                                    {filteredUndergrad.length > 0 && (
                                      <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        Undergraduate Programs
                                      </div>
                                    )}
                                    {filteredUndergrad.map((opt: string) => (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                          setCourse(opt);
                                          toggleDropdown('course');
                                          setCourseSearch('');
                                        }}
                                        className={`w-full px-6 py-3 text-left text-xs font-bold transition-colors border-b border-slate-50 last:border-0 ${course === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                      >
                                        {opt}
                                      </button>
                                    ))}

                                    {filteredGrad.length > 0 && (
                                      <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 border-t">
                                        Graduate Programs
                                      </div>
                                    )}
                                    {filteredGrad.map((opt: string) => (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                          setCourse(opt);
                                          toggleDropdown('course');
                                          setCourseSearch('');
                                        }}
                                        className={`w-full px-6 py-3 text-left text-xs font-bold transition-colors border-b border-slate-50 last:border-0 ${course === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                      >
                                        {opt}
                                      </button>
                                    ))}

                                    {filteredUndergrad.length === 0 && filteredGrad.length === 0 && (
                                      <div className="p-8 text-center">
                                        <p className="text-sm font-bold text-slate-400">
                                          {!selectedCollege ? 'Please select a college first' : `No courses found matching "${courseSearch}"`}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* School ID for WMSU College Students */}
                      {educationLevel === 'College' && isWMSU && (
                        <div className="relative flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="absolute left-4 text-gray-700 opacity-60">
                            <Lock className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            placeholder="School ID (9 Digits)"
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            required
                            className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                        </div>
                      )}

                      {educationLevel === 'High School' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          {/* Grade Level Select */}
                          <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Grade Level</label>
                            <div className="relative flex items-center">
                              <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleDropdown('gradeLevel')}
                                className={`w-full flex items-center justify-between bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.gradeLevel ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'}`}
                              >
                                <span className={gradeLevel ? `Grade ${gradeLevel}` : 'Select Grade Level'}>
                                  {gradeLevel ? `Grade ${gradeLevel}` : 'Select Grade Level'}
                                </span>
                                <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.gradeLevel ? 'rotate-180' : ''}`} />
                              </button>

                              <AnimatePresence>
                                {isDropdownOpen.gradeLevel && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                                  >
                                    {['7', '8', '9', '10', '11', '12'].map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => {
                                          setGradeLevel(level);
                                          if (!['11', '12'].includes(level)) setTrack('');
                                          toggleDropdown('gradeLevel');
                                        }}
                                        className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${gradeLevel === level ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                      >
                                        Grade {level}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* LRN for WMSU High School Students */}
                          {isWMSU && (
                            <div className="relative flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="absolute left-4 text-gray-700 opacity-60">
                                <Lock className="h-5 w-5" />
                              </div>
                              <input
                                type="text"
                                placeholder="LRN (12 Digits)"
                                value={lrn}
                                onChange={(e) => setLrn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                required
                                className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                              />
                            </div>
                          )}

                          {/* Conditional Track Selection for Grade 11-12 */}
                          {['11', '12'].includes(gradeLevel) && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                              <p className="mb-2 text-sm font-bold text-gray-700">Choose Track</p>
                              <div className="flex w-full rounded-lg bg-gray-100 p-1">
                                <button
                                  type="button"
                                  onClick={() => setTrack('Academic')}
                                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${track === 'Academic' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  Academic
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTrack('TechPro')}
                                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${track === 'TechPro' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  TechPro
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terms and Agreement Card & Checkbox (Shown on final step) */}
                  {((step === 4 && shouldShowEducationStep) || (step === 3 && !shouldShowEducationStep)) && (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-800" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Terms & Agreement
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          Scroll to read
                        </span>
                      </div>

                      {/* Scrollable Box to Read Terms */}
                      <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 space-y-2.5">
                        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/80 p-2.5 text-xs text-emerald-900 shadow-xs">
                          <p className="text-[11px] font-semibold leading-relaxed text-emerald-950">
                            Please review the terms and conditions governing your WMSU GCC account before completing your registration.
                          </p>
                        </div>
                        {TERMS_SECTIONS.map((sec, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <p className="font-bold text-slate-800 text-[11px]">
                              {sec.title}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{sec.content}</p>
                          </div>
                        ))}
                        <div className="pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100">
                          — End of Terms and Conditions —
                        </div>
                      </div>

                      {/* Agreement Checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600 cursor-pointer accent-emerald-800"
                        />
                        <span className="text-xs font-medium text-slate-700 leading-snug">
                          I have read, understood, and agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-emerald-900 font-bold underline hover:text-emerald-700 cursor-pointer"
                          >
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-emerald-900 font-bold underline hover:text-emerald-700 cursor-pointer"
                          >
                            Privacy Policy
                          </button>.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Global Navigation Buttons */}
                  <div className="mt-6 flex gap-3 pt-4 border-t border-gray-100">
                    {step > 1 && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          closeDropdowns();
                          setStep(step - 1);
                          window.scrollTo(0, 0);
                        }}
                        className="w-1/3 rounded-lg bg-gray-200 py-4 text-sm font-bold text-gray-700 transition-all hover:bg-gray-300 disabled:opacity-50"
                      >
                        Back
                      </button>
                    )}

                    {step === 1 && (
                      <button type="button" disabled={loading} onClick={() => { handleNextStep1(); window.scrollTo(0, 0); }} className="w-full rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50">Next</button>
                    )}
                    {step === 2 && (
                      <button type="button" disabled={loading} onClick={() => { handleNextStep2(); window.scrollTo(0, 0); }} className={step > 1 ? "w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50" : "w-full rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50"}>Next</button>
                    )}
                    {step === 3 && shouldShowEducationStep && (
                      <button type="button" disabled={loading} onClick={() => { handleNextStep3(); window.scrollTo(0, 0); }} className="w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50">Next</button>
                    )}
                    {step === 3 && !shouldShowEducationStep && (
                      <button type="submit" disabled={loading || !agreedTerms} className="w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating account...</>) : 'Complete Sign up'}
                      </button>
                    )}
                    {step === 4 && (
                      <button type="submit" disabled={loading || !agreedTerms} className="w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating account...</>) : 'Complete Sign up'}
                      </button>
                    )}
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-700">
                  Already have an account? <Link to="/login" className="ml-1 text-emerald-900 hover:underline font-bold">Sign In</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Terms and Agreement Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-hidden"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !loading) {
                setShowTermsModal(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Terms and Agreement</h3>
                    <p className="text-xs text-slate-500 font-bold">Western Mindanao State University Guidance & Counseling Center</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 hover:bg-slate-200/60 rounded-xl transition-all text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 disabled:opacity-50"
                  aria-label="Close terms modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Terms Content */}
              <div
                ref={termsScrollRef}
                onScroll={handleTermsScroll}
                className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[50vh] bg-slate-50/30"
              >
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-emerald-100/30 p-4 shadow-xs">
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-200/40 blur-xl pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        Review Required
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-900 border border-emerald-300/60">
                        Scroll to read
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/85 font-medium leading-relaxed">
                      Please review the terms and agreement carefully. You must scroll to the bottom of the document before accepting and completing your account registration.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {TERMS_SECTIONS.map((sec, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                      <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
                          {idx + 1}
                        </span>
                        {sec.title}
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-7">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom Marker */}
                <div className="pt-8 pb-2 text-center border-t border-slate-200/70 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  — End of Terms and Conditions —
                </div>
              </div>

              {/* Scroll Status & Action Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0">
                {/* Scroll Prompt / Success Indicator */}
                {!hasScrolledTerms ? (
                  <div
                    onClick={scrollToBottomTerms}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold cursor-pointer hover:bg-amber-100/70 transition-colors"
                    title="Click to scroll to bottom"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 animate-bounce text-amber-600 shrink-0" />
                      <span>Scroll down to the bottom to enable agreement</span>
                    </div>
                    <span className="text-[11px] underline text-amber-700 hover:text-amber-900 hidden sm:inline">Jump to bottom</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>You have reviewed the terms. You may now agree and create your account.</span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(false)}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAgreedTerms(true);
                      setShowTermsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold shadow-md bg-emerald-900 hover:bg-emerald-800 text-white cursor-pointer active:translate-y-0.5"
                  >
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    <span>I Understand and Agree</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}