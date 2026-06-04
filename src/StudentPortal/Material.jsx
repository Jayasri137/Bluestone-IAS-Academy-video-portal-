import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, Download, Layers, Award, Sparkles, FileText, ArrowUpRight, Search } from 'lucide-react';
import { API_BASE_URL } from '../config';

const getSubjectThumbnail = (subject) => {
  const sub = String(subject).toLowerCase();
  if (sub.includes('history') || sub.includes('culture')) return "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=600"; // Old books/history
  if (sub.includes('polity') || sub.includes('governance')) return "https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600"; // Government buildings/pillars
  if (sub.includes('geography')) return "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600"; // Atlas / desert mountains
  if (sub.includes('environment') || sub.includes('ecology')) return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600"; // Forest / green ecology
  if (sub.includes('economics') || sub.includes('finance')) return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600"; // Stock charts/financials
  if (sub.includes('tamil')) return "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=600"; // Indian literature / study
  if (sub.includes('english')) return "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=600"; // Creative writing
  if (sub.includes('science') || sub.includes('technology')) return "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600"; // High-tech / laboratory
  if (sub.includes('math') || sub.includes('aptitude') || sub.includes('reasoning')) return "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600"; // Blackboard math equations
  return "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=600"; // General books / exam study
};

const getFileExtensionBadge = (filePath) => {
  if (!filePath) return "DOC";
  const ext = filePath.split('.').pop().toUpperCase();
  return ext.substring(0, 4);
};

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dual Tab Navigation States
  const [selectedCourse, setSelectedCourse] = useState(() => {
    const studentCoursesStr = localStorage.getItem('student_courses') || 'UPSC';
    const approved = studentCoursesStr.split(',').map(c => c.trim().toUpperCase());
    return approved[0] || "UPSC";
  });
  const [selectedSubject, setSelectedSubject] = useState("All");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/materials`);
        setMaterials(res.data.filter(m => m.is_active));
      } catch (error) {
        console.error("Fetch materials error:", error);
      }
    };
    fetchMaterials();
  }, []);

  // Compute all available courses in the materials dataset
  const dynamicCourses = [...new Set(materials.map(m => m.course).filter(Boolean))];
  
  // Retrieve student's approved courses list
  const studentCoursesStr = localStorage.getItem('student_courses') || 'UPSC';
  const approvedCourses = studentCoursesStr.split(',').map(c => c.trim().toUpperCase());

  // Guarantee UPSC, TNPSC, and RRB are standard tabs but ONLY if student has approved rights
  const standardCourses = ["UPSC", "TNPSC", "RRB"];
  const allCourses = [
    ...standardCourses.filter(c => approvedCourses.includes(c.toUpperCase())),
    ...dynamicCourses.filter(c => !standardCourses.includes(c) && approvedCourses.includes(c.toUpperCase()))
  ];

  // 1. Filter materials belonging to the active selected course
  const courseMaterials = materials.filter(m => {
    const matCourse = m.course || 'UPSC';
    return matCourse.toUpperCase() === selectedCourse.toUpperCase();
  });

  // Extract distinct subjects present under this specific selected course program
  const activeCourseSubjects = [...new Set(courseMaterials.map(m => m.subject || 'General Studies').filter(Boolean))];

  // 2. Filter materials by selected Subject tab AND search term
  const filteredMaterials = courseMaterials.filter(m => {
    const matchesSubject = selectedSubject === "All" || (m.subject || 'General Studies').toUpperCase() === selectedSubject.toUpperCase();
    
    const titleMatch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    return matchesSubject && matchesSearch;
  });

  // Group materials subject-wise (only needed when "All" subjects tab is selected)
  const groupedBySubject = filteredMaterials.reduce((acc, m) => {
    const subject = m.subject || 'General Studies';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(m);
    return acc;
  }, {});

  const displayedSubjectGroups = selectedSubject === "All"
    ? Object.keys(groupedBySubject)
    : [selectedSubject];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER STATEMENT PANEL */}
      <section className="bg-gradient-to-br from-[#1a3a5f] to-[#122842] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} className="animate-pulse" /> Bluestone Archives
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Study Resource & Document Vault</h2>
          <p className="text-xs text-blue-200/80 font-medium">Download exam handouts, micro-notes, booklets, and curated files customized for your batch.</p>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-full max-w-xs shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full bg-white/10 border border-white/15 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-white/20 transition-all text-white placeholder-blue-200/50"
          />
        </div>
      </section>

      {/* PRIMARY LEVEL: HORIZONTAL COURSE TABS */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
        <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Layers size={12} className="text-[#c5a059]" /> Select Active Program Track
        </div>
        <div className="flex flex-wrap gap-2">
          {allCourses.map(course => (
            <button
              key={course}
              onClick={() => {
                setSelectedCourse(course);
                setSelectedSubject("All");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                selectedCourse.toUpperCase() === course.toUpperCase()
                  ? 'bg-gradient-to-r from-[#1a3a5f] to-[#122842] text-white border-[#1a3a5f] shadow-md shadow-blue-900/10'
                  : 'bg-slate-50 hover:bg-slate-100 text-gray-500 border-gray-100'
              }`}
            >
              {course}
            </button>
          ))}
        </div>
      </section>

      {/* SECONDARY LEVEL: HORIZONTAL SUBJECT BADGES */}
      {activeCourseSubjects.length > 0 && (
        <section className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100/30 flex items-center gap-4 flex-wrap">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 pr-4">
            Filter Subject
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSubject("All")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                selectedSubject === "All"
                  ? 'bg-[#c5a059] text-white'
                  : 'bg-slate-50 text-gray-400 hover:bg-slate-100'
              }`}
            >
              All Subjects
            </button>
            {activeCourseSubjects.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  selectedSubject.toUpperCase() === subj.toUpperCase()
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-white text-gray-400 hover:bg-slate-50'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* STUDY MATERIAL LIST GRID */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-inner">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <BookOpen className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#1a3a5f] mb-1">No Materials Found</h3>
          <p className="text-xs text-gray-400 font-bold max-w-sm mx-auto uppercase tracking-wider">
            We couldn't find any study files matching "{selectedSubject}" under the selected track.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {displayedSubjectGroups.map(subjectKey => {
            const subjectMaterials = selectedSubject === "All" 
              ? groupedBySubject[subjectKey] 
              : filteredMaterials;

            if (!subjectMaterials || subjectMaterials.length === 0) return null;

            return (
              <div key={subjectKey} className="space-y-5 animate-in fade-in duration-300">
                
                {/* Subject Header Label */}
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="w-2.5 h-6 rounded bg-[#c5a059]" />
                  <h3 className="text-md font-black text-[#1a3a5f] uppercase tracking-tight flex items-center gap-2">
                    {subjectKey}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a3a5f]/10 text-[#1a3a5f]">
                      {subjectMaterials.length} {subjectMaterials.length === 1 ? 'file' : 'files'}
                    </span>
                  </h3>
                </div>

                {/* Grid of material booklets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectMaterials.map(material => (
                    <div 
                      key={material.id} 
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Visual Thumbnail Top Cover with Overlay */}
                      <div className="h-40 relative overflow-hidden bg-slate-900 shrink-0">
                        <img 
                          src={getSubjectThumbnail(material.subject)} 
                          alt={material.subject}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-500"
                        />
                        
                        {/* Course Badge Tag */}
                        <span className="absolute top-4 left-4 text-[9px] font-black text-white bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {material.course}
                        </span>

                        {/* File extension badge top right */}
                        <span className="absolute top-4 right-4 text-[10px] font-black text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shadow">
                          {getFileExtensionBadge(material.file_path)}
                        </span>

                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-wider mb-0.5">Subject track</p>
                          <p className="text-sm font-black text-white drop-shadow-sm truncate">{material.subject}</p>
                        </div>
                      </div>

                      {/* Content details and downloads button */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex-1 space-y-3">
                          <h4 className="font-black text-gray-800 text-sm leading-snug group-hover:text-[#1a3a5f] transition-colors line-clamp-2">
                            {material.title}
                          </h4>
                          
                          <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3">
                            {material.description || 'Curated core subject handout published by the Bluestone academic staff.'}
                          </p>
                        </div>

                        {/* Created At Date */}
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-5 mb-4 shrink-0">
                          <Calendar size={12} className="text-[#c5a059]" />
                          Published: {new Date(material.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>

                        {/* Action download button */}
                        <a 
                          href={`${API_BASE_URL}${material.file_path}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1a3a5f] to-[#122842] text-white hover:from-[#c5a059] hover:to-[#b18e47] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Download size={14} /> Download Document
                        </a>
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Material;
