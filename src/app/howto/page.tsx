'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Video, Sparkles, TrendingUp, Cpu, MessageSquare, BarChart3, Mail, Copy, Check } from 'lucide-react';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { analytics } from '@/lib/analytics';

interface HowtoGuide {
  id: number;
  title: string;
  slug?: string;
  description: string | null;
  category: string;
  google_doc_url?: string;
  prompt_content?: string;
  preview_image_url: string | null;
  price: number;
  energy: number;
  related_ids: number[];
  status: string;
  tiktok_url: string | null;
  display_order: number;
  featured: boolean;
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

export default function HowtoPage() {
  const [guides, setGuides] = useState<HowtoGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptGuide, setPromptGuide] = useState<HowtoGuide | null>(null);
  const [copied, setCopied] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    message?: string;
    url?: string;
  } | null>(null);

  const loadGuides = useCallback(async () => {
    try {
      const res = await fetch('/api/howto-guides');
      if (res.ok) {
        const data = await res.json();
        setGuides(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const copyPrompt = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      analytics.ctaClick('copy_prompt_' + title, 'howto_page');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePurchase = async (guideId: number) => {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    // Free guide with prompt content → show prompt modal
    if (guide.price === 0 && guide.prompt_content) {
      analytics.ctaClick('view_prompt_' + guide.title, 'howto_page');
      setPromptGuide(guide);
      setShowPromptModal(true);
      setCopied(false);
      return;
    }

    // Free guide with URL → open directly
    if (guide.price === 0 && guide.google_doc_url) {
      analytics.ctaClick('free_guide_' + guide.title, 'howto_page');
      window.open(guide.google_doc_url, '_blank');
      return;
    }

    // Paid guide → show email/checkout modal
    analytics.ctaClick('unlock_guide_' + guide.title, 'howto_page');
    setSelectedGuideId(guideId);
    setShowEmailModal(true);
    setPurchaseResult(null);
  };

  const submitPurchase = async () => {
    if (!purchaseEmail || !selectedGuideId) return;
    setIsPurchasing(true);
    setPurchaseResult(null);

    try {
      const res = await fetch('/api/howto-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: selectedGuideId, email: purchaseEmail }),
      });

      const data = await res.json();

      if (data.alreadyPurchased) {
        analytics.formSubmit('guide_purchase_existing');
        setPurchaseResult({ success: true, message: 'You already own this guide!', url: data.url });
      } else if (data.checkoutUrl) {
        analytics.formSubmit('guide_purchase_checkout');
        window.location.href = data.checkoutUrl;
      } else if (data.success && data.placeholder) {
        analytics.formSubmit('guide_purchase_success');
        setPurchaseResult({ success: true, message: data.message, url: data.url });
      } else {
        setPurchaseResult({ success: false, message: data.error || 'Something went wrong' });
      }
    } catch {
      setPurchaseResult({ success: false, message: 'Failed to process. Please try again.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const mapStatus = (status: string): "completed" | "in-progress" | "pending" => {
    switch (status) {
      case 'available': return 'completed';
      case 'new': return 'in-progress';
      case 'coming-soon': return 'pending';
      default: return 'completed';
    }
  };

  const timelineData = guides.map((guide) => ({
    id: guide.id,
    title: guide.title,
    date: new Date(guide.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    content: guide.description || 'A step-by-step how-to guide.',
    category: guide.category,
    icon: categoryIcons[guide.category] || BookOpen,
    relatedIds: guide.related_ids || [],
    status: mapStatus(guide.status),
    energy: guide.energy,
    price: guide.price,
    purchased: false,
    onPurchase: () => handlePurchase(guide.id),
  }));

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <nav className="flex justify-between items-center h-12 max-w-[980px] mx-auto px-5">
          <Link href="/" className="text-[21px] font-semibold text-white tracking-[-0.5px]">
            ItsRyan.ai
          </Link>
          <Link
            href="/"
            className="text-white/70 text-xs font-normal hover:text-white transition-colors"
          >
            ← Back to site
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-8 px-5">
        <div className="max-w-[980px] mx-auto text-center">
          <span className="inline-block text-[13px] font-medium tracking-[0.1em] text-blue-400 uppercase mb-4">
            How-To Guides
          </span>
          <h1 className="text-[36px] sm:text-[48px] md:text-[60px] font-semibold text-white tracking-[-0.03em] leading-[1.1] mb-6">
            Learn what I teach on TikTok.
          </h1>
          <p className="text-[17px] sm:text-[19px] text-white/60 max-w-[620px] mx-auto leading-[1.6] mb-4">
            Step-by-step guides from my TikTok videos — follow along at your own pace, as many times as you need. Any paid guides go directly toward helping me continue doing free AI work for small businesses.
          </p>
          <p className="text-[13px] text-white/40 hidden md:block">
            Click any node on the orbital to explore • Click empty space to reset
          </p>
        </div>
      </section>

      {/* Orbital Timeline — hidden on mobile */}
      <section className="px-5 pb-16 hidden md:block">
        <div className="max-w-[980px] mx-auto">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="animate-pulse text-white/50">Loading guides...</div>
            </div>
          ) : guides.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center">
              <BookOpen className="w-12 h-12 text-white/30 mb-4" />
              <p className="text-white/50 text-lg mb-2">No guides yet</p>
              <p className="text-white/30 text-sm">Check back soon — new guides are coming!</p>
            </div>
          ) : (
            <RadialOrbitalTimeline timelineData={timelineData} />
          )}
        </div>
      </section>

      {/* Mobile loading state */}
      {loading && (
        <div className="md:hidden flex items-center justify-center py-24">
          <div className="animate-pulse text-white/50">Loading guides...</div>
        </div>
      )}

      {/* Card Grid — always visible, primary on mobile */}
      {!loading && guides.length > 0 && (
        <section className="px-5 pb-24">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-[24px] font-semibold text-white tracking-[-0.02em] mb-8 text-center md:hidden">
              Browse Guides
            </h2>
            <h2 className="text-[24px] font-semibold text-white tracking-[-0.02em] mb-8 text-center hidden md:block">
              All Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide) => {
                const Icon = categoryIcons[guide.category] || BookOpen;
                return (
                  <div
                    key={guide.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        guide.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                        guide.status === 'coming-soon' ? 'bg-white/10 text-white/50' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {guide.status === 'new' ? 'NEW' :
                         guide.status === 'coming-soon' ? 'COMING SOON' : 'AVAILABLE'}
                      </span>
                    </div>
                    <h3 className="text-[17px] font-semibold text-white mb-2 tracking-[-0.02em]">
                      {guide.title}
                    </h3>
                    <p className="text-[14px] text-white/50 leading-[1.5] mb-4 line-clamp-2">
                      {guide.description || 'A detailed step-by-step guide.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-white/30">{guide.category}</span>
                      <button
                        onClick={() => handlePurchase(guide.id)}
                        disabled={guide.status === 'coming-soon'}
                        className="px-4 py-2 text-[13px] font-medium bg-white text-black rounded-full hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {guide.status === 'coming-soon' ? 'Coming Soon' : guide.price === 0 && guide.prompt_content ? 'Free — View Prompt' : guide.price === 0 ? 'Free — View Guide' : `Unlock $${guide.price?.toFixed(2) || '1.99'}`}
                      </button>
                    </div>
                    {guide.tiktok_url && (
                      <a
                        href={guide.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => analytics.externalLinkClick(guide.tiktok_url!, 'tiktok_' + guide.title)}
                        className="inline-flex items-center gap-1 mt-3 text-[12px] text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Video size={12} />
                        Watch on TikTok
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-[980px] mx-auto px-5 text-center">
          <Link href="/" className="text-[15px] text-white/40 hover:text-white/70 transition-colors">
            © {new Date().getFullYear()} ItsRyan.ai
          </Link>
        </div>
      </footer>

      {/* Email Purchase Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2">
              Unlock This Guide
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Enter your email to purchase. You&apos;ll get instant access to the full guide.
            </p>

            {purchaseResult ? (
              <div className={`p-4 rounded-xl mb-4 ${purchaseResult.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <p className={`text-sm font-medium ${purchaseResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {purchaseResult.message}
                </p>
                {purchaseResult.url && (
                  <a
                    href={purchaseResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.externalLinkClick(purchaseResult.url!, 'open_purchased_guide')}
                    className="inline-block mt-3 px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                  >
                    Open Guide →
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="email"
                  value={purchaseEmail}
                  onChange={(e) => setPurchaseEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={submitPurchase}
                  disabled={isPurchasing || !purchaseEmail}
                  className="w-full py-3 bg-white text-black rounded-full font-medium text-[15px] hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPurchasing ? 'Processing...' : 'Pay $1.99 & Get Access'}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowEmailModal(false);
                setPurchaseResult(null);
                setSelectedGuideId(null);
              }}
              className="mt-4 w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {showPromptModal && promptGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl max-w-2xl w-full shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{promptGuide.title}</h2>
                {promptGuide.description && (
                  <p className="text-white/50 text-sm mt-1">{promptGuide.description}</p>
                )}
              </div>
              <button
                onClick={() => copyPrompt(promptGuide.prompt_content!, promptGuide.title)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="px-8 pb-2 overflow-y-auto flex-1 min-h-0">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <pre className="text-[14px] text-white/80 leading-[1.7] whitespace-pre-wrap font-mono break-words">
                  {promptGuide.prompt_content}
                </pre>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between">
              {promptGuide.google_doc_url && (
                <a
                  href={promptGuide.google_doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Open Full Guide →
                </a>
              )}
              <button
                onClick={() => {
                  setShowPromptModal(false);
                  setPromptGuide(null);
                  setCopied(false);
                }}
                className="text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
