'use client';

import Link from 'next/link';
import { Mail, Github, Linkedin } from 'lucide-react';
import { analytics } from '@/lib/analytics';

export default function Footer() {
  return (
    <footer className="py-20 text-center bg-[var(--surface)] border-t border-black/5">
      <div className="max-w-[980px] mx-auto px-[22px]">
        <div className="flex justify-center gap-8 mb-6">
          <Link href="mailto:itsryan@itsryan.ai" onClick={() => analytics.externalLinkClick('mailto:itsryan@itsryan.ai', 'email')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-110 transition-all">
            <Mail className="w-6 h-6" />
          </Link>
          <Link href="https://github.com/wacemindu123" onClick={() => analytics.externalLinkClick('https://github.com/wacemindu123', 'github')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-110 transition-all">
            <Github className="w-6 h-6" />
          </Link>
          <Link href="https://linkedin.com/in/ryan-widgeon" onClick={() => analytics.externalLinkClick('https://linkedin.com/in/ryan-widgeon', 'linkedin')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-110 transition-all">
            <Linkedin className="w-6 h-6" />
          </Link>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">Democratization of AI for small and medium sized businesses</p>
      </div>
    </footer>
  );
}
