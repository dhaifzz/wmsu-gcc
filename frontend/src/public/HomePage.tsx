import { useState, useEffect } from 'react';
import { ArrowRight, Users, Heart, Flag, MessageCircle, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import assessmentImg from '../assets/img/assessment-img.png';
import counselingImg from '../assets/img/counseling-img.png';
import shiftingImg from '../assets/img/shifting-img.png';
import ourServicesImg from '../assets/img/Presentation-GCC.jpg';
import ourServicesImg2 from '../assets/img/our-services2.png';
import ourServicesImg3 from '../assets/img/our-services3.png';

const HomePage = () => {
  const heroImages = [ourServicesImg, ourServicesImg2, ourServicesImg3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const features = [
    {
      image: counselingImg,
      title: "Counseling",
      path: "/services/counseling",
      description: "Counseling services are available for both students and outside clients. Appointments are required for consultations, which include the completion of the Personal Data Form and Counseling Form before sessions."
    },
    {
      image: assessmentImg,
      title: "Assessment for Students",
      path: "/services/assessment",
      description: "Conducts assessments for students taking the DASS-21 Test (College) and DASS-Y Test (High School). Students must schedule an appointment and complete the required forms before the assessment."
    },
    {
      image: shiftingImg,
      title: "Shifting Exam",
      path: "/services/shifting",
      description: "Students changing programs. Applicants must schedule an appointment and complete the required forms before taking the exam."
    }
  ];

  const services = [
    { name: "Individual Counseling", icon: <Users /> },
    { name: "Career Guidance", icon: <Flag /> },
    { name: "Crisis Intervention", icon: <MessageCircle /> },
    { name: "Peer Support", icon: <Heart /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image Carousel with Overlay */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, index) => (
            <img 
              key={index}
              src={img} 
              alt={`Hero Background ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-transparent"></div>
        </div>

        {/* Animated Spheres */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-bounce duration-[10000ms]"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Take care of your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 pr-4">
                Mental Health
              </span> <br />
            </h1>
            <p className="text-xl text-emerald-50/80 mb-10 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              The WMSU Guidance and Counseling Center provides a safe space for growth, 
              empowerment, and emotional support. We are here to help you shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <a 
                href="/register" 
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-2xl shadow-emerald-900/40 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
              >
                Register Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/about" 
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>


      </section>

      {/* Need Help? Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-emerald-600 text-sm font-black uppercase tracking-[0.2em] mb-4">Support Services</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Need Help? Start Here
            </h3>
            <p className="text-lg text-slate-600 font-medium">
              We provide comprehensive support services to help students navigate their academic journey and personal development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <a 
                key={index}
                href={feature.path}
                className="group flex flex-col"
              >
                <div className="relative h-64 mb-8 overflow-hidden rounded-[2rem] border-2 border-emerald-800 shadow-xl shadow-slate-200 transition-transform duration-500 group-hover:-translate-y-2">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <ChevronRight className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{feature.title}</h4>
                </div>
                
                <p className="text-slate-600 font-medium leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-4 text-emerald-700 font-black text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read more about {feature.title.split(' ')[0]} <ArrowRight size={16} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-emerald-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-emerald-400 text-sm font-black uppercase tracking-[0.2em] mb-4">Our Services</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-8">
                We're here to help <br /> you grow.
              </h3>
              <p className="text-emerald-100/70 text-lg mb-10 font-medium">
                Our center offers a variety of services tailored to meet the diverse 
                needs of the WMSU student body. From mental health support to 
                career planning, we've got you covered.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 text-white font-bold bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-emerald-400">{service.icon}</span>
                    {service.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <img 
                  src={ourServicesImg} 
                  alt="Our Services" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-emerald-900/20"></div>
              </div>
              {/* Floating Element */}
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-2xl animate-bounce duration-[4000ms]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <MessageCircle />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black">Professional Support</p>
                    <p className="text-slate-500 text-sm font-bold">Mon - Fri: 8AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
