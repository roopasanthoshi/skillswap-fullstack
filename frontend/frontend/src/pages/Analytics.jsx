import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Users, Zap, Search } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

const data = [
  { name: 'Jan', users: 400, matches: 240, skills: 100 },
  { name: 'Feb', users: 600, matches: 400, skills: 200 },
  { name: 'Mar', users: 900, matches: 600, skills: 400 },
  { name: 'Apr', users: 1500, matches: 1000, skills: 800 },
  { name: 'May', users: 2000, matches: 1500, skills: 1200 },
  { name: 'Jun', users: 2800, matches: 2100, skills: 1800 },
];

const skillData = [
  { name: 'React', value: 400 },
  { name: 'Python', value: 300 },
  { name: 'Node.js', value: 300 },
  { name: 'UI/UX', value: 200 },
  { name: 'AWS', value: 150 },
];

const COLORS = ['#00f0ff', '#b026ff', '#ff0055', '#22c55e', '#f59e0b'];

const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * (to - from) + from));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [from, to, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay for real feel
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-20 w-1/3 mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-80"><Skeleton className="w-full h-full" /></Card>
          <Card className="h-80"><Skeleton className="w-full h-full" /></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/10 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Activity className="text-[#00f0ff] w-10 h-10" />
          Network Intelligence
        </h1>
        <p className="text-slate-400 text-lg mt-2">
          Real-time analytics on the Nexus ecosystem growth and skill trends.
        </p>
      </div>

      {/* Metric Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={item}>
          <Card variant="glass" className="p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Users className="text-[#00f0ff] mb-4 w-8 h-8" />
            <p className="text-slate-400 text-sm">Active Nodes</p>
            <h2 className="text-3xl font-bold text-white"><AnimatedCounter from={0} to={12450} /></h2>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card variant="glass" className="p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#b026ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="text-[#b026ff] mb-4 w-8 h-8" />
            <p className="text-slate-400 text-sm">Successful Swaps</p>
            <h2 className="text-3xl font-bold text-white"><AnimatedCounter from={0} to={8932} /></h2>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="glass" className="p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff0055]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Search className="text-[#ff0055] mb-4 w-8 h-8" />
            <p className="text-slate-400 text-sm">Queries Processed</p>
            <h2 className="text-3xl font-bold text-white"><AnimatedCounter from={0} to={45192} /></h2>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div variants={item}>
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold mb-6">User Growth & Matches</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0B0E14', borderColor: 'rgba(0,240,255,0.2)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#00f0ff" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-bold mb-6">Trending Skills Demand</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#0B0E14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#b026ff" radius={[0, 4, 4, 0]}>
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Analytics;
