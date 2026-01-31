'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';

export default function HowItWorksSection() {
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
      id="how" 
      className={`py-[100px] bg-[var(--surface)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-[980px] mx-auto px-5">
        <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
          How it works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mt-10 md:mt-[60px]">
          <div className="bg-[var(--background)] p-8 sm:p-10 md:p-14 md:px-12 rounded-[18px] hover:scale-[1.02] transition-all">
            <span className="inline-block bg-[var(--accent)] text-white px-3 py-1 rounded-xl text-sm font-medium mb-4 md:mb-6">
              Option 1
            </span>
            <h3 className="text-[24px] sm:text-[28px] md:text-[32px] mb-3 md:mb-4 text-[var(--text-primary)] font-semibold tracking-[-0.5px]">I Build It</h3>
            <p className="text-[var(--text-secondary)] mb-6 md:mb-8 text-[16px] md:text-[19px] leading-[1.5]">
              Tell me your problem. I build the solution. You own it forever.
            </p>
            <ul className="list-none mb-6 md:mb-8">
              {['Tools worth $50k+', 'Custom for your business', 'You own everything', 'Actually free'].map((item, i) => (
                <li key={i} className="py-2 md:py-3 text-[var(--text-primary)] text-[15px] md:text-[17px] relative pl-7">
                  <span className="absolute left-0 text-[var(--accent)] font-semibold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button href="#apply">Get started</Button>
          </div>
          
          <div className="bg-[var(--background)] p-8 sm:p-10 md:p-14 md:px-12 rounded-[18px] hover:scale-[1.02] transition-all">
            <span className="inline-block bg-[var(--accent)] text-white px-3 py-1 rounded-xl text-sm font-medium mb-4 md:mb-6">
              Option 2
            </span>
            <h3 className="text-[24px] sm:text-[28px] md:text-[32px] mb-3 md:mb-4 text-[var(--text-primary)] font-semibold tracking-[-0.5px]">Learn AI</h3>
            <p className="text-[var(--text-secondary)] mb-6 md:mb-8 text-[16px] md:text-[19px] leading-[1.5]">
              Free classes on using ChatGPT and AI for your business.
            </p>
            <ul className="list-none mb-6 md:mb-8">
              {['ChatGPT for real work', 'Automate with AI', '10x faster content', 'In-person or online'].map((item, i) => (
                <li key={i} className="py-2 md:py-3 text-[var(--text-primary)] text-[15px] md:text-[17px] relative pl-7">
                  <span className="absolute left-0 text-[var(--accent)] font-semibold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button href="#ai-classes">Join classes</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
