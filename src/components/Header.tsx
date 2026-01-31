'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#why', label: 'Why' },
    { href: '#capabilities', label: 'What I Build' },
    { href: '#how', label: 'How It Works' },
    { href: '#prompt-library', label: 'Prompts' },
    { href: '#apply', label: 'Get Started' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/10">
      <nav className="flex justify-between items-center h-12 max-w-[980px] mx-auto px-5">
        <Link href="/" className="text-[21px] font-semibold text-[var(--text-primary)] tracking-[-0.5px]">
          Ryan.py
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity">
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
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 text-[var(--text-primary)] text-base font-medium border-b border-black/5 last:border-none"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
