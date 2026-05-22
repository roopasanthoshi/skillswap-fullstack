import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from './Card';

export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="w-full max-w-md relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00f0ff] to-[#b026ff] rounded-2xl blur opacity-20" />
            <Card variant="solid" className="p-6 relative border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {children}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
