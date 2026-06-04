import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Clock, Calendar, BookOpen, Layers, Award, Sparkles } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
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
  return "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600"; // General library / exam study
};

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Dual Tab Navigation States
  const [selectedCourse, setSelectedCourse] = useState(() => {
    const studentCoursesStr = localStorage.getItem('student_courses') || 'UPSC';
    const approved = studentCoursesStr.split(',').map(c => c.trim().toUpperCase());
    return approved[0] || "UPSC";
  });
  const [selectedSubject, setSelectedSubject] = useState("All");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/videos`);
        setVideos(res.data.filter(v => v.is_active));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchVideos();
  }, []);

  // Swapper: If a video is clicked, show theater mode
  if (selectedVideo) {
    return <VideoPlayer video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
  }

  // Compute all available courses in the dataset
  const dynamicCourses = [...new Set(videos.map(v => v.course).filter(Boolean))];
  
  // Retrieve student's approved courses list
  const studentCoursesStr = localStorage.getItem('student_courses') || 'UPSC';
  const approvedCourses = studentCoursesStr.split(',').map(c => c.trim().toUpperCase());

  // Guarantee UPSC, TNPSC, and RRB are standard tabs but ONLY if student has approved rights
  const standardCourses = ["UPSC", "TNPSC", "RRB"];
  const allCourses = [
    ...standardCourses.filter(c => approvedCourses.includes(c.toUpperCase())),
    ...dynamicCourses.filter(c => !standardCourses.includes(c) && approvedCourses.includes(c.toUpperCase()))
  ];

  // 1. Filter videos belonging to the active selected course
  const courseVideos = videos.filter(v => {
    const videoCourse = v.course || 'UPSC';
    return videoCourse.toUpperCase() === selectedCourse.toUpperCase();
  });

  // Extract distinct subjects present under this specific selected course program
  const activeCourseSubjects = [...new Set(courseVideos.map(v => v.subject || 'General Studies').filter(Boolean))];

  // 2. Filter videos belonging to the selected Subject tab
  const filteredVideos = courseVideos.filter(v => {
    if (selectedSubject === "All") return true;
    const videoSubject = v.subject || 'General Studies';
    return videoSubject.toUpperCase() === selectedSubject.toUpperCase();
  });

  // Extract Live session for this course (always search the full course so it stays highlighted)
  const liveClass = courseVideos.find(v => v.video_status === 'Live');
  
  // Extract recent/non-live videos for subject grouping
  const nonLiveVideos = filteredVideos.filter(v => v.video_status !== 'Live');

  // Group non-live videos subject-wise (only needed when "All" subjects tab is selected)
  const groupedBySubject = nonLiveVideos.reduce((acc, video) => {
    const subject = video.subject || 'General Studies';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(video);
    return acc;
  }, {});

  const displayedSubjectGroups = selectedSubject === "All"
    ? Object.keys(groupedBySubject)
    : [selectedSubject];

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* 1. PRIMARY HORIZONTAL COURSE TAB NAVIGATION */}
      <section className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-[#1a3a5f] tracking-tight uppercase flex items-center gap-2">
              <BookOpen className="text-[#c5a059]" size={24} /> Learning Programs
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Select your preparation track to access subjects</p>
          </div>
          <span className="flex items-center gap-1.5 bg-yellow-50 text-[#c5a059] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#c5a059]/20 shadow-sm shrink-0">
            <Sparkles size={12} className="animate-spin duration-1000" /> Self-Paced Streams
          </span>
        </div>

        {/* Course Tab Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide no-select">
          {allCourses.map(course => (
            <button
              key={course}
              onClick={() => {
                setSelectedCourse(course);
                setSelectedSubject("All"); // Reset subject selection on course switch
              }}
              className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 border ${
                selectedCourse === course
                  ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] shadow-lg shadow-blue-900/15 scale-[1.02]'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              {course} preparation
            </button>
          ))}
        </div>
      </section>

      {/* 2. NESTED SECONDARY SUBJECT TAB NAVIGATION */}
      <section className="mb-10 bg-slate-50/50 p-4 rounded-2xl border border-gray-100/30">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-select">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mr-2 shrink-0">Subject Tracks:</span>
          <button
            onClick={() => setSelectedSubject("All")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border shrink-0 ${
              selectedSubject === "All"
                ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:text-gray-700'
            }`}
          >
            All Subjects
          </button>
          {activeCourseSubjects.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border shrink-0 ${
                selectedSubject.toUpperCase() === subject.toUpperCase()
                  ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-100 hover:text-gray-700'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      {/* 3. LIVE CLASS SPECIFIC HERO (Only visible if live matches selectedCourse) */}
      {liveClass && (
        <section className="mb-12">
          <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span> Live Broadcast
          </h2>
          <div 
            className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group" 
            onClick={() => setSelectedVideo(liveClass)}
          >
            <div className="w-full lg:w-1/2 relative aspect-video overflow-hidden bg-slate-900 shrink-0">
              <img 
                src={getSubjectThumbnail(liveClass.subject)} 
                alt="Live Stream" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-[#1a3a5f]/20 group-hover:bg-[#1a3a5f]/40 transition-all flex items-center justify-center">
                <div className="bg-white p-5 rounded-full shadow-2xl text-[#c5a059] transform transition-transform group-hover:scale-110 duration-300">
                  <Play fill="currentColor" size={26} className="ml-1" />
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-lg tracking-widest shadow-md">
                Live Class
              </div>
            </div>
            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
              <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Award size={14} /> Instructor: {liveClass.faculty_name}
              </span>
              <h3 className="text-2xl lg:text-3xl font-black text-[#1a3a5f] mb-4 leading-tight group-hover:text-[#c5a059] transition-colors line-clamp-2">
                {liveClass.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-5 text-gray-500 font-bold text-xs mt-2 pt-5 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#c5a059]"/> 
                  Posted: {new Date(liveClass.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#c5a059]"/> 
                  Time: {new Date(liveClass.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                {liveClass.file_size && (
                  <div className="flex items-center gap-1.5 bg-slate-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                    Size: {(liveClass.file_size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                )}
                <span className="bg-[#1a3a5f]/5 text-[#1a3a5f] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ml-auto">
                  {liveClass.subject || 'General'}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. SEGREGATED SUBJECTS SECTIONS */}
      <section className="space-y-12">
        {displayedSubjectGroups.length > 0 && nonLiveVideos.length > 0 ? (
          displayedSubjectGroups.map(subject => {
            const subjectVideos = selectedSubject === "All"
              ? groupedBySubject[subject]
              : nonLiveVideos;
            
            if (!subjectVideos || subjectVideos.length === 0) return null;

            return (
              <div key={subject} className="animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Subject Header */}
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-3">
                  <div className="bg-[#c5a059]/10 text-[#c5a059] p-2.5 rounded-xl border border-[#c5a059]/15">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1a3a5f] tracking-tight uppercase">
                      {subject} <span className="text-gray-300 font-bold ml-1.5">({subjectVideos.length})</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lectures & recorded preparation material</p>
                  </div>
                </div>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {subjectVideos.map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => setSelectedVideo(v)} 
                      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="h-52 relative overflow-hidden bg-slate-900 shrink-0">
                        <img 
                          src={getSubjectThumbnail(v.subject)} 
                          alt={v.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-[#1a3a5f]/10 group-hover:bg-[#1a3a5f]/40 transition-all flex items-center justify-center">
                          <div className="bg-white/90 p-4 rounded-full text-[#c5a059] opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                            <Play fill="currentColor" size={20} className="ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-[#1a3a5f] font-black text-[9px] uppercase px-2.5 py-1 rounded-lg tracking-wider border border-white/25">
                          {v.video_status}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest mb-1">
                          Faculty: {v.faculty_name}
                        </span>
                        <h4 className="font-bold text-[#1a3a5f] text-base leading-snug group-hover:text-[#c5a059] transition-colors line-clamp-2 mb-4 h-12">
                          {v.title}
                        </h4>
                        
                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mt-auto pt-4 border-t border-gray-50">
                          <span className="flex items-center gap-1">
                            Posted: {new Date(v.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            {v.file_size && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500 font-extrabold bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">
                                  {(v.file_size / (1024 * 1024)).toFixed(1)} MB
                                </span>
                              </>
                            )}
                          </span>
                          <span className="text-[#c5a059] group-hover:underline flex items-center gap-1 font-black">
                            Watch Lecture →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-16 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center bg-white">
            <Layers className="text-[#c5a059]/20 mx-auto mb-4" size={50} />
            <h3 className="font-bold text-[#1a3a5f] text-lg mb-1">No Lectures Published</h3>
            <p className="text-xs text-gray-400 font-medium">There are currently no recorded lectures under the {selectedSubject === "All" ? `${selectedCourse} track` : `${selectedSubject} category`}.</p>
          </div>
        )}
      </section>

    </div>
  );
};

export default Video;