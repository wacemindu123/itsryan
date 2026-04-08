'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Submission } from '@/types';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; submission: Submission | null }>({ show: false, submission: null });

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) setSubmissions(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadSubmissions();
    const interval = setInterval(loadSubmissions, 30000);
    return () => clearInterval(interval);
  }, [loadSubmissions]);

  async function updateContactStatus(id: number, contacted: boolean) {
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted, table: 'submissions' }),
      });
      if (res.ok) loadSubmissions();
    } catch (e) { console.error(e); }
  }

  function handleSendCalendly(sub: Submission) {
    if (sub.contacted) {
      setConfirmModal({ show: true, submission: sub });
    } else {
      sendCalendly(sub.email, sub.name, sub.id);
    }
  }

  async function sendCalendly(email: string, name: string, id: number) {
    setConfirmModal({ show: false, submission: null });
    try {
      const res = await fetch('/api/send-calendly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Email sent successfully!');
        await updateContactStatus(id, true);
        loadSubmissions();
      } else {
        alert(`Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('sendCalendly error:', e);
      alert('Error sending email. Check console for details.');
    }
  }

  const today = new Date().toDateString();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const todayCount = submissions.filter(s => new Date(s.created_at).toDateString() === today).length;
  const weekCount = submissions.filter(s => new Date(s.created_at) >= weekAgo).length;

  if (loading) {
    return <div className="text-gray-500">Loading submissions...</div>;
  }

  return (
    <>
      <h1 className="text-4xl font-semibold mb-2">Form Submissions</h1>
      <p className="text-gray-500 mb-10">All responses from the business scaling form</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mb-10">
        <div className="bg-white p-4 md:p-6 rounded-xl text-center shadow-sm">
          <div className="text-2xl md:text-4xl font-semibold text-blue-600 mb-1">{submissions.length}</div>
          <div className="text-xs md:text-sm text-gray-500">Total Submissions</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl text-center shadow-sm">
          <div className="text-2xl md:text-4xl font-semibold text-blue-600 mb-1">{todayCount}</div>
          <div className="text-xs md:text-sm text-gray-500">Today</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl text-center shadow-sm">
          <div className="text-2xl md:text-4xl font-semibold text-blue-600 mb-1">{weekCount}</div>
          <div className="text-xs md:text-sm text-gray-500">This Week</div>
        </div>
      </div>

      <button onClick={loadSubmissions} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-base font-medium cursor-pointer mb-5 hover:bg-blue-700">
        Refresh Data
      </button>

      {/* Submission Cards — uncontacted first */}
      <div className="space-y-4 mb-16">
        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm">No submissions yet</div>
        ) : (
          [...submissions].sort((a, b) => {
            if (a.contacted === b.contacted) return 0;
            return a.contacted ? 1 : -1;
          }).map(sub => (
            <div key={sub.id} className={`bg-white rounded-xl p-5 md:p-6 shadow-sm border-l-4 ${sub.contacted ? 'border-green-500 bg-green-50/50' : 'border-blue-500'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sub.contacted}
                    onChange={(e) => updateContactStatus(sub.id, e.target.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{sub.name}</h3>
                    <p className="text-sm text-gray-500">{new Date(sub.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendCalendly(sub)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap ${sub.contacted ? 'bg-gray-400 text-white hover:bg-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {sub.contacted ? 'Resend Calendly' : 'Send Calendly'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{sub.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{sub.phone || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Business</p>
                  <p className="text-sm font-medium text-gray-900">{sub.business}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Website</p>
                  {sub.website ? (
                    <a href={sub.website.match(/^https?:\/\//) ? sub.website : `https://${sub.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">{sub.website}</a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">-</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Challenge</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.scaling_challenge}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for Resending Calendly */}
      {confirmModal.show && confirmModal.submission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4 text-yellow-500">!</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Contacted</h2>
              <p className="text-gray-600">
                You&apos;ve already sent a Calendly email to <strong>{confirmModal.submission.name}</strong>.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Are you sure you want to send another one?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, submission: null })}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => sendCalendly(confirmModal.submission!.email, confirmModal.submission!.name, confirmModal.submission!.id)}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer"
              >
                Send Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
