import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-20 text-center bg-[var(--surface)] border-t border-black/5">
      <div className="max-w-[980px] mx-auto px-[22px]">
        <div className="flex justify-center gap-8 mb-6">
          <Link href="mailto:widgeon1996@gmail.com" className="text-[var(--text-secondary)] text-2xl hover:text-[var(--text-primary)] hover:scale-110 transition-all">
            📧
          </Link>
          <Link href="https://github.com/wacemindu123" className="text-[var(--text-secondary)] text-2xl hover:text-[var(--text-primary)] hover:scale-110 transition-all">
            💻
          </Link>
          <Link href="https://linkedin.com/in/ryan-widgeon" className="text-[var(--text-secondary)] text-2xl hover:text-[var(--text-primary)] hover:scale-110 transition-all">
            👔
          </Link>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">For Atlanta small businesses</p>
      </div>
    </footer>
  );
}
