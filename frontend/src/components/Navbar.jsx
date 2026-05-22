import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Shuffle, Zap, Bell, MessageSquare, Activity, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ui/ThemeToggle';
import api from '../utils/api';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/');
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          isActive 
            ? 'bg-white/10 text-[#00f0ff] neon-text-blue' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">{children}</span>
      </Link>
    );
  };

  return (
    <nav className="glass-panel sticky top-4 z-50 mx-4 mt-4 lg:mx-8 px-2 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-14">
        
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 px-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#b026ff] p-[2px]">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#b026ff] opacity-50 blur-sm" />
            <div className="relative w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00f0ff]" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
            Nexus
          </span>
        </Link>
        
        {/* Navigation Items */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
              <NavLink to="/recommendations" icon={Shuffle}>Match</NavLink>
              <NavLink to="/search" icon={Search}>Discover</NavLink>
              <NavLink to="/swaps" icon={Activity}>Swaps</NavLink>
              <NavLink to="/schedule" icon={Activity}>Schedule</NavLink>
              <NavLink to="/requests" icon={Activity}>Requests</NavLink>
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              
              <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />
              
              <ThemeToggle />

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:text-[#00f0ff] hover:bg-white/5 rounded-xl transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff]" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-[#141822] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/5 bg-[#0B0E14] flex justify-between items-center">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-[#00f0ff]">{unreadCount} unread</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                        ) : (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              onClick={() => {
                                markAsRead(notification.id);
                                if (notification.link) {
                                  navigate(notification.link);
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-[#00f0ff]/5' : ''}`}
                            >
                              <p className="text-sm text-slate-300">{notification.content}</p>
                              <span className="text-xs text-slate-500 mt-1 block">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Link to="/chat" className="p-2 text-slate-400 hover:text-[#b026ff] hover:bg-white/5 rounded-xl transition-all mr-2 relative inline-flex">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#b026ff] rounded-full shadow-[0_0_8px_#b026ff]" />
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl flex items-center gap-1 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 px-2">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
                Log in
              </Link>
              <Link
                to="/signup"
                className="neon-button text-sm !px-5 !py-2"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
