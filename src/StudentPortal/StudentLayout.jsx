import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Video, BookOpen, GraduationCap, LogOut, Bell, Search, Lock, ShieldAlert } from 'lucide-react';

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. GET THE STUDENT STATUS
  const userStatus = localStorage.getItem('user_status') || 'inactive';
  const studentEmail = localStorage.getItem('student_id') || 'Student';

  useEffect(() => {
    const disableSecurityRisks = (e) => e.preventDefault();
    const disableKeys = (e) => {
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", disableSecurityRisks);
    document.addEventListener("keydown", disableKeys);
    return () => {
      document.removeEventListener("contextmenu", disableSecurityRisks);
      document.removeEventListener("keydown", disableKeys);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* 1. PERMANENT STUDENT SIDEBAR */}
      <aside className="w-72 bg-[#1a3a5f] text-white flex flex-col fixed h-full shadow-2xl z-30">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <div className="bg-[#c5a059] p-2 rounded-lg"><GraduationCap size={24}/></div>
          <div>
            <h1 className="font-bold tracking-tight text-lg">BLUESTONE <span className="text-[#c5a059]">IAS</span></h1>
            <p className="text-[10px] text-blue-300 font-bold tracking-[0.2em]">STUDENT PORTAL</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          <div onClick={() => navigate('/student/video')} 
               className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isActive('/student/video') ? 'bg-[#c5a059] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}>
            <Video size={20} />
            <span className="font-semibold">My Video Classes</span>
          </div>
          <div onClick={() => navigate('/student/material')} 
               className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isActive('/student/material') ? 'bg-[#c5a059] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}>
            <BookOpen size={20} />
            <span className="font-semibold">Study Material</span>
          </div>
        </nav>

        <button onClick={() => { localStorage.clear(); navigate('/'); }} className="m-6 p-4 flex items-center justify-center space-x-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold">
          <LogOut size={18} /> <span>Log Out</span>
        </button>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        
        {/* 3. PERMANENT STUDENT HEADER */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-[#1a3a5f]">
              {userStatus === 'inactive' ? 'Account Restricted' : (isActive('/student/video') ? 'Video Lectures' : 'Study Resources')}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Batch: UPSC CSE 2026</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full flex items-center gap-2 border ${userStatus === 'active' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-2 h-2 rounded-full ${userStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${userStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {userStatus}
              </span>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
               <div className="text-right">
                  <p className="text-xs font-bold text-[#1a3a5f]">{studentEmail.split('@')[0]}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-[#1a3a5f] text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                  {studentEmail.substring(0,2)}
               </div>
            </div>
          </div>
        </header>

        {/* 4. CONDITIONAL CONTENT RENDERING */}
        <main className="p-10 flex-1">
          <div className="max-w-7xl mx-auto h-full">
             {userStatus === 'inactive' ? (
               /* THE LOCK SCREEN LAYOUT */
               <div className="h-[60vh] flex items-center justify-center">
                 <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 max-w-lg w-full text-center">
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-red-50/50">
                      <Lock size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-[#1a3a5f] mb-4 uppercase tracking-tight">Access Denied</h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                      Your account is currently <span className="text-red-600 font-bold">INACTIVE</span>. 
                      Registration is complete, but access to videos and study materials requires administrator approval.
                    </p>
                    <div className="p-6 bg-slate-50 rounded-2xl flex items-start gap-4 text-left border border-gray-100">
                      <ShieldAlert className="text-[#c5a059] shrink-0" size={24} />
                      <div>
                        <p className="text-xs font-black text-[#1a3a5f] uppercase tracking-widest mb-1">What to do?</p>
                        <p className="text-[11px] text-gray-400 font-bold">Please wait 24-48 hours for verification or contact the batch coordinator for immediate activation.</p>
                      </div>
                    </div>
                 </div>
               </div>
             ) : (
               /* SHOW THE ACTUAL PAGE IF ACTIVE */
               <Outlet />
             )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;