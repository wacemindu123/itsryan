import Button from '../ui/Button';

export default function HeroSection() {
  return (
    <section className="py-20 pb-[100px] text-center animate-fade-in-up">
      <div className="max-w-[980px] mx-auto px-[22px]">
        <h1 className="text-[64px] font-semibold leading-[1.08] tracking-[-1.5px] mb-4 text-[var(--text-primary)] max-md:text-[40px] max-md:tracking-[-1px]">
          I help small businesses scale using AI and technology.<br />For free.
        </h1>
        <p className="text-[28px] font-normal leading-[1.3] tracking-[-0.3px] text-[var(--text-secondary)] mb-8 max-w-[800px] mx-auto max-md:text-[21px]">
          AI tools, automations, websites—the same stuff big companies pay $50k+ for.
        </p>
        
        <div className="flex justify-center gap-20 my-[60px] mb-10 animate-fade-in-up-delay-1 max-md:flex-col max-md:gap-8">
          <div className="text-center">
            <div className="text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">$600M</div>
            <div className="text-sm text-[var(--text-secondary)] font-normal">enterprise value added</div>
          </div>
          <div className="text-center">
            <div className="text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">$100M+</div>
            <div className="text-sm text-[var(--text-secondary)] font-normal">revenue built</div>
          </div>
          <div className="text-center">
            <div className="text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">52%</div>
            <div className="text-sm text-[var(--text-secondary)] font-normal">faster delivery</div>
          </div>
          <div className="text-center">
            <div className="text-[56px] font-semibold text-[var(--text-primary)] leading-none mb-2 tracking-[-1px]">17%</div>
            <div className="text-sm text-[var(--text-secondary)] font-normal">higher conversion</div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center flex-wrap animate-fade-in-up-delay-2">
          <Button href="#apply">Tell me what you need</Button>
          <Button href="#ai-classes" variant="secondary">Free AI classes</Button>
        </div>
      </div>
    </section>
  );
}
