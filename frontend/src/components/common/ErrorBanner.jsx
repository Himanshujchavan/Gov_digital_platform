import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ErrorBanner({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 my-4">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-800">Operation Error</h4>
        <p className="text-xs text-rose-700 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-rose-800 hover:text-rose-900 underline ml-auto"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
