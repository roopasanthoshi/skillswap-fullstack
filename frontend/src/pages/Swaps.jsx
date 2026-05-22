import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Loader2, Users, MessageSquare, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Swaps = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get('/chat/contacts');
        setConnections(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <Loader2 className="h-10 w-10 text-[#00f0ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Zap className="text-[#00f0ff] w-8 h-8" /> Active Swaps
        </h1>
        <p className="text-slate-400 text-lg">Manage your established skill exchange connections.</p>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Swaps</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You don't have any established connections yet. Discover new nodes to swap skills with.</p>
          <Link to="/search">
            <Button variant="primary">Discover Nodes</Button>
          </Link>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((contact) => (
            <motion.div key={contact.id} variants={item}>
              <Card variant="glass" className="p-6 flex flex-col h-full relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${contact.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`} />
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                    <div className="w-full h-full bg-[#0B0E14] rounded-full overflow-hidden flex items-center justify-center">
                      {contact.avatarUrl ? (
                        <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
                          {contact.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{contact.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">{contact.bio || 'SkillSwap Member'}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                  <Button variant="secondary" className="flex-1 flex justify-center items-center gap-2" onClick={() => navigate('/chat')}>
                    <MessageSquare className="w-4 h-4" /> Message
                  </Button>
                  <Button variant="ghost" className="flex-1 flex justify-center items-center gap-2 bg-[#b026ff]/10 text-[#b026ff] hover:bg-[#b026ff]/20" onClick={() => navigate('/schedule')}>
                    <Calendar className="w-4 h-4" /> Book
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Swaps;
