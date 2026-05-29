export function getScoreColor(score) {
  if (score >= 80) return 'emerald';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'amber';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export function getStatusColor(status) {
  const map = {
    saved: 'gray',
    generating: 'blue',
    previewing: 'purple',
    applied: 'blue',
    rejected: 'red',
    interview: 'green',
  };
  return map[status] || 'gray';
}

export function getStatusLabel(status) {
  const map = {
    saved: 'Saved',
    generating: 'Generating',
    previewing: 'Previewing',
    applied: 'Applied',
    rejected: 'Rejected',
    interview: 'Interview',
  };
  return map[status] || status;
}
