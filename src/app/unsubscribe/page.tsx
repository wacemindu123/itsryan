'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasRun = useRef(false);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!email || !token) {
      setStatus('error');
      setErrorMessage('Invalid unsubscribe link.');
      return;
    }

    fetch('/api/newsletter-unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
        } else {
          const data = await res.json();
          setStatus('error');
          setErrorMessage(data.error || 'Failed to unsubscribe.');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      });
  }, [email, token]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-5">
      <div className="max-w-[480px] w-full text-center">
        {status === 'loading' && (
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-200" />
            <div className="h-8 bg-gray-200 rounded-lg mb-4 max-w-[200px] mx-auto" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="text-[64px] mb-6">✓</div>
            <h1 className="text-[32px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
              You&apos;ve been unsubscribed.
            </h1>
            <p className="text-[17px] text-[var(--text-secondary)] leading-[1.6] mb-8">
              You won&apos;t receive any more emails from us. We&apos;re sorry to see you go.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 text-[17px] font-medium text-[var(--accent)] hover:underline transition-all"
            >
              Back to ItsRyan.ai
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-[64px] mb-6">✕</div>
            <h1 className="text-[32px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] mb-4">
              Something went wrong
            </h1>
            <p className="text-[17px] text-[var(--text-secondary)] leading-[1.6] mb-8">
              {errorMessage}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 text-[17px] font-medium text-[var(--accent)] hover:underline transition-all"
            >
              Back to ItsRyan.ai
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-200" />
          <div className="h-8 bg-gray-200 rounded-lg mb-4 w-48 mx-auto" />
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
