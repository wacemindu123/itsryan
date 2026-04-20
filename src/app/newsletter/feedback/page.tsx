'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function FeedbackInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const nonce = searchParams.get('nonce');
  const token = searchParams.get('token');

  const invalidLink = !draftId || !nonce || !token;

  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (invalidLink) return;

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/newsletter-regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: Number(draftId), nonce, token, feedback }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(data.error || 'Failed to request changes');
      }
    } catch {
      setStatus('error');
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-5 py-10">
      <div className="max-w-[520px] w-full bg-white rounded-2xl border border-black/10 p-8">
        <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] mb-2">Request changes</h1>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6] mb-6">
          Give quick feedback and I&apos;ll regenerate the draft and email you a new preview.
        </p>

        {invalidLink && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 font-medium">Invalid link.</p>
            <p className="text-[13px] text-red-600/80 mt-1">Ask Ryan to resend a fresh preview email.</p>
          </div>
        )}

        {status === 'success' ? (
          <div className="bg-[#34c759]/10 border border-[#34c759]/20 rounded-xl p-4">
            <p className="text-[#1d1d1f] font-medium">Got it — generating a revised draft now.</p>
            <p className="text-[13px] text-[#6e6e73] mt-1">You&apos;ll receive a fresh preview email shortly.</p>
            <div className="mt-4">
              <Link href="/admin/newsletter" className="text-[13px] text-[var(--accent)] underline">Back to admin</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              placeholder="Example: Make it shorter, remove story #2, more tactical prompts, less hype, add a CTA to book a call…"
              className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)] text-[14px] leading-relaxed resize-y"
              required
            />

            {status === 'error' && (
              <div className="text-[13px] text-red-500">{error}</div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || invalidLink}
              className="w-full px-6 py-3 bg-[#ffcc00] text-black rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit feedback'}
            </button>

            <p className="text-[12px] text-[#6e6e73]">
              Safety: If you don&apos;t approve, nothing sends.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function NewsletterFeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <FeedbackInner />
    </Suspense>
  );
}
