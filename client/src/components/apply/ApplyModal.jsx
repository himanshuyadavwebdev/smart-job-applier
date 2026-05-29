import React, { useEffect, useState } from 'react';
import { useApplyStore } from '../../../store/useApplyStore.js';
import { applyApi } from '../../../api/applyApi.js';
import StepIndicator from './StepIndicator.jsx';
import TailoredResumeViewer from './TailoredResumeViewer.jsx';
import CoverLetterEditor from './CoverLetterEditor.jsx';
import ApplicationConfirm from './ApplicationConfirm.jsx';
import Button from '../common/Button.jsx';
import Spinner from '../common/Spinner.jsx';
import toast from 'react-hot-toast';

export default function ApplyModal() {
  const {
    isOpen, currentJob, generatedDocs, step,
    isGenerating, setStep, setGeneratedDocs,
    setGenerating, updateDoc, confirmApply, reset,
  } = useApplyStore();

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [applyUrl, setApplyUrl] = useState('');

  // Auto-generate on open
  useEffect(() => {
    if (isOpen && currentJob && step === 1 && !generatedDocs) {
      handleGenerate();
    }
  }, [isOpen, currentJob]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await applyApi.generate(currentJob._id);
      const docs = res.data.data;
      setGeneratedDocs(docs);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate documents. Please try again.';
      toast.error(msg);
      reset();
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await applyApi.confirm({
        jobId: currentJob._id,
        coverLetter: generatedDocs?.coverLetter,
        tailoredResumeText: generatedDocs?.tailoredResumeText,
      });
      confirmApply(res.data.data.application);
      setApplyUrl(res.data.data.applyUrl || currentJob.applyUrl || '#');
      setConfirmed(true);
      toast.success('Application confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm application.');
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setApplyUrl('');
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-slide-up flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">{currentJob?.title}</h2>
              <p className="text-sm text-slate-400 mt-0.5">{currentJob?.company}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <StepIndicator currentStep={step} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1 — Generating */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white">Crafting your application</p>
                <p className="text-sm text-slate-400 mt-1.5">
                  AI is tailoring your resume and cover letter for this role...
                </p>
              </div>
              <div className="flex flex-col gap-1.5 text-center">
                {['Analysing job requirements', 'Matching your skills', 'Generating tailored documents'].map((text, i) => (
                  <p key={i} className="text-xs text-slate-600 animate-pulse-slow" style={{ animationDelay: `${i * 0.4}s` }}>
                    {text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Tailored Resume */}
          {step === 2 && (
            <TailoredResumeViewer
              value={generatedDocs?.tailoredResumeText}
              onChange={(val) => updateDoc('tailoredResumeText', val)}
            />
          )}

          {/* Step 3 — Cover Letter */}
          {step === 3 && (
            <CoverLetterEditor
              value={generatedDocs?.coverLetter}
              onChange={(val) => updateDoc('coverLetter', val)}
            />
          )}

          {/* Step 4 — Email Draft */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Optional email draft to send alongside your application.
              </p>
              <textarea
                value={generatedDocs?.emailDraft || ''}
                onChange={(e) => updateDoc('emailDraft', e.target.value)}
                rows={8}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 leading-relaxed
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedDocs?.emailDraft || '');
                  toast.success('Email draft copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to clipboard
              </button>
            </div>
          )}

          {/* Step 5 — Confirm */}
          {step === 5 && !confirmed && (
            <ApplicationConfirm job={currentJob} docs={generatedDocs} />
          )}

          {/* Success State */}
          {confirmed && (
            <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Application Submitted!</p>
                <p className="text-sm text-slate-400 mt-1">
                  Your tailored resume and cover letter have been saved.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors text-center"
                >
                  View on Job Site →
                </a>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {step > 1 && !confirmed && (
          <div className="p-6 border-t border-slate-800 flex items-center justify-between shrink-0">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || isGenerating}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>

            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)}>
                Looks good, next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleConfirm}
                loading={confirming}
              >
                Confirm and Apply
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
