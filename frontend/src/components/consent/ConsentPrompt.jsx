import React from 'react';
import { Shield, Clock, Building2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatDate';

export function ConsentPrompt({ consent, onApprove, onReject, loading = false }) {
  if (!consent) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl border border-amber-200/80 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-200/60 text-amber-900">
              <Clock className="w-3.5 h-3.5" /> Action Required: Consent Request
            </span>
            <span className="text-xs text-slate-500">
              Expires: {formatDate(consent.expiresAt)}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-2">
            Authorization to Share Data from {consent.dataOwnerId || 'Revenue Department'}
          </h3>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            <strong className="text-slate-800">{consent.requesterId || 'Education Department'}</strong> has requested access to your official records for:
            <span className="block mt-1 italic font-medium text-slate-700 bg-white/60 p-2 rounded-lg border border-amber-200/40">
              "{consent.purpose || 'Scholarship Scheme Eligibility Verification'}"
            </span>
          </p>

          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Requested Data Fields:
            </h4>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {(consent.requestedFields || ['annualIncome', 'incomeCertificateNumber', 'domicileStatus']).map((field) => (
                <span
                  key={field}
                  className="px-2.5 py-1 bg-white rounded-md text-xs font-mono font-medium text-slate-700 border border-slate-200 shadow-xs"
                >
                  ✓ {field}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-200/60 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(consent.id || consent.consentId)}
              disabled={loading}
              className="text-rose-700 border-rose-200 hover:bg-rose-50"
            >
              <X className="w-4 h-4 mr-1.5" /> Deny Consent
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => onApprove(consent.id || consent.consentId)}
              loading={loading}
            >
              <Check className="w-4 h-4 mr-1.5" /> Approve & Share Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
