import React, { useEffect, useCallback } from 'react';
import { jobApi } from '../api/jobApi.js';
import { useJobStore } from '../store/useJobStore.js';
import Navbar from '../components/common/Navbar.jsx';
import JobList from '../components/jobs/JobList.jsx';
import JobFilters from '../components/jobs/JobFilters.jsx';
import ApplyModal from '../components/apply/ApplyModal.jsx';
import { useApplyStore } from '../store/useApplyStore.js';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const { jobs, filters, currentPage, totalCount, isLoading, setJobs, setFilters, setPage, setLoading } = useJobStore();
  const { isOpen } = useApplyStore();

  const totalPages = Math.ceil(totalCount / 20);

  const fetchJobs = useCallback(async (overrideFilters, overridePage) => {
    setLoading(true);
    try {
      const params = {
        page: overridePage ?? currentPage,
        limit: 20,
        ...(overrideFilters ?? filters),
      };
      // Remove empty values
      Object.keys(params).forEach((k) => { if (params[k] === '' || params[k] == null) delete params[k]; });

      const res = await jobApi.getMatched(params);
      const { jobs: fetched, total } = res.data.data;
      setJobs(fetched, total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchJobs(newFilters, 1);
  };

  const handlePageChange = (page) => {
    setPage(page);
    fetchJobs(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h3>
              <JobFilters
                filters={filters}
                onChange={setFilters}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>
          </aside>

          {/* Main job list */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Matched Jobs</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isLoading ? 'Fetching live jobs...' : `${totalCount} jobs ranked by your profile`}
                </p>
              </div>
              <button
                onClick={() => fetchJobs()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            <JobList
              jobs={jobs}
              isLoading={isLoading}
              totalCount={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>

      {isOpen && <ApplyModal />}
    </div>
  );
}
