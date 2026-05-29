import React from 'react';

const STEPS = [
  { label: 'Generating' },
  { label: 'Resume' },
  { label: 'Cover Letter' },
  { label: 'Email' },
  { label: 'Confirm' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span className={`text-xs hidden sm:block ${isActive ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-colors ${isDone ? 'bg-emerald-700/60' : 'bg-slate-800'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
