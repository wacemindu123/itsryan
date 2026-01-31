'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser, SignIn, SignOutButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

interface Submission {
  id: number;
  name: string;
  email: string;
  business: string;
  scaling_challenge: string;
  created_at: string;
  contacted: boolean;
}

interface ClassSignup {
  id: number;
  name: string;
  email: string;
  phone: string;
  business: string | null;
  format: string;
  experience: string;
  created_at: string;
  contacted: boolean;
}

interface Prompt {
  id: number;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  content: string;
}

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useUser();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classSignups, setClassSignups] = useState<ClassSignup[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
  
  const [promptTitle, setPromptTitle] = useState('');
  const [promptIcon, setPromptIcon] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [promptTags, setPromptTags] = useState('');
  const [promptContent, setPromptContent] = useState('');

  const loadSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) setSubmissions(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadClassSignups = useCallback(async () => {
    try {
      const res = await fetch('/api/class-signups');
      if (res.ok) setClassSignups(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const loadPrompts = useCallback(async () => {
    try {
      const res = await fetch('/api/prompts');
      if (res.ok) setPrompts(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      loadSubmissions();
      loadClassSignups();
      loadPrompts();
      
      const interval1 = setInterval(loadSubmissions, 30000);
      const interval2 = setInterval(loadClassSignups, 30000);
      
      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
      };
    }
  }, [isSignedIn, loadSubmissions, loadClassSignups, loadPrompts]);

  async function updateContactStatus(id: number, contacted: boolean, table: string) {
    try {
      await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted, table }),
      });
    } catch (e) { console.error(e); }
  }

  async function sendCalendly(email: string, name: string, id: number) {
    try {
      const res = await fetch('/api/send-calendly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) {
        await updateContactStatus(id, true, 'submissions');
        loadSubmissions();
      }
    } catch (e) { console.error(e); }
  }

  async function savePrompt() {
    if (!promptTitle || !promptDescription || !promptContent) {
      alert('Please fill in Title, Description, and Content');
      return;
    }

    const tags = promptTags ? promptTags.split(',').map(t => t.trim()).filter(t => t) : [];
    const data = { title: promptTitle, icon: promptIcon || '📝', description: promptDescription, tags, content: promptContent, id: editingPromptId };

    try {
      const res = await fetch('/api/prompts', {
        method: editingPromptId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        cancelEdit();
        loadPrompts();
      }
    } catch (e) { console.error(e); }
  }

  async function deletePrompt(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await fetch('/api/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      loadPrompts();
    } catch (e) { console.error(e); }
  }

  function editPrompt(prompt: Prompt) {
    setEditingPromptId(prompt.id);
    setPromptTitle(prompt.title);
    setPromptIcon(prompt.icon || '');
    setPromptDescription(prompt.description);
    setPromptTags((prompt.tags || []).join(', '));
    setPromptContent(prompt.content);
  }

  function cancelEdit() {
    setEditingPromptId(null);
    setPromptTitle('');
    setPromptIcon('');
    setPromptDescription('');
    setPromptTags('');
    setPromptContent('');
  }

  const today = new Date().toDateString();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const todayCount = submissions.filter(s => new Date(s.created_at).toDateString() === today).length;
  const weekCount = submissions.filter(s => new Date(s.created_at) >= weekAgo).length;
  const inPersonCount = classSignups.filter(s => s.format === 'in-person').length;
  const virtualCount = classSignups.filter(s => s.format === 'virtual').length;

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <h1 className="text-4xl font-semibold mb-2">Admin Access</h1>
        <p className="text-gray-500 mb-8">Sign in to continue</p>
        <SignIn routing="hash" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-5 p-3 px-4 bg-white rounded-lg">
          <span className="text-sm text-gray-500">Admin</span>
          <SignOutButton>
            <button className="bg-transparent border border-gray-200 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-gray-50">
              Sign Out
            </button>
          </SignOutButton>
        </div>

        <Link href="/" className="inline-block mb-5 text-blue-600 font-medium hover:underline">← Back to Website</Link>

        <h1 className="text-4xl font-semibold mb-2">Form Submissions</h1>
        <p className="text-gray-500 mb-10">All responses from the business scaling form</p>

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

        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-16 overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold border-b border-gray-100">✓</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Date</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Name</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Email</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Business</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Challenge</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} className={`hover:bg-gray-50 ${sub.contacted ? 'bg-green-50 opacity-70' : ''}`}>
                  <td className="p-4 border-b border-gray-100">
                    <input type="checkbox" checked={sub.contacted} onChange={(e) => updateContactStatus(sub.id, e.target.checked, 'submissions')} className="w-5 h-5 accent-blue-600" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-sm text-gray-500">{new Date(sub.created_at).toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-100">{sub.name}</td>
                  <td className="p-4 border-b border-gray-100">{sub.email}</td>
                  <td className="p-4 border-b border-gray-100">{sub.business}</td>
                  <td className="p-4 border-b border-gray-100 max-w-md text-sm">{sub.scaling_challenge}</td>
                  <td className="p-4 border-b border-gray-100">
                    <button onClick={() => sendCalendly(sub.email, sub.name, sub.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-blue-700">
                      Send Calendly
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length === 0 && <div className="p-10 text-center text-gray-500">No submissions yet</div>}
        </div>

        <h1 className="text-4xl font-semibold mb-2 mt-16">AI Class Signups</h1>
        <p className="text-gray-500 mb-10">All signups for Free AI Classes</p>

        <div className="grid grid-cols-3 gap-5 mb-10">
          <div className="bg-white p-6 rounded-xl text-center shadow-sm">
            <div className="text-4xl font-semibold text-blue-600 mb-1">{classSignups.length}</div>
            <div className="text-sm text-gray-500">Total Signups</div>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow-sm">
            <div className="text-4xl font-semibold text-blue-600 mb-1">{inPersonCount}</div>
            <div className="text-sm text-gray-500">In-Person</div>
          </div>
          <div className="bg-white p-6 rounded-xl text-center shadow-sm">
            <div className="text-4xl font-semibold text-blue-600 mb-1">{virtualCount}</div>
            <div className="text-sm text-gray-500">Virtual</div>
          </div>
        </div>

        <button onClick={loadClassSignups} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-base font-medium cursor-pointer mb-5 hover:bg-blue-700">
          Refresh Class Data
        </button>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-16 overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold border-b border-gray-100">✓</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Date</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Name</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Email</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Phone</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Business</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Format</th>
                <th className="p-4 text-left font-semibold border-b border-gray-100">Experience</th>
              </tr>
            </thead>
            <tbody>
              {classSignups.map(s => (
                <tr key={s.id} className={`hover:bg-gray-50 ${s.contacted ? 'bg-green-50 opacity-70' : ''}`}>
                  <td className="p-4 border-b border-gray-100">
                    <input type="checkbox" checked={s.contacted} onChange={(e) => updateContactStatus(s.id, e.target.checked, 'class_signups')} className="w-5 h-5 accent-blue-600" />
                  </td>
                  <td className="p-4 border-b border-gray-100 text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="p-4 border-b border-gray-100">{s.name}</td>
                  <td className="p-4 border-b border-gray-100">{s.email}</td>
                  <td className="p-4 border-b border-gray-100">{s.phone}</td>
                  <td className="p-4 border-b border-gray-100">{s.business || '-'}</td>
                  <td className="p-4 border-b border-gray-100">{s.format}</td>
                  <td className="p-4 border-b border-gray-100">{s.experience}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {classSignups.length === 0 && <div className="p-10 text-center text-gray-500">No class signups yet</div>}
        </div>

        <div className="mt-16">
          <h1 className="text-4xl font-semibold mb-2">Prompt Library</h1>
          <p className="text-gray-500 mb-10">Manage prompts that appear on the website</p>

          <div className="bg-white p-8 rounded-xl mb-6 shadow-sm">
            <h3 className="text-xl mb-5">{editingPromptId ? 'Edit Prompt' : 'Add New Prompt'}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1.5 font-medium text-sm">Title</label>
                <input value={promptTitle} onChange={(e) => setPromptTitle(e.target.value)} placeholder="e.g., Website Conversion Evaluation" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block mb-1.5 font-medium text-sm">Icon (emoji)</label>
                <input value={promptIcon} onChange={(e) => setPromptIcon(e.target.value)} placeholder="e.g., 🎯" maxLength={4} className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-sm">Description</label>
              <input value={promptDescription} onChange={(e) => setPromptDescription(e.target.value)} placeholder="Brief description..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-sm">Tags (comma-separated)</label>
              <input value={promptTags} onChange={(e) => setPromptTags(e.target.value)} placeholder="e.g., Website, Conversion, UX" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-sm">Prompt Content</label>
              <textarea value={promptContent} onChange={(e) => setPromptContent(e.target.value)} placeholder="Paste your full prompt here..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600 min-h-[200px] resize-y font-mono" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={savePrompt} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                Save Prompt
              </button>
              {editingPromptId && (
                <button onClick={cancelEdit} className="bg-transparent text-gray-500 border border-gray-200 px-6 py-3 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </div>

          <h3 className="mb-4 font-semibold">Existing Prompts</h3>
          {prompts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No prompts yet. Add your first prompt above!</div>
          ) : (
            prompts.map(prompt => (
              <div key={prompt.id} className="bg-white p-6 rounded-xl mb-4 shadow-sm flex justify-between items-start gap-5">
                <div className="flex-1">
                  <div className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>{prompt.icon || '📝'}</span>
                    {prompt.title}
                  </div>
                  <div className="text-gray-500 text-sm mb-3">{prompt.description}</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(prompt.tags || []).map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-xs text-gray-500 max-h-20 overflow-hidden whitespace-pre-wrap">
                    {prompt.content.substring(0, 200)}...
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editPrompt(prompt)} className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-600">
                    Edit
                  </button>
                  <button onClick={() => deletePrompt(prompt.id, prompt.title)} className="bg-gray-50 text-red-500 border border-red-200 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-red-500 hover:text-white">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
