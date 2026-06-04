import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, ShieldCheck, RefreshCcw, Phone, User, BookOpen, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config';

const StudentManage = () => {
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    fullName: '',
    phone: '',
    role: 'student',
    status: 'active' // Active by default when created internally by admin
  });
  const [selectedCourses, setSelectedCourses] = useState(["UPSC"]);
  const [availableCourses, setAvailableCourses] = useState(["UPSC", "TNPSC", "RRB"]);
  const [loading, setLoading] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  React.useEffect(() => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (selectedCourses.length === 0) {
      showToast("Please assign at least one course for enrollment!", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/register`, {
        ...form,
        courses: selectedCourses,
        status: 'active' // Explicitly send active status
      });
      showToast(`Success: Account ${form.username} (${form.fullName}) is now created and active.`, "success");
      setForm({ username: '', password: '', fullName: '', phone: '', role: 'student', status: 'active' });
      setSelectedCourses(["UPSC"]);
    } catch (error) {
      showToast(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate a random ID (e.g., BS-2026-X123)
  const autoGenerateID = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setForm({ ...form, username: `BS-2026-${random}` });
  };

  return (
    <div className="p-4 animate-in fade-in duration-500">
      <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-4xl">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
          <div>
            <h3 className="text-xl font-black text-[#1a3a5f] flex items-center gap-2">
              <UserPlus className="text-[#c5a059]" /> Create Student Access
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Enroll new candidates to the portal</p>
          </div>
          <ShieldCheck className="text-green-500/20" size={40} />
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Student's full name" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm"
                  value={form.fullName}
                  onChange={(e) => setForm({...form, fullName: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="tel" 
                  placeholder="10-digit mobile number" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Enrollment ID Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Enrollment ID (Email or Code)</label>
                <button 
                  type="button" 
                  onClick={autoGenerateID}
                  className="text-[10px] font-bold text-[#c5a059] flex items-center gap-1 hover:underline"
                >
                  <RefreshCcw size={10} /> Auto-Generate ID
                </button>
              </div>
              <input 
                type="text" 
                placeholder="e.g. name@example.com or BS-2026-101" 
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                required 
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Initial Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Assign a secure password" 
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required 
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

          </div>

          {/* Dynamic Multiple Course Access Selection - Dropdown */}
          <div className="space-y-2 pt-4 border-t border-gray-100 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
              <BookOpen size={12} className="text-[#c5a059]" /> Assign Learning Program Access (Multi-Select Dropdown)
            </label>
            <div className="relative max-w-md">
              <button
                type="button"
                onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-left flex justify-between items-center transition-all text-sm"
              >
                <span>
                  {selectedCourses.length === 0 
                    ? "Choose courses to assign..." 
                    : selectedCourses.join(", ")}
                </span>
                <ChevronDown size={18} className={`text-[#c5a059] transition-transform duration-250 ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCourseDropdownOpen && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
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

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-[#1a3a5f] hover:bg-[#c5a059] text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {loading ? 'CREATING...' : 'ACTIVATE ACCOUNT'}
            </button>
          </div>
        </form>
      </section>

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

export default StudentManage;