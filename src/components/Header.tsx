'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/10">
      <nav className="flex justify-between items-center h-11 max-w-[980px] mx-auto px-[22px]">
        <Link href="/" className="text-[21px] font-semibold text-[var(--text-primary)] tracking-[-0.5px]">
          Ryan.py
        </Link>
        <div className="hidden md:flex gap-8">
          <Link href="#why" className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity">
            Why
          </Link>
          <Link href="#capabilities" className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity">
            What I Build
          </Link>
          <Link href="#how" className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity">
            How It Works
          </Link>
          <Link href="#prompt-library" className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity">
            Prompts
          </Link>
          <Link href="#apply" className="text-[var(--text-primary)] text-xs font-normal opacity-80 hover:opacity-100 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
