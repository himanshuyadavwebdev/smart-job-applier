import React, { useState, useEffect } from 'react';
import { resumeApi } from '../api/resumeApi.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { useResumeStore } from '../store/useResumeStore.js';
import Navbar from '../components/common/Navbar.jsx';
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
    <div className="min-h-[42px] flex flex-wrap gap-1.5 p-2 bg-slate-800/60 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 transition-all">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 text-blue-300 text-xs rounded-full border border-blue-500/20">
          {t}
          <button onClick={() => onRemove(t)} className="hover:text-white">×</button>
        </span>
      ))}
      <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={handleKey}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-200 placeholder-slate-600" />
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { activeResume, setResume, setAnalyzing, isAnalyzing } = useResumeStore();

  const [prefs, setPrefs] = useState({
    desiredRole: '', experienceLevel: '', targetLevel: '',
    salaryMin: '', salaryMax: '', currency: 'USD',
    jobType: [], preferredLocations: [], techStack: [],
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPrefs({
        desiredRole: user.preferences.desiredRole || '',
        experienceLevel: user.preferences.experienceLevel || '',
        targetLevel: user.preferences.targetLevel || '',
        salaryMin: user.preferences.salaryMin || '',
        salaryMax: user.preferences.salaryMax || '',
        currency: user.preferences.currency || 'USD',
        jobType: user.preferences.jobType || [],
        preferredLocations: user.preferences.preferredLocations || [],
        techStack: user.preferences.techStack || [],
      });
    }
    if (!activeResume) {
      resumeApi.getActive()
        .then((res) => setResume(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  const updatePref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));
  const toggleJobType = (type) => {
    setPrefs((p) => ({
      ...p,
      jobType: p.jobType.includes(type) ? p.jobType.filter((t) => t !== type) : [...p.jobType, type],
    }));
  };

  const handleFileSelect = async (file) => {
    setAnalyzing(true);
    try {
      const fd = buildFormData(file);
      const res = await resumeApi.upload(fd);
      setResume(res.data.data);
      setShowUploader(false);
      toast.success('Resume updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume.');
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
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your resume and job preferences.</p>
        </div>

        {/* User card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            {user?.preferences?.desiredRole && (
              <p className="text-xs text-blue-400 mt-1">{user.preferences.desiredRole} — {user.preferences.experienceLevel}</p>
            )}
          </div>
        </div>

        {/* Resume section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Active Resume</h2>
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showUploader ? 'Cancel' : 'Upload new'}
            </button>
          </div>

          {showUploader && (
            <div className="animate-fade-in">
              <ResumeUploader onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
              {isAnalyzing && (
                <div className="flex items-center gap-3 mt-3 p-4 bg-blue-900/20 border border-blue-800/40 rounded-xl">
                  <Spinner size="md" />
                  <p className="text-sm text-blue-300">Analysing with AI...</p>
                </div>
              )}
            </div>
          )}

          {activeResume ? (
            <ATSScoreCard classification={activeResume.classification} />
          ) : (
            <div className="text-sm text-slate-600 py-4 text-center">
              No resume uploaded yet.
            </div>
          )}
        </div>

        {/* Preferences form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Job Preferences</h2>
          <form onSubmit={handleSavePrefs} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Desired Role</label>
                <input type="text" value={prefs.desiredRole} onChange={(e) => updatePref('desiredRole', e.target.value)} placeholder="e.g. Full Stack Developer" className="input" />
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
                    <div onClick={() => toggleJobType(type)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${prefs.jobType.includes(type) ? 'bg-blue-600 border-blue-600' : 'border-slate-600'}`}>
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
              <TagInput tags={prefs.preferredLocations}
                onAdd={(v) => updatePref('preferredLocations', [...prefs.preferredLocations, v])}
                onRemove={(v) => updatePref('preferredLocations', prefs.preferredLocations.filter((l) => l !== v))}
                placeholder="Type a city and press Enter" />
            </div>

            <div>
              <label className="label">Tech Stack</label>
              <TagInput tags={prefs.techStack}
                onAdd={(v) => updatePref('techStack', [...prefs.techStack, v])}
                onRemove={(v) => updatePref('techStack', prefs.techStack.filter((t) => t !== v))}
                placeholder="Type a technology and press Enter" />
            </div>

            <Button type="submit" loading={savingPrefs} className="w-full">
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
