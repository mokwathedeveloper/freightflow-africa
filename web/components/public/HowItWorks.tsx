import type { HowItWorksStep } from '@/types/landing';

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

export default function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-16 px-5 bg-gray-50 border-y border-gray-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Process</p>
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <p className="text-sm text-gray-500 mt-2">Three steps from load to delivered</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <div key={step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(100%-0px)] w-8 border-t-2 border-dashed border-gray-300 z-10" />
              )}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-black text-gray-100">{step}</span>
                <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" aria-hidden="true" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
