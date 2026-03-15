'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser, SignIn, SignOutButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

interface HowtoGuide {
  id: number;
  title: string;
  description: string | null;
  category: string;
  google_doc_url: string;
  preview_image_url: string | null;
  price: number;
  energy: number;
  related_ids: number[];
  status: string;
  tiktok_url: string | null;
  display_order: number;
  featured: boolean;
  created_at: string;
}

const CATEGORIES = ['General', 'AI', 'Marketing', 'Automation', 'Content', 'Customer Service', 'Analytics', 'Email'];
const STATUSES = ['available', 'new', 'coming-soon'];

export default function AdminHowtoPage() {
  const { isSignedIn, isLoaded } = useUser();

  const [guides, setGuides] = useState<HowtoGuide[]>([]);
  const [activeTab, setActiveTab] = useState<'guides' | 'add'>('guides');

  // Add/Edit form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formGoogleDocUrl, setFormGoogleDocUrl] = useState('');
  const [formPreviewImageUrl, setFormPreviewImageUrl] = useState('');
  const [formPrice, setFormPrice] = useState('1.99');
  const [formEnergy, setFormEnergy] = useState('50');
  const [formStatus, setFormStatus] = useState('available');
  const [formTiktokUrl, setFormTiktokUrl] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState('0');
  const [formFeatured, setFormFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadGuides = useCallback(async () => {
    try {
      const res = await fetch('/api/howto-guides');
      if (res.ok) setGuides(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (isSignedIn) loadGuides();
  }, [isSignedIn, loadGuides]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('General');
    setFormGoogleDocUrl('');
    setFormPreviewImageUrl('');
    setFormPrice('1.99');
    setFormEnergy('50');
    setFormStatus('available');
    setFormTiktokUrl('');
    setFormDisplayOrder('0');
    setFormFeatured(false);
    setSaveResult(null);
  };

  const editGuide = (guide: HowtoGuide) => {
    setEditingId(guide.id);
    setFormTitle(guide.title);
    setFormDescription(guide.description || '');
    setFormCategory(guide.category);
    setFormGoogleDocUrl(guide.google_doc_url);
    setFormPreviewImageUrl(guide.preview_image_url || '');
    setFormPrice(String(guide.price));
    setFormEnergy(String(guide.energy));
    setFormStatus(guide.status);
    setFormTiktokUrl(guide.tiktok_url || '');
    setFormDisplayOrder(String(guide.display_order));
    setFormFeatured(guide.featured);
    setSaveResult(null);
    setActiveTab('add');
  };

  const saveGuide = async () => {
    if (!formTitle || !formGoogleDocUrl) {
      setSaveResult({ success: false, message: 'Title and Google Doc URL are required.' });
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    const payload = {
      ...(editingId ? { id: editingId } : {}),
      title: formTitle,
      description: formDescription || null,
      category: formCategory,
      google_doc_url: formGoogleDocUrl,
      preview_image_url: formPreviewImageUrl || null,
      price: parseFloat(formPrice) || 1.99,
      energy: parseInt(formEnergy) || 50,
      status: formStatus,
      tiktok_url: formTiktokUrl || null,
      display_order: parseInt(formDisplayOrder) || 0,
      featured: formFeatured,
    };

    try {
      const res = await fetch('/api/howto-guides', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveResult({ success: true, message: editingId ? 'Guide updated!' : 'Guide created!' });
        loadGuides();
        if (!editingId) resetForm();
      } else {
        const data = await res.json();
        setSaveResult({ success: false, message: data.error || 'Failed to save' });
      }
    } catch {
      setSaveResult({ success: false, message: 'Something went wrong.' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteGuide = async (id: number) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const res = await fetch('/api/howto-guides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) loadGuides();
    } catch (e) { console.error(e); }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-semibold text-center mb-6 text-[var(--text-primary)]">Admin Access</h1>
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-[#d2d2d7]">
        <div className="max-w-[1200px] mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              ← Back to Admin
            </Link>
            <span className="text-[21px] font-semibold text-[var(--text-primary)]">How-To Guides</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/howto" target="_blank" className="text-sm text-[var(--accent)] hover:underline">
              View Live Page ↗
            </Link>
            <SignOutButton>
              <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-5 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl font-semibold text-[var(--text-primary)] mb-1">{guides.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Guides</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl font-semibold text-[#34c759] mb-1">
              {guides.filter(g => g.status === 'available' || g.status === 'new').length}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Active</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl font-semibold text-[var(--text-secondary)] mb-1">
              {guides.filter(g => g.featured).length}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Featured</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('guides'); resetForm(); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'guides'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white text-[var(--text-primary)] hover:bg-gray-50'
            }`}
          >
            All Guides
          </button>
          <button
            onClick={() => { setActiveTab('add'); if (activeTab !== 'add') resetForm(); }}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'add'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white text-[var(--text-primary)] hover:bg-gray-50'
            }`}
          >
            {editingId ? 'Edit Guide' : '+ Add Guide'}
          </button>
        </div>

        {/* Guides Table */}
        {activeTab === 'guides' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d2d2d7]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Title</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                      No guides yet. Click &quot;+ Add Guide&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  guides.map((guide) => (
                    <tr key={guide.id} className="border-b border-[#d2d2d7] last:border-none hover:bg-[#f5f5f7] transition-colors">
                      <td className="p-4">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{guide.title}</div>
                        {guide.tiktok_url && (
                          <a href={guide.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)]">
                            TikTok ↗
                          </a>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{guide.category}</td>
                      <td className="p-4 text-sm text-[var(--text-primary)] font-medium">${guide.price?.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          guide.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          guide.status === 'coming-soon' ? 'bg-gray-100 text-gray-500' :
                          'bg-[#34c759]/10 text-[#34c759]'
                        }`}>
                          {guide.status === 'available' ? 'Available' :
                           guide.status === 'new' ? 'New' : 'Coming Soon'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => editGuide(guide)}
                            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteGuide(guide.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Form */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {saveResult && (
              <div className={`mb-6 p-4 rounded-xl ${saveResult.success ? 'bg-[#34c759]/10' : 'bg-red-50'}`}>
                <p className={`font-medium text-sm ${saveResult.success ? 'text-[#34c759]' : 'text-red-500'}`}>
                  {saveResult.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. How to Build an AI Chatbot"
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)] bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of what this guide covers..."
                  rows={3}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Google Doc URL *
                </label>
                <input
                  type="url"
                  value={formGoogleDocUrl}
                  onChange={(e) => setFormGoogleDocUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  TikTok URL
                </label>
                <input
                  type="url"
                  value={formTiktokUrl}
                  onChange={(e) => setFormTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@..."
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Preview Image URL
                </label>
                <input
                  type="url"
                  value={formPreviewImageUrl}
                  onChange={(e) => setFormPreviewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Popularity (0–100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formEnergy}
                  onChange={(e) => setFormEnergy(e.target.value)}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)] bg-white"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s === 'available' ? 'Available' : s === 'new' ? 'New' : 'Coming Soon'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(e.target.value)}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-5 h-5 rounded accent-[var(--accent)]"
                />
                <label htmlFor="featured" className="text-sm font-medium text-[var(--text-primary)]">
                  Featured Guide
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={saveGuide}
                disabled={isSaving || !formTitle || !formGoogleDocUrl}
                className="px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update Guide' : 'Create Guide'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-[var(--text-primary)] rounded-full font-medium hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
