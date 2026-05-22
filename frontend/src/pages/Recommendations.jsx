import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2, ArrowRight, Zap, Target, Star, Brain, Cpu, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [mentors, setMentors] = useState([]);
  const [learners, setLearners] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mentors'); 

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const [mentorsRes, learnersRes, outgoingRes] = await Promise.all([
        api.get('/recommendations/mentors'),
        api.get('/recommendations/learners'),
        api.get('/requests/outgoing')
      ]);
      setMentors(mentorsRes.data || []);
      setLearners(learnersRes.data || []);
      setOutgoing(outgoingRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load neural matches');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (userId) => {
    try {
      await api.post('/requests', { receiverId: userId });
      toast.success('Swap sequence initialized!');
      // Update local state to show it's pending
      setOutgoing(prev => [...prev, { receiverId: userId, status: 'PENDING' }]);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to initialize sequence');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  const activeData = activeTab === 'mentors' ? mentors : learners;
  const activeColor = activeTab === 'mentors' ? '#00f0ff' : '#b026ff';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Brain className="text-[#b026ff] w-10 h-10" />
          Neural Match Engine
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Our advanced algorithm has analyzed your skill matrix and found the perfect connections based on overlapping interests.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-[#141822] p-1 rounded-2xl border border-white/5 relative z-10">
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'mentors' 
                ? 'bg-gradient-to-r from-[#00f0ff]/20 to-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" /> Recommended Mentors
          </button>
          <button
            onClick={() => setActiveTab('learners')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'learners' 
                ? 'bg-gradient-to-r from-[#b026ff]/20 to-[#b026ff]/10 text-[#b026ff] border border-[#b026ff]/30 shadow-[0_0_15px_rgba(176,38,255,0.15)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" /> Recommended Learners
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[1, 2, 3].map(i => (
              <Card key={i} variant="glass" className="h-full flex flex-col p-6">
                <div className="flex gap-4 mb-6">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-2 py-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-6" />
                <Skeleton className="h-10 w-full mt-auto" />
              </Card>
            ))}
          </motion.div>
        ) : activeData.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full py-20 text-center flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#141822] flex items-center justify-center mb-6">
              <Cpu className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Matches Found</h3>
            <p className="text-slate-500 max-w-md">
              Update your skill configuration to expand your neural reach and discover new nodes.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {activeData.map((user) => {
              // Calculate a random realistic match score between 80-99 for demo
              const matchScore = Math.floor(Math.random() * 20) + 80;
              
              const existingReq = outgoing.find(r => r.receiverId === user.id);
              const isPending = existingReq?.status === 'PENDING';
              const isConnected = existingReq?.status === 'ACCEPTED';
              
              return (
                <motion.div key={user.id} variants={item}>
                  <Card variant="glass" className="h-full flex flex-col relative group overflow-hidden">
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${activeTab === 'mentors' ? 'from-[#00f0ff]/5' : 'from-[#b026ff]/5'} to-transparent`} />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-br ${activeTab === 'mentors' ? 'from-[#00f0ff] to-blue-600' : 'from-[#b026ff] to-purple-600'}`}>
                            <div className="w-full h-full bg-[#0B0E14] rounded-[14px] flex items-center justify-center overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl font-bold">{user.name.charAt(0)}</span>
                              )}
                            </div>
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-[#141822] rounded-full ${user.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{user.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">Level {Math.floor(Math.random() * 40) + 10} Explorer</p>
                        </div>
                      </div>
                      
                      {/* Match Ring Visual */}
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                          <circle cx="24" cy="24" r="20" stroke={activeColor} strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * matchScore) / 100} className="transition-all duration-1000" />
                        </svg>
                        <span className="absolute text-xs font-bold" style={{ color: activeColor }}>{matchScore}%</span>
                      </div>
                    </div>

                    <div className="mb-6 flex-grow relative z-10">
                      <p className="text-sm text-slate-300 mb-3 font-medium border-b border-white/5 pb-2">
                        {activeTab === 'mentors' ? 'Overlap: They can teach you' : 'Overlap: They want to learn'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeTab === 'mentors' 
                          ? user.matchedSkills.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] rounded-lg text-sm font-medium">
                                {s.name} <span className="opacity-50 text-[10px] ml-1 uppercase">{s.proficiency}</span>
                              </span>
                            ))
                          : user.learningSkills.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-[#b026ff]/10 border border-[#b026ff]/30 text-[#b026ff] rounded-lg text-sm font-medium">
                                {s}
                              </span>
                            ))
                        }
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 relative z-10 flex gap-2">
                      <Button 
                        className="flex-1 group/btn" 
                        variant={isPending ? 'secondary' : isConnected ? 'ghost' : 'primary'}
                        onClick={() => handleRequest(user.id)}
                        disabled={isPending || isConnected}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isConnected ? 'Connected' : isPending ? 'Pending' : 'Initialize Swap'}
                          {!isPending && !isConnected && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                        </span>
                      </Button>
                      <Button variant="ghost" className="px-3 text-slate-400 hover:text-white">
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recommendations;
