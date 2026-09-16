import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { workflowApi } from '../../api/workflow.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/application/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { FileText, ArrowRight, Clock, Plus } from 'lucide-react';

export function MyApplicationsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([
    {
      id: 'APP-1024',
      schemeName: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
      department: 'Higher Education',
      createdAt: new Date().toISOString(),
      currentStatus: 'CONSENT_REQUESTED',
      applicantName: user?.fullName || 'Rahul Sharma',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadApps() {
      try {
        setLoading(true);
        const res = await workflowApi.getApplications({ citizenId: user?.username });
        if (res?.data && res.data.length > 0) {
          setApplications(res.data);
        }
      } catch (e) {
        // Keeps seeded demo application active
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, [user?.username]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Scheme Applications</h2>
          <p className="text-xs text-slate-500">Track real-time progress and cross-department verification</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/citizen/services')}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Apply for New Scheme
        </Button>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                  {app.id}
                </span>
                <StatusBadge status={app.currentStatus} />
              </div>
              <h4 className="text-base font-bold text-slate-900">{app.schemeName}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-3">
                <span>Applicant: <strong>{app.applicantName}</strong></span>
                <span>•</span>
                <span>Submitted: {formatDate(app.createdAt)}</span>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/citizen/applications/${app.id}`)}
              className="flex items-center gap-1.5 w-full sm:w-auto"
            >
              <span>View Workflow Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
