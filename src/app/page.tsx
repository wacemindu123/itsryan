'use client';

import Header from '@/components/Header';
import JsonLd from '@/components/JsonLd';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import SocialBanner from '@/components/SocialBanner';
import NewsletterCTA from '@/components/NewsletterCTA';
import dynamic from 'next/dynamic';

const AIAgentsSection = dynamic(() => import('@/components/sections/AIAgentsSection'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const ValueProgressMeters = dynamic(() => import('@/components/sections/ValueProgressMeters'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
});
const ProjectShowcase = dynamic(() => import('@/components/sections/ProjectShowcase'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const BusinessShowcase = dynamic(() => import('@/components/sections/BusinessShowcase'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const CapabilitiesSection = dynamic(() => import('@/components/sections/CapabilitiesSection'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const HowItWorksSection = dynamic(() => import('@/components/sections/HowItWorksSection'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const PromptLibrary = dynamic(() => import('@/components/sections/PromptLibrary'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const ContactForm = dynamic(() => import('@/components/sections/ContactForm'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});
const ClassSignupForm = dynamic(() => import('@/components/sections/ClassSignupForm'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

export default function Home() {
  return (
    <>
      <JsonLd />
      <SocialBanner />
      <Header />
      <NewsletterCTA />
      <main>
        <HeroSection />
        <AIAgentsSection />
        <ValueProgressMeters />
        <ProjectShowcase />
        <BusinessShowcase />
        <CapabilitiesSection />
        <HowItWorksSection />
        <PromptLibrary />
        <ContactForm />
        <ClassSignupForm />
      </main>
      <Footer />
    </>
  );
}
