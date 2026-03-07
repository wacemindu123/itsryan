'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else if (data.error === 'Already subscribed') {
        setStatus('already');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Weekly AI insights',
      description: 'Curated stories, tools, and ideas delivered every week',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      title: 'No spam, ever',
      description: 'Just valuable content, no promotional noise',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Unsubscribe anytime',
      description: 'One click and you&apos;re out, no questions asked',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/10">
        <nav className="flex justify-between items-center h-12 max-w-[980px] mx-auto px-5">
          <Link href="/" className="text-[21px] font-semibold text-[var(--text-primary)] tracking-[-0.5px]">
            ItsRyan.ai
          </Link>
          <Link 
            href="/" 
            className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity"
          >
            ← Back to site
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-5">
        <div className="max-w-[980px] mx-auto text-center">
          <h1 className="text-[40px] sm:text-[56px] md:text-[64px] font-semibold text-[var(--text-primary)] tracking-[-0.04em] leading-[1.05] mb-6 animate-fade-in-up">
            AI, simplified. Weekly.
          </h1>
          <p className="text-[19px] md:text-[21px] text-[var(--text-secondary)] max-w-[600px] mx-auto leading-[1.6] mb-12 animate-fade-in-up-delay-1">
            Get a curated roundup of the most important AI stories, tools, and ideas — every week. No noise.
          </p>

          {/* Email Form */}
          <div className="max-w-[480px] mx-auto animate-fade-in-up-delay-2">
            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 py-4 px-6 bg-[#34c759]/10 rounded-full border border-[#34c759]/20">
                <svg className="w-6 h-6 text-[#34c759]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#34c759] font-medium text-[17px]">You&apos;re on the list.</span>
              </div>
            ) : status === 'already' ? (
              <div className="flex items-center justify-center gap-3 py-4 px-6 bg-[var(--accent)]/10 rounded-full border border-[var(--accent)]/20">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[var(--accent)] font-medium text-[17px]">You&apos;re already subscribed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-5 py-4 text-[17px] bg-white border border-[#d2d2d7] rounded-full focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 text-[17px] font-medium bg-[var(--accent)] text-white rounded-full hover:bg-[var(--accent-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe for free'}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="mt-3 text-sm text-red-500 text-center">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-[var(--accent)]">
                  {feature.icon}
                </div>
                <h3 className="text-[19px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-[var(--text-secondary)] leading-[1.5]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#d2d2d7]">
        <div className="max-w-[980px] mx-auto px-5 text-center">
          <Link href="/" className="text-[15px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            © {new Date().getFullYear()} ItsRyan.ai
          </Link>
        </div>
      </footer>
    </div>
  );
}
