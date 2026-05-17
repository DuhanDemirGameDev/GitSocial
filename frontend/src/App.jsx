import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Feed from './pages/Feed';
import CommunityDetail from './pages/CommunityDetail';
import CommunityList from './pages/CommunityList';
import CreateCommunity from './pages/CreateCommunity';
import DashboardLayout from './layouts/DashboardLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import JobBoard from './components/JobBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Feed />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="/communities" element={<CommunityList />} />
            <Route path="/communities/new" element={<CreateCommunity />} />
            <Route path="/communities/:id" element={<CommunityDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
