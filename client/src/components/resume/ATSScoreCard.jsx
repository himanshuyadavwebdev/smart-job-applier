import React from 'react';

function CircularScore({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#3b82f6' :
    score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-white">{score}</div>
        <div className="text-xs text-slate-500">/ 100</div>
      </div>
    </div>
  );
}

export default function ATSScoreCard({ classification }) {
  if (!classification) return null;

  const { atsScore = 0, role, experienceLevel, summary, strengths = [], missingSkills = [], skills = [], techStack = [] } = classification;

  const scoreLabel =
    atsScore >= 80 ? { text: 'Excellent', color: 'text-emerald-400' } :
    atsScore >= 60 ? { text: 'Good', color: 'text-blue-400' } :
    atsScore >= 40 ? { text: 'Fair', color: 'text-amber-400' } :
    { text: 'Needs Work', color: 'text-red-400' };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              {role || 'Professional'}
            </span>
            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {experienceLevel}
            </span>
          </div>
          {summary && <p className="text-sm text-slate-400 leading-relaxed mt-2">{summary}</p>}
        </div>
        <div className="text-center shrink-0">
          <CircularScore score={atsScore} />
          <p className={`text-xs font-medium mt-1 ${scoreLabel.color}`}>{scoreLabel.text}</p>
          <p className="text-xs text-slate-500">ATS Score</p>
        </div>
      </div>

      {skills.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills Detected</h4>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set([...techStack, ...skills])].slice(0, 16).map((skill) => (
              <span key={skill} className="px-2.5 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Strengths</h4>
            <ul className="space-y-1.5">
              {strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills to Add</h4>
            <ul className="space-y-1.5">
              {missingSkills.slice(0, 5).map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-amber-400 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
