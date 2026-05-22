import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Requests from './pages/Requests';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import Search from './pages/Search';
import Swaps from './pages/Swaps';
import Scheduling from './pages/Scheduling';
import { Loader2 } from 'lucide-react';
import api from './utils/api';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          setIsAuthenticated(true);
        } else {
          throw new Error('User not found');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#141822',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: { iconTheme: { primary: '#00f0ff', secondary: '#0B0E14' } },
          error: { iconTheme: { primary: '#ff0055', secondary: '#0B0E14' } },
        }}
      />
      <div className="animated-bg" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} />} />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />
              } />
              <Route path="/signup" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup setIsAuthenticated={setIsAuthenticated} />
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Recommendations /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Requests /></ProtectedRoute>} />
              <Route path="/swaps" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Swaps /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Scheduling /></ProtectedRoute>} />
              <Route path="/analytics" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Search />
                </ProtectedRoute>
              } />
              {/* Additional routes will be added here */}
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
