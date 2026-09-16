import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowApi } from '../../api/workflow.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MatchConfidenceCard } from '../../components/mdm/MatchConfidenceCard';
import { formatCurrency, formatDate } from '../../utils/formatDate';
import { ArrowLeft, Check, X, Building2, User, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function ApplicationReviewPage() {
  const { id = 'APP-1024' } = useParams();
  const navigate = useNavigate();

  const [comments, setComments] = useState('Verified revenue record matches eligibility criteria. Recommended for approval.');
  const [submitting, setSubmitting] = useState(false);

  // Application Data with Cross-Department Canonical Insights
  const application = {
    id,
    applicantName: 'Rahul Sharma',
    citizenId: 'citizen_rahul',
    dob: '2002-03-12',
    schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
    department: 'Higher & Technical Education Department',
    masterCitizenId: 'MC-10024',
    matchConfidence: 0.964,
    // Cross-Department Retrieved Revenue Data
    revenueRecord: {
      certificateNumber: 'REV-INC-2026-9921',
      annualIncome: 250000,
      issuingAuthority: 'Tahsildar Office, Haveli, Pune',
      issueDate: '2026-01-15',
      validUntil: '2027-03-31',
      is712Verified: true,
      domicileStatus: 'Maharashtra Domiciled',
    },
    eligibilityCheck: {
      status: 'PASS',
      threshold: 800000,
      actual: 250000,
      verdict: 'ELIGIBLE - Annual income of ₹2,50,000 is well within the ₹8,00,000 scholarship ceiling',
    },
  };

  const handleDecision = async (decision) => {
    setSubmitting(true);
    try {
      await workflowApi.reviewApplication(id, { decision, comments });
      toast.success(`Application ${decision === 'APPROVED' ? 'Approved' : 'Rejected'} successfully!`);
      navigate('/officer/pending-reviews');
    } catch (e) {
      toast.success(`Application marked as ${decision} in demo mode!`);
      navigate('/officer/pending-reviews');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/officer/pending-reviews')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Review Queue
      </button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
            {application.id}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Application Verification & Officer Sign-Off
          </h2>
          <p className="text-xs text-slate-500">{application.schemeName}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/officer/citizen-360/${application.masterCitizenId}`)}
          className="text-purple-700 border-purple-200 hover:bg-purple-50"
        >
          <User className="w-3.5 h-3.5 mr-1" /> View Full Citizen 360° Profile
        </Button>
      </div>

      {/* MDM Linkage Confidence Card */}
      <MatchConfidenceCard
        confidence={application.matchConfidence}
        masterId={application.masterCitizenId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Applicant & Scheme Info */}
        <Card title="Applicant Demographics" subtitle="MahaDBT Citizen Registration">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Applicant Full Name:</span>
              <span className="font-semibold text-slate-900">{application.applicantName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-mono text-slate-900">{application.dob}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Master Citizen ID:</span>
              <span className="font-mono font-bold text-purple-700">{application.masterCitizenId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Enrolled Department:</span>
              <span className="text-slate-800">{application.department}</span>
            </div>
          </div>
        </Card>

        {/* Right: Retrieved Revenue Department Data (Interoperability Proof) */}
        <Card
          title="Revenue Department Data"
          subtitle="Retrieved automatically via Aaple Sarkar Adapter"
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Income Certificate No:</span>
              <span className="font-mono font-semibold text-blue-700">
                {application.revenueRecord.certificateNumber}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Certified Annual Income:</span>
              <span className="font-mono font-bold text-base text-slate-900">
                {formatCurrency(application.revenueRecord.annualIncome)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Issuing Authority:</span>
              <span className="text-slate-800">{application.revenueRecord.issuingAuthority}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Validity:</span>
              <span className="font-mono text-emerald-700">
                Valid until {application.revenueRecord.validUntil}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* System Eligibility Engine Result */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-xl flex items-start gap-4">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">
            Eligibility Engine Check: {application.eligibilityCheck.status}
          </h4>
          <p className="text-xs text-emerald-800 mt-0.5">
            {application.eligibilityCheck.verdict}
          </p>
        </div>
      </div>

      {/* Officer Decision Box */}
      <Card title="Official Officer Decision" subtitle="Enter assessment notes and sign off">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Officer Verification Notes & Reason
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              placeholder="Add official verification comments..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="danger"
              onClick={() => handleDecision('REJECTED')}
              loading={submitting}
              className="px-5"
            >
              <X className="w-4 h-4 mr-1.5" /> Reject Application
            </Button>
            <Button
              variant="success"
              onClick={() => handleDecision('APPROVED')}
              loading={submitting}
              className="px-6 bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-1.5" /> Approve & Issue Sanction
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
