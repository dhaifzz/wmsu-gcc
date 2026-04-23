import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, UserCircle, Calendar, Briefcase, Users, Building, GraduationCap, BookOpen, Phone, MapPin, Map, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import authBg from '../assets/img/Auth-Background.jpg';
import gccLogo from '../assets/logos/GCC.png';
import wmsuLogo from '../assets/logos/WMSU.png';

export default function Register() {
  const [step, setStep] = useState(1);
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

  const [isStudent, setIsStudent] = useState<boolean>(true);

  const [school, setSchool] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [course, setCourse] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [track, setTrack] = useState('');
  const [isFaculty, setIsFaculty] = useState<boolean>(false);
  const [department, setDepartment] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Reset scroll position when step changes
  useEffect(() => {
    const scrollContainer = document.getElementById('register-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [step]);

  const handleNextStep1 = () => {
    setError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError('');
    setStep(3);
  };

  const handleNextStep3 = () => {
    setError('');
    setStep(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Handle registration logic here
    console.log('Registration submitted:', {
      email, password, firstName, middleInitial, lastName, sex, birthdate, occupation, school, course, gradeLevel, track, department: isFaculty ? department : ""
    });
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
        className="relative z-30 flex w-full max-w-[1000px] max-h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl md:flex-row"
      >
        {/* Back to Home Button */}
        <Link
          to="/"
          className="absolute top-6 left-8 z-50 flex items-center gap-2 text-sm font-bold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-800 bg-white rounded-2xl px-4 py-2.5 shadow-md group"
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
              <img src={wmsuLogo} alt="WMSU Logo" className="h-24 w-24 object-contain drop-shadow-md" />
              <img src={gccLogo} alt="GCC Logo" className="h-24 w-24 object-contain drop-shadow-md" />
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
                <div className="md:hidden mb-6 flex gap-4 justify-center">
                  <img src={wmsuLogo} alt="WMSU Logo" className="h-14 w-14 object-contain" />
                  <img src={gccLogo} alt="GCC Logo" className="h-14 w-14 object-contain" />
                </div>

                <h2 className="mb-2 text-4xl font-bold text-gray-800">Sign up</h2>
                <p className="mb-6 text-xs text-gray-500 font-medium">Create your account to get started with GCC.</p>

                {/* Student Check (Only in Step 1) */}
                {step === 1 && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="mb-2 text-sm font-bold text-gray-700">Are you a student?</p>
                    <div className="flex w-full rounded-xl bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setIsStudent(true)}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isStudent === true ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Yes, I am
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsStudent(false)}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isStudent === false ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                  {isStudent && (
                    <>
                      <div className={`h-1 flex-1 mx-1 rounded transition-colors duration-300 mb-4 ${step >= 4 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-colors duration-300 ${step >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>4</div>
                        <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${step >= 4 ? 'text-emerald-700' : 'text-gray-400'}`}>Education</span>
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                    {error}
                  </div>
                )}

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
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                          }}
                          required
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
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
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError('');
                          }}
                          required
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-20 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
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
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (error) setError('');
                          }}
                          required
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-20 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
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
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (error) setError('');
                            }}
                            required
                            className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                        </div>

                        {/* Middle Initial */}
                        <div className="relative flex w-24 items-center shrink-0">
                          <input
                            type="text"
                            placeholder="M.I."
                            value={middleInitial}
                            onChange={(e) => setMiddleInitial(e.target.value)}
                            maxLength={2}
                            className="w-full rounded-xl bg-gray-100 py-4 px-4 text-center text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
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
                            setLastName(e.target.value);
                            if (error) setError('');
                          }}
                          required
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
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
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      {/* Address Grid: City and Barangay */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex flex-1 items-center">
                          <div className="absolute left-4 text-gray-700">
                            <Building className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                        </div>
                        <div className="relative flex flex-1 items-center">
                          <div className="absolute left-4 text-gray-700">
                            <Map className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            placeholder="Barangay"
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            required
                            className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
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
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Additional Details */}
                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      {/* Sex */}
                      <div className="relative flex items-center">
                        <div className="absolute left-4 text-gray-700">
                          <Users className="h-5 w-5" />
                        </div>
                        <select
                          value={sex}
                          onChange={(e) => setSex(e.target.value)}
                          required
                          className={`w-full appearance-none rounded-xl bg-gray-100 py-4 pl-12 pr-10 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${sex ? 'text-slate-800' : 'text-gray-400'}`}
                        >
                          <option value="" disabled className="text-gray-400">Select Sex</option>
                          <option value="Male" className="text-gray-700">Male</option>
                          <option value="Female" className="text-gray-700">Female</option>
                          <option value="Prefer not to say" className="text-gray-700">Prefer not to say</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>

                      {/* Birthdate */}
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
                          className={`w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${birthdate ? 'text-gray-700' : 'text-gray-400'}`}
                        />
                      </div>

                      {/* Faculty Check */}
                      {!isStudent && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="mb-2">
                            <p className="mb-2 text-sm font-bold text-gray-700">Are you a Faculty member?</p>
                            <div className="flex w-full rounded-xl bg-gray-100 p-1">
                              <button
                                type="button"
                                onClick={() => setIsFaculty(true)}
                                className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isFaculty === true ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsFaculty(false);
                                  setDepartment('');
                                }}
                                className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${isFaculty === false ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                              >
                                No
                              </button>
                            </div>
                          </div>

                          {/* Department Selection for Faculty */}
                          {isFaculty && (
                            <div className="relative flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="absolute left-4 text-gray-700 opacity-60">
                                <Building className="h-5 w-5" />
                              </div>
                              <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                                className={`w-full appearance-none rounded-xl bg-gray-100 py-4 pl-12 pr-10 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${department ? 'text-slate-800' : 'text-gray-400'}`}
                              >
                                <option value="" disabled className="text-gray-400">Select Department/College</option>
                                <option value="CSM" className="text-gray-700">College of Science and Mathematics</option>
                                <option value="CLA" className="text-gray-700">College of Liberal Arts</option>
                                <option value="CTE" className="text-gray-700">College of Teacher Education</option>
                                <option value="COE" className="text-gray-700">College of Engineering</option>
                                <option value="CA" className="text-gray-700">College of Agriculture</option>
                                <option value="CN" className="text-gray-700">College of Nursing</option>
                                <option value="CCJE" className="text-gray-700">College of Criminal Justice Education</option>
                                <option value="CSWCD" className="text-gray-700">College of Social Work and Community Development</option>
                                <option value="CHomeE" className="text-gray-700">College of Home Economics</option>
                                <option value="CFCES" className="text-gray-700">College of Forestry and Environmental Studies</option>
                                <option value="CPADS" className="text-gray-700">College of Public Administration and Development Studies</option>
                                <option value="ILS" className="text-gray-700">Integrated Laboratory School</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Occupation */}
                      {!isStudent && !isFaculty && (
                        <div className="relative flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="absolute left-4 text-gray-700 opacity-60">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <select
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className={`w-full appearance-none rounded-xl bg-gray-100 py-4 pl-12 pr-10 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${occupation ? 'text-slate-800' : 'text-gray-400'}`}
                          >
                            <option value="" className="text-gray-400">Occupation (Optional)</option>
                            <option value="Employee" className="text-gray-700">Employee</option>
                            <option value="Self Employed" className="text-gray-700">Self Employed</option>
                            <option value="Unemployed" className="text-gray-700">Unemployed</option>
                            <option value="Prefer not to say" className="text-gray-700">Prefer not to say</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: Education Details */}
                  {step === 4 && isStudent && (
                    <div className="flex flex-col gap-4">

                      {/* School */}
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
                          className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                        />
                      </div>

                      {/* Education Level Selection */}
                      <div className="mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="mb-2 text-sm font-bold text-gray-700">Education Level</p>
                        <div className="flex w-full rounded-xl bg-gray-100 p-1">
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
                        <div className="relative flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="absolute left-4 text-gray-700 opacity-60">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <input
                            type="text"
                            placeholder="Course"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            required
                            className="w-full rounded-xl bg-gray-100 py-4 pl-12 pr-4 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                          />
                        </div>
                      )}

                      {educationLevel === 'High School' && (
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          {/* Grade Level Select */}
                          <div className="relative flex items-center">
                            <div className="absolute left-4 text-gray-700 opacity-60">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <select
                              value={gradeLevel}
                              onChange={(e) => {
                                setGradeLevel(e.target.value);
                                if (!['11', '12'].includes(e.target.value)) setTrack('');
                              }}
                              required
                              className={`w-full appearance-none rounded-xl bg-gray-100 py-4 pl-12 pr-10 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${gradeLevel ? 'text-slate-800' : 'text-gray-400'}`}
                            >
                              <option value="" disabled className="text-gray-400">Select Grade Level</option>
                              <option value="7" className="text-gray-700">Grade 7</option>
                              <option value="8" className="text-gray-700">Grade 8</option>
                              <option value="9" className="text-gray-700">Grade 9</option>
                              <option value="10" className="text-gray-700">Grade 10</option>
                              <option value="11" className="text-gray-700">Grade 11</option>
                              <option value="12" className="text-gray-700">Grade 12</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>

                          {/* Conditional Track Selection for Grade 11-12 */}
                          {['11', '12'].includes(gradeLevel) && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                              <p className="mb-2 text-sm font-bold text-gray-700">Choose Track</p>
                              <div className="flex w-full rounded-xl bg-gray-100 p-1">
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
                        onClick={() => {
                          setStep(step - 1);
                          setError('');
                          window.scrollTo(0, 0);
                        }}
                        className="w-1/3 rounded-xl bg-gray-200 py-4 text-sm font-bold text-gray-700 transition-all hover:bg-gray-300"
                      >
                        Back
                      </button>
                    )}

                    {step === 1 && (
                      <button type="button" onClick={() => { handleNextStep1(); window.scrollTo(0, 0); }} className="w-full rounded-xl bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0">Next</button>
                    )}
                    {step === 2 && (
                      <button type="button" onClick={() => { handleNextStep2(); window.scrollTo(0, 0); }} className={step > 1 ? "w-2/3 rounded-xl bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0" : "w-full rounded-xl bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0"}>Next</button>
                    )}
                    {step === 3 && isStudent && (
                      <button type="button" onClick={() => { handleNextStep3(); window.scrollTo(0, 0); }} className="w-2/3 rounded-xl bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0">Next</button>
                    )}
                    {step === 3 && !isStudent && (
                      <button type="submit" className="w-2/3 rounded-xl bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0">Complete Sign up</button>
                    )}
                    {step === 4 && (
                      <button type="submit" className="w-2/3 rounded-xl bg-emerald-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0">Complete Sign up</button>
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
