'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Zap, Target, Rocket, BarChart3, Link2, Sparkles, LucideIcon } from 'lucide-react';

const capabilities: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: MessageSquare, title: 'AI Chatbots', description: 'Answer questions 24/7. Reduced customer service time 34% at a major company.' },
  { icon: Zap, title: 'Automation', description: 'Stop wasting time. Save 5+ hours per week on repetitive tasks.' },
  { icon: Target, title: 'Smart Recommendations', description: 'Show the right products. Increased sales 5%, ad revenue 10x.' },
  { icon: Rocket, title: 'Online Ordering', description: '24/7 ordering from phones. Improved conversion by 17%.' },
  { icon: BarChart3, title: 'Dashboards', description: 'All your numbers in one place. Make faster decisions.' },
  { icon: Link2, title: 'Integrations', description: 'Connect your tools. Cut manual work by 34%.' },
  { icon: Sparkles, title: 'Anything Else', description: "Got something specific? I'll build it custom for your business." },
];

export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="capabilities" 
      className={`py-[100px] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
          What I can build
        </h2>
        <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] text-center mb-10 md:mb-20 font-normal tracking-[-0.2px]">
          Real tools with real results
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-[60px]">
          {capabilities.map((cap, index) => (
            <div 
              key={index}
              className="bg-[var(--surface)] p-6 sm:p-8 md:p-12 md:px-8 rounded-[18px] border border-black/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-black/10 transition-all duration-400"
            >
              <cap.icon className="w-10 h-10 md:w-13 md:h-13 mb-4 md:mb-6 text-[var(--accent)]" strokeWidth={1.5} />
              <h3 className="text-xl md:text-2xl mb-2 md:mb-3 text-[var(--text-primary)] font-semibold tracking-[-0.3px]">{cap.title}</h3>
              <p className="text-[var(--text-secondary)] text-[15px] md:text-[17px] leading-[1.5] font-normal">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
