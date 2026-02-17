'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser, SignIn, SignOutButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
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

interface Business {
  id: number;
  name: string;
  thumbnail: string | null;
  website_url: string | null;
  description: string | null;
  value_delivered: number;
  revenue_generated: number;
  color: string;
  video_links: string[];
  github_links: string[];
  additional_links: string[];
  featured: boolean;
  display_order: number;
}

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useUser();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classSignups, setClassSignups] = useState<ClassSignup[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
  const [editingBusinessId, setEditingBusinessId] = useState<number | null>(null);
  
  const [promptTitle, setPromptTitle] = useState('');
  const [promptIcon, setPromptIcon] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [promptTags, setPromptTags] = useState('');
  const [promptContent, setPromptContent] = useState('');
  
  // Business form state
  const [businessName, setBusinessName] = useState('');
  const [businessThumbnail, setBusinessThumbnail] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessValueDelivered, setBusinessValueDelivered] = useState('');
  const [businessRevenueGenerated, setBusinessRevenueGenerated] = useState('');
  const [businessColor, setBusinessColor] = useState('#3B82F6');
  const [businessVideoLinks, setBusinessVideoLinks] = useState('');
  const [businessGithubLinks, setBusinessGithubLinks] = useState('');
  const [businessAdditionalLinks, setBusinessAdditionalLinks] = useState('');
  const [businessFeatured, setBusinessFeatured] = useState(false);
  const [businessDisplayOrder, setBusinessDisplayOrder] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  
  // Confirmation modal state for sending Calendly
  const [confirmModal, setConfirmModal] = useState<{show: boolean; submission: Submission | null}>({show: false, submission: null});
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'submissions' | 'signups' | 'prompts' | 'businesses'>('submissions');

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

  const loadBusinesses = useCallback(async () => {
    try {
      const res = await fetch('/api/businesses');
      if (res.ok) setBusinesses(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      loadSubmissions();
      loadClassSignups();
      loadPrompts();
      loadBusinesses();
      
      const interval1 = setInterval(loadSubmissions, 30000);
      const interval2 = setInterval(loadClassSignups, 30000);
      
      return () => {
        clearInterval(interval1);
        clearInterval(interval2);
      };
    }
  }, [isSignedIn, loadSubmissions, loadClassSignups, loadPrompts, loadBusinesses]);

  async function updateContactStatus(id: number, contacted: boolean, table: string) {
    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contacted, table }),
      });
      if (res.ok) {
        if (table === 'submissions') {
          loadSubmissions();
        } else if (table === 'class_signups') {
          loadClassSignups();
        }
      }
    } catch (e) { console.error(e); }
  }

  function handleSendCalendly(sub: Submission) {
    if (sub.contacted) {
      // Show confirmation modal if already contacted
      setConfirmModal({ show: true, submission: sub });
    } else {
      // Send directly if not contacted yet
      sendCalendly(sub.email, sub.name, sub.id);
    }
  }

  async function sendCalendly(email: string, name: string, id: number) {
    console.log('sendCalendly called:', { email, name, id });
    setConfirmModal({ show: false, submission: null });
    try {
      const res = await fetch('/api/send-calendly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      console.log('sendCalendly response:', res.status, res.ok);
      const data = await res.json();
      console.log('sendCalendly data:', data);
      if (res.ok) {
        alert('Email sent successfully!');
        await updateContactStatus(id, true, 'submissions');
        loadSubmissions();
      } else {
        alert(`Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (e) { 
      console.error('sendCalendly error:', e); 
      alert('Error sending email. Check console for details.');
    }
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

  async function saveBusiness() {
    if (!businessName) {
      alert('Please fill in Business Name');
      return;
    }

    const data = {
      name: businessName,
      thumbnail: businessThumbnail || null,
      website_url: businessWebsite || null,
      description: businessDescription || null,
      value_delivered: parseInt(businessValueDelivered) || 0,
      revenue_generated: parseInt(businessRevenueGenerated) || 0,
      color: businessColor || '#3B82F6',
      video_links: businessVideoLinks ? businessVideoLinks.split(',').map(s => s.trim()).filter(s => s) : [],
      github_links: businessGithubLinks ? businessGithubLinks.split(',').map(s => s.trim()).filter(s => s) : [],
      additional_links: businessAdditionalLinks ? businessAdditionalLinks.split(',').map(s => s.trim()).filter(s => s) : [],
      featured: businessFeatured,
      display_order: parseInt(businessDisplayOrder) || 0,
      id: editingBusinessId
    };

    try {
      const res = await fetch('/api/businesses', {
        method: editingBusinessId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        cancelBusinessEdit();
        loadBusinesses();
      }
    } catch (e) { console.error(e); }
  }

  async function deleteBusiness(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await fetch('/api/businesses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      loadBusinesses();
    } catch (e) { console.error(e); }
  }

  function editBusiness(business: Business) {
    setEditingBusinessId(business.id);
    setBusinessName(business.name);
    setBusinessThumbnail(business.thumbnail || '');
    setBusinessWebsite(business.website_url || '');
    setBusinessDescription(business.description || '');
    setBusinessValueDelivered(business.value_delivered?.toString() || '');
    setBusinessRevenueGenerated(business.revenue_generated?.toString() || '');
    setBusinessColor(business.color || '#3B82F6');
    setBusinessVideoLinks((business.video_links || []).join(', '));
    setBusinessGithubLinks((business.github_links || []).join(', '));
    setBusinessAdditionalLinks((business.additional_links || []).join(', '));
    setBusinessFeatured(business.featured || false);
    setBusinessDisplayOrder(business.display_order?.toString() || '');
  }

  function cancelBusinessEdit() {
    setEditingBusinessId(null);
    setBusinessName('');
    setBusinessThumbnail('');
    setBusinessWebsite('');
    setBusinessDescription('');
    setBusinessValueDelivered('');
    setBusinessRevenueGenerated('');
    setBusinessColor('#3B82F6');
    setBusinessVideoLinks('');
    setBusinessGithubLinks('');
    setBusinessAdditionalLinks('');
    setBusinessFeatured(false);
    setBusinessDisplayOrder('');
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setBusinessThumbnail(data.url);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingThumbnail(false);
    }
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

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'submissions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('signups')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'signups'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Class Signups ({classSignups.length})
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'prompts'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prompts ({prompts.length})
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'businesses'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Businesses ({businesses.length})
          </button>
        </div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <>
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

        {/* Submissions Cards - unchecked first, then checked at bottom */}
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
                      onChange={(e) => updateContactStatus(sub.id, e.target.checked, 'submissions')} 
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
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
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Challenge</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{sub.scaling_challenge}</p>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Class Signups Tab */}
        {activeTab === 'signups' && (
          <>
            <h1 className="text-4xl font-semibold mb-2">AI Class Signups</h1>
            <p className="text-gray-500 mb-10">All signups for Free AI Classes</p>

        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-10">
          <div className="bg-white p-4 md:p-6 rounded-xl text-center shadow-sm">
            <div className="text-2xl md:text-4xl font-semibold text-blue-600 mb-1">{classSignups.length}</div>
            <div className="text-xs md:text-sm text-gray-500">Total Signups</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl text-center shadow-sm">
            <div className="text-2xl md:text-4xl font-semibold text-blue-600 mb-1">{inPersonCount}</div>
            <div className="text-xs md:text-sm text-gray-500">In-Person</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl text-center shadow-sm">
            <div className="text-2xl md:text-4xl font-semibold text-blue-600 mb-1">{virtualCount}</div>
            <div className="text-xs md:text-sm text-gray-500">Virtual</div>
          </div>
        </div>

        <button onClick={loadClassSignups} className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-base font-medium cursor-pointer mb-5 hover:bg-blue-700">
          Refresh Class Data
        </button>

        {/* Class Signups Cards - unchecked first, then checked at bottom */}
        <div className="space-y-4 mb-16">
          {classSignups.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm">No class signups yet</div>
          ) : (
            [...classSignups].sort((a, b) => {
              if (a.contacted === b.contacted) return 0;
              return a.contacted ? 1 : -1;
            }).map(s => (
              <div key={s.id} className={`bg-white rounded-xl p-5 md:p-6 shadow-sm border-l-4 ${s.contacted ? 'border-green-500 bg-green-50/50' : 'border-purple-500'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={s.contacted} 
                      onChange={(e) => updateContactStatus(s.id, e.target.checked, 'class_signups')} 
                      className="w-5 h-5 accent-blue-600" 
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{s.name}</h3>
                      <p className="text-sm text-gray-500">{new Date(s.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.format === 'in-person' ? 'bg-green-100 text-green-700' : s.format === 'virtual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {s.format === 'in-person' ? 'In-Person' : s.format === 'virtual' ? 'Virtual' : 'Either'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900 break-all">{s.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{s.phone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Business</p>
                    <p className="text-sm font-medium text-gray-900">{s.business || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">AI Experience</p>
                    <p className="text-sm font-medium text-gray-900">
                      {s.experience === 'none' ? '🆕 Never tried it' : 
                       s.experience === 'beginner' ? '👋 Used ChatGPT a few times' : 
                       s.experience === 'intermediate' ? '⚡ Uses AI regularly' : s.experience}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <>
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
          </>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <>
            <h1 className="text-4xl font-semibold mb-2">Business Management</h1>
            <p className="text-gray-500 mb-10">Manage businesses for the Value Meters and Showcase</p>

            <div className="bg-white p-8 rounded-xl mb-6 shadow-sm">
              <h3 className="text-xl mb-5">{editingBusinessId ? 'Edit Business' : 'Add New Business'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Business Name *</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., Acme Corp" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Thumbnail</label>
                  <div className="flex gap-2">
                    <input value={businessThumbnail} onChange={(e) => setBusinessThumbnail(e.target.value)} placeholder="URL or upload..." className="flex-1 p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                    <label className={`px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors ${uploadingThumbnail ? 'bg-gray-300 text-gray-500' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                      {uploadingThumbnail ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={uploadingThumbnail} className="hidden" />
                    </label>
                  </div>
                  {businessThumbnail && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={businessThumbnail} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                      <button type="button" onClick={() => setBusinessThumbnail('')} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Website URL</label>
                  <input value={businessWebsite} onChange={(e) => setBusinessWebsite(e.target.value)} placeholder="https://..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Color (for meters)</label>
                  <input type="color" value={businessColor} onChange={(e) => setBusinessColor(e.target.value)} className="w-full h-[46px] p-1 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Value Delivered ($)</label>
                  <input type="number" value={businessValueDelivered} onChange={(e) => setBusinessValueDelivered(e.target.value)} placeholder="0" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Revenue Generated ($)</label>
                  <input type="number" value={businessRevenueGenerated} onChange={(e) => setBusinessRevenueGenerated(e.target.value)} placeholder="0" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Display Order</label>
                  <input type="number" value={businessDisplayOrder} onChange={(e) => setBusinessDisplayOrder(e.target.value)} placeholder="0" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="featured" checked={businessFeatured} onChange={(e) => setBusinessFeatured(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                  <label htmlFor="featured" className="font-medium text-sm">Featured on Homepage</label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 font-medium text-sm">Description</label>
                <textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder="Brief description..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Video Links (comma-separated)</label>
                  <input value={businessVideoLinks} onChange={(e) => setBusinessVideoLinks(e.target.value)} placeholder="https://youtube.com/..., ..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">GitHub Links (comma-separated)</label>
                  <input value={businessGithubLinks} onChange={(e) => setBusinessGithubLinks(e.target.value)} placeholder="https://github.com/..., ..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-sm">Additional Links (comma-separated)</label>
                  <input value={businessAdditionalLinks} onChange={(e) => setBusinessAdditionalLinks(e.target.value)} placeholder="https://..., ..." className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-600" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={saveBusiness} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">
                  {editingBusinessId ? 'Update Business' : 'Add Business'}
                </button>
                {editingBusinessId && (
                  <button onClick={cancelBusinessEdit} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h3 className="mb-4 font-semibold">Existing Businesses</h3>
            {businesses.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm">No businesses yet. Add your first business above!</div>
            ) : (
              <div className="space-y-4">
                {businesses.map(business => (
                  <div key={business.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: business.color }}>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{business.name}</h3>
                          {business.featured && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">Featured</span>}
                        </div>
                        {business.description && <p className="text-gray-500 text-sm mb-3">{business.description}</p>}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-green-600">Value: ${(business.value_delivered || 0).toLocaleString()}</span>
                          <span className="text-blue-600">Revenue: ${(business.revenue_generated || 0).toLocaleString()}</span>
                          <span className="text-gray-500">Order: {business.display_order}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editBusiness(business)} className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-600 hover:text-white hover:border-blue-600">
                          Edit
                        </button>
                        <button onClick={() => deleteBusiness(business.id, business.name)} className="bg-gray-50 text-red-500 border border-red-200 px-4 py-2 rounded-md text-sm cursor-pointer hover:bg-red-500 hover:text-white">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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
    </div>
  );
}
