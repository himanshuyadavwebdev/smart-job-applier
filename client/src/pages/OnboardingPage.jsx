import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../api/resumeApi.js';
import { useResumeStore } from '../store/useResumeStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ResumeUploader from '../components/resume/ResumeUploader.jsx';
import ATSScoreCard from '../components/resume/ATSScoreCard.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { buildFormData } from '../utils/fileHelpers.js';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];
const JOB_TYPES = ['Remote', 'Hybrid', 'On-site'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];

function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [val, setVal] = useState('');
  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && val.trim()) {
      e.preventDefault();
      onAdd(val.trim());
      setVal('');
    }
  };
  return (
    <div className="min-h-[42px] flex flex-wrap gap-1.5 p-2 bg-slate-800/60 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 text-blue-300 text-xs rounded-full border border-blue-500/20">
          {t}
          <button onClick={() => onRemove(t)} className="hover:text-white transition-colors ml-0.5">×</button>
        </span>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKey}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-200 placeholder-slate-600"
      />
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setResume, setAnalyzing, isAnalyzing } = useResumeStore();
  const { setUser, user } = useAuthStore();

  const [uploadedResume, setUploadedResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [prefs, setPrefs] = useState({
    desiredRole: user?.preferences?.desiredRole || '',
    experienceLevel: user?.preferences?.experienceLevel || '',
    targetLevel: user?.preferences?.targetLevel || '',
    salaryMin: user?.preferences?.salaryMin || '',
    salaryMax: user?.preferences?.salaryMax || '',
    currency: user?.preferences?.currency || 'USD',
    jobType: user?.preferences?.jobType || [],
    preferredLocations: user?.preferences?.preferredLocations || [],
    techStack: user?.preferences?.techStack || [],
  });

  const updatePref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));

  const toggleJobType = (type) => {
    setPrefs((p) => ({
      ...p,
      jobType: p.jobType.includes(type) ? p.jobType.filter((t) => t !== type) : [...p.jobType, type],
    }));
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setAnalyzing(true);
    try {
      const fd = buildFormData(file);
      const res = await resumeApi.upload(fd);
      setUploadedResume(res.data.data);
      setResume(res.data.data);
      toast.success('Resume analysed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyse resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await resumeApi.updatePreferences({
        ...prefs,
        salaryMin: Number(prefs.salaryMin) || 0,
        salaryMax: Number(prefs.salaryMax) || 0,
      });
      toast.success('Preferences saved! Finding your matched jobs...');
      setTimeout(() => navigate('/jobs'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm">Smart Job Applier</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Step</span>
            <span className="text-xs font-medium text-blue-400">{uploadedResume ? '2' : '1'} / 2</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Section 1 — Resume Upload */}
        <section className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Upload your resume</h1>
            <p className="text-slate-400 text-sm mt-1">
              We will analyse it with AI to understand your skills, experience level, and ATS compatibility.
            </p>
          </div>

          <ResumeUploader onFileSelect={handleFileSelect} isLoading={isAnalyzing} />

          {isAnalyzing && (
            <div className="flex items-center gap-3 p-4 bg-blue-900/20 border border-blue-800/40 rounded-xl">
              <Spinner size="md" />
              <div>
                <p className="text-sm font-medium text-blue-300">Analysing your resume with AI...</p>
                <p className="text-xs text-blue-400/60 mt-0.5">This takes 10–20 seconds.</p>
              </div>
            </div>
          )}

          {uploadedResume && !isAnalyzing && (
            <ATSScoreCard classification={uploadedResume.classification} />
          )}
        </section>

        {/* Section 2 — Preferences */}
        {uploadedResume && !isAnalyzing && (
          <section className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white">Set your preferences</h2>
              <p className="text-slate-400 text-sm mt-1">
                Help us find the most relevant jobs for you.
              </p>
            </div>

            <form onSubmit={handleSavePrefs} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Desired Role</label>
                  <input
                    type="text"
                    value={prefs.desiredRole}
                    onChange={(e) => updatePref('desiredRole', e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <select value={prefs.experienceLevel} onChange={(e) => updatePref('experienceLevel', e.target.value)} className="input">
                    <option value="">Select level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Target Level</label>
                  <select value={prefs.targetLevel} onChange={(e) => updatePref('targetLevel', e.target.value)} className="input">
                    <option value="">Select target</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select value={prefs.currency} onChange={(e) => updatePref('currency', e.target.value)} className="input">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Min. Salary</label>
                  <input type="number" value={prefs.salaryMin} onChange={(e) => updatePref('salaryMin', e.target.value)} placeholder="e.g. 80000" className="input" min={0} />
                </div>
                <div>
                  <label className="label">Max. Salary</label>
                  <input type="number" value={prefs.salaryMax} onChange={(e) => updatePref('salaryMax', e.target.value)} placeholder="e.g. 120000" className="input" min={0} />
                </div>
              </div>

              <div>
                <label className="label">Job Type</label>
                <div className="flex gap-4">
                  {JOB_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => toggleJobType(type)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                          prefs.jobType.includes(type) ? 'bg-blue-600 border-blue-600' : 'border-slate-600'
                        }`}
                      >
                        {prefs.jobType.includes(type) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span onClick={() => toggleJobType(type)} className="text-sm text-slate-300 cursor-pointer">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Preferred Locations</label>
                <TagInput
                  tags={prefs.preferredLocations}
                  onAdd={(v) => updatePref('preferredLocations', [...prefs.preferredLocations, v])}
                  onRemove={(v) => updatePref('preferredLocations', prefs.preferredLocations.filter((l) => l !== v))}
                  placeholder="Type a city and press Enter"
                />
              </div>

              <div>
                <label className="label">Tech Stack Preferences</label>
                <TagInput
                  tags={prefs.techStack}
                  onAdd={(v) => updatePref('techStack', [...prefs.techStack, v])}
                  onRemove={(v) => updatePref('techStack', prefs.techStack.filter((t) => t !== v))}
                  placeholder="Type a technology and press Enter"
                />
              </div>

              <Button type="submit" loading={savingPrefs} size="lg" className="w-full mt-2">
                Find My Matched Jobs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
