import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; 
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {}
        <Route path="/register" element={<Register />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* İçeriye ait sayfalar (DashboardLayout ile sarılı) */}
      <Route element={<DashboardLayout />}>
        {/* Ana sayfa (Geçici içerik) */}
        <Route path="/" element={<div className="text-gray-300">Hoş geldin! Burası yakında gönderi akışı (Feed) olacak.</div>} />
        {/* İleride eklenecek diğer sayfalar: */}
        {/* <Route path="/explore" element={<Explore />} /> */}
        
      </Route>   
    </Routes>
    </Router>
  );
}

export default App;
