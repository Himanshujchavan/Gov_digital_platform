import React from 'react';
import { Card } from '../../components/common/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Activity, Clock, ShieldCheck, Zap, Database, Server } from 'lucide-react';

export function SystemStatsPage() {
  const dailyData = [
    { day: 'Mon', apps: 120, autoVerified: 114 },
    { day: 'Tue', apps: 180, autoVerified: 172 },
    { day: 'Wed', apps: 240, autoVerified: 231 },
    { day: 'Thu', apps: 310, autoVerified: 298 },
    { day: 'Fri', apps: 420, autoVerified: 405 },
    { day: 'Sat', apps: 280, autoVerified: 270 },
    { day: 'Sun', apps: 190, autoVerified: 184 },
  ];

  const consentData = [
    { name: 'Approved', value: 92, color: '#10b981' },
    { name: 'Pending', value: 5, color: '#f59e0b' },
    { name: 'Rejected', value: 3, color: '#f43f5e' },
  ];

  const services = [
    { name: 'API Gateway', port: 8000, status: 'UP', latency: '4ms' },
    { name: 'Auth & RBAC Service', port: 8001, status: 'UP', latency: '6ms' },
    { name: 'Simulated Depts API', port: 8002, status: 'UP', latency: '12ms' },
    { name: 'Canonical Adapters', port: 8003, status: 'UP', latency: '8ms' },
    { name: 'MDM Entity Resolution (AI)', port: 8004, status: 'UP', latency: '45ms' },
    { name: 'Consent Manager', port: 8005, status: 'UP', latency: '9ms' },
    { name: 'Workflow State Machine', port: 8006, status: 'UP', latency: '14ms' },
    { name: 'Central Audit Engine', port: 8007, status: 'UP', latency: '5ms' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">System Monitoring & Interop SLAs</h2>
        <p className="text-xs text-slate-500">
          Real-time metrics on cross-department data exchange and workflow execution
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Applications</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">1,740</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">↑ 18% from last week</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Auto-Verification Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">96.2%</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero physical document uploads</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg. Interop Turnaround</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">1.8 sec</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Reduced from 14-21 days</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">MDM Match Confidence</span>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">97.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Weighted Jaro-Winkler + DOB + Addr</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Cross-Department Processing Volume" subtitle="Daily scheme applications processed via middleware">
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="apps" fill="#1e40af" name="Total Applications" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="autoVerified" fill="#10b981" name="Auto-Verified via Adapters" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Citizen Consent Compliance" subtitle="Consent response breakdown">
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={consentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {consentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs mt-2">
                {consentData.map((c) => (
                  <span key={c.name} className="flex items-center gap-1 font-medium text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name} ({c.value}%)
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Microservice Health Indicators */}
      <Card title="Microservice Health Status" subtitle="Interoperability cluster heartbeat">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((svc) => (
            <div key={svc.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{svc.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">Port :{svc.port}</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {svc.status}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{svc.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
