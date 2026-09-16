import React from 'react';
import { UserCheck, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export function MatchConfidenceCard({ confidence = 0.964, masterId = 'MC-10024', matchedFields = [] }) {
  const percentage = Math.round(confidence * 1000) / 10;
  const isHighConfidence = confidence >= 0.9;
  const isBorderline = confidence >= 0.7 && confidence < 0.9;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isHighConfidence ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Probabilistic MDM Resolution</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
                AI Linkage
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned Master Citizen ID: <strong className="text-slate-800 font-mono">{masterId}</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {percentage}%
          </div>
          <span className="text-[11px] font-medium text-emerald-600 flex items-center justify-end gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> High Confidence Match
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isHighConfidence ? 'bg-purple-600' : isBorderline ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Matched Attributes Breakdown */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Linkage Criteria:</span>
        <div className="flex gap-2">
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Name: 98% (Jaro-Winkler)</span>
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">DOB: 100%</span>
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Address: 92%</span>
        </div>
      </div>
    </div>
  );
}
