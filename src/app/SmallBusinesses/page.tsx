'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Business {
  id: number;
  name: string;
  thumbnail: string | null;
  website_url: string | null;
  description: string | null;
  value_delivered: number;
  revenue_generated: number;
  video_links: string[];
  github_links: string[];
  additional_links: string[];
  display_order: number;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function SmallBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)] pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-5">
          <Link href="/" className="inline-block mb-8 text-blue-600 font-medium hover:underline">
            ← Back to Home
          </Link>

          <h1 className="text-[32px] sm:text-4xl md:text-5xl font-semibold mb-4 text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
            Small Businesses I&apos;m Helping
          </h1>
          <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] mb-12 font-normal tracking-[-0.2px]">
            Explore the businesses I&apos;ve partnered with and the value we&apos;ve created together.
          </p>

          {loading ? (
            <div className="text-center py-20">
              <div className="text-2xl text-gray-400">Loading...</div>
            </div>
          ) : businesses.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-2xl p-12 md:p-16 text-center border border-black/5">
              <div className="text-5xl mb-4 text-gray-300">B</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Businesses coming soon</h3>
              <p className="text-[var(--text-secondary)]">Check back soon to see the businesses I&apos;m helping grow.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {businesses.map((business) => (
                <div 
                  key={business.id}
                  className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-black/5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-32 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {business.thumbnail ? (
                        <Image
                          src={business.thumbnail}
                          alt={business.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-gray-300 font-bold">B</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mb-1">
                            {business.name}
                          </h2>
                          {business.description && (
                            <p className="text-[var(--text-secondary)]">{business.description}</p>
                          )}
                        </div>
                        
                        {business.website_url && (
                          <a
                            href={business.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                          >
                            Visit Website →
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Value Delivered</p>
                          <p className="text-lg font-semibold text-green-700">
                            {formatCurrency(business.value_delivered)}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Revenue Generated</p>
                          <p className="text-lg font-semibold text-blue-700">
                            {formatCurrency(business.revenue_generated)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {business.video_links && business.video_links.length > 0 && (
                          business.video_links.map((link, i) => (
                            <a
                              key={`video-${i}`}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              Video {i + 1}
                            </a>
                          ))
                        )}
                        
                        {business.github_links && business.github_links.length > 0 && (
                          business.github_links.map((link, i) => (
                            <a
                              key={`github-${i}`}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              GitHub {i + 1}
                            </a>
                          ))
                        )}
                        
                        {business.additional_links && business.additional_links.length > 0 && (
                          business.additional_links.map((link, i) => (
                            <a
                              key={`link-${i}`}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                            >
                              Resource {i + 1}
                            </a>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
