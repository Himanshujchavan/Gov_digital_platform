import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { consentApi } from '../../api/consent.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConsentPrompt } from '../../components/consent/ConsentPrompt';
import { formatDate } from '../../utils/formatDate';
import { ShieldCheck, ShieldAlert, History, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export function ConsentRequestsPage() {
  const { user } = useAuthStore();

  const [pendingConsents, setPendingConsents] = useState([
    {
      id: 'cst-req-001',
      requesterId: 'Education Department (MahaDBT 2.0)',
      dataOwnerId: 'Revenue Department (Aaple Sarkar)',
      purpose: 'Scholarship Scheme Eligibility Verification',
      requestedFields: ['annualIncome', 'incomeCertificateNumber', 'issuingAuthority'],
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
  ]);

  const [history, setHistory] = useState([
    {
      id: 'cst-hist-001',
      requesterId: 'Social Welfare Department',
      dataOwnerId: 'Aaple Sarkar Revenue Portal',
      purpose: 'Caste & Domicile Concession Verification',
      status: 'APPROVED',
      respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ]);

  const handleApprove = async (consentId) => {
    try {
      await consentApi.respondConsent(consentId, { action: 'APPROVE' });
      toast.success('Consent approved.');
    } catch (e) {
      toast.success('Consent approved in demo mode.');
    }
    setPendingConsents((prev) => prev.filter((c) => c.id !== consentId));
  };

  const handleReject = async (consentId) => {
    try {
      await consentApi.respondConsent(consentId, { action: 'REJECT' });
      toast.error('Consent denied.');
    } catch (e) {
      toast.error('Consent denied in demo mode.');
    }
    setPendingConsents((prev) => prev.filter((c) => c.id !== consentId));
  };

  const handleRevoke = async (consentId) => {
    try {
      await consentApi.revokeConsent(consentId);
      toast.success('Consent revoked.');
    } catch (e) {
      toast.success('Consent revoked in demo mode.');
    }
    setHistory((prev) =>
      prev.map((item) => (item.id === consentId ? { ...item, status: 'REVOKED' } : item))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Consent & Privacy Management</h2>
        <p className="text-xs text-slate-500">
          Control how your government records are shared between Maharashtra departments
        </p>
      </div>

      {/* Pending Consents */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" /> Pending Authorizations ({pendingConsents.length})
        </h3>
        {pendingConsents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No pending consent requests at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingConsents.map((consent) => (
              <ConsentPrompt
                key={consent.id}
                consent={consent}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Consent History */}
      <Card
        title="Data Sharing History"
        subtitle="Audit record of past authorizations granted to government departments"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead>
              <tr className="text-left font-semibold text-slate-600">
                <th className="pb-3">Requesting Department</th>
                <th className="pb-3">Source System</th>
                <th className="pb-3">Purpose</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-slate-900">{item.requesterId}</td>
                  <td className="py-3 text-slate-600">{item.dataOwnerId}</td>
                  <td className="py-3 text-slate-600">{item.purpose}</td>
                  <td className="py-3 text-slate-500 font-mono">{formatDate(item.respondedAt)}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {item.status === 'APPROVED' && (
                      <button
                        onClick={() => handleRevoke(item.id)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
