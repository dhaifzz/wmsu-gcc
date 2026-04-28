import { useState, useEffect, useMemo } from 'react';
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
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authBg from '../assets/img/Auth-Background.jpg';
import gccLogoAsset from '../assets/logos/GCC.png';
import wmsuLogoAsset from '../assets/logos/WMSU.png';
import { authApi, cmsApi } from '../lib/api';
import { showToast } from '../components/modal-notification/toast';
import { showAlert } from '../components/modal-notification/sweetalert';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logos, setLogos] = useState({
    wmsuLogo: wmsuLogoAsset,
    gccLogo: gccLogoAsset
  });
  const [undergradCourses, setUndergradCourses] = useState<string[]>([]);
  const [gradCourses, setGradCourses] = useState<string[]>([]);
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
        const [logoRes, systemRes] = await Promise.all([
          cmsApi.getContent('logos'),
          cmsApi.getContent('system')
        ]);
        
        if (logoRes.ok && logoRes.data) {
          setLogos({
            wmsuLogo: logoRes.data.wmsuLogo || wmsuLogoAsset,
            gccLogo: logoRes.data.gccLogo || gccLogoAsset
          });
        }

        if (systemRes.ok && systemRes.data && ((systemRes.data.undergradCourses && systemRes.data.undergradCourses.length > 0) || (systemRes.data.gradCourses && systemRes.data.gradCourses.length > 0))) {
          setUndergradCourses(systemRes.data.undergradCourses || []);
          setGradCourses(systemRes.data.gradCourses || []);
          setOccupations(systemRes.data.occupations || []);
        } else {
          // Fallback if DB is empty
          setUndergradCourses([
            "Associate in Computer Technology – Application Development",
            "Associate in Computer Technology – Networking",
            "BA Asian Studies Major in ASEAN Community",
            "BA English",
            "BA History",
            "BA Mass Communication – Broadcasting",
            "BA Mass Communication – Journalism",
            "BA Political Science",
            "Bachelor of Agricultural Technology",
            "Bachelor of Culture and Arts Education",
            "Bachelor of Early Childhood Education",
            "Bachelor of Elementary Education",
            "Bachelor of Laws",
            "Bachelor of Physical Education",
            "Bachelor of Public Administration",
            "Bachelor of Secondary Education",
            "Bachelor of Special Needs Education",
            "BS Accountancy",
            "BS Agriculture",
            "BS Agribusiness",
            "BS Agricultural and Biosystems Engineering",
            "BS Agroforestry",
            "BS Architecture",
            "BS Civil Engineering",
            "BS Community Development",
            "BS Computer Engineering",
            "BS Computer Science",
            "BS Criminology",
            "BS Economics",
            "BS Electrical Engineering",
            "BS Electronics Engineering",
            "BS Environmental Engineering",
            "BS Environmental Science",
            "BS Exercise and Sports Sciences",
            "BS Food Technology",
            "BS Forestry",
            "BS Geodetic Engineering",
            "BS Home Economics",
            "BS Hospitality Management",
            "BS Industrial Engineering",
            "BS Information Technology",
            "BS Mechanical Engineering",
            "BS Nursing",
            "BS Nutrition and Dietetics",
            "BS Psychology",
            "BS Sanitary Engineering",
            "BS Social Work"
          ]);
          setGradCourses([
            "Diploma in Physical Education",
            "MA Education",
            "MA Education – Home Economics",
            "MA Education – Nutrition and Health Education",
            "MA Nursing – Nursing Education",
            "MA Nursing – Nursing Management",
            "Master in Food Processing and Management",
            "Master in Information Technology",
            "Master in Physical Education",
            "Master of Public Administration",
            "MS Agronomy",
            "MS Social Work",
            "Ph.D. in Education"
          ]);
          setOccupations(["Student", "Employee", "Self Employed", "Unemployed", "Prefer not to say"]);
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
    department: false,
    occupation: false,
    course: false,
    city: false,
    barangay: false
  });

  const filteredUndergrad = undergradCourses.filter(c => c.toLowerCase().includes(courseSearch.toLowerCase()));
  const filteredGrad = gradCourses.filter(c => c.toLowerCase().includes(courseSearch.toLowerCase()));
  const filteredOccs = (occupations.length > 0 ? occupations : ['Student', 'Employee', 'Self Employed', 'Unemployed', 'Prefer not to say'])
    .filter(o => o.toLowerCase().includes(occSearch.toLowerCase()));

  const toggleDropdown = (key: string) => {
    setIsDropdownOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const closeDropdowns = () => {
    setIsDropdownOpen({ sex: false, gradeLevel: false, department: false, occupation: false, course: false, city: false });
  };


  const [isWMSU, setIsWMSU] = useState<boolean>(true);

  const [school, setSchool] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [course, setCourse] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [track, setTrack] = useState('');
  const [isFaculty, setIsFaculty] = useState<boolean>(false);
  const [department, setDepartment] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [lrn, setLrn] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset scroll position when step changes
  useEffect(() => {
    const scrollContainer = document.getElementById('register-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [step]);

  const handleNextStep1 = () => {
    if (!email.trim()) { showToast.error('Email is required.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showToast.error('Please enter a valid email address.'); return; }
    if (password.length < 8) { showToast.error('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(password)) { showToast.error('Password must contain at least one uppercase letter.'); return; }
    if (!/[0-9]/.test(password)) { showToast.error('Password must contain at least one number.'); return; }
    if (password !== confirmPassword) { showToast.error('Passwords do not match.'); return; }
    
    closeDropdowns();
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!firstName.trim()) { showToast.error('First name is required.'); return; }
    if (!lastName.trim()) { showToast.error('Last name is required.'); return; }
    if (!contactNumber.trim()) { showToast.error('Contact number is required.'); return; }
    const phoneRegex = /^(09\d{9}|\+639\d{9})$/;
    if (!phoneRegex.test(contactNumber.replace(/\s/g, ''))) { showToast.error('Enter a valid PH number (09xxxxxxxxx or +639xxxxxxxxx).'); return; }
    if (!city.trim()) { showToast.error('City is required.'); return; }
    if (!barangay.trim()) { showToast.error('Barangay is required.'); return; }
    if (!street.trim()) { showToast.error('Street / House No. is required.'); return; }
    
    closeDropdowns();
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (!sex) { showToast.error('Please select your sex.'); return; }
    if (!birthdate) { showToast.error('Birthdate is required.'); return; }
    if (isWMSU && isFaculty && !department) { showToast.error('Please select your department.'); return; }
    if (isWMSU && isFaculty && !employeeId.trim()) { showToast.error('Employee ID is required.'); return; }
    if (isWMSU && isFaculty && !/^\d{6}$/.test(employeeId.trim())) { showToast.error('Employee ID must be exactly 6 digits.'); return; }
    if (!isWMSU && !occupation) { showToast.error('Please select your occupation.'); return; }
    
    closeDropdowns();
    setStep(4);
  };

  const validateStep4 = (): boolean => {
    if (!educationLevel) { showToast.error('Please select an education level.'); return false; }
    if (educationLevel === 'College' && !course.trim()) { showToast.error('Course is required.'); return false; }
    if (educationLevel === 'College' && isWMSU && !/^\d{9}$/.test(schoolId.trim())) { showToast.error('School ID must be exactly 9 digits.'); return false; }
    if (educationLevel === 'High School' && !gradeLevel) { showToast.error('Grade level is required.'); return false; }
    if (educationLevel === 'High School' && isWMSU && !/^\d{12}$/.test(lrn.trim())) { showToast.error('LRN must be exactly 12 digits.'); return false; }
    if (educationLevel === 'High School' && ['11', '12'].includes(gradeLevel) && !track) { showToast.error('Please select a track.'); return false; }
    if (!isWMSU && !school.trim()) { showToast.error('School name is required.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If on step 4, validate education fields first
    if (step === 4 && !validateStep4()) return;

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
        department: isFaculty ? department : '',
        occupation: !isWMSU ? occupation : '',
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
                <div className="md:hidden mb-6 mt-14 flex gap-4 justify-center">
                  <img src={logos.wmsuLogo} alt="WMSU Logo" className="h-14 w-14 object-contain" />
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
                        onClick={() => setIsWMSU(true)}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isWMSU === true ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Yes, I am
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWMSU(false);
                          setIsFaculty(false);
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
                  {((isWMSU && !isFaculty) || (!isWMSU && occupation === 'Student')) && (
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
                          className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      {/* Password Input */}
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

                      {/* Confirm Password Input */}
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
                            onChange={(e) => setFirstName(e.target.value)}
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
                            onChange={(e) => setMiddleInitial(e.target.value)}
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
                          onChange={(e) => setLastName(e.target.value)}
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
                          placeholder="Contact Number"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          required
                          className="w-full rounded-lg bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      {/* Address Grid: City and Barangay */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* City Selection */}
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-700 pointer-events-none">
                            <Building className="h-5 w-5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleDropdown('city')}
                            className={`w-full flex items-center justify-between bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.city ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'} rounded-lg`}
                          >
                            <span className={city ? 'text-slate-800' : 'text-gray-400'}>
                              {city || 'Select City'}
                            </span>
                            <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.city ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen.city && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
                              >
                                <div className="p-3 border-b border-slate-50">
                                  <div className="relative flex items-center">
                                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Search city..."
                                      value={citySearch}
                                      onChange={(e) => setCitySearch(e.target.value)}
                                      className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar">
                                  {filteredCities.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        setCity(opt);
                                        setBarangay(''); 
                                        toggleDropdown('city');
                                        setCitySearch('');
                                      }}
                                      className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${city === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Barangay Selection */}
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-700 pointer-events-none">
                            <Map className="h-5 w-5" />
                          </div>
                          
                          <button
                            type="button"
                            disabled={!city}
                            onClick={() => toggleDropdown('barangay')}
                            className={`w-full flex items-center justify-between py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.barangay ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'} rounded-lg ${!city ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'bg-gray-100'}`}
                          >
                            <span className={barangay ? 'text-slate-800' : 'text-gray-400'}>
                              {barangay || (city ? 'Select or Type Barangay' : 'Select city first')}
                            </span>
                            <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.barangay ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen.barangay && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]"
                              >
                                <div className="p-3 border-b border-slate-50">
                                  <div className="relative flex items-center">
                                    <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                                    <input
                                      type="text"
                                      placeholder="Type your barangay..."
                                      value={barangay || barangaySearch}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setBarangaySearch(val);
                                        // If not Zamboanga, update barangay state directly as they type
                                        if (city !== 'Zamboanga City') {
                                          setBarangay(val);
                                        }
                                      }}
                                      className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto custom-scrollbar">
                                  {filteredBarangays.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        setBarangay(opt);
                                        toggleDropdown('barangay');
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
                                        {city ? 'No barangays found for this city' : 'Select a city first'}
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
                          placeholder="Street / House No."
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          required
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

                      {/* Department Selection for Faculty */}
                      {isWMSU && isFaculty && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Department / College</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                              <Building className="h-5 w-5" />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDropdown('department')}
                              className={`w-full flex items-center justify-between bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.department ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'}`}
                            >
                              <span className={department ? 'text-slate-800' : 'text-gray-400'}>
                                {department || 'Select Department/College'}
                              </span>
                              <ChevronDown size={18} className={`text-emerald-600 transition-transform ${isDropdownOpen.department ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {isDropdownOpen.department && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                                >
                                  {[
                                    { val: "CSM", label: "College of Science and Mathematics" },
                                    { val: "CLA", label: "College of Liberal Arts" },
                                    { val: "CTE", label: "College of Teacher Education" },
                                    { val: "COE", label: "College of Engineering" },
                                    { val: "CA", label: "College of Agriculture" },
                                    { val: "CN", label: "College of Nursing" },
                                    { val: "CCJE", label: "College of Criminal Justice Education" },
                                    { val: "CSWCD", label: "College of Social Work and Community Development" },
                                    { val: "CHomeE", label: "College of Home Economics" },
                                    { val: "CFCES", label: "College of Forestry and Environmental Studies" },
                                    { val: "CPADS", label: "College of Public Administration and Development Studies" },
                                    { val: "ILS", label: "Integrated Laboratory School" }
                                  ].map((opt) => (
                                    <button
                                      key={opt.val}
                                      type="button"
                                      onClick={() => {
                                        setDepartment(opt.val);
                                        toggleDropdown('department');
                                      }}
                                      className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${department === opt.val ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-emerald-50/50'}`}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Employee ID for Faculty */}
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

                      {/* Occupation */}
                      {!isWMSU && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Occupation</label>
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
                      )}
                    </div>
                  )}

                  {/* STEP 4: Education Details */}
                  {step === 4 && ((isWMSU && !isFaculty) || (!isWMSU && occupation === 'Student')) && (
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
                              onChange={(e) => setSchool(e.target.value)}
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

                      {/* Conditional Fields */}
                      {educationLevel === 'College' && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2 block">Course</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 z-10 text-gray-700 pointer-events-none">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDropdown('course')}
                              className={`w-full flex items-center justify-between bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold transition-all border-2 ${isDropdownOpen.course ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10' : 'border-transparent'}`}
                            >
                              <span className={course ? 'text-slate-800' : 'text-gray-400'}>
                                {course || 'Select Course'}
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
                                  {/* Search Input */}
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
                                    {/* Undergraduate Section */}
                                    {filteredUndergrad.length > 0 && (
                                      <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                        Undergraduate Programs
                                      </div>
                                    )}
                                    {filteredUndergrad.map((opt) => (
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

                                    {/* Graduate Section */}
                                    {filteredGrad.length > 0 && (
                                      <div className="px-4 py-2 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 border-t">
                                        Graduate Programs
                                      </div>
                                    )}
                                    {filteredGrad.map((opt) => (
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
                                        <p className="text-sm font-bold text-slate-400">No courses found matching "{courseSearch}"</p>
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
                                <span className={gradeLevel ? 'text-slate-800' : 'text-gray-400'}>
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
                    {step === 3 && ((isWMSU && !isFaculty) || (!isWMSU && occupation === 'Student')) && (
                      <button type="button" disabled={loading} onClick={() => { handleNextStep3(); window.scrollTo(0, 0); }} className="w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-50">Next</button>
                    )}
                    {step === 3 && !((isWMSU && !isFaculty) || (!isWMSU && occupation === 'Student')) && (
                      <button type="submit" disabled={loading} className="w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-2">
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating account...</>) : 'Complete Sign up'}
                      </button>
                    )}
                    {step === 4 && (
                      <button type="submit" disabled={loading} className="w-2/3 rounded-lg bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-2">
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
    </div>
  );
}