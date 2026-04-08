'use client';

import { useEffect, useState } from 'react';
import type { ClassSignup } from '@/types';

export default function AdminSignupsPage() {
  const [signups, setSignups] = useState<ClassSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSignups() {
      try {
        const res = await fetch('/api/class-signups');
        if (res.ok) {
          const data = await res.json();
          setSignups(data);
        }
      } catch (error) {
        console.error('Error loading signups:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSignups();
  }, []);

  async function toggleContacted(id: number, contacted: boolean) {
    try {
      const res = await fetch('/api/class-signups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted: !contacted }),
      });
      if (res.ok) {
        setSignups(prev =>
          prev.map(s => (s.id === id ? { ...s, contacted: !contacted } : s))
        );
      }
    } catch (error) {
      console.error('Error updating signup:', error);
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading class signups...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Class Signups ({signups.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {signups.map((signup) => (
                <tr key={signup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{signup.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{signup.business || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{signup.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{signup.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{signup.format}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{signup.experience}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(signup.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      signup.contacted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {signup.contacted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleContacted(signup.id, signup.contacted)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Mark {signup.contacted ? 'Uncontacted' : 'Contacted'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {signups.length === 0 && (
            <div className="text-center py-12 text-gray-500">No class signups yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
