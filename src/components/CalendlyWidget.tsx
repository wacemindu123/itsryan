'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Calendly?: {
      initBadgeWidget: (options: {
        url: string;
        text: string;
        color: string;
        textColor: string;
        branding: boolean;
      }) => void;
    };
  }
}

export default function CalendlyWidget() {
  useEffect(() => {
    const initCalendly = () => {
      if (typeof window !== 'undefined' && window.Calendly) {
        window.Calendly.initBadgeWidget({
          url: 'https://calendly.com/ryansmallbussinessdoctor/15min',
          text: 'Schedule time with me',
          color: '#0071e3',
          textColor: '#ffffff',
          branding: true,
        });
      }
    };

    // Try immediately
    initCalendly();

    // Also try after a delay in case script hasn't loaded
    const timeout = setTimeout(initCalendly, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
