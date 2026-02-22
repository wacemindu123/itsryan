'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import Modal from '../ui/Modal';

export default function ContactForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        alert('There was an error submitting your form. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section 
        ref={sectionRef}
        id="apply" 
        className={`py-[100px] bg-[var(--background)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-[980px] mx-auto px-5">
          <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
            Tell me about your business
          </h2>
          <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] text-center mb-10 md:mb-20 font-normal tracking-[-0.2px]">
            I&apos;ll help you scale with the right tech solutions.
          </p>
          
          <div className="max-w-[600px] mx-auto bg-[var(--surface)] p-6 sm:p-8 md:p-14 rounded-[18px] border border-black/5">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Name
                </label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  required
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Phone
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  required
                  placeholder="(555) 123-4567"
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Business
                </label>
                <input 
                  type="text" 
                  name="business" 
                  required
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Website
                </label>
                <input 
                  type="url" 
                  name="website" 
                  placeholder="https://yourbusiness.com"
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  What you believe is impeding your ability to scale your business?
                </label>
                <textarea 
                  name="scaling-challenge" 
                  required
                  placeholder="Tell me about the challenges you're facing..."
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)] min-h-[150px] resize-y"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 px-[22px] py-3 text-[17px] font-normal rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all cursor-pointer border-none disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send it'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <div className="text-center text-[64px] mb-6">✓</div>
        <h2 className="text-[var(--text-primary)] mb-4 text-[32px] font-semibold tracking-[-0.5px]">Got it</h2>
        <p className="text-[var(--text-secondary)] leading-[1.6] mb-3 text-[17px]">I&apos;ll get back to you in 2-3 days.</p>
      </Modal>
    </>
  );
}
