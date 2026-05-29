import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { applyApi } from '../api/applyApi.js';
import Navbar from '../components/common/Navbar.jsx';
import Badge from '../components/common/Badge.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { formatDate } from '../utils/formatters.js';
import { getStatusColor, getStatusLabel } from '../utils/scoreUtils.js';
import toast from 'react-hot-toast';

function MetricCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-900/30 to-transparent border-blue-800/40',
    green: 'from-emerald-900/30 to-transparent border-emerald-800/40',
    amber: 'from-amber-900/20 to-transparent border-amber-800/30',
    red: 'from-red-900/20 to-transparent border-red-800/30',
  };
  const textColors = { blue: 'text-blue-400', green: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400' };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

function buildChartData(applications) {
  const counts = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    counts[key] = 0;
  }
  applications.forEach((app) => {
    if (app.appliedAt) {
      const key = new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in counts) counts[key]++;
    }
  });
  return Object.entries(counts).map(([date, applications]) => ({ date, applications }));
}

function buildSkillGapData(applications) {
  const freq = {};
  applications.forEach((app) => {
    const job = app.jobId;
    if (!job?.skills) return;
    job.skills.forEach((skill) => {
      freq[skill] = (freq[skill] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
}

export default function DashboardPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await applyApi.getHistory();
        setApps(res.data.data);
      } catch {
        toast.error('Failed to load application history.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await applyApi.updateStatus(appId, status);
      setApps((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
      if (selectedApp?._id === appId) setSelectedApp((a) => ({ ...a, status }));
      toast.success('Status updated.');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const total = apps.length;
  const applied = apps.filter((a) => ['applied', 'rejected', 'interview'].includes(a.status)).length;
  const interviews = apps.filter((a) => a.status === 'interview').length;
  const rejected = apps.filter((a) => a.status === 'rejected').length;
  const rejectionRate = applied > 0 ? Math.round((rejected / applied) * 100) : 0;

  const chartData = buildChartData(apps);
  const skillGap = buildSkillGapData(apps);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your job search progress.</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Saved" value={total} sub="All applications" color="blue" />
          <MetricCard label="Applied" value={applied} sub="Confirmed submissions" color="green" />
          <MetricCard label="Interviews" value={interviews} sub="Requested by employers" color="amber" />
          <MetricCard label="Rejection Rate" value={`${rejectionRate}%`} sub={rejected > 0 ? `${rejected} rejections` : 'No rejections yet'} color={rejectionRate > 40 ? 'red' : 'blue'} />
        </div>

        {/* Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-5">Applications (Last 30 Days)</h2>
          {applied === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
              No applications submitted yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#475569', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application history */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">Application History</h2>
            </div>
            {apps.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">
                No applications yet. Start applying from the Jobs page.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-500 bg-slate-800/40">
                      <th className="px-4 py-3 font-medium">Job</th>
                      <th className="px-4 py-3 font-medium">Match</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {apps.map((app) => (
                      <tr
                        key={app._id}
                        onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-200 truncate max-w-[180px]">{app.jobId?.title || '—'}</p>
                          <p className="text-slate-500 truncate max-w-[180px]">{app.jobId?.company || ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${app.matchScore >= 70 ? 'text-emerald-400' : app.matchScore >= 50 ? 'text-blue-400' : 'text-slate-400'}`}>
                            {app.matchScore ? `${app.matchScore}%` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusColor(app.status)}>
                            {getStatusLabel(app.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {formatDate(app.appliedAt || app.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detail panel */}
            {selectedApp && (
              <div className="border-t border-slate-800 p-5 animate-fade-in bg-slate-800/30">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selectedApp.jobId?.title}</h3>
                    <p className="text-xs text-slate-400">{selectedApp.jobId?.company} — {selectedApp.jobId?.location}</p>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="text-slate-500 hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Update status:</span>
                  {['applied', 'interview', 'rejected'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedApp._id, s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedApp.status === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skill gap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-300">Skills in Applied Jobs</h2>
              <p className="text-xs text-slate-600 mt-0.5">How often each skill appears</p>
            </div>
            {skillGap.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600">Apply to jobs to see skill frequency.</div>
            ) : (
              <div className="p-5 space-y-3">
                {skillGap.map(({ skill, count }) => (
                  <div key={skill}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-300">{skill}</span>
                      <span className="text-xs text-slate-500">{count} job{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${(count / (skillGap[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
