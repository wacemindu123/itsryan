'use client';

import { useEffect, useRef, useState } from 'react';

const capabilities = [
  { icon: '💬', title: 'AI Chatbots', description: 'Answer questions 24/7. Reduced customer service time 34% at a major company.' },
  { icon: '⚡', title: 'Automation', description: 'Stop wasting time. Save 5+ hours per week on repetitive tasks.' },
  { icon: '🎯', title: 'Smart Recommendations', description: 'Show the right products. Increased sales 5%, ad revenue 10x.' },
  { icon: '🚀', title: 'Online Ordering', description: '24/7 ordering from phones. Improved conversion by 17%.' },
  { icon: '📊', title: 'Dashboards', description: 'All your numbers in one place. Make faster decisions.' },
  { icon: '🔗', title: 'Integrations', description: 'Connect your tools. Cut manual work by 34%.' },
  { icon: '✨', title: 'Anything Else', description: "Got something specific? I'll build it custom for your business." },
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
      <div className="max-w-[1200px] mx-auto px-[22px]">
        <h2 className="text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1] max-md:text-[32px]">
          What I can build
        </h2>
        <p className="text-[21px] text-[var(--text-secondary)] text-center mb-20 font-normal tracking-[-0.2px] max-md:text-[19px]">
          Real tools with real results
        </p>
        
        <div className="grid grid-cols-3 gap-6 mt-[60px] max-md:grid-cols-1">
          {capabilities.map((cap, index) => (
            <div 
              key={index}
              className="bg-[var(--surface)] p-12 px-8 rounded-[18px] border border-black/5 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-black/10 transition-all duration-400"
            >
              <span className="text-[52px] mb-6 block">{cap.icon}</span>
              <h3 className="text-2xl mb-3 text-[var(--text-primary)] font-semibold tracking-[-0.3px]">{cap.title}</h3>
              <p className="text-[var(--text-secondary)] text-[17px] leading-[1.5] font-normal">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
