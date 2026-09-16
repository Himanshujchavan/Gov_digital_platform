import React from 'react';

export function Loader({ text = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mb-3" />
      <p className="text-sm font-medium text-slate-600">{text}</p>
    </div>
  );
}
