'use client';

import dynamic from 'next/dynamic';

const SubmissionsDashboard = dynamic(() => import('./SubmissionsDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-24">
      <div className="text-[#8a93a6] animate-pulse">Loading dashboard…</div>
    </div>
  ),
});

export default function AdminSubmissionsPage() {
  return (
    <div className="bg-[#0b0d12] -m-5 p-3 sm:p-5 min-h-[calc(100vh-120px)] rounded-2xl" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <SubmissionsDashboard />
    </div>
  );
}
