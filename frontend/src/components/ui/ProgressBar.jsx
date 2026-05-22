import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({ progress, className, color = '#00f0ff' }) => {
  return (
    <div className={`w-full bg-[#141822] rounded-full h-2.5 border border-white/5 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-2.5 rounded-full relative"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
      </motion.div>
    </div>
  );
};
