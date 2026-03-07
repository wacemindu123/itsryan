import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import AIAgentsSection from '@/components/sections/AIAgentsSection';
import ValueProgressMeters from '@/components/sections/ValueProgressMeters';
import ProjectShowcase from '@/components/sections/ProjectShowcase';
import BusinessShowcase from '@/components/sections/BusinessShowcase';
import CapabilitiesSection from '@/components/sections/CapabilitiesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import PromptLibrary from '@/components/sections/PromptLibrary';
import ContactForm from '@/components/sections/ContactForm';
import ClassSignupForm from '@/components/sections/ClassSignupForm';
import SocialBanner from '@/components/SocialBanner';
import NewsletterCTA from '@/components/NewsletterCTA';

export default function Home() {
  return (
    <>
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
