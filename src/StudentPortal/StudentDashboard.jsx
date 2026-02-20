import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import StudentLayout from './StudentLayout';

const StudentPortal = () => {
  // Get status from localStorage
  const status = localStorage.getItem('user_status'); 

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR REMAINS VISIBLE */}
      <StudentLayout />

      <main className="flex-1 overflow-y-auto">
        {status === 'inactive' ? (
          /* LOCKED SCREEN LAYOUT */
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-red-50 text-center">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-red-500" size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-[#1a3a5f] mb-2">Account Pending</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                Your account is currently <span className="text-red-500 font-bold uppercase">Inactive</span>. 
                Please contact the Bluestone IAS administration to activate your portal and access videos.
              </p>

              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 text-left border border-gray-100">
                <AlertCircle className="text-[#c5a059]" size={20} />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Support: admin@bluestoneias.com
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CONTENT (Videos, Courses, etc.) */
          <div className="p-8">
             <h1 className="text-3xl font-black text-[#1a3a5f]">Dashboard</h1>
             {/* YOUR VIDEO LIST AND STUFF GOES HERE */}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPortal;