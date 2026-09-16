export const statusColors = {
  // Workflow States
  APPLICATION_RECEIVED: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Application Received'
  },
  CONSENT_REQUESTED: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    dot: 'bg-amber-500',
    label: 'Consent Requested'
  },
  CONSENT_GRANTED: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    label: 'Consent Granted'
  },
  MDM_RESOLUTION: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    label: 'MDM Cross-Linking'
  },
  DATA_RETRIEVAL: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Data Retrieval'
  },
  DATA_VALIDATION: {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-500',
    label: 'Data Validation'
  },
  ELIGIBILITY_CHECK: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    label: 'Eligibility Check'
  },
  OFFICER_REVIEW: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    label: 'Officer Review'
  },
  APPROVED: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    dot: 'bg-emerald-500',
    label: 'Approved'
  },
  REJECTED: {
    bg: 'bg-rose-50 text-rose-700 border-rose-300',
    dot: 'bg-rose-500',
    label: 'Rejected'
  },
  CITIZEN_NOTIFIED: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    label: 'Citizen Notified'
  },
  // Consent Statuses
  PENDING: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending'
  },
  REVOKED: {
    bg: 'bg-slate-100 text-slate-600 border-slate-300',
    dot: 'bg-slate-400',
    label: 'Revoked'
  },
  EXPIRED: {
    bg: 'bg-red-50 text-red-600 border-red-200',
    dot: 'bg-red-400',
    label: 'Expired'
  }
};

export function getStatusConfig(status) {
  return statusColors[status] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
    label: status || 'Unknown'
  };
}
