import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, ShieldCheck, RefreshCcw } from 'lucide-react';

const StudentManage = () => {
 // Update your state to include status
const [form, setForm] = useState({ 
  username: '', 
  password: '', 
  role: 'student',
  status: 'active' // Ensure this is set to active for Admin-created users
});

// Update the handleRegister to include this in the POST request
const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await axios.post('https://bluestoneinternationalpreschool.com/bias_api/api/users/register', {
      ...form,
      status: 'active' // Explicitly send active status
    });
    alert(`Success: Account ${form.username} is now active.`);
    setForm({ username: '', password: '', role: 'student', status: 'active' });
  } catch (error) {
    alert(error.response?.data?.message || "Registration failed");
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
    <div className="p-4">
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-[#1a3a5f] flex items-center gap-2">
              <UserPlus className="text-[#c5a059]" /> Create Student Access
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Enroll new candidates to the portal</p>
          </div>
          <ShieldCheck className="text-green-500/20" size={40} />
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enrollment ID Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Enrollment ID</label>
              <button 
                type="button" 
                onClick={autoGenerateID}
                className="text-[10px] font-bold text-[#c5a059] flex items-center gap-1 hover:underline"
              >
                <RefreshCcw size={10} /> Auto-Generate
              </button>
            </div>
            <input 
              type="text" 
              placeholder="e.g. BS-2026-101" 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f]"
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              required 
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Initial Password</label>
            <input 
              type="text" 
              placeholder="Assign a password" 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f]"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required 
            />
          </div>

          {/* Role (Hidden or Toggle) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Account Role</label>
            <select 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] appearance-none"
              value={form.role}
              onChange={(e) => setForm({...form, role: e.target.value})}
            >
              <option value="student">Student (Standard Access)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1a3a5f] text-white font-black py-4 rounded-2xl hover:bg-[#c5a059] transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50"
            >
              {loading ? 'CREATING...' : 'ACTIVATE ACCOUNT'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default StudentManage;