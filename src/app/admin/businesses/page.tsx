'use client';

import { useEffect, useState } from 'react';
import type { Business } from '@/types';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch('/api/businesses');
        if (res.ok) {
          const data = await res.json();
          setBusinesses(data);
        }
      } catch (error) {
        console.error('Error loading businesses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  async function deleteBusiness(id: number) {
    if (!confirm('Delete this business?')) return;
    try {
      const res = await fetch('/api/businesses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setBusinesses(prev => prev.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading businesses...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Businesses ({businesses.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Delivered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{business.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {business.website_url ? (
                      <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(business.value_delivered / 1000).toFixed(0)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(business.revenue_generated / 1000).toFixed(0)}K
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      business.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {business.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{business.display_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => deleteBusiness(business.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {businesses.length === 0 && (
            <div className="text-center py-12 text-gray-500">No businesses yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
