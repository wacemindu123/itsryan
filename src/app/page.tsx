import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import WhySection from '@/components/sections/WhySection';
import CapabilitiesSection from '@/components/sections/CapabilitiesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import PromptLibrary from '@/components/sections/PromptLibrary';
import ContactForm from '@/components/sections/ContactForm';
import ClassSignupForm from '@/components/sections/ClassSignupForm';
import CalendlyWidget from '@/components/CalendlyWidget';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WhySection />
        <CapabilitiesSection />
        <HowItWorksSection />
        <PromptLibrary />
        <ContactForm />
        <ClassSignupForm />
      </main>
      <Footer />
      <CalendlyWidget />
    </>
  );
}
