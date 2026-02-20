import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Mail, Phone, User } from 'lucide-react';

const StudentDatabase = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('https://bluestoneinternationalpreschool.com/bias_api/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleToggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.put(`https://bluestoneinternationalpreschool.com/bias_api/api/users/${studentId}/status`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
        fetchStudents(); 
      }
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-black text-[#1a3a5f] mb-6">Student Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b">
              <th className="pb-4 px-2">Student Name</th>
              <th className="pb-4 px-2">Contact Info</th>
              <th className="pb-4 px-2">Status</th>
              <th className="pb-4 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                
                {/* 1. NAME COLUMN */}
                <td className="py-5 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1a3a5f]">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="font-black text-[#1a3a5f] text-sm leading-tight">
                        {student.fullName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">ID: {student.id}</p>
                    </div>
                  </div>
                </td>

                {/* 2. CONTACT COLUMN (Email & Phone) */}
                <td className="py-5 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600 text-[11px] font-bold">
                      <Mail size={12} className="text-[#c5a059]" /> {student.username}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-[11px] font-bold">
                      <Phone size={12} className="text-[#c5a059]" /> {student.phone}
                    </div>
                  </div>
                </td>

                {/* 3. STATUS COLUMN */}
                <td className="py-5 px-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    student.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {student.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </td>

                {/* 4. ACTION COLUMN */}
                <td className="py-5 px-2 text-right">
                  <button 
                    onClick={() => handleToggleStatus(student.id, student.status)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${
                      student.status === 'active' 
                      ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-[#1a3a5f] text-white hover:bg-[#c5a059]'
                    }`}
                  >
                    {student.status === 'active' ? (
                      <><UserX size={14} /> Disable</>
                    ) : (
                      <><UserCheck size={14} /> Activate</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDatabase;