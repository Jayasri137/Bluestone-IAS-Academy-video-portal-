import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCheck, UserX, Mail, Phone, User, BookOpen, Sparkles, Check, X, Edit3, Trash2, History, Settings, Search, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config';

const StudentDatabase = () => {
  const [students, setStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState(["UPSC", "TNPSC", "RRB"]);

  // Inline editing state for student approved courses
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingCourses, setEditingCourses] = useState([]);

  // Detail edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', fullName: '', phone: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // History timeline modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [pendingDelete, setPendingDelete] = useState(null); // holds student metadata for delete confirm modal
  const [pendingStatusToggle, setPendingStatusToggle] = useState(null); // holds student metadata for toggle confirm modal

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/courses`);
      setAvailableCourses(res.data);
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  };

  useEffect(() => { 
    fetchStudents(); 
    fetchCourses();
  }, []);

  const handleToggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${studentId}/status`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
        fetchStudents(); 
        showToast(`Student account ${newStatus === 'active' ? 'unlocked' : 'locked'} successfully!`, "success");
      }
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error.message);
      showToast("Failed to update student login lock.", "error");
    }
  };

  const handleSaveCourses = async (studentId) => {
    if (editingCourses.length === 0) {
      showToast("Please assign at least one approved course program!", "error");
      return;
    }
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${studentId}/courses`, {
        courses: editingCourses
      });
      if (response.data.success) {
        setEditingStudentId(null);
        fetchStudents();
        showToast("Approved programs updated successfully!", "success");
      }
    } catch (err) {
      console.error("Error updating courses:", err);
      showToast("Failed to update approved courses.", "error");
    }
  };

  // Open edit details modal
  const handleEditClick = (student) => {
    setEditForm({
      id: student.id,
      fullName: student.fullName || '',
      phone: student.phone || '',
      username: student.username || '',
      password: ''
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  // Submit edit details form
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${editForm.id}/details`, {
        fullName: editForm.fullName,
        phone: editForm.phone,
        username: editForm.username,
        password: editForm.password
      });
      if (response.data.success) {
        setIsEditModalOpen(false);
        fetchStudents();
        if (response.data.passwordReset) {
          showToast("Student profile and password updated!", "success");
        } else {
          showToast("Student profile details updated!", "success");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update student profile.", "error");
    }
  };

  // Trigger permanent delete modal
  const triggerDeleteConfirm = (studentId, studentName) => {
    setPendingDelete({ id: studentId, fullName: studentName });
  };

  // Trigger status enable/disable modal
  const triggerToggleStatusConfirm = (studentId, studentName, currentStatus) => {
    setPendingStatusToggle({ id: studentId, fullName: studentName, currentStatus });
  };

  // Open history log
  const handleHistoryClick = (student) => {
    setSelectedHistoryStudent(student);
    setIsHistoryModalOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const nameMatch = (student.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (student.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (student.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const coursesMatch = (student.courses || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch || phoneMatch || coursesMatch;
  });

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStudents = itemsPerPage === 999999
    ? filteredStudents
    : filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  return (
    <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-500 relative">
      
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1a3a5f] tracking-tight uppercase flex items-center gap-2">
            <User className="text-[#c5a059]" /> Student Database
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage enrollments, course approvals, and login locks</p>
        </div>
        <span className="text-[10px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/15 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Settings size={12} className="animate-spin-slow" /> Control Panel Actions
        </span>
      </div>

      {/* --- PREMIUM SEARCH BAR --- */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students by name, email, phone..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#c5a059] transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="pb-4 px-2">Student Name</th>
              <th className="pb-4 px-2">Contact Info</th>
              <th className="pb-4 px-2">Approved Programs</th>
              <th className="pb-4 px-2">Status</th>
              <th className="pb-4 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* 1. NAME COLUMN */}
                  <td className="py-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[#1a3a5f] border border-blue-100">
                        <User size={15} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a3a5f] text-sm leading-tight">
                          {student.fullName || 'Registered Candidate'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">DB Record: #{student.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* 2. CONTACT COLUMN (Email & Phone) */}
                  <td className="py-6 px-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 text-xs font-bold">
                        <Mail size={12} className="text-[#c5a059]" /> {student.username}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-xs font-bold">
                        <Phone size={12} className="text-[#c5a059]" /> {student.phone || 'No Phone'}
                      </div>
                    </div>
                  </td>

                  {/* 3. DYNAMIC APPROVED PROGRAMS COLUMN */}
                  <td className="py-6 px-2">
                    {editingStudentId === student.id ? (
                      <div className="flex flex-wrap items-center gap-1.5 max-w-xs bg-slate-50 p-2 rounded-xl border border-gray-200">
                        {availableCourses.map(course => {
                          const isSelected = editingCourses.includes(course);
                          return (
                            <button
                              key={course}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setEditingCourses(editingCourses.filter(c => c !== course));
                                } else {
                                  setEditingCourses([...editingCourses, course]);
                                }
                              }}
                              className={`px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase transition-all ${
                                isSelected 
                                  ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-sm' 
                                  : 'bg-white text-gray-400 border-gray-200 hover:text-gray-700'
                              }`}
                            >
                              {course}
                            </button>
                          );
                        })}
                        <div className="flex items-center gap-1 ml-auto pt-1 sm:pt-0">
                          <button
                            onClick={() => handleSaveCourses(student.id)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-lg"
                            title="Save Approved Courses"
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                          <button
                            onClick={() => setEditingStudentId(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-500 p-1 rounded-lg"
                            title="Cancel Edit"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                        {(student.courses ? student.courses.split(',') : ['UPSC']).map(c => {
                          const name = c.trim().toUpperCase();
                          return name ? (
                            <span key={name} className="bg-slate-100 text-[#1a3a5f] text-[9px] font-black px-2.5 py-1.5 rounded-lg border border-slate-200 uppercase tracking-tighter shadow-sm">
                              {name}
                            </span>
                          ) : null;
                        })}
                        <button
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setEditingCourses(student.courses ? student.courses.split(',').map(c => c.trim().toUpperCase()) : ['UPSC']);
                          }}
                          className="text-[9px] font-black text-[#c5a059] bg-[#c5a059]/10 px-2 py-1 rounded border border-[#c5a059]/15 hover:bg-[#c5a059] hover:text-white transition-all uppercase tracking-wider ml-1"
                        >
                          Edit Access
                        </button>
                      </div>
                    )}
                  </td>

                  {/* 4. STATUS COLUMN */}
                  <td className="py-6 px-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      student.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {student.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </td>

                  {/* 5. MULTI-ACTIONS COLUMN */}
                  <td className="py-6 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* STATUS LOCK SWITCHER */}
                      <button 
                        onClick={() => triggerToggleStatusConfirm(student.id, student.fullName, student.status)}
                        className={`p-2 rounded-xl border transition-all ${
                          student.status === 'active' 
                          ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border-green-100/30' 
                          : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border-red-100/30'
                        }`}
                        title={student.status === 'active' ? "Disable Access" : "Approve Access"}
                      >
                        {student.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>

                      {/* EDIT DETAILS DETAILS */}
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="p-2 rounded-xl bg-slate-50 text-[#1a3a5f] hover:bg-[#c5a059] hover:text-white border border-slate-100 transition-all"
                        title="Edit Profile Info"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* LOG TIMELINE */}
                      <button 
                        onClick={() => handleHistoryClick(student)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-[#1a3a5f] hover:text-white border border-slate-100 transition-all"
                        title="Access Audit Logs"
                      >
                        <History size={14} />
                      </button>

                      {/* TRASH PERMANENT DELETE */}
                      <button 
                        onClick={() => triggerDeleteConfirm(student.id, student.fullName)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100/30 transition-all"
                        title="Permanently Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 font-semibold italic">
                  No student registrations match the active criteria or page boundaries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PREMIUM PAGINATION BAR --- */}
      {totalItems > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
          
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#c5a059] text-[#1a3a5f]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={999999}>All</option>
            </select>
            <span>entries</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="normal-case">
              Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} entries
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all font-semibold text-[10px]"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center font-black text-[10px] ${
                    currentPage === page
                      ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] shadow-md shadow-blue-900/10'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all font-semibold text-[10px]"
              >
                Next
              </button>
            </div>
          )}
          
        </div>
      )}

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

      {/* --- PREMIUM CONFIRMATION STATUS TOGGLE DIALOG --- */}
      {pendingStatusToggle && (
        <div className="fixed inset-0 bg-[#1a3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-gray-100 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
              pendingStatusToggle.currentStatus === 'active' 
                ? 'bg-amber-50 text-amber-500 border-amber-100' 
                : 'bg-emerald-50 text-emerald-500 border-emerald-100'
            }`}>
              {pendingStatusToggle.currentStatus === 'active' ? <UserX size={24} /> : <UserCheck size={24} />}
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight">
                {pendingStatusToggle.currentStatus === 'active' ? "Disable Access?" : "Enable Access?"}
              </h4>
              <p className="text-xs text-gray-400 font-semibold mt-2 leading-relaxed">
                Are you sure you want to {pendingStatusToggle.currentStatus === 'active' ? 'disable access and lock' : 'enable access and approve'} student <strong className="text-[#1a3a5f]">{pendingStatusToggle.fullName}</strong>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPendingStatusToggle(null)}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-all text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const studentId = pendingStatusToggle.id;
                  const currentStatus = pendingStatusToggle.currentStatus;
                  setPendingStatusToggle(null);
                  await handleToggleStatus(studentId, currentStatus);
                }}
                className={`flex-1 py-3.5 rounded-xl text-white font-black transition-all text-xs uppercase tracking-wider shadow-lg ${
                  pendingStatusToggle.currentStatus === 'active'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                }`}
              >
                {pendingStatusToggle.currentStatus === 'active' ? 'Yes, Lock' : 'Yes, Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM CONFIRMATION DELETE DIALOG --- */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-[#1a3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-gray-100 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight">Delete Student Profile?</h4>
              <p className="text-xs text-gray-400 font-semibold mt-2 leading-relaxed">
                Are you absolutely sure you want to permanently erase <strong className="text-[#1a3a5f]">{pendingDelete.fullName}</strong> from the database? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-all text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const studentId = pendingDelete.id;
                  setPendingDelete(null);
                  try {
                    const response = await axios.delete(`${API_BASE_URL}/api/users/${studentId}`);
                    if (response.data.success) {
                      fetchStudents();
                      showToast("Student account deleted permanently.", "success");
                    }
                  } catch (err) {
                    console.error(err);
                    showToast("Failed to delete student account.", "error");
                  }
                }}
                className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-all text-xs uppercase tracking-wider shadow-lg shadow-rose-500/10"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT DETAILS DIALOG MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#1a3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight">Edit Student Details</h3>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-4 mt-1 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm" 
                  value={editForm.fullName} 
                  onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email / ID (Username)</label>
                <input 
                  type="text" 
                  className="w-full p-4 mt-1 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm" 
                  value={editForm.username} 
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full p-4 mt-1 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm" 
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Reset Password (Optional)</label>
                <div className="relative mt-1">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter new password to reset" 
                    className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#c5a059] font-bold text-[#1a3a5f] text-sm" 
                    value={editForm.password} 
                    onChange={e => setEditForm({...editForm, password: e.target.value})}
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

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-gray-500 font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-xl bg-[#1a3a5f] text-white font-black hover:bg-[#c5a059] transition-all text-xs uppercase tracking-wider shadow-md"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- HISTORY ACTIVITY TIMELINE PANEL MODAL --- */}
      {isHistoryModalOpen && selectedHistoryStudent && (
        <div className="fixed inset-0 bg-[#1a3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full border border-gray-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            
            <button 
              onClick={() => setIsHistoryModalOpen(false)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-black p-1 bg-slate-50 rounded-full transition-colors"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight flex items-center gap-2">
                <History className="text-[#c5a059]" size={20} /> Access Audit Logs
              </h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">
                Timeline: {selectedHistoryStudent.fullName}
              </p>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-5">
              
              {/* Account Status Blocks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Approval Lock</p>
                  <p className="font-black text-xs text-[#1a3a5f] mt-1 flex items-center gap-1.5">
                    {selectedHistoryStudent.status === 'active' ? (
                      <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> APPROVED</>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> LOCKED</>
                    )}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Registered ID</p>
                  <p className="font-black text-xs text-[#1a3a5f] mt-1 truncate">{selectedHistoryStudent.username}</p>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Database Record Audit Log</p>
                <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 py-2">
                  
                  {/* Event 1 */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#c5a059] border-2 border-white" />
                    <p className="text-xs font-black text-[#1a3a5f] leading-tight">Classroom Program Access Initialized</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">Approved Track rights: {selectedHistoryStudent.courses || 'UPSC'}</p>
                  </div>

                  {/* Event 2 */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                    <p className="text-xs font-black text-[#1a3a5f] leading-tight">Access Gateway Verified</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">Security Credentials Registered</p>
                  </div>

                  {/* Event 3 */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                    <p className="text-xs font-black text-[#1a3a5f] leading-tight">Candidate Profile Registered</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">Enrolled via Contact: {selectedHistoryStudent.phone || 'No Phone'}</p>
                  </div>

                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-all text-xs uppercase tracking-wider"
              >
                Dismiss Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDatabase;