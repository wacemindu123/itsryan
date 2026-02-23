'use client';

import { useState, useEffect } from 'react';

export default function SocialBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner
    const dismissed = localStorage.getItem('social_banner_dismissed');
    if (dismissed) return;

    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('social_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-12 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 shadow-lg animate-[slideDown_0.3s_ease-out] cursor-pointer"
      onClick={scrollToProjects}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm md:text-base font-medium flex-1 text-center">
          Here from my socials to try an app? 
          <span className="underline ml-1 font-semibold">
            Click here to see my projects
          </span>
        </p>
        <button 
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          className="text-white/80 hover:text-white text-xl leading-none cursor-pointer"
          aria-label="Dismiss banner"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
