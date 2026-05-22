import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export function Card({ children, className, variant = 'glass', ...props }) {
  const variants = {
    glass: 'glass-card',
    solid: 'bg-[#141822] border border-white/5 rounded-xl',
    panel: 'glass-panel',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={twMerge(clsx(variants[variant], 'p-6', className))}
      {...props}
    >
      {children}
    </motion.div>
  );
}
