import React from 'react';

const variants = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  gray: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

export default function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
