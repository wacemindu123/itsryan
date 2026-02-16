'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Business {
  id: number;
  name: string;
  value_delivered: number;
  revenue_generated: number;
  color: string;
}

const GOAL = 1000000;
const SEGMENTS = 20;

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function SegmentedMeter({ 
  title, 
  total,
  animationDelay = 0
}: { 
  title: string; 
  total: number;
  animationDelay?: number;
}) {
  const percentage = Math.min((total / GOAL) * 100, 100);
  const [displayValue, setDisplayValue] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(0);

  const filledSegments = Math.round((displayValue / 100) * SEGMENTS);

  useEffect(() => {
    if (!isInitialized) {
      const initTimeout = setTimeout(() => setIsInitialized(true), animationDelay + 50);
      return () => clearTimeout(initTimeout);
    }

    const duration = 800;
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startValueRef.current + (percentage - startValueRef.current) * eased;
      setDisplayValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, isInitialized, animationDelay]);

  const getSegmentStyle = (index: number) => {
    let scale = 1;
    let translateY = 0;

    if (hoveredSegment !== null) {
      const distance = Math.abs(hoveredSegment - index);
      if (distance === 0) {
        scale = 1.3;
        translateY = -1;
      } else if (distance <= 3) {
        const falloff = Math.cos((distance / 3) * (Math.PI / 2));
        scale = 1 + 0.2 * falloff;
        translateY = -0.5 * falloff;
      }
    }

    const delay = isInitialized ? index * 20 : 0;

    return {
      transform: `scaleY(${scale}) translateY(${translateY}px)`,
      transitionDelay: `${delay}ms`,
    };
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">
            {formatCurrency(total)} / {formatCurrency(GOAL)}
          </span>
          <span
            className="text-sm font-semibold text-[var(--text-primary)] tabular-nums tracking-tight transition-all duration-300"
            style={{
              filter: hoveredSegment !== null ? "brightness(1.2)" : "brightness(1)",
            }}
          >
            {Math.round(displayValue)}%
          </span>
        </div>
      </div>

      <div
        className="flex gap-[3px] py-1"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: SEGMENTS }).map((_, index) => {
          const isFilled = index < filledSegments;
          const isHovered = hoveredSegment === index;

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={cn(
                "h-3 flex-1 rounded-[4px] cursor-pointer origin-center",
                "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                isFilled ? "bg-primary" : "bg-muted/60",
                isHovered && isFilled && "brightness-110 shadow-[0_0_16px_hsl(var(--primary)/0.5)]",
                isHovered && !isFilled && "bg-muted",
                hoveredSegment !== null && !isFilled && !isHovered && "bg-muted/40",
              )}
              style={getSegmentStyle(index)}
            />
          );
        })}
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-[var(--text-secondary)]">
        <span>$0</span>
        <span>{formatCurrency(GOAL)}</span>
      </div>
    </div>
  );
}

export default function ValueProgressMeters() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch('/api/businesses');
        if (res.ok) {
          const data = await res.json();
          setBusinesses(data);
        }
      } catch (e) {
        console.error('Error loading businesses:', e);
      }
    }
    loadBusinesses();
  }, []);

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

  const valueDeliveredTotal = businesses.reduce((sum, b) => sum + (b.value_delivered || 0), 0);
  const revenueGeneratedTotal = businesses.reduce((sum, b) => sum + (b.revenue_generated || 0), 0);

  return (
    <section 
      ref={sectionRef}
      className={`py-16 md:py-24 bg-[var(--surface)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-[980px] mx-auto px-5">
        <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
          Impact Tracker
        </h2>
        <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] text-center mb-12 md:mb-16 font-normal tracking-[-0.2px]">
          Tracking my journey to deliver $1M in value to small businesses
        </p>

        <div className="bg-[var(--background)] p-6 md:p-10 rounded-2xl border border-black/5">
          <SegmentedMeter 
            title="Value Delivered" 
            total={valueDeliveredTotal}
            animationDelay={isVisible ? 200 : 0}
          />
          
          <SegmentedMeter 
            title="Revenue Generated" 
            total={revenueGeneratedTotal}
            animationDelay={isVisible ? 600 : 0}
          />
          
          {businesses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-[var(--text-secondary)] text-center">
                Tracking progress across {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
