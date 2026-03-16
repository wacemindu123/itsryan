'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { analytics } from '@/lib/analytics';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get('from') || 'contact';

  const isClassSignup = source === 'class';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-[700px] mx-auto px-5 py-20 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-semibold text-[var(--text-primary)] mb-3 tracking-[-0.5px]">
          {isClassSignup ? "You're signed up!" : "Got it — I'll be in touch!"}
        </h1>

        <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-[500px] mx-auto">
          {isClassSignup
            ? "You're on the list for the next AI class. I'll send you details soon."
            : "I've received your info and I'm already thinking about how to help. Expect to hear from me within 24 hours."}
        </p>

        {/* Next Steps CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-[var(--surface)] rounded-2xl p-8 border border-black/5 text-center">
            <div className="text-3xl mb-3">📬</div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Join the Newsletter
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Weekly AI tips and tools to help your business grow.
            </p>
            <Link
              href="/newsletter"
              onClick={() => analytics.ctaClick('newsletter', 'thank_you_page')}
              className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all"
            >
              Subscribe Free →
            </Link>
          </div>
          <div className="bg-[var(--surface)] rounded-2xl p-8 border border-black/5 text-center">
            <div className="text-3xl mb-3">🔥</div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              How-To Guides
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Step-by-step guides on using AI to grow your business.
            </p>
            <Link
              href="/howto"
              onClick={() => analytics.ctaClick('howto_guides', 'thank_you_page')}
              className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all"
            >
              Browse Guides →
            </Link>
          </div>
        </div>

        {/* What happens next */}
        <div className="text-left bg-[var(--surface)] rounded-2xl p-8 border border-black/5 mb-10">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">I review your submission</p>
                <p className="text-sm text-[var(--text-secondary)]">I personally read every response — no bots here.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {isClassSignup ? "You get class details" : "I reach out with ideas"}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {isClassSignup
                    ? "I'll email you the date, time, and what to expect."
                    : "Usually within 24 hours, I'll share initial thoughts on what I can build for you."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {isClassSignup ? "Show up and learn" : "We build something great"}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {isClassSignup
                    ? "Come ready to learn ChatGPT and AI tools for your business."
                    : "I build. You own it. No strings attached."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 text-[var(--accent)] font-medium hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
