import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BookOpen, Search, Upload, Edit, Trash2, ShieldAlert, Check, X,
  Activity, Calendar, FileText, ArrowRight, Settings, Plus, Info
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const COURSE_SUBJECTS = {
  "UPSC": ["Polity", "History", "Geography", "Economics", "Environment", "Science & Tech", "Current Affairs"],
  "TNPSC": ["Tamil Society", "Aptitude", "Unit 8 & 9", "Indian Polity", "History & Culture", "Economy of India"],
  "RRB": ["General Intelligence", "General Science", "Arithmetic", "General Awareness"]
};

const MaterialsManage = () => {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileObject, setSelectedFileObject] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    title: '', 
    description: '',
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
  const [pendingDeleteMaterial, setPendingDeleteMaterial] = useState(null); // holds { id: '', title: '' }

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
    description: '',
    course: 'UPSC',
    subject: 'Polity'
  });

  useEffect(() => { fetchMaterials(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, courseFilter, subjectFilter]);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/materials`);
      setMaterials(res.data);
    } catch (error) { 
      console.error("Error fetching materials:", error); 
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "course") {
      if (value === "CUSTOM") {
        setIsCustomCourse(true);
        setForm(prev => ({ ...prev, course: "", subject: "" }));
        setIsCustomSubject(true);
      } else {
        setIsCustomCourse(false);
        const firstSubject = COURSE_SUBJECTS[value]?.[0] || "";
        setForm(prev => ({ ...prev, course: value, subject: firstSubject }));
        setIsCustomSubject(false);
      }
    }

    if (name === "subject") {
      if (value === "CUSTOM") {
        setIsCustomSubject(true);
        setForm(prev => ({ ...prev, subject: "" }));
      } else {
        setIsCustomSubject(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileObject(file);
      setSelectedFileName(file.name);
    }
  };

  const addMaterial = async (e) => {
    e.preventDefault();

    const finalCourse = isCustomCourse ? customCourseValue.trim() : form.course;
    const finalSubject = isCustomSubject ? customSubjectValue.trim() : form.subject;

    if (!form.title.trim()) return showToast("Title is required", "error");
    if (!finalCourse) return showToast("Course category is required", "error");
    if (!finalSubject) return showToast("Subject category is required", "error");

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("course", finalCourse);
    formData.append("subject", finalSubject);
    
    if (selectedFileObject) {
      formData.append("materialFile", selectedFileObject);
    } else {
      return showToast("Please choose a study material document file to upload", "error");
    }

    setIsUploading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast("New study resource published successfully!");

      // Reset form
      setForm({ title: '', description: '', course: 'UPSC', subject: 'Polity' });
      setSelectedFileObject(null);
      setSelectedFileName("");
      setIsCustomCourse(false);
      setCustomCourseValue("");
      setIsCustomSubject(false);
      setCustomSubjectValue("");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      showToast("Operation failed. Try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const updateMaterial = async (e) => {
    e.preventDefault();

    const finalCourse = isEditCustomCourse ? editCustomCourseValue.trim() : editForm.course;
    const finalSubject = isEditCustomSubject ? editCustomSubjectValue.trim() : editForm.subject;

    if (!editForm.title.trim()) return showToast("Title is required", "error");
    if (!finalCourse) return showToast("Course category is required", "error");
    if (!finalSubject) return showToast("Subject category is required", "error");

    const formData = new FormData();
    formData.append("title", editForm.title.trim());
    formData.append("description", editForm.description.trim());
    formData.append("course", finalCourse);
    formData.append("subject", finalSubject);
    
    if (editSelectedFileObject) {
      formData.append("materialFile", editSelectedFileObject);
    }

    setIsUploading(true);

    try {
      await axios.put(`${API_BASE_URL}/api/materials/edit/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast("Study material updated successfully!");
      resetEditForm();
      fetchMaterials();
    } catch (err) {
      console.error(err);
      showToast("Operation failed. Try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const editHandleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));

    if (name === "course") {
      if (value === "CUSTOM") {
        setIsEditCustomCourse(true);
        setEditForm(prev => ({ ...prev, course: "", subject: "" }));
        setIsEditCustomSubject(true);
      } else {
        setIsEditCustomCourse(false);
        const firstSubject = COURSE_SUBJECTS[value]?.[0] || "";
        setEditForm(prev => ({ ...prev, course: value, subject: firstSubject }));
        setIsEditCustomSubject(false);
      }
    }

    if (name === "subject") {
      if (value === "CUSTOM") {
        setIsEditCustomSubject(true);
        setEditForm(prev => ({ ...prev, subject: "" }));
      } else {
        setIsEditCustomSubject(false);
      }
    }
  };

  const resetEditForm = () => {
    setEditForm({ title: '', description: '', course: 'UPSC', subject: 'Polity' });
    setEditSelectedFileObject(null);
    setEditSelectedFileName("");
    setIsEditCustomCourse(false);
    setEditCustomCourseValue("");
    setIsEditCustomSubject(false);
    setEditCustomSubjectValue("");
    setEditingId(null);
    setIsEditModalOpen(false);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 1 ? 0 : 1;
      await axios.put(`${API_BASE_URL}/api/materials/${id}`, { is_active: nextStatus });
      showToast(nextStatus === 1 ? "Resource set to visible!" : "Resource hidden successfully!");
      fetchMaterials();
    } catch (error) {
      showToast("Failed to switch resource visibility", "error");
    }
  };

  const deleteMaterial = (id, title) => {
    setPendingDeleteMaterial({ id, title });
  };

  const confirmDeleteMaterial = async () => {
    if (!pendingDeleteMaterial) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/materials/${pendingDeleteMaterial.id}`);
      showToast("Study material and physical file erased successfully!");
      setPendingDeleteMaterial(null);
      fetchMaterials();
    } catch (error) {
      showToast("Error erasing material record", "error");
    }
  };

  const cancelDeleteMaterial = () => {
    setPendingDeleteMaterial(null);
  };

  // Get dynamic unique lists for current filters from the active dataset
  const distinctCourses = [...new Set(materials.map(m => m.course).filter(Boolean))];
  const distinctSubjects = [...new Set(materials.map(m => m.subject).filter(Boolean))];

  // Scoped Subjects list for filtering based on selected Course Tab
  const availableSubjectsForFilter = courseFilter === "All"
    ? distinctSubjects
    : [...new Set(materials.filter(m => m.course === courseFilter).map(m => m.subject).filter(Boolean))];

  // Search and filter logic
  const filteredMaterials = materials.filter(m => {
    const titleMatch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch;
    
    const matchesCourse = courseFilter === "All" || m.course === courseFilter;
    const matchesSubject = subjectFilter === "All" || m.subject === subjectFilter;
    
    return matchesSearch && matchesCourse && matchesSubject;
  });

  const totalItems = filteredMaterials.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMaterials = itemsPerPage === 999999
    ? filteredMaterials
    : filteredMaterials.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  return (
    <div className="p-2 animate-in fade-in duration-500">
      
      {/* 1. PUBLISH FORM */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
         <h3 className="text-lg font-bold text-[#1a3a5f] mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-[#c5a059]"/> 
            Upload Study Material (PDF/Docs)
         </h3>
         
         <form onSubmit={addMaterial} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Title */}
             <div className="flex flex-col gap-2">
               <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Document Title</label>
               <input 
                 type="text" 
                 name="title"
                 placeholder="e.g. Laxmikanth Indian Polity Revision Handout"
                 value={form.title} 
                 onChange={handleInputChange} 
                 className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none transition-all shadow-inner text-gray-800"
                 required
               />
             </div>

             {/* Description */}
             <div className="flex flex-col gap-2">
               <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Brief Description / Notes</label>
               <input 
                 type="text" 
                 name="description"
                 placeholder="e.g. Highlights 24 core amendments for CSE prelims 2026."
                 value={form.description} 
                 onChange={handleInputChange} 
                 className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none transition-all shadow-inner text-gray-800"
               />
             </div>

             {/* Course */}
             <div className="flex flex-col gap-2">
               <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Course Program</label>
               {!isCustomCourse ? (
                 <select 
                   name="course" 
                   value={form.course} 
                   onChange={handleInputChange} 
                   className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none text-gray-800 transition-all cursor-pointer"
                 >
                   <option value="UPSC">UPSC CSE (Civil Services)</option>
                   <option value="TNPSC">TNPSC (Group Exams)</option>
                   <option value="RRB">RRB (Railway Exams)</option>
                   <option value="CUSTOM">➕ Add Custom Course Category</option>
                 </select>
               ) : (
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Type Custom Course (e.g. Banking)" 
                     value={customCourseValue} 
                     onChange={(e) => setCustomCourseValue(e.target.value)} 
                     className="flex-1 p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs font-black text-[#1a3a5f] outline-none focus:ring-2 focus:ring-[#c5a059] shadow-inner"
                     required
                   />
                   <button 
                     type="button" 
                     onClick={() => { setIsCustomCourse(false); setForm(prev => ({ ...prev, course: 'UPSC' })); }}
                     className="px-4 bg-slate-100 hover:bg-slate-250 text-slate-500 rounded-2xl font-bold transition-all text-xs"
                   >
                     Reset
                   </button>
                 </div>
               )}
             </div>

             {/* Subject */}
             <div className="flex flex-col gap-2">
               <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Subject Track</label>
               {!isCustomSubject ? (
                 <select 
                   name="subject" 
                   value={form.subject} 
                   onChange={handleInputChange} 
                   className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none text-gray-800 transition-all cursor-pointer"
                 >
                   {(COURSE_SUBJECTS[form.course] || []).map(subj => (
                     <option key={subj} value={subj}>{subj}</option>
                   ))}
                   <option value="CUSTOM">➕ Add Custom Subject Category</option>
                 </select>
               ) : (
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Type Custom Subject (e.g. Banking Theory)" 
                     value={customSubjectValue} 
                     onChange={(e) => setCustomSubjectValue(e.target.value)} 
                     className="flex-1 p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs font-black text-[#1a3a5f] outline-none focus:ring-2 focus:ring-[#c5a059] shadow-inner"
                     required
                   />
                   <button 
                     type="button" 
                     onClick={() => { setIsCustomSubject(false); setForm(prev => ({ ...prev, subject: COURSE_SUBJECTS[form.course]?.[0] || 'General' })); }}
                     className="px-4 bg-slate-100 hover:bg-slate-250 text-slate-500 rounded-2xl font-bold transition-all text-xs"
                   >
                     Reset
                   </button>
                 </div>
               )}
             </div>

              {/* Document Selector Input */}
              <div className="flex flex-col gap-2 md:col-span-2">
               <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Upload Document File (PDF, DOCX, ZIP)</label>
               <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 px-6 py-4 border-2 border-dashed border-gray-200 hover:border-[#c5a059] hover:bg-amber-50/10 rounded-2xl cursor-pointer transition-all shrink-0">
                   <Upload size={18} className="text-[#c5a059]" />
                   <span className="text-xs font-bold text-gray-600">Choose File...</span>
                   <input 
                     type="file" 
                     accept=".pdf,.doc,.docx,.zip,.xls,.xlsx,.ppt,.pptx" 
                     onChange={handleFileChange} 
                     className="hidden" 
                   />
                 </label>
                 
                 {selectedFileName ? (
                   <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-150 px-4 py-3.5 rounded-2xl text-xs font-black shrink-0 shadow-sm animate-in zoom-in-95 duration-200">
                     <FileText size={16} />
                     <span>Selected: {selectedFileName}</span>
                   </div>
                 ) : (
                   <span className="text-xs text-gray-400 italic">No document file selected yet.</span>
                 )}
               </div>
             </div>

           </div>

           {/* Submit Button */}
           <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
             
             <button 
               type="submit" 
               disabled={isUploading}
               className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/95 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/15 hover:shadow-xl transition-all disabled:opacity-50"
             >
               {isUploading ? "Uploading Resource..." : "Publish Document Resource"}
               <ArrowRight size={16} />
             </button>
           </div>
         </form>
      </section>

      {/* 2. DUAL-ROW FILTERS & COURSE TABS */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h4 className="text-xs font-black text-[#1a3a5f] uppercase tracking-widest mb-4">Program Filtration System</h4>
        
        {/* Dynamic Primary Course horizontal tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-5">
           <button 
             onClick={() => { setCourseFilter("All"); setSubjectFilter("All"); }}
             className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${courseFilter === "All" ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] shadow-md shadow-blue-950/10' : 'bg-slate-50 text-gray-500 border-gray-100 hover:bg-gray-100/50'}`}
           >
             All Programs
           </button>
           {distinctCourses.map(course => (
             <button 
               key={course}
               onClick={() => { setCourseFilter(course); setSubjectFilter("All"); }}
               className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all uppercase tracking-tighter ${courseFilter === course ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-md shadow-amber-950/10' : 'bg-slate-50 text-gray-500 border-gray-100 hover:bg-gray-100/50'}`}
             >
               {course}
             </button>
           ))}
        </div>

        {/* Secondary Subject tabs */}
        <div className="flex flex-wrap gap-1.5 pt-4">
          <button 
            onClick={() => setSubjectFilter("All")}
            className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition-all uppercase ${subjectFilter === "All" ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-400 border-gray-100 hover:bg-slate-50'}`}
          >
            All Subjects
          </button>
          {availableSubjectsForFilter.map(subj => (
            <button 
              key={subj}
              onClick={() => setSubjectFilter(subj)}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition-all uppercase ${subjectFilter === subj ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-white text-gray-400 border-gray-100 hover:bg-slate-50'}`}
            >
              {subj}
            </button>
          ))}
        </div>
      </section>

      {/* 3. MATERIAL ARCHIVES LIST TABLE */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-8">
        
        {/* Search header bar */}
        <div className="p-6 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#c5a059] w-72 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[#1a3a5f] text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-5">Document Title</th>
                <th className="px-8 py-5">Course</th>
                <th className="px-8 py-5">Subject</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5 text-center">Download Link</th>
                <th className="px-8 py-5 text-center">Visibility</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedMaterials.length > 0 ? (
                paginatedMaterials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                    
                    {/* Document Title */}
                    <td className="px-8 py-6 font-bold text-gray-800 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#c5a059] shrink-0" />
                        <span>{m.title}</span>
                      </div>
                    </td>
                    
                    {/* Course */}
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-[#1a3a5f] bg-[#c5a059]/10 px-2.5 py-1 rounded-lg border border-[#c5a059]/20 uppercase tracking-tighter">
                        {m.course || 'UPSC'}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold text-gray-600 italic">{m.subject || 'General'}</div>
                    </td>

                    {/* Description */}
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-400 font-medium max-w-xs truncate">{m.description || 'No notes added.'}</p>
                    </td>

                    {/* Download File link */}
                    <td className="px-8 py-6 text-center">
                      {m.file_path ? (
                        <a 
                          href={`${API_BASE_URL}${m.file_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm"
                        >
                          <Upload size={12} className="rotate-180" /> Download Document
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No File Found</span>
                      )}
                    </td>

                    {/* Visibility toggle switch */}
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleToggle(m.id, m.is_active)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            m.is_active ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${m.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3 text-gray-400">
                        <button 
                          onClick={() => {
                             setEditingId(m.id);
                             
                             // Detect custom courses / subjects and set up states for edit modal
                             const isPredefinedCourse = COURSE_SUBJECTS[m.course] !== undefined;
                             const isPredefinedSubject = isPredefinedCourse && COURSE_SUBJECTS[m.course].includes(m.subject);
                             
                             setIsEditCustomCourse(!isPredefinedCourse);
                             setEditCustomCourseValue(!isPredefinedCourse ? m.course : "");
                             setIsEditCustomSubject(!isPredefinedSubject);
                             setEditCustomSubjectValue(!isPredefinedSubject ? m.subject : "");

                             setEditForm({
                               title: m.title,
                               description: m.description,
                               course: isPredefinedCourse ? m.course : 'CUSTOM',
                               subject: isPredefinedSubject ? m.subject : 'CUSTOM'
                             });

                             setEditSelectedFileObject(null);
                             setEditSelectedFileName("");
                             setIsEditModalOpen(true);
                          }}
                          className="hover:text-amber-500 transition-colors"
                        >
                          <Edit size={16}/>
                        </button>
                        <button 
                          onClick={() => deleteMaterial(m.id, m.title)} 
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
                  <td colSpan={7} className="px-8 py-10 text-center text-gray-400 font-semibold italic">
                    No study material documents match the filters or page constraints.
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
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* --- BESPOKE DELETION CONFIRMATION MODAL --- */}
      {pendingDeleteMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-rose-50 max-w-md w-full text-center animate-in scale-in duration-200">
            <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="text-rose-500" size={32} />
            </div>
            <h4 className="text-xl font-black text-[#1a3a5f] mb-2 uppercase tracking-tight">Confirm Deletion</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              Are you sure you want to permanently erase <span className="text-rose-600 font-bold">"{pendingDeleteMaterial.title}"</span>? This will permanently delete the resource and its physical storage document from disk.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={cancelDeleteMaterial} 
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteMaterial} 
                className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-all"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PREMIUM EDIT OVERLAY MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm overflow-y-auto p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-[#c5a059]">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#1a3a5f] uppercase tracking-tight">Edit Study Resource</h4>
                  <p className="text-xs text-gray-400 font-medium">Modify resource information and documents</p>
                </div>
              </div>
              <button 
                onClick={resetEditForm}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={updateMaterial} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Document Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={editForm.title} 
                    onChange={editHandleInputChange} 
                    placeholder="e.g. Laxmikanth Indian Polity Revision Handout"
                    className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none transition-all shadow-inner text-gray-800"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Brief Description / Notes</label>
                  <input 
                    type="text" 
                    name="description"
                    value={editForm.description} 
                    onChange={editHandleInputChange} 
                    placeholder="e.g. Highlights 24 core amendments for CSE prelims 2026."
                    className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none transition-all shadow-inner text-gray-800"
                  />
                </div>

                {/* Course */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Course Program</label>
                  {!isEditCustomCourse ? (
                    <select 
                      name="course" 
                      value={editForm.course} 
                      onChange={editHandleInputChange} 
                      className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none text-gray-800 transition-all cursor-pointer"
                    >
                      <option value="UPSC">UPSC CSE (Civil Services)</option>
                      <option value="TNPSC">TNPSC (Group Exams)</option>
                      <option value="RRB">RRB (Railway Exams)</option>
                      <option value="CUSTOM">➕ Add Custom Course Category</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type Custom Course (e.g. Banking)" 
                        value={editCustomCourseValue} 
                        onChange={(e) => setEditCustomCourseValue(e.target.value)} 
                        className="flex-1 p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs font-black text-[#1a3a5f] outline-none focus:ring-2 focus:ring-[#c5a059] shadow-inner"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => { setIsEditCustomCourse(false); setEditForm(prev => ({ ...prev, course: 'UPSC' })); }}
                        className="px-4 bg-slate-100 hover:bg-slate-250 text-slate-500 rounded-2xl font-bold transition-all text-xs"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Subject Track</label>
                  {!isEditCustomSubject ? (
                    <select 
                      name="subject" 
                      value={editForm.subject} 
                      onChange={editHandleInputChange} 
                      className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#c5a059] outline-none text-gray-800 transition-all cursor-pointer"
                    >
                      {(COURSE_SUBJECTS[editForm.course] || []).map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                      <option value="CUSTOM">➕ Add Custom Subject Category</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type Custom Subject (e.g. Banking Theory)" 
                        value={editCustomSubjectValue} 
                        onChange={(e) => setEditCustomSubjectValue(e.target.value)} 
                        className="flex-1 p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs font-black text-[#1a3a5f] outline-none focus:ring-2 focus:ring-[#c5a059] shadow-inner"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => { setIsEditCustomSubject(false); setEditForm(prev => ({ ...prev, subject: COURSE_SUBJECTS[editForm.course]?.[0] || 'General' })); }}
                        className="px-4 bg-slate-100 hover:bg-slate-250 text-slate-500 rounded-2xl font-bold transition-all text-xs"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {/* Document Selector Input */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-black text-[#1a3a5f] uppercase tracking-wider">Replace Document File (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-6 py-4 border-2 border-dashed border-gray-200 hover:border-[#c5a059] hover:bg-amber-50/10 rounded-2xl cursor-pointer transition-all shrink-0">
                      <Upload size={18} className="text-[#c5a059]" />
                      <span className="text-xs font-bold text-gray-600">Choose File...</span>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.zip,.xls,.xlsx,.ppt,.pptx" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setEditSelectedFileObject(file);
                            setEditSelectedFileName(file.name);
                          }
                        }} 
                        className="hidden" 
                      />
                    </label>
                    
                    {editSelectedFileName ? (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-150 px-4 py-3.5 rounded-2xl text-xs font-black shrink-0 shadow-sm animate-in zoom-in-95 duration-200">
                        <FileText size={16} />
                        <span>Selected: {editSelectedFileName}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-[#c5a059] font-bold flex items-center gap-1.5 italic bg-amber-50/50 px-4 py-3 rounded-xl border border-amber-100">
                        <Info size={14}/>
                        Leave empty if you do not want to replace the current file.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={resetEditForm}
                  className="px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/95 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/15 hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isUploading ? "Saving..." : "Save Changes"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaterialsManage;
