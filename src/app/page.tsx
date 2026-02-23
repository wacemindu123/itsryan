import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ValueProgressMeters from '@/components/sections/ValueProgressMeters';
import ProjectShowcase from '@/components/sections/ProjectShowcase';
import BusinessShowcase from '@/components/sections/BusinessShowcase';
import WhySection from '@/components/sections/WhySection';
import CapabilitiesSection from '@/components/sections/CapabilitiesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import PromptLibrary from '@/components/sections/PromptLibrary';
import ContactForm from '@/components/sections/ContactForm';
import ClassSignupForm from '@/components/sections/ClassSignupForm';
import SocialBanner from '@/components/SocialBanner';

export default function Home() {
  return (
    <>
      <SocialBanner />
      <Header />
      <main>
        <HeroSection />
        <ValueProgressMeters />
        <ProjectShowcase />
        <BusinessShowcase />
        <WhySection />
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
