import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { workflowApi } from '../../api/workflow.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/application/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import { ClipboardList, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export function PendingReviewsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [departmentFilter, setDepartmentFilter] = useState('education');
  const [reviews, setReviews] = useState([
    {
      id: 'APP-1024',
      citizenId: 'citizen_rahul',
      applicantName: 'Rahul Sharma',
      masterCitizenId: 'MC-10024',
      schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
      department: 'education',
      retrievedIncome: 250000,
      eligibilityResult: 'PASS',
      eligibilityReason: 'Income ≤ ₹8,00,000 ceiling',
      matchConfidence: 0.964,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'APP-1025',
      citizenId: 'citizen_priya',
      applicantName: 'Priya Patil',
      masterCitizenId: 'MC-10028',
      schemeName: 'Post Matric Scholarship for OBC / EBC Students',
      department: 'education',
      retrievedIncome: 180000,
      eligibilityResult: 'PASS',
      eligibilityReason: 'Income ≤ ₹8,00,000 ceiling',
      matchConfidence: 0.982,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ]);

  useEffect(() => {
    async function loadPending() {
      try {
        const res = await workflowApi.getPendingReviews(departmentFilter);
        if (res?.data && res.data.length > 0) {
          setReviews(res.data);
        }
      } catch (e) {
        // Keeps demo items
      }
    }
    loadPending();
  }, [departmentFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Application Review Queue</h2>
          <p className="text-xs text-slate-500">
            Awaiting officer verification and benefit disbursement authorization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Filter Department:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="education">Higher & Technical Education</option>
            <option value="social_welfare">Social Justice & Welfare</option>
            <option value="revenue">Revenue & Land</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead>
              <tr className="text-left font-semibold text-slate-600">
                <th className="pb-3">App ID</th>
                <th className="pb-3">Applicant Name</th>
                <th className="pb-3">Master Citizen ID</th>
                <th className="pb-3">Scheme</th>
                <th className="pb-3">Retrieved Revenue Income</th>
                <th className="pb-3">System Eligibility</th>
                <th className="pb-3">MDM Match</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-blue-700">{item.id}</td>
                  <td className="py-3 font-semibold text-slate-900">{item.applicantName}</td>
                  <td className="py-3 font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] w-fit">
                    {item.masterCitizenId}
                  </td>
                  <td className="py-3 max-w-xs text-slate-700 truncate">{item.schemeName}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">
                    {formatCurrency(item.retrievedIncome)}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {item.eligibilityResult}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-[11px] font-mono font-bold text-purple-700">
                      {Math.round(item.matchConfidence * 100)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/officer/review/${item.id}`)}
                      className="bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
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
