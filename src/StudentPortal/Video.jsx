import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Clock, Calendar } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('https://bluestoneinternationalpreschool.com/bias_api/api/videos');
        setVideos(res.data.filter(v => v.is_active));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchVideos();
  }, []);

  // View Swapper: If a video is clicked, show Theater Mode
  if (selectedVideo) {
    return <VideoPlayer video={selectedVideo} onBack={() => setSelectedVideo(null)} />;
  }

  const liveClass = videos.find(v => v.video_status === 'Live');
  const recentClasses = videos.filter(v => v.video_status === 'Recent');

  return (
    <div className="animate-in fade-in duration-500">
      {/* Live Class Hero Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-[#1a3a5f] mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> Live Session
        </h2>
        {liveClass ? (
          <div 
            className="bg-white rounded-3xl shadow-sm border border-gray-100 flex overflow-hidden hover:shadow-xl transition-all cursor-pointer group" 
            onClick={() => setSelectedVideo(liveClass)}
          >
            <div className="w-1/2 relative aspect-video overflow-hidden bg-slate-200">
              {/* Keep cover image or use placeholder if not found */}
              <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200" alt="thumb" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-[#1a3a5f]/20 group-hover:bg-[#1a3a5f]/40 transition-all flex items-center justify-center">
                <div className="bg-white p-5 rounded-full shadow-2xl text-[#c5a059]"><Play fill="currentColor" size={30} /></div>
              </div>
            </div>
            <div className="w-1/2 p-10 flex flex-col justify-center bg-white">
              <h3 className="text-3xl font-bold text-[#1a3a5f] mb-4 leading-tight">{liveClass.title}</h3>
              <div className="flex flex-col gap-3 text-gray-500 font-medium">
            <h1 className="text-lg font-bold text-[#1a3a5f] mb-4">Streaming Date: {new Date(liveClass.streaming_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h1>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={18} className="text-[#c5a059]"/> 
                  posted on: {new Date(liveClass.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={18} className="text-[#c5a059]"/> 
                  Date: {new Date(liveClass.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 border-2 border-dashed rounded-3xl text-center text-gray-400">No live sessions available.</div>
        )}
      </section>

      {/* Grid Section */}
      <section>
        <h2 className="text-2xl font-bold text-[#1a3a5f] mb-8">Recent Lectures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentClasses.map(v => (
            <div key={v.id} onClick={() => setSelectedVideo(v)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:-translate-y-2 hover:shadow-2xl transition-all">
               <div className="h-52 relative overflow-hidden bg-slate-200">
                  <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600" alt="thumb" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="text-white" size={40} />
                  </div>
               </div>
               <div className="p-6">
                 <h4 className="font-bold text-[#1a3a5f] line-clamp-2 mb-3 h-12 leading-snug">{v.title}</h4>
                 <h3 className="text-sm text-gray-500 font-medium mb-4">Streaming Date: {new Date(v.streaming_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                 <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>posted on: {new Date(v.created_at).toLocaleDateString()}</span>
                    <span className="text-[#c5a059]">Watch Now</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Video;