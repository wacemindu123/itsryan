'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useInView } from '@/hooks/useInView';
import Image from 'next/image';
import { analytics } from '@/lib/analytics';
import type { Project } from '@/types';

export default function ProjectShowcase() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useInView(sectionRef, { threshold: 0.1 });
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Error loading projects:', e);
      }
    }
    loadProjects();
  }, []);

  // Check URL for project parameter and auto-open modal
  useEffect(() => {
    if (projects.length === 0 || hasCheckedUrl) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');
    
    if (projectParam) {
      // Try to find by ID first, then by name (slug)
      let project = projects.find(p => p.id.toString() === projectParam);
      if (!project) {
        // Try matching by name (case-insensitive, with slug support)
        const slug = projectParam.toLowerCase().replace(/-/g, ' ');
        project = projects.find(p => p.name.toLowerCase() === slug || p.name.toLowerCase().replace(/\s+/g, '-') === projectParam.toLowerCase());
      }
      
      if (project) {
        setSelectedProject(project);
        // Scroll to projects section
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    
    setHasCheckedUrl(true);
  }, [projects, hasCheckedUrl]);

  const handleWaitlistSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/project-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: selectedProject.id, 
          email, 
          phone: phone || null 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        analytics.formSubmit('project_waitlist_' + selectedProject.name);
        setEmail('');
        setPhone('');
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
    setSubmitted(false);
    setError('');
    setEmail('');
    setPhone('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Live</span>;
      case 'coming_soon':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Coming Soon</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">In Progress</span>;
    }
  };

  const featuredProjects = projects.filter(p => p.featured);
  const displayProjects = featuredProjects.length >= 6 
    ? featuredProjects.slice(0, 6)
    : projects.slice(0, 6);

  return (
    <section 
      ref={sectionRef}
      id="projects"
      className={`py-16 md:py-24 bg-[var(--surface)] transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-[28px] sm:text-4xl md:text-5xl font-semibold mb-4 text-center text-[var(--text-primary)] tracking-[-1px] leading-[1.1]">
          Projects I&apos;m Building
        </h2>
        <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[var(--text-secondary)] text-center mb-12 md:mb-16 font-normal tracking-[-0.2px]">
          Apps and tools built for people who reached out
        </p>

        {displayProjects.length === 0 ? (
          <div className="bg-[var(--background)] rounded-2xl p-12 md:p-16 text-center border border-black/5">
            <div className="text-5xl mb-4 text-gray-300">P</div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Projects coming soon</h3>
            <p className="text-[var(--text-secondary)]">Check back soon to see the apps and tools I&apos;m building.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => { analytics.ctaClick('project_card_' + project.name, 'project_showcase'); setSelectedProject(project); }}
                className="bg-[var(--background)] rounded-xl overflow-hidden border border-black/5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.name}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl text-gray-300 font-bold">P</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate flex-1">
                      {project.name}
                    </h3>
                    {getStatusBadge(project.status)}
                  </div>
                  {project.description && (
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              {selectedProject.thumbnail && (
                <div className="aspect-video rounded-xl bg-gray-100 mb-4 overflow-hidden">
                  <Image
                    src={selectedProject.thumbnail}
                    alt={selectedProject.name}
                    width={500}
                    height={280}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h2>
                {getStatusBadge(selectedProject.status)}
              </div>
              {selectedProject.description && (
                <p className="text-gray-600">{selectedProject.description}</p>
              )}
            </div>

            {selectedProject.status === 'live' && selectedProject.demo_url ? (
              <div className="space-y-3">
                <a
                  href={selectedProject.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analytics.externalLinkClick(selectedProject.demo_url!, 'try_project_' + selectedProject.name)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Try It Now
                </a>
                {selectedProject.video_url && (
                  <a
                    href={selectedProject.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => analytics.externalLinkClick(selectedProject.video_url!, 'demo_video_' + selectedProject.name)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Watch Demo Video
                  </a>
                )}
              </div>
            ) : (
              <div>
                {submitted ? (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-3 text-green-500">✓</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">You&apos;re on the list!</h3>
                    <p className="text-gray-600 text-sm">We&apos;ll notify you when {selectedProject.name} is ready.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-blue-800 text-sm font-medium">
                        {selectedProject.status === 'coming_soon' 
                          ? 'This project is coming soon! Join the waitlist to be notified when it launches.'
                          : 'This project is still in development. Join the waitlist to try it first!'}
                      </p>
                    </div>
                    <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                      />
                      {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            <button
              onClick={closeModal}
              className="w-full px-4 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
