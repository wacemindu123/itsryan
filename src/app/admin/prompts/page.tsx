'use client';

import { useEffect, useState } from 'react';
import type { Prompt } from '@/types';

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Prompt>>({});

  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await fetch('/api/prompts');
        if (res.ok) {
          const data = await res.json();
          setPrompts(data);
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPrompts();
  }, []);

  async function savePrompt() {
    if (!editingId) return;
    try {
      const res = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPrompts(prev => prev.map(p => p.id === editingId ? updated.data : p));
        setEditingId(null);
        setEditForm({});
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  }

  async function deletePrompt(id: number) {
    if (!confirm('Delete this prompt?')) return;
    try {
      const res = await fetch('/api/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPrompts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading prompts...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Prompts ({prompts.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <tr key={prompt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === prompt.id ? (
                      <input
                        type="text"
                        value={editForm.title ?? prompt.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      prompt.title
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === prompt.id ? (
                      <input
                        type="text"
                        value={editForm.icon ?? prompt.icon}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                        className="w-16 px-2 py-1 border rounded"
                      />
                    ) : (
                      prompt.icon
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {editingId === prompt.id ? (
                      <textarea
                        value={editForm.description ?? prompt.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                        rows={2}
                      />
                    ) : (
                      <div className="truncate">{prompt.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {editingId === prompt.id ? (
                      <input
                        type="text"
                        value={editForm.tags?.join(', ') ?? prompt.tags.join(', ')}
                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(',').map(t => t.trim()) })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    ) : (
                      prompt.tags.join(', ')
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingId === prompt.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={savePrompt}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditForm({}); }}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(prompt.id); setEditForm({}); }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {prompts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No prompts yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
