import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Login';
import AdminLayout from './AdminLogin/AdminLayout';
import VideoManage from './AdminLogin/Videos'; // Your Videomanage component
import Video from './StudentPortal/Video';
import StudentLayout from './StudentPortal/StudentLayout';
import StudentDatabase from './AdminLogin/StudentDatabase'; 
import StudentPortal from './StudentPortal/StudentDashboard';
import StudentManage from './StudentPortal/Registration';
import MaterialsManage from './AdminLogin/Materials';
import Material from './StudentPortal/Material';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        {/* Admin Portal Nesting */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="videos" replace />} />
          <Route path="videos" element={<VideoManage />} />
          <Route path="students" element={<StudentDatabase />} /> 
          <Route path="materials" element={<MaterialsManage />} />
        </Route>

        {/* FIXED STUDENT PORTAL NESTING */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="video" replace />} />
          <Route path="video" element={<Video />} />
          <Route path="material" element={<Material />} />
          <Route path="dashboard" element={<StudentPortal/>} />
          <Route path="registration" element={<StudentManage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;