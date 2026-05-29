import React from 'react';

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-16 h-16' };

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-slate-700 border-t-blue-500 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
