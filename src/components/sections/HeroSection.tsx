import Button from '../ui/Button';

export default function HeroSection() {
  return (
    <section className="py-12 md:py-20 pb-16 md:pb-[100px] text-center animate-fade-in-up">
      <div className="max-w-[980px] mx-auto px-5">
        <h1 className="text-[32px] sm:text-[40px] md:text-[56px] lg:text-[64px] font-semibold leading-[1.12] tracking-[-1px] md:tracking-[-1.5px] mb-4 text-[var(--text-primary)]">
          I help small businesses scale using AI and technology.<br className="hidden sm:block" /><span className="sm:hidden"> </span>For free.
        </h1>
        <p className="text-[18px] sm:text-[21px] md:text-[28px] font-normal leading-[1.4] tracking-[-0.3px] text-[var(--text-secondary)] mb-8 max-w-[800px] mx-auto">
          AI tools, automations, websites—the same stuff big companies pay $50k+ for.
        </p>
        
        <div className="grid grid-cols-2 md:flex md:justify-center gap-6 md:gap-12 lg:gap-20 my-10 md:my-[60px] mb-10 animate-fade-in-up-delay-1">
          <div className="text-center">
            <div className="text-[32px] sm:text-[40px] md:text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">$600M</div>
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">enterprise value added</div>
          </div>
          <div className="text-center">
            <div className="text-[32px] sm:text-[40px] md:text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">$100M+</div>
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">revenue built</div>
          </div>
          <div className="text-center">
            <div className="text-[32px] sm:text-[40px] md:text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">52%</div>
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">faster delivery</div>
          </div>
          <div className="text-center">
            <div className="text-[32px] sm:text-[40px] md:text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">17%</div>
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">higher conversion</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up-delay-2 px-4 sm:px-0">
          <Button href="#apply">Tell me what you need</Button>
          <Button href="#ai-classes" variant="secondary">Free AI classes</Button>
        </div>
      </div>
    </section>
  );
}
