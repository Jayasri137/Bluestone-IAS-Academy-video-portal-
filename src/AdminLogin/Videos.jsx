import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Upload, Activity, Clock, Edit, Trash2, Search, User, Calendar } from 'lucide-react';

const VideoManage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFileObject, setSelectedFileObject] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ 
    title: '', 
    faculty_name: '', 
    designation: '', 
    video_status: 'Live',
    streaming_date: '' ,// NEW FIELD
  });

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get('https://bluestoneinternationalpreschool.com/bias_api/api/videos');
      setVideos(res.data);
    } catch (error) { console.error("Error fetching videos:", error); }
  };

 const addOrUpdateVideo = async (e) => {
  e.preventDefault();
  setIsUploading(true);
  
  const formData = new FormData();
  
  // Append fields one by one to ensure clean data
  formData.append('title', form.title);
  formData.append('faculty_name', form.faculty_name);
  formData.append('designation', form.designation);
  formData.append('video_status', form.video_status);
  
  // Only append date if it's not empty, otherwise send null or omit
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
  withCredentials: true, // Crucial if your live site uses sessions/login
  timeout: 0, // 0 means no timeout on the client side
  onUploadProgress: (p) => {
    const percent = Math.round((p.loaded * 100) / p.total);
    setUploadProgress(percent);
  }
};

    if (editingId) {
      await axios.put(`https://bluestoneinternationalpreschool.com/bias_api/api/videos/edit/${editingId}`, formData, config);
    } else {
      await axios.post('https://bluestoneinternationalpreschool.com/bias_api/api/videos', formData, config);
    }
    
    alert("Saved successfully!");
    resetForm();
    fetchVideos();
  } catch (error) {
    console.error("Frontend Error:", error.response?.data || error.message);
    alert("Server Error: Check if all fields are filled correctly.");
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};

  const handleToggle = async (id, currentStatus) => {
    try {
      setVideos(prev => prev.map(v => v.id === id ? {...v, is_active: !currentStatus} : v));
      await axios.put(`https://bluestoneinternationalpreschool.com/bias_api/api/videos/${id}`, { is_active: !currentStatus });
    } catch (error) { fetchVideos(); }
  };

  const deleteVideo = async (id) => {
    if (window.confirm("Delete this record permanently?")) {
      try {
        await axios.delete(`https://bluestoneinternationalpreschool.com/bias_api/api/videos/${id}`);
        fetchVideos();
      } catch (error) { alert("Delete failed."); }
    }
  };

  const resetForm = () => {
    setForm({ title: '', faculty_name: '', designation: '', video_status: 'Live', streaming_date: '' });
    setSelectedFileObject(null);
    setSelectedFileName("");
    setEditingId(null);
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 animate-in fade-in duration-500">
      
      {/* 1. PUBLISH FORM */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
         <h3 className="text-lg font-bold text-[#1a3a5f] mb-6 flex items-center gap-2">
            <Activity size={20} className="text-[#c5a059]"/> 
            {editingId ? "Update Lecture" : "Publish New Lecture"}
         </h3>
         <form onSubmit={addOrUpdateVideo} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Lecture Title</label>
              <input type="text" placeholder="Title" className="p-3 bg-slate-50 rounded-xl border outline-none text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Faculty</label>
              <input type="text" placeholder="Faculty" className="p-3 bg-slate-50 rounded-xl border outline-none text-sm" value={form.faculty_name} onChange={e => setForm({...form, faculty_name: e.target.value})} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Designation</label>
              <input type="text" placeholder="Designation" className="p-3 bg-slate-50 rounded-xl border outline-none text-sm" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Stream Type</label>
              <select className="p-3 bg-slate-50 rounded-xl border outline-none text-sm" value={form.video_status} onChange={e => setForm({...form, video_status: e.target.value})}>
                  <option value="Live">Live</option>
                  <option value="Recent">Recent</option>
              </select>
            </div>
            
            {/* NEW STREAMING DATE INPUT */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Streaming Date & Time</label>
              <input type="datetime-local" className="p-3 bg-slate-50 rounded-xl border outline-none text-sm" value={form.streaming_date} onChange={e => setForm({...form, streaming_date: e.target.value})} required />
            </div>

            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-bold text-gray-400 ml-2 uppercase">Video File</label>
               <input type="file" onChange={(e) => {setSelectedFileObject(e.target.files[0]); setSelectedFileName(e.target.files[0].name)}} className="p-2 text-[10px]" />
            </div>

            <div className="lg:col-span-1 flex items-end">
              <button className="w-full bg-[#1a3a5f] text-white rounded-xl font-bold py-3 hover:bg-[#c5a059] transition-all shadow-lg shadow-blue-900/10">
                  {isUploading ? `Uploading ${uploadProgress}%` : "Save"}
              </button>
            </div>
         </form>
      </section>

     {/* 2. REPOSITORY TABLE */}
<div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/50 text-[#1a3a5f] text-[11px] font-black uppercase tracking-widest border-b">
          <th className="px-8 py-5">Lecture</th>
          <th className="px-8 py-5">Faculty</th>
          <th className="px-8 py-5">Stream Type</th>
          <th className="px-8 py-5">Streaming Date</th>
          <th className="px-8 py-5 text-center">Video File</th> {/* COLUMN HEADER */}
          <th className="px-8 py-5 text-center">Visibility</th>
          <th className="px-8 py-5 text-center">Actions</th>
        </tr>
      </thead>
  <tbody className="divide-y divide-gray-50">
  {filteredVideos.map(v => (
    <tr key={v.id} className="hover:bg-slate-50/30 transition-colors">
      <td className="px-8 py-6 font-bold text-gray-800 text-sm">{v.title}</td>
      
      {/* FACULTY & DESIGNATION */}
      <td className="px-8 py-6">
        <div className="text-xs font-bold text-gray-700">{v.faculty_name}</div>
        <div className="text-[10px] text-[#c5a059] font-bold">{v.designation}</div>
      </td>

      {/* STREAM TYPE */}
      <td className="px-8 py-6">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
          v.video_status === 'Live' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'
        }`}>
          {v.video_status}
        </span>
      </td>
      
      {/* STREAMING DATE - FIXED FETCHING */}
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

      {/* VIDEO FILE PATH - FIXED FETCHING */}
      <td className="px-8 py-6 text-center">
        {v.file_path ? (
          <a 
            href={`https://bluestoneinternationalpreschool.com/bias_api${v.file_path}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100"
          >
            <Upload size={12} /> View File
          </a>
        ) : (
          <span className="text-[10px] text-gray-400 italic">No File</span>
        )}
      </td>

      {/* VISIBILITY TOGGLE */}
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

      {/* ACTIONS */}
      <td className="px-8 py-6">
        <div className="flex justify-center gap-2 text-gray-400">
          <button onClick={() => {
             setEditingId(v.id);
             setForm({
               title: v.title,
               faculty_name: v.faculty_name,
               designation: v.designation,
               video_status: v.video_status,
               streaming_date: v.streaming_date ? new Date(new Date(v.streaming_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
             });
             window.scrollTo(0,0);
          }} className="hover:text-blue-500"><Edit size={16}/></button>
          <button onClick={() => deleteVideo(v.id)} className="hover:text-red-500"><Trash2 size={16}/></button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
</div>
    </div>
  );
};

export default VideoManage;