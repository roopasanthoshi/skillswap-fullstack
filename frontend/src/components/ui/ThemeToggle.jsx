import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  return (
    <button
      onClick={() => setIsLight(!isLight)}
      className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative flex items-center justify-center overflow-hidden"
    >
      <div className={`transition-transform duration-500 flex ${isLight ? '-translate-y-10' : 'translate-y-0'}`}>
        <Moon className="w-5 h-5 absolute transition-opacity duration-300" style={{ opacity: isLight ? 0 : 1 }} />
        <Sun className="w-5 h-5 absolute translate-y-10 transition-opacity duration-300" style={{ opacity: isLight ? 1 : 0 }} />
      </div>
    </button>
  );
};
