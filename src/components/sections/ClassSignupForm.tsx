'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import Modal from '../ui/Modal';

export default function ClassSignupForm() {
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
      const response = await fetch('/api/class-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        alert('There was an error signing up. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error signing up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section 
        ref={sectionRef}
        id="ai-classes" 
        className={`py-[100px] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="max-w-[980px] mx-auto px-[22px]">
          <h2 className="text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1] max-md:text-[32px]">
            Free AI Classes
          </h2>
          <p className="text-[21px] text-[var(--text-secondary)] text-center mb-20 font-normal tracking-[-0.2px] max-md:text-[19px]">
            Learn ChatGPT and AI tools for your business
          </p>
          
          <div className="max-w-[600px] mx-auto bg-[var(--surface)] p-14 rounded-[18px] border border-black/5 max-md:p-8 max-md:px-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Name
                </label>
                <input 
                  type="text" 
                  name="class-name" 
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
                  name="class-email" 
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
                  name="class-phone" 
                  required
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Business (optional)
                </label>
                <input 
                  type="text" 
                  name="class-business"
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  Format
                </label>
                <select 
                  name="format" 
                  required
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                >
                  <option value="">Choose one...</option>
                  <option value="in-person">In-person (Atlanta)</option>
                  <option value="virtual">Online</option>
                  <option value="either">Either works</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-[var(--text-primary)] text-[17px] tracking-[-0.2px]">
                  AI Experience
                </label>
                <select 
                  name="experience" 
                  required
                  className="w-full py-[14px] px-4 bg-[var(--background)] border border-black/10 rounded-xl text-[var(--text-primary)] text-[17px] transition-all focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                >
                  <option value="">Choose one...</option>
                  <option value="none">Never tried it</option>
                  <option value="beginner">Used ChatGPT a few times</option>
                  <option value="intermediate">Use AI regularly</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 px-[22px] py-3 text-[17px] font-normal rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02] transition-all cursor-pointer border-none disabled:opacity-50"
              >
                {isSubmitting ? 'Signing up...' : 'Sign up'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <div className="text-center text-[64px] mb-6">✓</div>
        <h2 className="text-[var(--text-primary)] mb-4 text-[32px] font-semibold tracking-[-0.5px]">You&apos;re in</h2>
        <p className="text-[var(--text-secondary)] leading-[1.6] mb-3 text-[17px]">I&apos;ll email you details in 24 hours.</p>
      </Modal>
    </>
  );
}
