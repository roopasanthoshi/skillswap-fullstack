import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Cpu, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const LandingPage = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* Abstract geometric background elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#00f0ff] opacity-10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#b026ff] opacity-10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <span className="text-sm font-medium text-slate-300">Nexus Platform v2.0 is Live</span>
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#b026ff] to-[#ff0055]">
              Skill Exchange
            </span>
          </motion.h1>
          
          <motion.p variants={item} className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with a global network of professionals. Teach what you know, learn what you don't. Powered by advanced matching algorithms.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto flex items-center gap-2 group">
                Initialize Sequence
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Authenticate
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <Card variant="glass" className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-[#00f0ff]/10 flex items-center justify-center mb-6 border border-[#00f0ff]/20">
              <Cpu className="w-7 h-7 text-[#00f0ff]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Neural Matching</h3>
            <p className="text-slate-400 leading-relaxed">
              Our advanced engine analyzes your skills and interests to find the perfect learning partner instantly.
            </p>
          </Card>

          <Card variant="glass" className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b026ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-[#b026ff]/10 flex items-center justify-center mb-6 border border-[#b026ff]/20">
              <Globe className="w-7 h-7 text-[#b026ff]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Network</h3>
            <p className="text-slate-400 leading-relaxed">
              Access a worldwide database of experts. Break geographical boundaries to expand your knowledge.
            </p>
          </Card>

          <Card variant="glass" className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff0055]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-[#ff0055]/10 flex items-center justify-center mb-6 border border-[#ff0055]/20">
              <Shield className="w-7 h-7 text-[#ff0055]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Exchange</h3>
            <p className="text-slate-400 leading-relaxed">
              End-to-end encrypted chats and verified profiles ensure a safe environment for your learning journey.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
