import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User as UserIcon, ShieldCheck, UserPlus, ArrowRight, Phone, Mail } from 'lucide-react';

const Portal = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    const endpoint = isRegistering 
      ? 'https://bluestoneinternationalpreschool.com/bias_api/api/users/register' 
      : 'https://bluestoneinternationalpreschool.com/bias_api/api/login';

    try {
      const response = await axios.post(endpoint, {
        username: formData.username,
        password: formData.password,
        fullName: isRegistering ? formData.fullName : undefined,
        phone: isRegistering ? formData.phone : undefined,
        role: isAdmin ? 'admin' : 'student'
      });

      if (response.data.success) {
        if (isRegistering) {
          alert("Registration Successful! Admin has been notified for activation.");
          setIsRegistering(false); 
          setFormData({ username: '', password: '', confirmPassword: '', fullName: '', phone: '' });
        } else {
          const user = response.data.user;
          
          // Save session data
          localStorage.setItem('student_id', user.username);
          localStorage.setItem('user_role', user.role);
          localStorage.setItem('user_status', user.status); 

          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/student'); 
          }
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action failed. Please check your credentials.");
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
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c5a059] outline-none font-bold text-[#1a3a5f] transition-all"
                />
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
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 outline-none font-bold text-[#1a3a5f] transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-[#c5a059]'
                    }`}
                  />
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
    </div>
  );
};

export default Portal;