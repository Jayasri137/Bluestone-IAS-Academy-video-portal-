import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Video, LogOut, Users, ShieldCheck, Bell, Search } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* --- PERMANENT SIDEBAR --- */}
      <aside className="w-72 bg-[#1a3a5f] text-white flex flex-col h-full shadow-2xl z-30">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <div className="bg-[#c5a059] p-2 rounded-lg"><ShieldCheck size={24}/></div>
          <div>
            <h1 className="font-bold tracking-tight text-lg">BLUESTONE <span className="text-[#c5a059]">IAS</span></h1>
            <p className="text-[10px] text-blue-300 font-bold tracking-[0.2em]">ADMIN PANEL</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          <div onClick={() => navigate('/admin/videos')} 
               className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isActive('/admin/videos') ? 'bg-[#c5a059] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}>
            <Video size={20} />
            <span className="font-semibold">Video Management</span>
          </div>
          <div onClick={() => navigate('/admin/students')} 
               className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isActive('/admin/students') ? 'bg-[#c5a059] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'}`}>
            <Users size={20} />
            <span className="font-semibold">Student Database</span>
          </div>
        </nav>

        <button onClick={() => navigate('/')} className="m-6 p-4 flex items-center justify-center space-x-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold border border-red-500/10">
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </aside>

      {/* --- RIGHT SIDE CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* --- PERMANENT HEADER --- */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 z-20 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1a3a5f]">
              {isActive('/admin/videos') ? 'Video Repository' : 'Student Database'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Server Live</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search data..." className="pl-10 pr-4 py-2 bg-slate-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-[#c5a059] outline-none w-64" />
            </div>
            <div className="relative cursor-pointer text-gray-400 hover:text-[#1a3a5f]">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1a3a5f] text-white flex items-center justify-center font-bold text-sm border-2 border-slate-100 shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* --- DYNAMIC PAGE CONTENT (Scrollable area) --- */}
        <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;