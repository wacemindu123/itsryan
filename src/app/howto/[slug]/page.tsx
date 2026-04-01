'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Video, Sparkles, TrendingUp, Cpu, MessageSquare, BarChart3, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface HowtoGuide {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  google_doc_url?: string;
  prompt_content?: string;
  preview_image_url: string | null;
  price: number;
  energy: number;
  status: string;
  tiktok_url: string | null;
  created_at: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  'AI': Cpu,
  'Marketing': TrendingUp,
  'Automation': Sparkles,
  'Content': Video,
  'Customer Service': MessageSquare,
  'Analytics': BarChart3,
  'Email': Mail,
  'General': BookOpen,
};

export default function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [guide, setGuide] = useState<HowtoGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const loadGuide = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch('/api/howto-guides');
      if (res.ok) {
        const guides: HowtoGuide[] = await res.json();
        const found = guides.find(g => g.slug === slug);
        setGuide(found || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) loadGuide();
  }, [slug, loadGuide]);

  const copyPrompt = async () => {
    if (!guide?.prompt_content) return;
    try {
      await navigator.clipboard.writeText(guide.prompt_content);
      setCopied(true);
      analytics.ctaClick('copy_prompt_' + guide.title, 'guide_detail');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = guide.prompt_content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Icon = guide ? (categoryIcons[guide.category] || BookOpen) : BookOpen;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading guide...</div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-5">
        <BookOpen className="w-12 h-12 text-white/30 mb-4" />
        <h1 className="text-2xl font-semibold text-white mb-2">Guide not found</h1>
        <p className="text-white/50 mb-6">This guide may have been removed or the link is incorrect.</p>
        <Link href="/howto" className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all">
          ← Browse All Guides
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <nav className="flex justify-between items-center h-12 max-w-[980px] mx-auto px-5">
          <Link href="/" className="text-[21px] font-semibold text-white tracking-[-0.5px]">
            ItsRyan.ai
          </Link>
          <Link
            href="/howto"
            className="text-white/70 text-xs font-normal hover:text-white transition-colors"
          >
            ← All Guides
          </Link>
        </nav>
      </header>

      {/* Guide Content */}
      <section className="pt-16 md:pt-24 pb-16 px-5">
        <div className="max-w-[700px] mx-auto">
          {/* Category + Status */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
              <Icon size={18} />
            </div>
            <span className="text-sm text-blue-400 font-medium">{guide.category}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              guide.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
              guide.status === 'coming-soon' ? 'bg-white/10 text-white/50' :
              'bg-green-500/20 text-green-400'
            }`}>
              {guide.status === 'new' ? 'NEW' :
               guide.status === 'coming-soon' ? 'COMING SOON' : 'AVAILABLE'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[32px] sm:text-[40px] font-semibold text-white tracking-[-0.03em] leading-[1.15] mb-4">
            {guide.title}
          </h1>

          {/* Description */}
          {guide.description && (
            <p className="text-[17px] text-white/60 leading-[1.6] mb-8">
              {guide.description}
            </p>
          )}

          {/* TikTok link */}
          {guide.tiktok_url && (
            <a
              href={guide.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.externalLinkClick(guide.tiktok_url!, 'tiktok_' + guide.title)}
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8"
            >
              <Video size={14} />
              Watch the TikTok video
            </a>
          )}

          {/* Prompt Content — scrollable card with copy button */}
          {guide.prompt_content && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <span className="text-sm font-medium text-white/70">Prompt</span>
                <button
                  onClick={copyPrompt}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
              <div className="px-6 py-5 max-h-[500px] overflow-y-auto">
                <pre className="text-[14px] text-white/80 leading-[1.7] whitespace-pre-wrap font-mono break-words">
                  {guide.prompt_content}
                </pre>
              </div>
            </div>
          )}

          {/* Google Doc link */}
          {guide.google_doc_url && (
            <a
              href={guide.google_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.externalLinkClick(guide.google_doc_url!, 'open_guide_' + guide.title)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <ExternalLink size={16} />
              Open Full Guide
            </a>
          )}

          {/* Back to all guides */}
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <Link
              href="/howto"
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              ← Browse all How-To Guides
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-[980px] mx-auto px-5 text-center">
          <Link href="/" className="text-[15px] text-white/40 hover:text-white/70 transition-colors">
            © {new Date().getFullYear()} ItsRyan.ai
          </Link>
        </div>
      </footer>
    </div>
  );
}
