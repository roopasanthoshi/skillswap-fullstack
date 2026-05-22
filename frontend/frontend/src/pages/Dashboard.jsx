import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2, Zap, Users, TrendingUp, Activity, Crosshair, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [exploreUsers, setExploreUsers] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, exploreRes, incRes, outRes, bookRes] = await Promise.all([
          api.get('/users/dashboard-stats'),
          api.get('/recommendations/explore'),
          api.get('/requests/incoming'),
          api.get('/requests/outgoing'),
          api.get('/bookings')
        ]);
        setStats(statsRes.data && typeof statsRes.data === 'object' ? statsRes.data : {
          profileCompletion: 0,
          knownCount: 0,
          learningCount: 0,
          pendingRequests: 0,
          acceptedRequests: 0,
          knownSkills: [],
          learningSkills: []
        });
        setExploreUsers(Array.isArray(exploreRes.data) ? exploreRes.data : (exploreRes.data?.users || []));
        setIncoming(Array.isArray(incRes.data) ? incRes.data : []);
        setOutgoing(Array.isArray(outRes.data) ? outRes.data : []);
        setBookings(Array.isArray(bookRes.data) ? bookRes.data : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Set safe default stats to prevent null crashes
        setStats({
          profileCompletion: 0,
          knownCount: 0,
          learningCount: 0,
          pendingRequests: 0,
          acceptedRequests: 0,
          knownSkills: [],
          learningSkills: []
        });
        setExploreUsers([]);
        setIncoming([]);
        setOutgoing([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRequestAction = async (id, status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      // Re-fetch data to update counts and lists
      const [statsRes, incRes, outRes] = await Promise.all([
        api.get('/users/dashboard-stats'),
        api.get('/requests/incoming'),
        api.get('/requests/outgoing')
      ]);
      setStats(statsRes.data);
      setIncoming(incRes.data || []);
      setOutgoing(outRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const pendingIncoming = incoming.filter(req => req.status === 'PENDING');
  // Since we migrated to SwapConnection, activeConnections should ideally come from /chat/contacts, but we'll adapt:
  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <Loader2 className="h-12 w-12 text-[#00f0ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome to <span className="neon-text-blue">Nexus</span>
          </h1>
          <p className="text-slate-400 text-lg">Your intelligent skill exchange hub.</p>
        </div>
        
        <div className="flex gap-4">
          <Link to="/recommendations">
            <Button variant="primary">Smart Match</Button>
          </Link>
          <Link to="/profile">
            <Button variant="secondary">My Skills</Button>
          </Link>
        </div>
      </motion.div>

      {/* Profile Completion & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card variant="glass" className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Profile Synchronization</h2>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Optimization Level</span>
            <span className="font-bold text-[#00f0ff]">{stats.profileCompletion}%</span>
          </div>
          <ProgressBar progress={stats.profileCompletion} className="mb-6" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-white/5 pt-6">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Known Skills</p>
              <p className="text-2xl font-bold text-[#00f0ff]">{stats.knownCount}</p>
            </div>
            <div className="text-center border-l border-white/5">
              <p className="text-xs text-slate-500 mb-1">Learning Goals</p>
              <p className="text-2xl font-bold text-[#b026ff]">{stats.learningCount}</p>
            </div>
            <div className="text-center border-l border-white/5">
              <p className="text-xs text-slate-500 mb-1">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pendingRequests}</p>
            </div>
            <div className="text-center border-l border-white/5">
              <p className="text-xs text-slate-500 mb-1">Active Swaps</p>
              <p className="text-2xl font-bold text-green-500">{stats.acceptedRequests}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00f0ff]" /> Known Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(!stats.knownSkills || stats.knownSkills.length === 0) ? (
                  <span className="text-xs text-slate-500 italic">None added</span>
                ) : (
                  stats.knownSkills.map(ks => (
                    <span key={ks.id} className="text-xs px-2 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full text-[#00f0ff]">
                      {ks.skill.name}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#b026ff]" /> Learning Targets
              </h4>
              <div className="flex flex-wrap gap-2">
                {(!stats.learningSkills || stats.learningSkills.length === 0) ? (
                  <span className="text-xs text-slate-500 italic">None added</span>
                ) : (
                  stats.learningSkills.map(ls => (
                    <span key={ls.id} className="text-xs px-2 py-1 bg-[#b026ff]/10 border border-[#b026ff]/30 rounded-full text-[#b026ff]">
                      {ls.skill.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ff0055]/10 flex items-center justify-center mb-4 border border-[#ff0055]/20">
            <Activity className="w-8 h-8 text-[#ff0055]" />
          </div>
          <h3 className="text-lg font-bold mb-2">Network Status</h3>
          <p className="text-sm text-slate-400 mb-4">You are connected to the global skill grid.</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Optimal
          </div>
        </Card>
      </div>

      {/* Connection Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Pending Requests */}
        <Card variant="glass" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-yellow-500" /> Pending Inbound
            </h2>
            <Link to="/requests" className="text-sm text-[#00f0ff] hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {pendingIncoming.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No pending requests at the moment.</p>
            ) : (
              pendingIncoming.slice(0, 3).map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                      <div className="w-full h-full bg-[#0B0E14] rounded-full overflow-hidden flex items-center justify-center">
                        {req.sender.avatarUrl ? (
                          <img src={req.sender.avatarUrl} alt={req.sender.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-xs">{req.sender.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{req.sender.name}</p>
                      <p className="text-xs text-slate-400">Wants to swap skills</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequestAction(req.id, 'ACCEPTED')} className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg transition-colors">Accept</button>
                    <button onClick={() => handleRequestAction(req.id, 'REJECTED')} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Bookings */}
        <Card variant="glass" className="p-6 border-[#b026ff]/30 shadow-[0_0_15px_rgba(176,38,255,0.1)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-[#b026ff]" /> Session Bookings
            </h2>
            <Link to="/schedule" className="text-sm text-[#00f0ff] hover:underline">Manage Schedule</Link>
          </div>
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <p className="text-slate-500 text-sm italic">You don't have any upcoming sessions booked.</p>
            ) : (
              upcomingBookings.slice(0, 3).map(b => {
                const partner = b.providerId === stats.userId ? b.requester : b.provider;
                if (!partner) return null;
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                        <div className="w-full h-full bg-[#0B0E14] rounded-full overflow-hidden flex items-center justify-center">
                          {partner.avatarUrl ? (
                            <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-xs">{partner.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{partner.name}</p>
                        <p className="text-xs text-[#00f0ff]">{new Date(b.scheduledAt).toLocaleDateString()} at {new Date(b.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {b.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="text-[#00f0ff]" /> 
          Discover Nodes (Users)
        </h2>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {(!exploreUsers || exploreUsers.length === 0) ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No users found. Try adding some skills to get recommendations.
            </div>
          ) : (
            exploreUsers.map((user) => (
              <motion.div key={user.id} variants={item}>
                <Card variant="solid" className="h-full flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className={`inline-flex h-2 w-2 rounded-full ${user.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`} />
                  </div>
                  
                  <div className="flex flex-col items-center mb-6 mt-4">
                    <div className="w-20 h-20 rounded-full mb-4 bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#141822] flex items-center justify-center text-2xl font-bold overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold">{user.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 text-center mt-2 px-2">
                      {user.bio || 'Tech enthusiast looking to learn and share knowledge.'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                    <div className="text-center flex-1 border-r border-white/5">
                      <p className="text-xs text-slate-500">Knows</p>
                      <p className="font-bold text-[#00f0ff]">{user.knownCount}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-500">Learning</p>
                      <p className="font-bold text-[#b026ff]">{user.learningCount}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
