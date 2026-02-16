'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Business {
  id: number;
  name: string;
  thumbnail: string | null;
  website_url: string | null;
  video_links: string[];
  featured: boolean;
  display_order: number;
}

export default function BusinessShowcase() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
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

  const featuredBusinesses = businesses.filter(b => b.featured);
  const displayBusinesses = featuredBusinesses.length >= 8 
    ? featuredBusinesses.slice(0, 8)
    : businesses.slice(0, 8);

  return (
    <section 
      ref={sectionRef}
      className={`py-16 md:py-24 bg-[var(--background)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
          Businesses I&apos;m Helping
        </h2>
        <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] text-center mb-12 md:mb-16 font-normal tracking-[-0.2px]">
          Real results for real small businesses
        </p>

        {displayBusinesses.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-12 md:p-16 text-center border border-black/5">
            <div className="text-5xl mb-4 text-gray-300">B</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Businesses coming soon</h3>
            <p className="text-[var(--text-secondary)]">Check back soon to see the businesses I&apos;m helping grow.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-10">
              {displayBusinesses.map((business, index) => (
                <div
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className="bg-[var(--surface)] rounded-xl p-4 md:p-6 border border-black/5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square rounded-lg bg-gray-100 mb-4 overflow-hidden flex items-center justify-center">
                    {business.thumbnail ? (
                      <Image
                        src={business.thumbnail}
                        alt={business.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl text-gray-300 font-bold">B</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-center truncate">
                    {business.name}
                  </h3>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link 
                href="/SmallBusinesses"
                className="inline-block px-8 py-4 bg-[var(--accent)] text-white rounded-full font-medium hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all"
              >
                View All Businesses →
              </Link>
            </div>
          </>
        )}
      </div>

      {selectedBusiness && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBusiness(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-xl bg-gray-100 mb-4 overflow-hidden flex items-center justify-center">
                {selectedBusiness.thumbnail ? (
                  <Image
                    src={selectedBusiness.thumbnail}
                    alt={selectedBusiness.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl text-gray-300 font-bold">B</div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedBusiness.name}</h2>
            </div>

            <div className="space-y-3">
              {selectedBusiness.website_url && (
                <a
                  href={selectedBusiness.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Visit Website
                </a>
              )}
              
              {selectedBusiness.video_links && selectedBusiness.video_links.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 text-center">Watch Related Videos</p>
                  {selectedBusiness.video_links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Video {i + 1}
                    </a>
                  ))}
                </div>
              )}

              <button
                onClick={() => setSelectedBusiness(null)}
                className="w-full px-4 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
