import React from 'react';

export default function MatchBadge({ score }) {
  if (score == null) return null;

  const config =
    score >= 80
      ? { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', label: 'Strong Match' }
      : score >= 60
      ? { bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400', label: 'Good Match' }
      : score >= 40
      ? { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', label: 'Fair Match' }
      : { bg: 'bg-slate-700/50 border-slate-600', text: 'text-slate-400', label: 'Low Match' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-blue-400' : score >= 40 ? 'bg-amber-400' : 'bg-slate-500'}`} />
      {score}% {config.label}
    </span>
  );
}
