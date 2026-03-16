'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';

export default function NewsletterCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the CTA
    const dismissed = localStorage.getItem('newsletter_cta_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    analytics.ctaClick('newsletter_cta_dismissed', 'floating_cta');
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('newsletter_cta_dismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-[slideUp_0.3s_ease-out]">
      <Link
        href="/newsletter"
        onClick={() => analytics.ctaClick('join_newsletter', 'floating_cta')}
        className="group flex items-center gap-2 px-4 py-3 bg-[var(--accent)] text-white rounded-full shadow-lg hover:bg-[var(--accent-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium"
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
        <span className="hidden sm:inline">Join the Newsletter</span>
        <span className="sm:hidden">Newsletter</span>
        <button
          onClick={handleDismiss}
          className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Link>
    </div>
  );
}
