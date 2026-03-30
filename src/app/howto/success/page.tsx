'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function HowtoSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [guideUrl, setGuideUrl] = useState<string | null>(null);
  const hasRun = useRef(false);

  const sessionId = searchParams.get('session_id');
  const guideId = searchParams.get('guide_id');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!sessionId || !guideId) return;

    fetch(`/api/howto-confirm?session_id=${encodeURIComponent(sessionId)}&guide_id=${encodeURIComponent(guideId)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('confirm_failed');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.url) {
          setGuideUrl(data.url);
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId, guideId]);

  if (!sessionId || !guideId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-5">
        <div className="max-w-md w-full text-center">
          <div>
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-2xl font-semibold text-white mb-3">Something went wrong</h1>
            <p className="text-white/60 mb-8">We couldn&apos;t confirm your purchase. Please contact support.</p>
            <Link
              href="/howto"
              className="inline-block px-8 py-3.5 bg-white text-black rounded-full font-medium text-[17px] hover:bg-white/90 transition-all"
            >
              Back to Guides
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-5">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="animate-pulse text-white/50">Confirming your purchase...</div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-semibold text-white mb-3">Purchase Complete!</h1>
            <p className="text-white/60 mb-8">Your guide is ready. Click below to open it.</p>
            {guideUrl && (
              <a
                href={guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3.5 bg-white text-black rounded-full font-medium text-[17px] hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Open Your Guide →
              </a>
            )}
            <div className="mt-6">
              <Link href="/howto" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                ← Back to all guides
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-2xl font-semibold text-white mb-3">Something went wrong</h1>
            <p className="text-white/60 mb-8">We couldn&apos;t confirm your purchase. Please contact support.</p>
            <Link
              href="/howto"
              className="inline-block px-8 py-3.5 bg-white text-black rounded-full font-medium text-[17px] hover:bg-white/90 transition-all"
            >
              Back to Guides
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HowtoSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center p-5">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    }>
      <HowtoSuccessContent />
    </Suspense>
  );
}
