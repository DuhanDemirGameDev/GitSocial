import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- YENİ EKLENDİ

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Register sayfası artık boş div değil, gerçek bileşenimize bağlı! */}
        <Route path="/register" element={<Register />} /> 
      </Routes>
    </Router>
  );
}

export default App;