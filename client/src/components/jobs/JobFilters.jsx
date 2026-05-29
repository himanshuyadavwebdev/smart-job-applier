import React, { useState } from 'react';
import Button from '../common/Button.jsx';

const JOB_TYPES = ['Remote', 'Hybrid', 'On-site'];
const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];

export default function JobFilters({ filters, onChange, onSearch, isLoading }) {
  const [local, setLocal] = useState(filters);

  const update = (key, value) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onChange(updated);
  };

  const toggleJobType = (type) => {
    const current = local.jobType === type ? '' : type;
    update('jobType', current);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(local);
  };

  const handleReset = () => {
    const reset = { role: '', location: '', jobType: '', salaryMin: '', experienceLevel: '' };
    setLocal(reset);
    onChange(reset);
    onSearch(reset);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Role / Keywords</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={local.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder="e.g. React Developer"
            className="input pl-9"
          />
        </div>
      </div>

      <div>
        <label className="label">Location</label>
        <input
          type="text"
          value={local.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="e.g. New York, Remote"
          className="input"
        />
      </div>

      <div>
        <label className="label">Job Type</label>
        <div className="space-y-2">
          {JOB_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  local.jobType === type
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-600 group-hover:border-slate-500'
                }`}
                onClick={() => toggleJobType(type)}
              >
                {local.jobType === type && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                onClick={() => toggleJobType(type)}
                className={`text-sm ${local.jobType === type ? 'text-slate-200' : 'text-slate-400'}`}
              >
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Min. Salary (USD/yr)</label>
        <input
          type="number"
          value={local.salaryMin}
          onChange={(e) => update('salaryMin', e.target.value)}
          placeholder="e.g. 80000"
          className="input"
          min={0}
          step={5000}
        />
      </div>

      <div>
        <label className="label">Experience Level</label>
        <select
          value={local.experienceLevel}
          onChange={(e) => update('experienceLevel', e.target.value)}
          className="input"
        >
          <option value="">Any level</option>
          {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button type="submit" loading={isLoading} className="w-full">
          Find Jobs
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset} className="w-full text-slate-500 text-xs">
          Reset filters
        </Button>
      </div>
    </form>
  );
}
