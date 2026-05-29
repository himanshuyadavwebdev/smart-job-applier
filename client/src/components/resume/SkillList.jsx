import React from 'react';

export default function SkillList({ skills = [], variant = 'blue', max = 20 }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    gray: 'bg-slate-700/50 text-slate-300 border-slate-700',
  };

  const visible = skills.slice(0, max);
  const remaining = skills.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((skill) => (
        <span
          key={skill}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]}`}
        >
          {skill}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
