'use client';

import { useEffect, useRef, useState } from 'react';

const agentCards = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Never miss a lead again.',
    description: 'AI agents monitor your inbound channels 24/7 — qualifying leads, asking the right questions, and routing hot prospects directly to your calendar. No more leads falling through the cracks at 2am.',
    stat: 'Businesses report 4–7× improvement in lead conversion rates with agentic workflows.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Support that scales without hiring.',
    description: 'Deploy a support agent that handles FAQs, order inquiries, and common issues end-to-end — escalating to humans only when it truly matters. Your customers get instant, accurate answers every time.',
    stat: '68% of customer service interactions projected to be handled autonomously by 2028.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Booking, follow-ups, reminders — handled.',
    description: 'From booking discovery calls to sending follow-up sequences and chasing no-shows, your AI agent keeps your pipeline moving without you lifting a finger.',
    stat: 'Teams save 10+ hours/week on scheduling and follow-up alone.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    title: 'Always-clean CRM. Zero manual entry.',
    description: 'Your agent logs calls, updates contact records, adds notes after meetings, and keeps your CRM accurate in real time — so your data is always reliable, and your team stays focused on selling.',
    stat: 'Eliminates the #1 sales rep complaint: manual CRM updates.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Outreach that writes and sends itself.',
    description: 'Agents research prospects, draft personalized outreach emails, manage drip sequences, and report on what\'s working — all aligned to your brand voice and goals.',
    stat: 'AI-powered outreach delivers 3× higher response rates than generic sequences.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Weekly reports. Zero effort.',
    description: 'Get automated weekly summaries of your pipeline, support tickets, marketing performance, and key metrics — without building a single dashboard or waiting on your team.',
    stat: 'Organizations using agentic workflows report 171% average ROI within the first year.',
  },
];

const stats = [
  '171% avg. ROI',
  '66% report productivity gains',
  '93% of IT leaders deploying agents by 2026',
];

export default function AIAgentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="ai-agents"
      className="py-[60px] md:py-[100px] bg-white"
    >
      <div className="max-w-[980px] mx-auto px-5">
        {/* SUB-BLOCK 1 — HEADLINE HOOK */}
        <div className={`text-center mb-16 md:mb-24 transition-all duration-[600ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <span className="inline-block text-[13px] font-medium tracking-[0.1em] text-[#0071e3] uppercase mb-4">
            AI Agents for Business
          </span>
          <h2 className="text-[36px] sm:text-[48px] md:text-[60px] font-semibold text-[#1d1d1f] tracking-[-0.03em] leading-[1.1] mb-6">
            Your business, running on autopilot.
          </h2>
          <p className="text-[17px] sm:text-[19px] text-[#6e6e73] max-w-[620px] mx-auto leading-[1.6] mb-8">
            Autonomous AI agents handle your leads, customer service, scheduling, and operations — 24/7 — so you can focus on what actually grows your business.
          </p>
          <button
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0071e3] text-white text-[17px] font-medium rounded-full hover:bg-[#0077ed] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Let&apos;s Build Your Agent Stack
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* SUB-BLOCK 2 — VALUE PROPS GRID */}
        <div className={`mb-16 md:mb-24 transition-all duration-[600ms] ease-out delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <h3 className="text-[28px] sm:text-[32px] font-semibold text-[#1d1d1f] tracking-[-0.02em] text-center mb-10 md:mb-14">
            What your AI agents can do
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-[18px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/30 transition-all duration-[400ms] ease-out hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                }`}
                style={{
                  transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
                }}
              >
                <div className="text-[#0071e3] mb-4">
                  {card.icon}
                </div>
                <h4 className="text-[19px] font-semibold text-[#1d1d1f] tracking-[-0.02em] mb-3">
                  {card.title}
                </h4>
                <p className="text-[15px] text-[#6e6e73] leading-[1.6] mb-4">
                  {card.description}
                </p>
                <p className="text-[13px] text-[#34c759] leading-[1.5] pt-3 border-t border-[#d2d2d7]/50">
                  {card.stat}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SUB-BLOCK 3 — CLOSING SOCIAL PROOF STRIP */}
        <div className={`bg-[#f5f5f7] rounded-[18px] p-6 md:p-8 border-t border-b border-[#d2d2d7]/50 transition-all duration-[600ms] ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-[17px] sm:text-[19px] font-semibold text-[#1d1d1f] tracking-[-0.02em] leading-[1.4] lg:max-w-[480px]">
              Companies that adopt AI agents now are building a permanent competitive advantage over those that don&apos;t.
            </p>
            
            <div className="flex flex-wrap gap-2">
              {stats.map((stat, index) => (
                <span
                  key={index}
                  className="inline-block px-4 py-2 bg-white rounded-full text-[13px] font-medium text-[#1d1d1f] shadow-sm"
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>
          
          <p className="text-[12px] text-[#6e6e73] text-center mt-6 pt-4 border-t border-[#d2d2d7]/50">
            Sources: Google Cloud ROI Report 2025 · Landbase Agentic AI Statistics · MuleSoft/Deloitte Benchmark 2025
          </p>
        </div>
      </div>
    </section>
  );
}
