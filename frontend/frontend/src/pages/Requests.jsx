import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2, Inbox, Send, Users, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const Requests = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [incRes, outRes] = await Promise.all([
        api.get('/requests/incoming'),
        api.get('/requests/outgoing')
      ]);
      setIncoming(incRes.data || []);
      setOutgoing(outRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load swap requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchRequests();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const pendingIncoming = incoming.filter(req => req.status === 'PENDING');
  const sentRequests = outgoing;
  const activeMatches = [...incoming, ...outgoing].filter(req => req.status === 'ACCEPTED');

  const getActiveData = () => {
    if (activeTab === 'incoming') return pendingIncoming;
    if (activeTab === 'outgoing') return sentRequests;
    return activeMatches;
  };

  const activeData = getActiveData();

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Request Management</h1>
        <p className="text-slate-400 text-lg">Manage your incoming and outgoing swap sequences.</p>
      </div>

      <div className="flex justify-center mb-12 overflow-x-auto pb-4">
        <div className="inline-flex bg-[#141822] p-1 rounded-2xl border border-white/5 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'incoming' ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30' : 'text-slate-400 hover:text-white'}`}
          >
            <Inbox className="w-4 h-4" /> Pending Inbox
            {pendingIncoming.length > 0 && (
              <span className="ml-2 bg-[#00f0ff] text-black text-xs px-2 py-0.5 rounded-full">{pendingIncoming.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'outgoing' ? 'bg-[#b026ff]/20 text-[#b026ff] border border-[#b026ff]/30' : 'text-slate-400 hover:text-white'}`}
          >
            <Send className="w-4 h-4" /> Sent Box
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Active Matches
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} variant="glass" className="h-24 flex items-center p-6"><Skeleton className="h-full w-full" /></Card>
            ))}
          </motion.div>
        ) : activeData.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Requests Found</h3>
            <p className="text-slate-500">Your {activeTab} queue is empty.</p>
          </motion.div>
        ) : (
          <motion.div key="content" variants={container} initial="hidden" animate="show" className="space-y-4">
            {activeData.map((req) => {
              const isOutgoing = req.senderId !== undefined && req.senderId !== req.receiverId && activeTab !== 'incoming';
              // If we're looking at incoming, user is receiver, other person is sender
              // If we're looking at active matches, we need to know who the other person is
              let otherPerson;
              if (activeTab === 'incoming') otherPerson = req.sender;
              else if (activeTab === 'outgoing') otherPerson = req.receiver;
              else otherPerson = req.senderId === req.receiverId ? null : (req.sender || req.receiver); // Fallback for active matches

              if (!otherPerson) return null;

              return (
                <motion.div key={req.id} variants={item}>
                  <Card variant="glass" className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#141822] flex items-center justify-center text-xl font-bold overflow-hidden">
                          {otherPerson.avatarUrl ? (
                            <img src={otherPerson.avatarUrl} alt={otherPerson.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
                              {otherPerson.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{otherPerson.name}</h3>
                        <p className="text-sm text-slate-400 max-w-lg line-clamp-1">{req.message || (activeTab === 'incoming' ? 'Wants to swap skills with you.' : 'Request sent.')}</p>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            req.status === 'ACCEPTED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            req.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'incoming' && req.status === 'PENDING' && (
                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <Button variant="primary" onClick={() => handleAction(req.id, 'ACCEPTED')} className="flex-1 md:flex-none flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> Accept
                        </Button>
                        <Button variant="ghost" onClick={() => handleAction(req.id, 'REJECTED')} className="flex-1 md:flex-none text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    )}
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

export default Requests;
