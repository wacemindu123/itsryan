'use client';

import { useEffect, useState } from 'react';
import type { Submission } from '@/types';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  async function toggleContacted(id: number, contacted: boolean) {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted: !contacted }),
      });
      if (res.ok) {
        setSubmissions(prev =>
          prev.map(s => (s.id === id ? { ...s, contacted: !contacted } : s))
        );
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading submissions...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Submissions ({submissions.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{submission.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.business}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{submission.scaling_challenge}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.contacted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.contacted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleContacted(submission.id, submission.contacted)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Mark {submission.contacted ? 'Uncontacted' : 'Contacted'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">No submissions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
