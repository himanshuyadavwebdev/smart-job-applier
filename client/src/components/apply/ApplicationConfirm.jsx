import React from 'react';

export default function ApplicationConfirm({ job, docs }) {
  return (
    <div className="space-y-5">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">{job?.title}</h3>
        <p className="text-sm text-slate-400">{job?.company} &mdash; {job?.location}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resume Preview</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
            {docs?.tailoredResumeText || '—'}
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Cover Letter Preview</h4>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
            {docs?.coverLetter || '—'}
          </p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-blue-300 leading-relaxed">
          By confirming, you acknowledge that this application is ready to submit.
          You will be redirected to the employer's site to complete the application process.
        </p>
      </div>
    </div>
  );
}
