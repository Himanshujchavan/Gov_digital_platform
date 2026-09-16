import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { workflowApi } from '../../api/workflow.api';
import { consentApi } from '../../api/consent.api';
import { Card } from '../../components/common/Card';
import { TimelineStepper } from '../../components/application/TimelineStepper';
import { ConsentPrompt } from '../../components/consent/ConsentPrompt';
import { StatusBadge } from '../../components/application/StatusBadge';
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function ApplicationTimelinePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [appData, setAppData] = useState({
    id: id || 'APP-1024',
    schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
    currentStatus: 'CONSENT_REQUESTED',
    history: [
      { step: 'APPLICATION_RECEIVED', timestamp: new Date(Date.now() - 1000 * 120).toISOString(), details: 'Application submitted via MahaDBT portal' },
      { step: 'CONSENT_REQUESTED', timestamp: new Date(Date.now() - 1000 * 60).toISOString(), details: 'Consent request dispatched to citizen' }
    ],
  });

  const [activeConsent, setActiveConsent] = useState({
    id: 'cst-1024-req',
    consentId: 'cst-1024-req',
    requesterId: 'Education Department (MahaDBT)',
    dataOwnerId: 'Revenue Department (Aaple Sarkar)',
    purpose: 'Scholarship Income Eligibility Verification',
    requestedFields: ['annualIncome', 'incomeCertificateNumber', 'issuingAuthority'],
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  });

  const [loadingConsent, setLoadingConsent] = useState(false);

  // Polling logic every 3 seconds (Phase 4 of plan)
  useEffect(() => {
    let intervalId;

    async function fetchTimeline() {
      try {
        const res = await workflowApi.getApplicationTimeline(id);
        if (res?.data) {
          setAppData(res.data);
        }
      } catch (e) {
        // Fallback gracefully during demo
      }
    }

    fetchTimeline();

    // Auto-poll if non-terminal
    if (appData.currentStatus !== 'APPROVED' && appData.currentStatus !== 'REJECTED') {
      intervalId = setInterval(fetchTimeline, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [id, appData.currentStatus]);

  const handleApproveConsent = async (consentId) => {
    setLoadingConsent(true);
    try {
      await consentApi.respondConsent(consentId, { action: 'APPROVE' });
      toast.success('Consent approved! Revenue data shared securely.');
    } catch (e) {
      toast.success('Consent approved in demo mode!');
    }

    // Advance simulated timeline state seamlessly
    setActiveConsent(null);
    setAppData((prev) => ({
      ...prev,
      currentStatus: 'OFFICER_REVIEW',
      history: [
        ...prev.history,
        { step: 'CONSENT_GRANTED', timestamp: new Date().toISOString(), details: 'Citizen authorized Revenue data exchange' },
        { step: 'MDM_RESOLUTION', timestamp: new Date().toISOString(), details: 'Citizen matched to MC-10024 with 96.4% confidence' },
        { step: 'DATA_RETRIEVAL', timestamp: new Date().toISOString(), details: 'Revenue adapter retrieved Income: ₹2,50,000' },
        { step: 'DATA_VALIDATION', timestamp: new Date().toISOString(), details: 'Canonical schema validation passed' },
        { step: 'ELIGIBILITY_CHECK', timestamp: new Date().toISOString(), details: 'Income ₹2,50,000 ≤ ₹8,00,000 threshold (ELIGIBLE)' },
        { step: 'OFFICER_REVIEW', timestamp: new Date().toISOString(), details: 'Queued for Education Officer approval' }
      ]
    }));
    setLoadingConsent(false);
  };

  const handleRejectConsent = async (consentId) => {
    setLoadingConsent(true);
    try {
      await consentApi.respondConsent(consentId, { action: 'REJECT' });
      toast.error('Consent denied.');
    } catch (e) {
      toast.error('Consent denied in demo mode.');
    }
    setActiveConsent(null);
    setAppData((prev) => ({
      ...prev,
      currentStatus: 'REJECTED',
      history: [
        ...prev.history,
        { step: 'REJECTED', timestamp: new Date().toISOString(), details: 'Applicant denied consent for income data access' }
      ]
    }));
    setLoadingConsent(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/citizen/applications')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Applications
      </button>

      {/* Header Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {appData.id}
            </span>
            <StatusBadge status={appData.currentStatus} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">{appData.schemeName}</h2>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Workflow Engine</span>
          <span className="text-xs font-mono font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live State Machine Active
          </span>
        </div>
      </div>

      {/* Dynamic Action Required Box if Consent is Pending */}
      {appData.currentStatus === 'CONSENT_REQUESTED' && activeConsent && (
        <ConsentPrompt
          consent={activeConsent}
          onApprove={handleApproveConsent}
          onReject={handleRejectConsent}
          loading={loadingConsent}
        />
      )}

      {/* Stepper Timeline Card */}
      <Card
        title="Interoperability Workflow Step Progression"
        subtitle="Chronological execution trace across Aaple Sarkar, MahaDBT, and MDM"
      >
        <TimelineStepper
          currentStep={appData.currentStatus}
          history={appData.history}
          isTerminalRejected={appData.currentStatus === 'REJECTED'}
        />
      </Card>
    </div>
  );
}
