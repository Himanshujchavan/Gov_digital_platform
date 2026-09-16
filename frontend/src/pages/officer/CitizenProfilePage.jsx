import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Building2, UserCheck, Layers, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/formatDate';

export function CitizenProfilePage() {
  const { masterId = 'MC-10024' } = useParams();
  const navigate = useNavigate();

  const linkedRecords = [
    {
      department: 'Revenue & District Administration (Aaple Sarkar)',
      deptId: 'REV-1021',
      recordedName: 'Rahul Sharma',
      dob: '2002-03-12',
      address: 'Plot 42, Shivajinagar, Pune 411005',
      primaryData: 'Annual Income: ₹2,50,000 (Cert # REV-INC-2026-9921)',
      matchConfidence: '98.2%',
    },
    {
      department: 'Welfare & Higher Education (MahaDBT 2.0)',
      deptId: 'WEL-7821',
      recordedName: 'R. Sharma',
      dob: '2002-03-12',
      address: 'Shivajinagar, Pune',
      primaryData: 'Scholarship Applicant, Enrollment: COEP Pune',
      matchConfidence: '96.4%',
    },
    {
      department: 'Land Records Registry (Mahabhumi)',
      deptId: 'LAND-4512',
      recordedName: 'Rahul S.',
      dob: '2002-03-12',
      address: 'Taluka Haveli, District Pune',
      primaryData: '7/12 Extract: Survey # 124/2A, 1.2 Hectares (Family Land)',
      matchConfidence: '92.1%',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
            MDM Citizen 360° Profile
          </span>
          <h2 className="text-2xl font-black mt-1">Master Citizen ID: {masterId}</h2>
          <p className="text-xs text-purple-200 mt-1">
            Harmonized entity view resolved across 3 independent Maharashtra databases
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center">
          <span className="text-[10px] text-purple-200 block uppercase font-bold">Overall Match</span>
          <span className="text-xl font-bold font-mono text-emerald-400">96.4%</span>
        </div>
      </div>

      <Card
        title="Departmental Record Linkage Breakdown"
        subtitle="Probabilistic record linkage matches variations in name, date of birth, and address"
      >
        <div className="space-y-4">
          {linkedRecords.map((record) => (
            <div
              key={record.deptId}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {record.department}
                </span>
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Match: {record.matchConfidence}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[11px]">System ID:</span>
                  <span className="font-mono font-bold text-blue-700">{record.deptId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Name in Record:</span>
                  <span className="font-medium text-slate-800">{record.recordedName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Associated Data:</span>
                  <span className="text-slate-800 font-medium">{record.primaryData}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
