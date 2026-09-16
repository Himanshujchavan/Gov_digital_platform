import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatDate';
import { ShieldCheck, Search, Filter, Eye, FileCode } from 'lucide-react';

export function AuditLogPage() {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const auditEvents = [
    {
      id: 'EVT-9081',
      timestamp: new Date().toISOString(),
      eventType: 'WORKFLOW_STEP_COMPLETED',
      actor: 'workflow-engine',
      action: 'ELIGIBILITY_CHECK_PASSED',
      resource: 'APP-1024',
      outcome: 'SUCCESS',
      details: { income: 250000, ceiling: 800000, scheme: 'SCH-MAHA-001' },
    },
    {
      id: 'EVT-9080',
      timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
      eventType: 'DATA_ACCESS',
      actor: 'adapters:revenue',
      action: 'QUERY_INCOME_CERTIFICATE',
      resource: 'REV-1021',
      outcome: 'SUCCESS',
      details: { consentId: 'cst-1024-req', certifiedAmount: 250000 },
    },
    {
      id: 'EVT-9079',
      timestamp: new Date(Date.now() - 1000 * 90).toISOString(),
      eventType: 'MDM_MATCH_FOUND',
      actor: 'mdm-service',
      action: 'RESOLVE_ENTITY',
      resource: 'MC-10024',
      outcome: 'SUCCESS',
      details: { matchScore: 0.964, linkedSystems: ['REV-1021', 'WEL-7821'] },
    },
    {
      id: 'EVT-9078',
      timestamp: new Date(Date.now() - 1000 * 150).toISOString(),
      eventType: 'CONSENT_APPROVED',
      actor: 'citizen_rahul',
      action: 'GRANT_CONSENT',
      resource: 'cst-1024-req',
      outcome: 'SUCCESS',
      details: { requester: 'Higher Education', dataOwner: 'Revenue Dept' },
    },
    {
      id: 'EVT-9077',
      timestamp: new Date(Date.now() - 1000 * 240).toISOString(),
      eventType: 'AUTH_LOGIN',
      actor: 'citizen_rahul',
      action: 'USER_AUTHENTICATE',
      resource: 'usr-cit-001',
      outcome: 'SUCCESS',
      details: { role: 'citizen', ip: '127.0.0.1' },
    },
  ];

  const filtered = auditEvents.filter((evt) => {
    if (filterType !== 'ALL' && evt.eventType !== filterType) return false;
    if (searchQuery && !evt.resource.toLowerCase().includes(searchQuery.toLowerCase()) && !evt.actor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Central Immutable Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Append-only security logs for cross-system authentication, consent, and data exchange
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by Resource ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white w-48"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="ALL">All Event Types</option>
            <option value="AUTH_LOGIN">Authentication</option>
            <option value="CONSENT_APPROVED">Consent</option>
            <option value="MDM_MATCH_FOUND">MDM Linkage</option>
            <option value="DATA_ACCESS">Data Access</option>
            <option value="WORKFLOW_STEP_COMPLETED">Workflow Engine</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead>
              <tr className="text-left font-semibold text-slate-600">
                <th className="pb-3">Event ID</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Actor / Service</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Resource</th>
                <th className="pb-3">Outcome</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/80">
                  <td className="py-3 font-mono font-bold text-slate-900">{evt.id}</td>
                  <td className="py-3 font-mono text-slate-500">{formatDate(evt.timestamp)}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-800">{evt.actor}</td>
                  <td className="py-3 text-slate-600">{evt.action}</td>
                  <td className="py-3 font-mono font-bold text-blue-700">{evt.resource}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {evt.outcome}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold p-1 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={`Audit Event Inspection: ${selectedEvent?.id}`}
      >
        {selectedEvent && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Timestamp:</span>
                <span className="font-mono">{selectedEvent.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Event Type:</span>
                <span className="font-bold">{selectedEvent.eventType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Actor:</span>
                <span>{selectedEvent.actor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Resource:</span>
                <span className="font-mono font-bold text-blue-700">{selectedEvent.resource}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-700 font-semibold block mb-1">Payload / Details:</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px] font-mono">
                {JSON.stringify(selectedEvent.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
