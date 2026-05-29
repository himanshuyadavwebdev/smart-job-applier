import React from 'react';
import ATSScoreCard from './ATSScoreCard.jsx';

export default function ResumePreview({ resume }) {
  if (!resume) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">{resume.fileName}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Resume</p>
        </div>
        <a
          href={resume.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View file
        </a>
      </div>
      <ATSScoreCard classification={resume.classification} />
    </div>
  );
}
