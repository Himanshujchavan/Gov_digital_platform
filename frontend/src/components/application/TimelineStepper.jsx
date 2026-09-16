import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const WORKFLOW_STEPS = [
  { id: 'APPLICATION_RECEIVED', label: 'Application Submitted', desc: 'Received by MahaDBT portal' },
  { id: 'CONSENT_REQUESTED', label: 'Consent Requested', desc: 'Authorization requested to fetch Revenue record' },
  { id: 'CONSENT_GRANTED', label: 'Consent Granted', desc: 'Citizen authorized cross-department data access' },
  { id: 'MDM_RESOLUTION', label: 'MDM Entity Resolution', desc: 'Citizen resolved to Master ID (MC-10024)' },
  { id: 'DATA_RETRIEVAL', label: 'Revenue Data Retrieval', desc: 'Income certificate retrieved via Adapter' },
  { id: 'DATA_VALIDATION', label: 'Canonical Validation', desc: 'Schema verified and normalized' },
  { id: 'ELIGIBILITY_CHECK', label: 'Eligibility Engine', desc: 'Income criteria checked (≤ ₹2,50,000)' },
  { id: 'OFFICER_REVIEW', label: 'Department Review', desc: 'Awaiting Education Officer sign-off' },
  { id: 'APPROVED', label: 'Final Decision', desc: 'Application Approved' },
];

export function TimelineStepper({ currentStep, history = [], isTerminalRejected = false }) {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {WORKFLOW_STEPS.map((step, idx) => {
        const historyItem = history.find((h) => h.step === step.id);
        const isPast = currentIndex > idx || (currentStep === 'APPROVED' && idx === WORKFLOW_STEPS.length - 1);
        const isCurrent = currentStep === step.id;
        const isRejectedAtThisStep = isTerminalRejected && isCurrent;

        let icon = <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />;
        let circleClass = 'border-slate-200 bg-white text-slate-400';
        let titleClass = 'text-slate-500';

        if (isPast) {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
          circleClass = 'border-emerald-500 bg-emerald-50 text-emerald-600';
          titleClass = 'text-slate-900 font-semibold';
        } else if (isRejectedAtThisStep) {
          icon = <XCircle className="w-5 h-5 text-rose-600" />;
          circleClass = 'border-rose-500 bg-rose-50 text-rose-600';
          titleClass = 'text-rose-900 font-bold';
        } else if (isCurrent) {
          icon = <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
          circleClass = 'border-blue-600 bg-blue-50 text-blue-600 ring-4 ring-blue-100';
          titleClass = 'text-blue-900 font-bold';
        }

        return (
          <div key={step.id} className="relative flex items-start gap-4 group">
            {/* Step node indicator */}
            <div
              className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border bg-white z-10 transition-transform ${circleClass}`}
            >
              {icon}
            </div>

            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${titleClass}`}>{step.label}</span>
                {historyItem?.timestamp && (
                  <span className="text-xs text-slate-400 font-mono">
                    {formatDate(historyItem.timestamp)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{step.desc}</p>

              {historyItem?.details && (
                <div className="mt-2 text-xs bg-slate-50 rounded-lg p-2 text-slate-700 font-mono border border-slate-100">
                  {typeof historyItem.details === 'string'
                    ? historyItem.details
                    : JSON.stringify(historyItem.details, null, 2)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
