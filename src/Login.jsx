import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User as UserIcon, ShieldCheck, UserPlus, ArrowRight, Phone, Mail, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from './config';

const Portal = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState(["UPSC"]);
  const [availableCourses, setAvailableCourses] = useState(["UPSC", "TNPSC", "RRB"]);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/courses`);
        setAvailableCourses(res.data);
      } catch (err) {
        console.error("Error loading dynamic courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Unified State for all form fields
  const [formData, setFormData] = useState({
    username: '',      // Used as Email/ID
    password: '',
    confirmPassword: '',
    fullName: '',      // New Field
    phone: ''          // New Field
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Registration Validation
    if (isRegistering && formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    if (isRegistering && selectedCourses.length === 0) {
      showToast("Please select at least one course program for enrollment!", "error");
      return;
    }

    setLoading(true);

    const endpoint = isRegistering 
      ? `${API_BASE_URL}/api/users/register` 
      : `${API_BASE_URL}/api/login`;

    try {
      const response = await axios.post(endpoint, {
        username: formData.username,
        password: formData.password,
        fullName: isRegistering ? formData.fullName : undefined,
        phone: isRegistering ? formData.phone : undefined,
        courses: isRegistering ? selectedCourses : undefined,
        role: isAdmin ? 'admin' : 'student'
      });

      if (response.data.success) {
        if (isRegistering) {
          showToast("Registration Successful! Admin has been notified for activation.", "success");
          setIsRegistering(false); 
          setSelectedCourses(["UPSC"]);
          setFormData({ username: '', password: '', confirmPassword: '', fullName: '', phone: '' });
        } else {
          const user = response.data.user;
          
          // Save session data
          localStorage.setItem('student_id', user.username);
          localStorage.setItem('user_role', user.role);
          localStorage.setItem('user_status', user.status); 
          localStorage.setItem('student_courses', user.courses || 'UPSC'); // Store approved courses

          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/student'); 
          }
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Action failed. Please check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-[#1a3a5f] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
            {isRegistering ? <UserPlus size={100} /> : <ShieldCheck size={100} />}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter relative z-10 uppercase">
            Bluestone <span className="text-[#c5a059]">IAS</span>
          </h1>
          <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 relative z-10">
            {isRegistering ? 'Student Registration' : 'Secure Access Gateway'}
          </p>
        </div>

        <div className="px-10 py-8">
          {/* Role Switcher (Hidden during Registration) */}
          {!isRegistering && (
            <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
              <button
                onClick={() => setIsAdmin(false)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all ${
                  !isAdmin ? 'bg-white text-[#1a3a5f] shadow-sm' : 'text-gray-400'
                }`}
              > Student </button>
              <button
                onClick={() => setIsAdmin(true)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all ${
                  isAdmin ? 'bg-white text-[#1a3a5f] shadow-sm' : 'text-gray-400'
                }`}
              > Admin </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Registration Only) */}
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c5a059] outline-none font-bold text-[#1a3a5f] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Phone Number (Registration Only) */}
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit Mobile Number"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c5a059] outline-none font-bold text-[#1a3a5f] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email / Username */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                {isAdmin ? 'Admin ID' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  name="username"
                  type={isAdmin ? "text" : "email"}
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={isAdmin ? "Admin Code" : "name@example.com"}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c5a059] outline-none font-bold text-[#1a3a5f] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c5a059] outline-none font-bold text-[#1a3a5f] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Registration Only) */}
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 outline-none font-bold text-[#1a3a5f] transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-[#c5a059]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Select Courses (Registration Only - Dynamic Dropdown) */}
            {isRegistering && (
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Select Course Programs</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-left flex justify-between items-center transition-all"
                  >
                    <span className="text-sm">
                      {selectedCourses.length === 0 
                        ? "Choose programs for enrollment..." 
                        : selectedCourses.join(", ")}
                    </span>
                    <ChevronDown size={18} className={`text-[#c5a059] transition-transform duration-250 ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isCourseDropdownOpen && (
                    <>
                      {/* Clicking outside closes the dropdown */}
                      <div className="fixed inset-0 z-30" onClick={() => setIsCourseDropdownOpen(false)} />
                      
                      <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 space-y-1 z-40 max-h-56 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
                        {availableCourses.map(course => {
                          const isSelected = selectedCourses.includes(course);
                          return (
                            <button
                              key={course}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCourses(selectedCourses.filter(c => c !== course));
                                } else {
                                  setSelectedCourses([...selectedCourses, course]);
                                }
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors text-left"
                            >
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'bg-[#c5a059] border-[#c5a059] text-white' : 'border-slate-200 bg-white'
                              }`}>
                                {isSelected && <span className="text-[10px] font-black">✓</span>}
                              </div>
                              <span className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">{course}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3a5f] hover:bg-[#c5a059] text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'PROCESSING...' : (
                <>
                  {isRegistering ? 'CREATE MY ACCOUNT' : `ENTER ${isAdmin ? 'ADMIN' : 'STUDENT'} PORTAL`}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle */}
          {!isAdmin && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm font-medium">
                {isRegistering ? "Already have an account?" : "New to Bluestone IAS?"}
                <button 
                  type="button"
                  onClick={() => { 
                    setIsRegistering(!isRegistering); 
                    setFormData({ username: '', password: '', confirmPassword: '', fullName: '', phone: '' });
                  }}
                  className="ml-2 text-[#c5a059] font-black hover:underline"
                >
                  {isRegistering ? "Login Now" : "Register Here"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- PREMIUM TOAST OVERLAY --- */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-wider border transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : 'bg-rose-500 text-white border-rose-400'
          }`}>
            <span className="text-sm">{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portal;