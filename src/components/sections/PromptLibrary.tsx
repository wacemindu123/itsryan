'use client';

import { useEffect, useRef, useState } from 'react';

interface Prompt {
  id: number;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  content: string;
}

export default function PromptLibrary() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);

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

  useEffect(() => {
    async function loadPrompts() {
      try {
        const response = await fetch('/api/prompts');
        if (response.ok) {
          const data = await response.json();
          setPrompts(data);
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
      }
    }
    loadPrompts();
  }, []);

  const copyPrompt = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopySuccess(prompt.id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyFromModal = async () => {
    if (selectedPrompt) {
      await copyPrompt(selectedPrompt);
    }
  };

  return (
    <>
      <section 
        ref={sectionRef}
        id="prompt-library" 
        className={`py-[100px] bg-[var(--surface)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-[1200px] mx-auto px-5">
          <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
            Prompt Library
          </h2>
          <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] text-center mb-10 md:mb-20 font-normal tracking-[-0.2px]">
            Ready-to-use prompts to evaluate and improve your business
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4 md:gap-6 mt-8 md:mt-[60px]">
            {prompts.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-secondary)] col-span-full">
                No prompts available yet. Check back soon!
              </div>
            ) : (
              prompts.map((prompt) => (
                <div 
                  key={prompt.id}
                  className="bg-[var(--background)] p-6 md:p-8 rounded-[18px] border border-black/5 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-[var(--accent)] transition-all cursor-pointer"
                >
                  <span className="text-[32px] md:text-[40px] mb-3 md:mb-4 block">{prompt.icon || 'P'}</span>
                  <h3 className="text-lg md:text-xl mb-2 md:mb-3 text-[var(--text-primary)] font-semibold tracking-[-0.3px]">{prompt.title}</h3>
                  <p className="text-[var(--text-secondary)] text-[14px] md:text-[15px] leading-[1.5] mb-4 md:mb-5">{prompt.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {(prompt.tags || []).map((tag, i) => (
                      <span key={i} className="bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => copyPrompt(prompt)}
                      className={`flex-1 py-[10px] px-4 text-sm font-medium rounded-[10px] border-none cursor-pointer transition-all ${
                        copySuccess === prompt.id 
                          ? 'bg-green-500 text-white' 
                          : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                      }`}
                    >
                      {copySuccess === prompt.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button 
                      onClick={() => setSelectedPrompt(prompt)}
                      className="flex-1 py-[10px] px-4 text-sm font-medium rounded-[10px] bg-transparent text-[var(--accent)] border border-[var(--accent)] cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-all"
                    >
                      View Full
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Prompt Modal */}
      {selectedPrompt && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-[10px] animate-[fadeIn_0.3s] overflow-y-auto"
          onClick={() => setSelectedPrompt(null)}
        >
          <div 
            className="relative bg-[var(--surface)] mx-auto my-10 p-12 rounded-[18px] w-[90%] max-w-[900px] max-h-[calc(100vh-80px)] overflow-y-auto animate-[slideUp_0.4s_cubic-bezier(0.4,0,0.2,1)] shadow-[0_40px_80px_rgba(0,0,0,0.3)] max-md:p-6 max-md:my-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-black/10">
              <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-[-0.5px] max-md:text-[22px]">
                {selectedPrompt.title}
              </h2>
              <button 
                onClick={() => setSelectedPrompt(null)}
                className="bg-none border-none text-[28px] text-[var(--text-secondary)] cursor-pointer p-0 leading-none hover:text-[var(--text-primary)]"
              >
                &times;
              </button>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-6 font-mono text-sm leading-[1.6] text-[var(--text-primary)] whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto max-md:text-[13px] max-md:p-4">
              {selectedPrompt.content}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-black/10">
              <button 
                onClick={() => setSelectedPrompt(null)}
                className="px-[22px] py-3 text-[17px] font-normal rounded-full bg-transparent text-[var(--accent)] border border-[var(--accent)] cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-all"
              >
                Close
              </button>
              <button 
                onClick={copyFromModal}
                className={`px-[22px] py-3 text-[17px] font-normal rounded-full border-none cursor-pointer transition-all ${
                  copySuccess === selectedPrompt.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                }`}
              >
                {copySuccess === selectedPrompt.id ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
