import React from 'react';

export default function TailoredResumeViewer({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          AI has optimised your resume for this role. You can edit directly below.
        </p>
        <span className="text-xs text-slate-600">{value?.split(/\s+/).filter(Boolean).length || 0} words</span>
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 leading-relaxed
                   placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   resize-none font-mono transition-all"
        placeholder="Your tailored resume will appear here..."
      />
    </div>
  );
}
