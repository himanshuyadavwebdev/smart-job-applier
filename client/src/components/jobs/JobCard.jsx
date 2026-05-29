import React, { useState } from 'react';
import { formatDistanceToNow } from '../../../utils/formatters.js';
import MatchBadge from './MatchBadge.jsx';
import SkillList from '../resume/SkillList.jsx';
import { jobApi } from '../../../api/jobApi.js';
import { useApplyStore } from '../../../store/useApplyStore.js';
import { useJobStore } from '../../../store/useJobStore.js';
import toast from 'react-hot-toast';

export default function JobCard({ job }) {
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const { startApply } = useApplyStore();
  const { toggleSaveJob } = useJobStore();

  const handleSave = async (e) => {
    e.stopPropagation();
    setSaving(true);
    try {
      if (isSaved) {
        await jobApi.unsave(job._id);
        setIsSaved(false);
        toggleSaveJob(job._id);
        toast.success('Removed from saved jobs.');
      } else {
        await jobApi.save(job._id);
        setIsSaved(true);
        toggleSaveJob(job._id);
        toast.success('Job saved!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save job.';
      if (msg.includes('already saved')) {
        setIsSaved(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    startApply(job);
  };

  const salaryText = (() => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} — ${fmt(job.salaryMax)}`;
    if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
    return `Up to ${fmt(job.salaryMax)}`;
  })();

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1 group-hover:text-blue-300 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5 truncate">{job.company}</p>
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        )}
        {job.jobType && (
          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700">
            {job.jobType}
          </span>
        )}
        {salaryText && (
          <span className="text-xs font-medium text-emerald-400">{salaryText}</span>
        )}
        {job.postedAt && (
          <span className="text-xs text-slate-600 ml-auto">
            {formatDistanceToNow(job.postedAt)}
          </span>
        )}
      </div>

      {job.skills?.length > 0 && (
        <div className="mb-4">
          <SkillList skills={job.skills} max={5} variant="gray" />
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all border ${
            isSaved
              ? 'bg-emerald-600/15 text-emerald-400 border-emerald-700/40 hover:bg-emerald-600/25'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
          } disabled:opacity-50`}
        >
          <svg className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {isSaved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={handleApply}
          className="flex-[2] flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Easy Apply
        </button>
      </div>
    </div>
  );
}
