import posthog from 'posthog-js';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── PostHog helpers ──────────────────────────────────────────────────
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  // PostHog
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }

  // GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

// ── Funnel step helper ───────────────────────────────────────────────
// Use this to mark funnel steps, e.g. trackFunnelStep('signup', 1, 'visited_page')
export function trackFunnelStep(
  funnelName: string,
  step: number,
  stepName: string,
  properties?: Record<string, unknown>,
) {
  trackEvent('funnel_step', {
    funnel_name: funnelName,
    step_number: step,
    step_name: stepName,
    ...properties,
  });
}

// ── Common pre-built events ──────────────────────────────────────────
export const analytics = {
  // Page / navigation
  pageView: (pageName: string) => trackEvent('page_view', { page: pageName }),

  // CTA clicks
  ctaClick: (ctaName: string, location: string) =>
    trackEvent('cta_click', { cta_name: ctaName, location }),

  // Form events
  formStart: (formName: string) => trackEvent('form_start', { form_name: formName }),
  formSubmit: (formName: string) => trackEvent('form_submit', { form_name: formName }),
  formError: (formName: string, error: string) =>
    trackEvent('form_error', { form_name: formName, error }),

  // Contact / signup funnel
  contactFunnelStep: (step: number, stepName: string) =>
    trackFunnelStep('contact', step, stepName),

  // AI class signup funnel
  aiClassFunnelStep: (step: number, stepName: string) =>
    trackFunnelStep('ai_class_signup', step, stepName),

  // Prompt library
  promptCopied: (promptId: string, promptTitle: string) =>
    trackEvent('prompt_copied', { prompt_id: promptId, prompt_title: promptTitle }),

  // Newsletter
  newsletterSignup: (source: string) => trackEvent('newsletter_signup', { source }),

  // External link clicks
  externalLinkClick: (url: string, label: string) =>
    trackEvent('external_link_click', { url, label }),

  // Calendly
  calendlyClick: (source: string) => trackEvent('calendly_click', { source }),

  // Identify user (for PostHog person profiles)
  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, traits);
      if (window.gtag) {
        window.gtag('set', { user_id: userId });
      }
    }
  },
};
