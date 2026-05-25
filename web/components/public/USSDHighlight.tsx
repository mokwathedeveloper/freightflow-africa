import { Clock } from 'lucide-react';

interface USSDHighlightProps {
  ussdCode: string;
}

export default function USSDHighlight({ ussdCode }: USSDHighlightProps) {
  return (
    <section id="ussd" className="py-16 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#1E3A8A] rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Clock size={11} aria-hidden="true" /> Inclusive Design
            </div>
            <h2 className="text-2xl font-bold mb-3">No smartphone? No problem.</h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-md">
              Over 70% of Kenyan truck drivers use basic feature phones. FreightFlow&apos;s USSD
              integration means every driver can update cargo status, check job details, and
              receive notifications — all without internet.
            </p>
          </div>
          <div className="shrink-0 text-center">
            <div className="bg-white/10 border border-white/20 rounded-xl px-8 py-6">
              <p className="text-white/60 text-xs font-medium mb-2">Dial from any phone</p>
              <p className="text-white text-3xl font-mono font-black tracking-wider">{ussdCode}</p>
              <p className="text-white/60 text-xs mt-2">Update status · Check jobs · View payments</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
