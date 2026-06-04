import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Info, Calendar, Play, Maximize } from 'lucide-react';
import { API_BASE_URL } from '../config';

const VideoPlayer = ({ video, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Security: Prevent Right-Click and Shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' || 
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        alert("Action restricted for security purposes.");
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
      
      // AUTO FULLSCREEN ON MOBILE
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const toggleManualFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) { /* Safari */
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-5 duration-500 select-none pb-10" ref={containerRef}>
      
      {/* HEADER / BACK BUTTON - Mobile Optimized */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a3a5f] font-bold hover:text-[#c5a059] transition-colors p-2"
        >
          <ArrowLeft size={20} /> <span className="text-sm md:text-base">Back</span>
        </button>
        <div className="bg-[#c5a059]/10 text-[#c5a059] px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-[#c5a059]/20">
          Secure Stream
        </div>
      </div>

      {/* VIDEO PLAYER CONTAINER */}
      <div className="relative bg-black rounded-xl md:rounded-3xl overflow-hidden shadow-2xl aspect-video border-2 md:border-4 border-white group no-select">
        
        {/* Subtle Watermark */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 pointer-events-none opacity-20 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest z-10">
          Protected Content • BSIAS
        </div>

        <div className="video-shield" onContextMenu={(e) => e.preventDefault()} />

        {!isPlaying && (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 cursor-pointer"
            onClick={handlePlayVideo}
          >
            <div className="bg-[#c5a059] p-4 md:p-6 rounded-full text-white transform transition-transform group-hover:scale-110">
              <Play fill="currentColor" size={30} className="md:w-10 md:h-10" />
            </div>
          </div>
        )}

        <video 
          ref={videoRef}
          controls={isPlaying} 
          className="w-full h-full"
          controlsList="nodownload noremoteplayback"
          playsInline // Important for iOS to prevent forced native player
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src={`${API_BASE_URL}${video.file_path}`} type="video/mp4" />
        </video>

        {/* Manual Fullscreen button overlay for better UI */}
        {isPlaying && (
            <button 
                onClick={toggleManualFullscreen}
                className="absolute bottom-4 right-12 z-30 text-white opacity-0 group-hover:opacity-70 transition-opacity"
            >
                <Maximize size={20} />
            </button>
        )}
      </div>

      {/* VIDEO DETAILS AREA - Responsive Spacing */}
      <div className="mt-4 md:mt-8 bg-white p-5 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col border-b pb-6 border-gray-50">
          <h1 className="text-xl md:text-3xl font-black text-[#1a3a5f] mb-3 leading-tight">
            {video.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <h3 className="text-sm md:text-lg font-bold text-[#c5a059] flex items-center gap-2">
              <Calendar size={16} className="md:w-5 md:h-5"/> 
              {new Date(video.streaming_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h3>
            
            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500">
              <Info size={16} className="text-[#c5a059] md:w-[18px] md:h-[18px]"/> 
              Status: {video.video_status}
            </div>
          </div>
        </div>

        {/* FACULTY CARD - Responsive Layout */}
        <div className="flex items-center gap-3 md:gap-4 mt-6 bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 w-full sm:w-fit sm:min-w-[300px]">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-[#1a3a5f] rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <User size={24} className="md:w-7 md:h-7" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] md:text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.1em]">Faculty Instructor</p>
            <h4 className="font-bold text-[#1a3a5f] text-base md:text-lg truncate">{video.faculty_name}</h4>
          </div>
        </div>

        {/* ABOUT AREA */}
        <div className="mt-8 pt-6 border-t border-gray-50">
          <h5 className="font-bold text-[#1a3a5f] mb-2 uppercase text-[10px] md:text-xs tracking-widest">About this Session</h5>
          <p className="text-gray-500 text-xs md:text-sm leading-relaxed italic">
            This lecture is protected content. Recording or distributing this video is strictly prohibited 
            and may result in account suspension.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;