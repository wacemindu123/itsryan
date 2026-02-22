'use client';

import { useState, useEffect, FormEvent } from 'react';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('newsletter_popup_seen');
    if (hasSeenPopup) return;

    // Show popup after 5 seconds on first visit
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem('newsletter_popup_seen', 'true');
    }, 5000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem('newsletter_popup_seen')) {
        setIsOpen(true);
        localStorage.setItem('newsletter_popup_seen', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || null }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to subscribe');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">You&apos;re In!</h2>
            <p className="text-gray-600">
              Thanks for subscribing. You&apos;ll get bi-weekly AI tips and tech insights for your business.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900">
              AI Tips for Your Business
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Get bi-weekly insights on using AI to grow your small business. No spam, just practical tips.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional, for SMS updates)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                We won&apos;t send you spam. Unsubscribe at any time.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
