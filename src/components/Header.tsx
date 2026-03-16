'use client';

import { useState } from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/howto', label: '🔥 How-To Guides', highlight: true },
    { href: '#capabilities', label: 'What I Build', highlight: false },
    { href: '#how', label: 'How It Works', highlight: false },
    { href: '#prompt-library', label: 'Prompts', highlight: false },
    { href: '#apply', label: 'Get Started', highlight: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/10">
      <nav className="flex justify-between items-center h-12 max-w-[980px] mx-auto px-5">
        <Link href="/" className="text-[21px] font-semibold text-[var(--text-primary)] tracking-[-0.5px]">
          ItsRyan.ai
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => analytics.ctaClick(link.label, 'header_nav')}
              className={
                link.highlight
                  ? "text-[var(--accent)] text-xs font-semibold hover:text-[var(--accent-hover)] transition-colors"
                  : "text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text-primary)] transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--background)] border-t border-black/10 py-4 px-5">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => { analytics.ctaClick(link.label, 'mobile_nav'); setMobileMenuOpen(false); }}
              className={
                link.highlight
                  ? "block py-3 text-[var(--accent)] text-base font-semibold border-b border-black/5 last:border-none"
                  : "block py-3 text-[var(--text-primary)] text-base font-medium border-b border-black/5 last:border-none"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
