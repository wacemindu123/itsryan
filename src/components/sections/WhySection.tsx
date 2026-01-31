'use client';

import { useEffect, useRef, useState } from 'react';

export default function WhySection() {
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
      id="why" 
      className={`py-[120px] bg-[var(--surface)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-[980px] mx-auto px-5">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="text-lg sm:text-xl md:text-2xl leading-[1.5] text-[var(--text-primary)] mb-6 md:mb-8 tracking-[-0.3px] font-normal">
            I&apos;ve built tech that made companies hundreds of millions. <strong className="font-semibold">The same tools could transform your business—but they usually cost $50k+.</strong>
          </p>
          <p className="text-lg sm:text-xl md:text-2xl leading-[1.5] text-[var(--text-primary)] mb-6 md:mb-8 tracking-[-0.3px] font-normal">
            For Atlanta small businesses, they cost $0. Because I want to help.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-10 mt-12 md:mt-20 max-w-[900px] mx-auto">
          <div className="text-center p-4 md:p-6 rounded-[18px] bg-[var(--background)] hover:-translate-y-1 transition-transform">
            <div className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold text-[var(--text-primary)] mb-2 tracking-[-0.5px]">$100M+</div>
            <div className="text-[11px] sm:text-[13px] text-[var(--text-secondary)] font-normal leading-[1.4]">Revenue from my products</div>
          </div>
          <div className="text-center p-4 md:p-6 rounded-[18px] bg-[var(--background)] hover:-translate-y-1 transition-transform">
            <div className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold text-[var(--text-primary)] mb-2 tracking-[-0.5px]">$20M</div>
            <div className="text-[11px] sm:text-[13px] text-[var(--text-secondary)] font-normal leading-[1.4]">Scaled in 3 months</div>
          </div>
          <div className="text-center p-4 md:p-6 rounded-[18px] bg-[var(--background)] hover:-translate-y-1 transition-transform">
            <div className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold text-[var(--text-primary)] mb-2 tracking-[-0.5px]">52%</div>
            <div className="text-[11px] sm:text-[13px] text-[var(--text-secondary)] font-normal leading-[1.4]">Faster delivery</div>
          </div>
          <div className="text-center p-4 md:p-6 rounded-[18px] bg-[var(--background)] hover:-translate-y-1 transition-transform">
            <div className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold text-[var(--text-primary)] mb-2 tracking-[-0.5px]">34%</div>
            <div className="text-[11px] sm:text-[13px] text-[var(--text-secondary)] font-normal leading-[1.4]">Less manual work</div>
          </div>
        </div>
      </div>
    </section>
  );
}
