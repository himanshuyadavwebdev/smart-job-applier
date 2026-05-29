import React from 'react';

export default function ProgressBar({ value = 0, max = 100, color = 'blue', showLabel = false, className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">{value}</span>
          <span className="text-xs text-slate-500">{max}</span>
        </div>
      )}
    </div>
  );
}
