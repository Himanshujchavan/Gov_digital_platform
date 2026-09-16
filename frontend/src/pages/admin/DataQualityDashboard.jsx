import React from 'react';
import { Card } from '../../components/common/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CheckCircle2, ShieldCheck, Database, Award } from 'lucide-react';

export function DataQualityDashboard() {
  const qualityData = [
    {
      department: 'Revenue (Aaple Sarkar)',
      Completeness: 94,
      Consistency: 91,
      Validity: 98,
      Uniqueness: 95,
    },
    {
      department: 'Welfare (MahaDBT 2.0)',
      Completeness: 88,
      Consistency: 85,
      Validity: 92,
      Uniqueness: 89,
    },
    {
      department: 'Land Records (Mahabhumi)',
      Completeness: 96,
      Consistency: 94,
      Validity: 99,
      Uniqueness: 97,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Departmental Data Quality Scores</h2>
        <p className="text-xs text-slate-500">
          Automated data cleansing, schema consistency and deduplication benchmark
        </p>
      </div>

      <Card title="4-Dimension Quality Benchmark" subtitle="Evaluated across connected Maharashtra database adapters">
        <div className="h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityData}>
              <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Completeness" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Consistency" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Validity" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Uniqueness" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {qualityData.map((d) => (
          <Card key={d.department} title={d.department} subtitle="Adapter Health Rating">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Completeness:</span>
                <span className="font-bold text-blue-600">{d.Completeness}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Consistency:</span>
                <span className="font-bold text-purple-600">{d.Consistency}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Field Validity:</span>
                <span className="font-bold text-emerald-600">{d.Validity}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Uniqueness:</span>
                <span className="font-bold text-amber-600">{d.Uniqueness}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
