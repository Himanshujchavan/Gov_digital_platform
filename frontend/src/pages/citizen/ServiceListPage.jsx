import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { GraduationCap, Home, FileText, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export function ServiceListPage() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'SCH-MAHA-001',
      title: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna',
      department: 'Higher & Technical Education (MahaDBT 2.0)',
      category: 'Scholarship & Tuition Fee Waiver',
      description: 'Tuition and exam fee reimbursement for eligible students from economically weaker sections.',
      incomeLimit: 'Up to ₹8,00,000 / annum (Target demo: ₹2,50,000)',
      interopBenefit: 'Automatically verifies Income from Revenue System without uploading physical certificates',
      icon: GraduationCap,
      badge: 'Popular Demo',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'SCH-MAHA-002',
      title: 'Post Matric Scholarship for VJNT / OBC / SBC Students',
      department: 'Social Justice and Special Assistance',
      category: 'Post-Matric Scheme',
      description: 'Maintenance allowance and compulsory fees for vocational and professional degree courses.',
      incomeLimit: 'Up to ₹1,50,000 / annum',
      interopBenefit: 'Cross-verifies caste and domicile from Aaple Sarkar records',
      icon: FileText,
      badge: 'Integrated',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'LAND-MAHA-001',
      title: 'Digitally Signed 7/12 & 8A Land Extract Verification',
      department: 'Revenue & Land Records (Mahabhumi)',
      category: 'Agriculture & Land Registry',
      description: 'Integrated land title and survey verification for agricultural subsidies and benefits.',
      incomeLimit: 'No income ceiling',
      interopBenefit: 'Connects directly with Mahabhumi Land Records via Canonical Adapter',
      icon: Home,
      badge: 'Mahabhumi',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-blue-700/80 rounded-full text-xs font-semibold text-blue-200 border border-blue-500/30 inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Powered by Maharashtra Interoperability Middleware
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Apply Once, Re-use Everywhere
          </h2>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            No more repetitive document uploads. When applying for government schemes, our platform securely fetches your verified records from Aaple Sarkar and Mahabhumi with your explicit consent.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Notified Government Schemes</h3>
          <p className="text-xs text-slate-500">Select a scheme to launch an integrated application workflow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${service.badgeColor}`}>
                    {service.badge}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-blue-700 tracking-wider uppercase">
                  {service.department}
                </span>

                <h4 className="text-base font-bold text-slate-900 mt-1 line-clamp-2 leading-snug">
                  {service.title}
                </h4>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                {/* Interoperability Advantage */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Zero-Document Feature:
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    "{service.interopBenefit}"
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button
                  variant="primary"
                  className="w-full justify-between group"
                  onClick={() => navigate(`/citizen/apply/${service.id}`)}
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
