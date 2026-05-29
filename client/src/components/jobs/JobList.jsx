import React from 'react';
import JobCard from './JobCard.jsx';
import Spinner from '../common/Spinner.jsx';

function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-5 w-24 bg-slate-800 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-28 bg-slate-800 rounded" />
        <div className="h-5 w-16 bg-slate-800 rounded-full" />
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => <div key={i} className="h-5 w-16 bg-slate-800 rounded-full" />)}
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <div className="flex-1 h-8 bg-slate-800 rounded-lg" />
        <div className="flex-[2] h-8 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}

export default function JobList({ jobs, isLoading, totalCount, currentPage, totalPages, onPageChange }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!isLoading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No jobs found</p>
        <p className="text-sm text-slate-600 mt-1">Try adjusting your filters or preferences.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Showing <span className="text-slate-300 font-medium">{jobs.length}</span> of{' '}
        <span className="text-slate-300 font-medium">{totalCount}</span> matched jobs
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jobs.map((job) => <JobCard key={job._id} job={job} />)}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pg = i + 1;
            return (
              <button
                key={pg}
                onClick={() => onPageChange(pg)}
                className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                  pg === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {pg}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
