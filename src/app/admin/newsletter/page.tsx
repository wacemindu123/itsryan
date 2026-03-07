'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser, SignIn, SignOutButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

interface NewsletterSubscriber {
  id: number;
  email: string;
  phone: string | null;
  name: string | null;
  subscribed: boolean;
  created_at: string;
}

export default function AdminNewsletterPage() {
  const { isSignedIn, isLoaded } = useUser();
  
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'compose'>('subscribers');
  
  // Compose state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    sent?: number;
    failed?: number;
    errors?: string[];
  } | null>(null);

  const loadSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/newsletter-signup');
      if (res.ok) setSubscribers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      loadSubscribers();
    }
  }, [isSignedIn, loadSubscribers]);

  const toggleSubscriberStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/newsletter-subscriber-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, subscribed: !currentStatus }),
      });
      if (res.ok) loadSubscribers();
    } catch (e) { console.error(e); }
  };

  const sendNewsletter = async () => {
    setIsSending(true);
    setSendResult(null);
    
    try {
      const res = await fetch('/api/newsletter-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSendResult({
          success: true,
          sent: data.results.sent,
          failed: data.results.failed,
          errors: data.results.errors,
        });
        setSubject('');
        setContent('');
      } else {
        setSendResult({
          success: false,
          errors: [data.error || 'Failed to send newsletter'],
        });
      }
    } catch {
      setSendResult({
        success: false,
        errors: ['Something went wrong. Please try again.'],
      });
    } finally {
      setIsSending(false);
      setShowConfirm(false);
    }
  };

  const activeSubscribers = subscribers.filter(s => s.subscribed);
  const inactiveSubscribers = subscribers.filter(s => !s.subscribed);

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
            <span className="text-[21px] font-semibold text-[var(--text-primary)]">Newsletter</span>
          </div>
          <SignOutButton>
            <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-5 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl font-semibold text-[var(--text-primary)] mb-1">{subscribers.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Subscribers</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl font-semibold text-[#34c759] mb-1">{activeSubscribers.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Active</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl font-semibold text-[var(--text-secondary)] mb-1">{inactiveSubscribers.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Inactive</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white text-[var(--text-primary)] hover:bg-gray-50'
            }`}
          >
            Subscribers
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white text-[var(--text-primary)] hover:bg-gray-50'
            }`}
          >
            Compose Newsletter
          </button>
        </div>

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d2d2d7]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Subscribed</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">
                      No subscribers yet
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-[#d2d2d7] last:border-none hover:bg-[#f5f5f7] transition-colors">
                      <td className="p-4 text-sm text-[var(--text-primary)]">{sub.email}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          sub.subscribed
                            ? 'bg-[#34c759]/10 text-[#34c759]'
                            : 'bg-gray-100 text-[var(--text-secondary)]'
                        }`}>
                          {sub.subscribed ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleSubscriberStatus(sub.id, sub.subscribed)}
                          className={`text-sm font-medium cursor-pointer ${
                            sub.subscribed
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-[var(--accent)] hover:text-[var(--accent-hover)]'
                          }`}
                        >
                          {sub.subscribed ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {sendResult && (
              <div className={`mb-6 p-4 rounded-xl ${
                sendResult.success ? 'bg-[#34c759]/10' : 'bg-red-50'
              }`}>
                {sendResult.success ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-medium text-[#34c759]">
                        {sendResult.sent} emails sent successfully
                      </p>
                      {sendResult.failed && sendResult.failed > 0 && (
                        <p className="text-sm text-red-500 mt-1">
                          {sendResult.failed} failed
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500">
                    <p className="font-medium">Failed to send newsletter</p>
                    {sendResult.errors?.map((err, i) => (
                      <p key={i} className="text-sm mt-1">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Newsletter subject line..."
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your newsletter content here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)] font-mono text-sm leading-relaxed resize-y"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!subject || !content}
                  className="px-6 py-3 bg-gray-100 text-[var(--text-primary)] rounded-full font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Preview
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!subject || !content || activeSubscribers.length === 0}
                  className="px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Send to {activeSubscribers.length} subscribers
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#d2d2d7] flex justify-between items-center">
              <span className="font-medium text-[var(--text-primary)]">Email Preview</span>
              <button
                onClick={() => setShowPreview(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="border border-[#d2d2d7] rounded-xl p-6">
                <div className="pb-4 mb-4 border-b border-[#d2d2d7]">
                  <span className="text-[17px] font-semibold text-[var(--text-primary)]">ItsRyan.ai</span>
                </div>
                <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">{subject}</h1>
                <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {content}
                </div>
                <div className="mt-6 pt-4 border-t border-[#d2d2d7]">
                  <p className="text-xs text-[var(--text-secondary)]">
                    You&apos;re receiving this because you subscribed to the ItsRyan.ai newsletter.
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    <span className="underline">Unsubscribe</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Send Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Send Newsletter?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              This will send &quot;{subject}&quot; to {activeSubscribers.length} active subscribers.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isSending}
                className="px-6 py-3 bg-gray-100 text-[var(--text-primary)] rounded-full font-medium hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendNewsletter}
                disabled={isSending}
                className="px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-[var(--accent-hover)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Newsletter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
