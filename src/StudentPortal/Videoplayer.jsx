import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Info, Calendar, Play } from 'lucide-react';

const VideoPlayer = ({ video, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Security: Prevent Right-Click and certain Keyboard Shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Block PrintScreen, Ctrl+S, Ctrl+U, Ctrl+Shift+I
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
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-5 duration-500 select-none">
      {/* TOP NAVIGATION BAR */}
     
        {/* Subtle Watermark (Optional: Add user name/ID here to discourage screen recording) */}
        <div className="absolute top-4 right-4 pointer-events-none opacity-20 text-white text-[10px] font-bold uppercase tracking-widest z-10">
          Protected Content • BSIAS
        </div>


      {/* VIDEO DETAILS AREA */}
      <div className="mt-8 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8 border-gray-50">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-[#1a3a5f] mb-4 leading-tight">{video.title}</h1>
            <h3 className="text-lg font-bold text-[#c5a059] mb-4 flex items-center gap-2">
              <Calendar size={20}/> 
              Streaming Date: {new Date(video.streaming_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="flex flex-wrap gap-6 text-gray-500">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info size={18} className="text-[#c5a059]"/> 
                Status: {video.video_status}
              </div>
            </div>
          </div>
        </div>

        {/* FACULTY CARD */}
        <div className="flex items-center gap-4 mt-8 bg-slate-50 p-4 rounded-2xl border border-gray-100 w-fit min-w-[300px]">
          <div className="w-14 h-14 bg-[#1a3a5f] rounded-xl flex items-center justify-center text-white shadow-lg">
            <User size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.1em]">Faculty Instructor</p>
            <h4 className="font-bold text-[#1a3a5f] text-lg">{video.faculty_name}</h4>
            <p className="text-xs text-gray-500 font-medium">{video.designation}</p>
          </div>
        </div>

         <div className="flex items-center justify-between mt-10 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#1a3a5f] font-bold hover:text-[#c5a059] transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="bg-[#c5a059]/10 text-[#c5a059] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#c5a059]/20">
          Secure Stream
        </div>
      </div>

      {/* VIDEO PLAYER CONTAINER */}
    <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-white group no-select">
  
  {/* THE SHIELD: This sits on top of the video to block direct interaction */}
  <div className="video-shield" onContextMenu={(e) => e.preventDefault()} />

  {!isPlaying && (
    <div 
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 cursor-pointer"
      onClick={handlePlayVideo}
    >
      <div className="bg-[#c5a059] p-6 rounded-full text-white">
        <Play fill="currentColor" size={40} />
      </div>
    </div>
  )}

  <video 
    ref={videoRef}
    controls={isPlaying} 
    className="w-full h-full"
    controlsList="nodownload noremoteplayback"
    onContextMenu={(e) => e.preventDefault()} // Extra layer for the element itself
  >
    <source src={`https://bluestoneinternationalpreschool.com/bias_api${video.file_path}`} type="video/mp4" />
  </video>
</div>


        {/* ABOUT AREA */}
        <div className="mt-10 pt-8 border-t border-gray-50">
          <h5 className="font-bold text-[#1a3a5f] mb-2 uppercase text-xs tracking-widest">About this Session</h5>
          <p className="text-gray-500 text-sm leading-relaxed">
            This lecture is protected content. Recording or distributing this video is strictly prohibited 
            and may result in account suspension. Please use the pause/resume features to take notes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;