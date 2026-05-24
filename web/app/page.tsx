import Link from 'next/link';
import { Truck, Package, MessageSquare, Radio, Zap, Shield, ChevronRight, Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Truck size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">FreightFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sign In
            </Link>
            <Link href="/auth/role" className={cn(buttonVariants({ size: 'sm' }))}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-20 px-5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
            <Zap size={12} /> Built for Africa&apos;s Talking Hackathon 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Digital Freight Marketplace<br />
            <span className="text-primary">for Africa</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Connect shippers with transporters across Kenya. Post loads, track cargo,
            and update delivery status — even on a basic phone via USSD.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/role" className={cn(buttonVariants(), 'gap-2 h-11 px-6')}>
              Start Shipping <ChevronRight size={16} />
            </Link>
            <Link href="/auth/login" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-6')}>
              I&apos;m a Transporter
            </Link>
          </div>
        </div>
      </section>

      {/* Africa's Talking APIs */}
      <section className="py-16 px-5 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Powered by Africa&apos;s Talking APIs
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, label: 'SMS API', desc: 'Load alerts & OTP' },
              { icon: Radio, label: 'USSD API', desc: '*384*7447# status updates' },
              { icon: Truck, label: 'Voice API', desc: 'Delivery call alerts' },
              { icon: Star, label: 'Airtime API', desc: 'Driver rewards' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-card rounded-xl border border-border p-4 text-center space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Icon size={18} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Package,
                step: '1',
                title: 'Shipper Posts a Load',
                desc: 'Enter origin, destination, cargo type, and weight. All registered transporters are notified via SMS instantly.',
              },
              {
                icon: Truck,
                step: '2',
                title: 'Transporter Accepts',
                desc: 'Browse matching loads on the dashboard or receive an SMS. Accept the load with one click — shipper is notified.',
              },
              {
                icon: Shield,
                step: '3',
                title: 'Track & Confirm',
                desc: 'Transporters update status via the web or *384*7447# on any basic phone. Shipper confirms delivery and rates.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                    {step}
                  </span>
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 bg-primary text-primary-foreground">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <h2 className="text-2xl font-bold">Ready to move freight smarter?</h2>
          <p className="text-primary-foreground/80">
            Join FreightFlow — free for shippers and transporters. No app download needed.
          </p>
          <Link
            href="/auth/role"
            className="inline-flex items-center gap-2 bg-background text-foreground rounded-lg px-6 h-11 font-medium text-sm hover:bg-background/90 transition-colors"
          >
            Create Free Account <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6 px-5 text-center text-xs text-muted-foreground">
        © 2026 FreightFlow · Built for the Africa&apos;s Talking Transportation &amp; Logistics Hackathon
      </footer>
    </div>
  );
}
