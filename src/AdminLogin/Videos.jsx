import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Upload, Activity, Clock, Edit, Trash2, Search, User, Calendar, BookOpen, Layers, Sparkles, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

const COURSE_SUBJECTS = {
  UPSC: [
    "Polity",
    "History",
    "Geography",
    "Economics",
    "Environment & Ecology",
    "Science & Technology",
    "International Relations",
    "Current Affairs"
  ],
  TNPSC: [
    "General Tamil",
    "General English",
    "General Studies",
    "Aptitude & Mental Ability",
    "History & Culture of India",
    "Indian National Movement",
    "Tamil Nadu History & Culture"
  ],
  RRB: [
    "General Awareness",
    "General Science",
    "Mathematics",
    "General Intelligence & Reasoning"
  ]
};

const VideoManage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileObject, setSelectedFileObject] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    faculty_name: '',
    video_status: 'Live',
    streaming_date: '',
    course: 'UPSC',
    subject: 'Polity'
  });
  const [editSelectedFileObject, setEditSelectedFileObject] = useState(null);
  const [editSelectedFileName, setEditSelectedFileName] = useState("");
  const [isEditCustomCourse, setIsEditCustomCourse] = useState(false);
  const [editCustomCourseValue, setEditCustomCourseValue] = useState("");
  const [isEditCustomSubject, setIsEditCustomSubject] = useState(false);
  const [editCustomSubjectValue, setEditCustomSubjectValue] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Toast & delete confirmation states
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [pendingDeleteVideo, setPendingDeleteVideo] = useState(null); // holds { id: '', title: '' }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Filter States
  const [courseFilter, setCourseFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Dynamic Custom Dropdown States
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [customCourseValue, setCustomCourseValue] = useState("");
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectValue, setCustomSubjectValue] = useState("");

  const [form, setForm] = useState({ 
    title: '', 
    faculty_name: '', 
    video_status: 'Live',
    streaming_date: '',
    course: 'UPSC',
    subject: 'Polity'
  });

  useEffect(() => { fetchVideos(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, courseFilter, subjectFilter]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/videos`);
      setVideos(res.data);
    } catch (error) { console.error("Error fetching videos:", error); }
  };

  const addVideo = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData();
    
    // Append standard fields
    formData.append('title', form.title);
    formData.append('faculty_name', form.faculty_name);
    formData.append('video_status', form.video_status);
    
    // Resolve Dynamic Course & Subject
    const resolvedCourse = form.course === 'Custom' ? customCourseValue : form.course;
    const resolvedSubject = form.subject === 'Custom' ? customSubjectValue : form.subject;
    
    formData.append('course', resolvedCourse);
    formData.append('subject', resolvedSubject);

    if (form.streaming_date) {
      formData.append('streaming_date', form.streaming_date);
    }

    if (selectedFileObject) {
      formData.append('videoFile', selectedFileObject);
    }

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 0,
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setUploadProgress(percent);
        }
      };

      await axios.post(`${API_BASE_URL}/api/videos`, formData, config);
      
      showToast("Lecture saved successfully!", "success");
      resetForm();
      fetchVideos();
    } catch (error) {
      console.error("Frontend Error:", error.response?.data || error.message);
      showToast("Server Error: Check if all fields are filled correctly.", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const updateVideo = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData();
    
    formData.append('title', editForm.title);
    formData.append('faculty_name', editForm.faculty_name);
    formData.append('video_status', editForm.video_status);
    
    const resolvedCourse = editForm.course === 'Custom' ? editCustomCourseValue : editForm.course;
    const resolvedSubject = editForm.subject === 'Custom' ? editCustomSubjectValue : editForm.subject;
    
    formData.append('course', resolvedCourse);
    formData.append('subject', resolvedSubject);

    if (editForm.streaming_date) {
      formData.append('streaming_date', editForm.streaming_date);
    }

    if (editSelectedFileObject) {
      formData.append('videoFile', editSelectedFileObject);
    }

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 0,
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setUploadProgress(percent);
        }
      };

      await axios.put(`${API_BASE_URL}/api/videos/edit/${editingId}`, formData, config);
      
      showToast("Lecture updated successfully!", "success");
      resetEditForm();
      fetchVideos();
    } catch (error) {
      console.error("Frontend Error:", error.response?.data || error.message);
      showToast("Server Error: Check if all fields are filled correctly.", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      setVideos(prev => prev.map(v => v.id === id ? {...v, is_active: !currentStatus} : v));
      await axios.put(`${API_BASE_URL}/api/videos/${id}`, { is_active: !currentStatus });
    } catch (error) { fetchVideos(); }
  };

  const deleteVideo = async (id, title) => {
    setPendingDeleteVideo({ id, title });
  };

  const resetForm = () => {
    setForm({ 
      title: '', 
      faculty_name: '', 
      video_status: 'Live', 
      streaming_date: '',
      course: 'UPSC',
      subject: 'Polity'
    });
    setSelectedFileObject(null);
    setSelectedFileName("");
    setIsCustomCourse(false);
    setCustomCourseValue("");
    setIsCustomSubject(false);
    setCustomSubjectValue("");
  };

  const resetEditForm = () => {
    setEditForm({ 
      title: '', 
      faculty_name: '', 
      video_status: 'Live', 
      streaming_date: '',
      course: 'UPSC',
      subject: 'Polity'
    });
    setEditSelectedFileObject(null);
    setEditSelectedFileName("");
    setEditingId(null);
    setIsEditModalOpen(false);
    setIsEditCustomCourse(false);
    setEditCustomCourseValue("");
    setIsEditCustomSubject(false);
    setEditCustomSubjectValue("");
  };

  // Extract distinct filters dynamically based on database values
  const distinctCourses = [...new Set(videos.map(v => v.course).filter(Boolean))];
  const distinctSubjects = [...new Set(videos.map(v => v.subject).filter(Boolean))];

  // Scoped Subjects list for filtering based on selected Course Tab
  const availableSubjectsForFilter = courseFilter === "All"
    ? distinctSubjects
    : [...new Set(videos.filter(v => v.course === courseFilter).map(v => v.subject).filter(Boolean))];

  // Search and filter logic
  const filteredVideos = videos.filter(v => {
    const titleMatch = v.title.toLowerCase().includes(searchTerm.toLowerCase());
    const facultyMatch = v.faculty_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || facultyMatch;
    
    const matchesCourse = courseFilter === "All" || v.course === courseFilter;
    const matchesSubject = subjectFilter === "All" || v.subject === subjectFilter;
    
    return matchesSearch && matchesCourse && matchesSubject;
  });

  const totalItems = filteredVideos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedVideos = itemsPerPage === 999999
    ? filteredVideos
    : filteredVideos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  return (
    <div className="p-2 animate-in fade-in duration-500">
      
      {/* 1. PUBLISH FORM */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
         <h3 className="text-lg font-bold text-[#1a3a5f] mb-6 flex items-center gap-2">
            <Activity size={20} className="text-[#c5a059]"/> 
            Publish New Lecture
         </h3>
         
         <form onSubmit={addVideo} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Lecture Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Lecture Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fundamental Rights - Laxmikanth" 
                  className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  required 
                />
              </div>

              {/* Faculty Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Faculty Instructor</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Aravind" 
                  className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                  value={form.faculty_name} 
                  onChange={e => setForm({...form, faculty_name: e.target.value})} 
                  required 
                />
              </div>

              {/* Stream Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Stream Type</label>
                <select 
                  className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                  value={form.video_status} 
                  onChange={e => setForm({...form, video_status: e.target.value})}
                >
                    <option value="Live">Live Stream</option>
                    <option value="Recent">Recent Recording</option>
                </select>
              </div>
              
              {/* Streaming Date & Time */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Streaming Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                  value={form.streaming_date} 
                  onChange={e => setForm({...form, streaming_date: e.target.value})} 
                  required 
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              
              {/* Course Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Course Program</label>
                <select 
                  className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold text-[#1a3a5f]" 
                  value={form.course} 
                  onChange={e => {
                    const selectedCourse = e.target.value;
                    let defaultSub = "General";
                    if (selectedCourse !== 'Custom' && COURSE_SUBJECTS[selectedCourse]) {
                      defaultSub = COURSE_SUBJECTS[selectedCourse][0];
                    }
                    setForm({ ...form, course: selectedCourse, subject: defaultSub });
                    setIsCustomCourse(selectedCourse === 'Custom');
                    setIsCustomSubject(selectedCourse === 'Custom'); // automatically trigger custom input
                  }}
                >
                  <option value="UPSC">UPSC Program</option>
                  <option value="TNPSC">TNPSC Program</option>
                  <option value="RRB">RRB Program</option>
                  <option value="Custom">➕ Add Custom Course...</option>
                </select>
              </div>

              {/* Custom Course Name */}
              {isCustomCourse && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#c5a059] ml-2 uppercase">Custom Course Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Banking, SSC" 
                    className="p-3 bg-white rounded-xl border-2 border-[#c5a059] outline-none text-sm font-bold text-[#1a3a5f]" 
                    value={customCourseValue} 
                    onChange={e => setCustomCourseValue(e.target.value)} 
                    required 
                  />
                </div>
              )}

              {/* Subject Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Subject Category</label>
                <select 
                  className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold text-[#1a3a5f]" 
                  value={form.subject} 
                  onChange={e => {
                    const selectedSubject = e.target.value;
                    setForm({ ...form, subject: selectedSubject });
                    setIsCustomSubject(selectedSubject === 'Custom');
                  }}
                >
                  {form.course !== 'Custom' && COURSE_SUBJECTS[form.course] ? (
                    <>
                      {COURSE_SUBJECTS[form.course].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="Custom">➕ Add Custom Subject...</option>
                    </>
                  ) : (
                    <>
                      <option value="General">General Study</option>
                      <option value="Custom">➕ Add Custom Subject...</option>
                    </>
                  )}
                </select>
              </div>

              {/* Custom Subject Name */}
              {isCustomSubject && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#c5a059] ml-2 uppercase">Custom Subject Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Quantitative Aptitude" 
                    className="p-3 bg-white rounded-xl border-2 border-[#c5a059] outline-none text-sm font-bold text-[#1a3a5f]" 
                    value={customSubjectValue} 
                    onChange={e => setCustomSubjectValue(e.target.value)} 
                    required 
                  />
                </div>
              )}

            </div>

            {/* Video File Upload Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                 <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Upload Video File</label>
                 <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border w-fit">
                   <Upload size={18} className="text-gray-400" />
                   <input 
                     type="file" 
                     onChange={(e) => {
                       if (e.target.files[0]) {
                         setSelectedFileObject(e.target.files[0]); 
                         setSelectedFileName(e.target.files[0].name);
                       }
                     }} 
                     className="text-xs file:hidden cursor-pointer text-gray-500 font-medium" 
                   />
                   {selectedFileName && (
                     <span className="text-xs font-bold text-green-600 truncate max-w-xs bg-green-50 px-2 py-1 rounded">
                       ✓ {selectedFileName}
                     </span>
                   )}
                 </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto md:self-end">
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 md:flex-initial bg-[#1a3a5f] hover:bg-[#c5a059] text-white rounded-xl font-bold px-8 py-3.5 transition-all shadow-lg shadow-blue-900/10 text-xs uppercase tracking-wider"
                >
                    {isUploading ? `Uploading ${uploadProgress}%` : "Publish Lecture"}
                </button>
              </div>
            </div>

         </form>
      </section>

      {/* 2. REPOSITORY TABLE & FILTERS */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Course Grouping Tabs */}
        <div className="bg-slate-50/50 px-8 pt-6 pb-2 border-b border-gray-100/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => {
                setCourseFilter("All");
                setSubjectFilter("All");
              }}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border shrink-0 ${
                courseFilter === "All"
                  ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] shadow-md shadow-blue-900/10 scale-[1.02]'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
              }`}
            >
              All Programs
            </button>
            {["UPSC", "TNPSC", "RRB", ...distinctCourses.filter(c => c !== 'UPSC' && c !== 'TNPSC' && c !== 'RRB')].map(course => (
              <button
                key={course}
                onClick={() => {
                  setCourseFilter(course);
                  setSubjectFilter("All"); // Reset subject filter when switching course tabs
                }}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border shrink-0 ${
                  courseFilter === course
                    ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] shadow-md shadow-blue-900/10 scale-[1.02]'
                    : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800'
                }`}
              >
                {course}
              </button>
            ))}
          </div>
          
          <span className="text-[10px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/15 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
             <Sparkles size={12} /> Course Management Tabs
          </span>
        </div>

        {/* Dynamic Secondary Subject Tabs */}
        <div className="bg-slate-50/30 px-8 py-3.5 border-b border-gray-100/20 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-2">Subject tab filter:</span>
          <button
            onClick={() => setSubjectFilter("All")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border shrink-0 ${
              subjectFilter === "All"
                ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-slate-50'
            }`}
          >
            All Subjects
          </button>
          {availableSubjectsForFilter.map(sub => (
            <button
              key={sub}
              onClick={() => setSubjectFilter(sub)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border shrink-0 ${
                subjectFilter === sub
                  ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Dynamic Search Bar */}
        <div className="p-6 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search lectures or faculty..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#c5a059] w-72 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[#1a3a5f] text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-5">Lecture</th>
                <th className="px-8 py-5">Faculty Instructor</th>
                <th className="px-8 py-5">Course</th>
                <th className="px-8 py-5">Subject</th>
                <th className="px-8 py-5">Stream Type</th>
                <th className="px-8 py-5">Streaming Date</th>
                <th className="px-8 py-5 text-center">Video File</th>
                <th className="px-8 py-5 text-center">Visibility</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedVideos.length > 0 ? (
                paginatedVideos.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/30 transition-colors">
                    
                    {/* Lecture Title */}
                    <td className="px-8 py-6 font-bold text-gray-800 text-sm">{v.title}</td>
                    
                    {/* Faculty */}
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-gray-700">{v.faculty_name}</div>
                    </td>

                    {/* Course */}
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-[#1a3a5f] bg-[#c5a059]/10 px-2.5 py-1 rounded-lg border border-[#c5a059]/20 uppercase tracking-tighter">
                        {v.course || 'UPSC'}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-gray-600 italic">{v.subject || 'General'}</div>
                    </td>

                    {/* Stream Status */}
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                        v.video_status === 'Live' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                      }`}>
                        {v.video_status}
                      </span>
                    </td>
                    
                    {/* Streaming Date */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[11px] text-gray-600 font-bold">
                        <Calendar size={12} className="text-[#c5a059]"/> 
                        {v.streaming_date ? (
                          new Date(v.streaming_date).toLocaleString('en-GB', { 
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })
                        ) : (
                          <span className="text-gray-400 font-normal italic">Not Set</span>
                        )}
                      </div>
                    </td>

                    {/* Video file path link */}
                    <td className="px-8 py-6 text-center">
                      {v.file_path ? (
                        <div className="flex flex-col items-center gap-1">
                          <a 
                            href={`${API_BASE_URL}${v.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 shadow-sm"
                          >
                            <Upload size={12} /> View File
                          </a>
                          {v.file_size ? (
                            <span className="text-[9px] text-gray-500 font-black tracking-wide uppercase">
                              {(v.file_size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          ) : (
                            <span className="text-[9px] text-gray-400 italic font-semibold">Size N/A</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No File</span>
                      )}
                    </td>

                    {/* Visibility switch */}
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleToggle(v.id, v.is_active)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            v.is_active ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${v.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </td>
                                       {/* Actions */}
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3 text-gray-400">
                        <button 
                          onClick={() => {
                             setEditingId(v.id);
                             
                             // Detect custom courses / subjects and set up states for edit modal
                             const isPredefinedCourse = COURSE_SUBJECTS[v.course] !== undefined;
                             const isPredefinedSubject = isPredefinedCourse && COURSE_SUBJECTS[v.course].includes(v.subject);
                             
                             setIsEditCustomCourse(!isPredefinedCourse);
                             setEditCustomCourseValue(!isPredefinedCourse ? v.course : "");
                             setIsEditCustomSubject(!isPredefinedSubject);
                             setEditCustomSubjectValue(!isPredefinedSubject ? v.subject : "");
  
                             setEditForm({
                               title: v.title,
                               faculty_name: v.faculty_name,
                               video_status: v.video_status,
                               course: isPredefinedCourse ? v.course : "Custom",
                               subject: isPredefinedSubject ? v.subject : "Custom",
                               streaming_date: v.streaming_date ? new Date(new Date(v.streaming_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
                             });
                             setIsEditModalOpen(true);
                          }} 
                          className="hover:text-[#c5a059] transition-colors"
                        >
                          <Edit size={16}/>
                        </button>
                        <button 
                          onClick={() => deleteVideo(v.id, v.title)} 
                          className="hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-8 py-10 text-center text-gray-400 font-semibold italic">
                    No lectures match the selected filters or page constraints.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PREMIUM PAGINATION BAR --- */}
        {totalItems > 0 && (
          <div className="px-8 py-5 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
            
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

      {/* --- PREMIUM CONFIRMATION DELETE DIALOG --- */}
      {pendingDeleteVideo && (
        <div className="fixed inset-0 bg-[#1a3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-gray-100 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight">Delete Lecture?</h4>
              <p className="text-xs text-gray-400 font-semibold mt-2 leading-relaxed">
                Are you absolutely sure you want to permanently delete <strong className="text-[#1a3a5f]">{pendingDeleteVideo.title}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPendingDeleteVideo(null)}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-all text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const videoId = pendingDeleteVideo.id;
                  setPendingDeleteVideo(null);
                  try {
                    await axios.delete(`${API_BASE_URL}/api/videos/${videoId}`);
                    fetchVideos();
                    showToast("Lecture deleted successfully.", "success");
                  } catch (error) {
                    showToast("Delete failed. Please try again.", "error");
                  }
                }}
                className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black transition-all text-xs uppercase tracking-wider shadow-lg shadow-rose-500/10"
              >
                Delete Lecture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PREMIUM EDIT DIALOG MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#1a3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-3xl w-full border border-gray-100 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-[#1a3a5f] uppercase tracking-tight flex items-center gap-2">
                <Edit size={20} className="text-[#c5a059]" /> Edit Lecture Details
              </h3>
              <button 
                onClick={resetEditForm}
                className="text-gray-400 hover:text-gray-600 font-black p-1 bg-slate-50 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={updateVideo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Lecture Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Lecture Title</label>
                  <input 
                    type="text" 
                    className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})} 
                    required 
                  />
                </div>

                {/* Faculty Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Faculty Instructor</label>
                  <input 
                    type="text" 
                    className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                    value={editForm.faculty_name} 
                    onChange={e => setEditForm({...editForm, faculty_name: e.target.value})} 
                    required 
                  />
                </div>

                {/* Stream Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Stream Type</label>
                  <select 
                    className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                    value={editForm.video_status} 
                    onChange={e => setEditForm({...editForm, video_status: e.target.value})}
                  >
                      <option value="Live">Live Stream</option>
                      <option value="Recent">Recent Recording</option>
                  </select>
                </div>
                
                {/* Streaming Date & Time */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Streaming Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold" 
                    value={editForm.streaming_date} 
                    onChange={e => setEditForm({...editForm, streaming_date: e.target.value})} 
                    required 
                  />
                </div>

                {/* Course Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Course Program</label>
                  <select 
                    className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold text-[#1a3a5f]" 
                    value={editForm.course} 
                    onChange={e => {
                      const selectedCourse = e.target.value;
                      let defaultSub = "General";
                      if (selectedCourse !== 'Custom' && COURSE_SUBJECTS[selectedCourse]) {
                        defaultSub = COURSE_SUBJECTS[selectedCourse][0];
                      }
                      setEditForm({ ...editForm, course: selectedCourse, subject: defaultSub });
                      setIsEditCustomCourse(selectedCourse === 'Custom');
                      setIsEditCustomSubject(selectedCourse === 'Custom');
                    }}
                  >
                    <option value="UPSC">UPSC Program</option>
                    <option value="TNPSC">TNPSC Program</option>
                    <option value="RRB">RRB Program</option>
                    <option value="Custom">➕ Add Custom Course...</option>
                  </select>
                </div>

                {/* Custom Course Name */}
                {isEditCustomCourse && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#c5a059] uppercase ml-1">Custom Course Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Banking, SSC" 
                      className="p-3 bg-white rounded-xl border-2 border-[#c5a059] outline-none text-sm font-bold text-[#1a3a5f]" 
                      value={editCustomCourseValue} 
                      onChange={e => setEditCustomCourseValue(e.target.value)} 
                      required 
                    />
                  </div>
                )}

                {/* Subject Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Subject Category</label>
                  <select 
                    className="p-3 bg-slate-50 rounded-xl border outline-none text-sm font-semibold text-[#1a3a5f]" 
                    value={editForm.subject} 
                    onChange={e => {
                      const selectedSubject = e.target.value;
                      setEditForm({ ...editForm, subject: selectedSubject });
                      setIsEditCustomSubject(selectedSubject === 'Custom');
                    }}
                  >
                    {editForm.course !== 'Custom' && COURSE_SUBJECTS[editForm.course] ? (
                      <>
                        {COURSE_SUBJECTS[editForm.course].map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="Custom">➕ Add Custom Subject...</option>
                      </>
                    ) : (
                      <>
                        <option value="General">General Study</option>
                        <option value="Custom">➕ Add Custom Subject...</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Custom Subject Name */}
                {isEditCustomSubject && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#c5a059] uppercase ml-1">Custom Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Quantitative Aptitude" 
                      className="p-3 bg-white rounded-xl border-2 border-[#c5a059] outline-none text-sm font-bold text-[#1a3a5f]" 
                      value={editCustomSubjectValue} 
                      onChange={e => setEditCustomSubjectValue(e.target.value)} 
                      required 
                    />
                  </div>
                )}

              </div>

              {/* Video File Upload Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                   <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Replace Video File (Optional)</label>
                   <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border w-fit">
                     <Upload size={18} className="text-gray-400" />
                     <input 
                       type="file" 
                       onChange={(e) => {
                         if (e.target.files[0]) {
                           setEditSelectedFileObject(e.target.files[0]); 
                           setEditSelectedFileName(e.target.files[0].name);
                         }
                       }} 
                       className="text-xs file:hidden cursor-pointer text-gray-500 font-medium" 
                     />
                     {editSelectedFileName ? (
                       <span className="text-xs font-bold text-green-600 truncate max-w-xs bg-green-50 px-2 py-1 rounded">
                         ✓ {editSelectedFileName}
                       </span>
                     ) : (
                       <span className="text-xs text-gray-400 italic">Leave empty to keep existing video file</span>
                     )}
                   </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto md:self-end">
                  <button 
                    type="button" 
                    onClick={resetEditForm}
                    className="flex-1 md:flex-initial bg-slate-100 text-gray-600 rounded-xl font-bold px-6 py-3.5 hover:bg-slate-200 transition-all text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 md:flex-initial bg-[#1a3a5f] hover:bg-[#c5a059] text-white rounded-xl font-bold px-8 py-3.5 transition-all shadow-lg shadow-blue-900/10 text-xs uppercase tracking-wider"
                  >
                      {isUploading ? `Uploading ${uploadProgress}%` : "Update Lecture"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoManage;