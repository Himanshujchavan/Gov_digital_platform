import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mdmApi } from '../../api/mdm.api';
import { Users, Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function DuplicatesReviewPage() {
  const [duplicates, setDuplicates] = useState([
    {
      id: 'DUP-PAIR-01',
      matchScore: 0.842,
      masterCitizenId: 'MC-10024',
      recordA: {
        department: 'Revenue (Aaple Sarkar)',
        id: 'REV-1021',
        name: 'Rahul Sharma',
        dob: '2002-03-12',
        address: 'Plot 42, Shivajinagar, Pune 411005',
      },
      recordB: {
        department: 'Welfare (MahaDBT)',
        id: 'WEL-7821',
        name: 'R. Sharma',
        dob: '2002-03-12',
        address: 'Shivajinagar, Pune',
      },
    },
    {
      id: 'DUP-PAIR-02',
      matchScore: 0.765,
      masterCitizenId: 'MC-10031',
      recordA: {
        department: 'Land Records (Mahabhumi)',
        id: 'LAND-8902',
        name: 'Sunil Patil',
        dob: '1988-07-20',
        address: 'Taluka Haveli, Pune',
      },
      recordB: {
        department: 'Revenue',
        id: 'REV-5412',
        name: 'Sunil V. Patil',
        dob: '1988-07-20',
        address: 'Haveli, Pune 412001',
      },
    },
  ]);

  const handleConfirm = async (pairId) => {
    try {
      await mdmApi.confirmDuplicate(pairId, { isMatch: true });
      toast.success('Records confirmed and linked to Master Citizen ID!');
    } catch (e) {
      toast.success('Confirmed in demo mode!');
    }
    setDuplicates((prev) => prev.filter((d) => d.id !== pairId));
  };

  const handleReject = async (pairId) => {
    try {
      await mdmApi.confirmDuplicate(pairId, { isMatch: false });
      toast.error('Flagged as separate individuals.');
    } catch (e) {
      toast.error('Dismissed in demo mode.');
    }
    setDuplicates((prev) => prev.filter((d) => d.id !== pairId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">MDM Borderline Matches & Duplicate Review</h2>
        <p className="text-xs text-slate-500">
          Supervised machine learning verification queue for matches in the 70% – 89% confidence range
        </p>
      </div>

      <div className="space-y-4">
        {duplicates.map((pair) => (
          <Card key={pair.id} className="border-amber-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-xs">
                  Review Needed
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">{pair.id}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Confidence Score: {Math.round(pair.matchScore * 1000) / 10}%
                </span>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-blue-700 uppercase tracking-wider block text-[10px]">
                  Source Record A ({pair.recordA.department})
                </span>
                <div><span className="text-slate-400">ID:</span> <strong className="font-mono">{pair.recordA.id}</strong></div>
                <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{pair.recordA.name}</strong></div>
                <div><span className="text-slate-400">DOB:</span> <span className="font-mono">{pair.recordA.dob}</span></div>
                <div><span className="text-slate-400">Address:</span> <span>{pair.recordA.address}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-purple-700 uppercase tracking-wider block text-[10px]">
                  Source Record B ({pair.recordB.department})
                </span>
                <div><span className="text-slate-400">ID:</span> <strong className="font-mono">{pair.recordB.id}</strong></div>
                <div><span className="text-slate-400">Name:</span> <strong className="text-slate-900">{pair.recordB.name}</strong></div>
                <div><span className="text-slate-400">DOB:</span> <span className="font-mono">{pair.recordB.dob}</span></div>
                <div><span className="text-slate-400">Address:</span> <span>{pair.recordB.address}</span></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(pair.id)}
                className="text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4 mr-1" /> Not Same Citizen
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleConfirm(pair.id)}
              >
                <Check className="w-4 h-4 mr-1" /> Confirm Match & Merge
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
