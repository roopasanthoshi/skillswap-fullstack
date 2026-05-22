import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2, Calendar, Clock, Check, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Scheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // New slot form
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  // New booking form
  const [providerId, setProviderId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, bookRes, connRes] = await Promise.all([
        api.get('/schedule'),
        api.get('/bookings'),
        api.get('/chat/contacts') // Re-use contacts for booking providers
      ]);
      setSchedules(schedRes.data || []);
      setBookings(bookRes.data || []);
      setConnections(connRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/schedule', { dayOfWeek, startTime, endTime });
      setSchedules([...schedules, res.data]);
      toast.success('Availability slot added');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.delete(`/schedule/${id}`);
      setSchedules(schedules.filter(s => s.id !== id));
      toast.success('Slot removed');
    } catch (err) {
      toast.error('Failed to remove slot');
    }
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    if (!providerId || !bookingDate || !bookingTime) return toast.error('Fill required fields');
    
    // Combine date and time
    const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`);
    if (scheduledAt < new Date()) return toast.error('Cannot book in the past');

    try {
      const res = await api.post('/bookings', {
        providerId,
        scheduledAt,
        duration,
        notes
      });
      setBookings([...bookings, res.data]);
      toast.success('Session booked successfully');
      setProviderId('');
      setNotes('');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to book session');
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData(); // Refresh list to get updated statuses and relations
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const incomingBookings = bookings.filter(b => b.providerId === user.id);
  const outgoingBookings = bookings.filter(b => b.requesterId === user.id);

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
          <Calendar className="text-[#b026ff] w-8 h-8" /> Session Scheduling
        </h1>
        <p className="text-slate-400 text-lg">Manage your availability and book learning sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Availability Management */}
        <div className="space-y-8">
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="text-[#00f0ff]" /> My Availability
            </h2>
            <form onSubmit={handleAddSlot} className="flex gap-2 mb-6">
              <select 
                value={dayOfWeek} 
                onChange={e => setDayOfWeek(e.target.value)}
                className="bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
              <input 
                type="time" 
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              />
              <span className="text-slate-500 self-center">-</span>
              <input 
                type="time" 
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
              />
              <Button type="submit" variant="primary" className="px-3"><Plus className="w-4 h-4" /></Button>
            </form>

            <div className="space-y-2">
              {schedules.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No availability slots configured.</p>
              ) : (
                schedules.map(slot => (
                  <div key={slot.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="font-bold">{DAYS[slot.dayOfWeek]}</p>
                      <p className="text-sm text-slate-400">{slot.startTime} - {slot.endTime}</p>
                    </div>
                    <button onClick={() => handleDeleteSlot(slot.id)} className="text-slate-400 hover:text-red-400 p-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Book a Session */}
          <Card variant="glass" className="p-6 border-[#b026ff]/30 shadow-[0_0_15px_rgba(176,38,255,0.1)]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-[#b026ff]" /> Book a Session
            </h2>
            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Select Active Connection</label>
                <select 
                  value={providerId}
                  onChange={e => setProviderId(e.target.value)}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#b026ff]"
                  required
                >
                  <option value="">-- Select a User --</option>
                  {connections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#b026ff]"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#b026ff]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Duration (minutes)</label>
                <select 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#b026ff]"
                >
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Topic / Notes (Optional)</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="w-full bg-[#141822] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#b026ff]"
                />
              </div>
              <Button type="submit" className="w-full bg-[#b026ff] hover:bg-purple-600 text-white">Request Booking</Button>
            </form>
          </Card>
        </div>

        {/* Incoming & Outgoing Bookings */}
        <div className="space-y-8">
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold mb-6">Incoming Requests (To Teach)</h2>
            <div className="space-y-3">
              {incomingBookings.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No incoming booking requests.</p>
              ) : (
                incomingBookings.map(b => (
                  <div key={b.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-[#00f0ff]">{b.requester?.name}</p>
                        <p className="text-xs text-slate-400">{new Date(b.scheduledAt).toLocaleString()} ({b.duration}m)</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    {b.notes && <p className="text-sm text-slate-300 mb-3 bg-[#0B0E14] p-2 rounded-lg">"{b.notes}"</p>}
                    
                    {b.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <Button variant="primary" className="flex-1 px-2 py-1 text-xs" onClick={() => handleBookingAction(b.id, 'CONFIRMED')}>Confirm</Button>
                        <Button variant="ghost" className="flex-1 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10" onClick={() => handleBookingAction(b.id, 'CANCELLED')}>Decline</Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold mb-6">My Booked Sessions (To Learn)</h2>
            <div className="space-y-3">
              {outgoingBookings.length === 0 ? (
                <p className="text-sm text-slate-500 italic">You haven't booked any sessions.</p>
              ) : (
                outgoingBookings.map(b => (
                  <div key={b.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-[#b026ff]">{b.provider?.name}</p>
                        <p className="text-xs text-slate-400">{new Date(b.scheduledAt).toLocaleString()} ({b.duration}m)</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    {b.status === 'CONFIRMED' && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <Button variant="ghost" className="w-full text-red-400 hover:bg-red-500/10 text-xs py-1" onClick={() => handleBookingAction(b.id, 'CANCELLED')}>Cancel Session</Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scheduling;
