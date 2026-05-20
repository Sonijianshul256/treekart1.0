"use client";

import { ArrowRight, Building2, Gift, MapPinned, Sprout, Leaf } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      <section className="relative min-h-[72vh] overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1800&q=85"
          alt="Organic farm rows"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-4 py-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-marigold">Organic fruit trees in rural Rajasthan</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Treekart</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90">
            Rent a real Papaya or Mango tree, follow its farm life, receive harvests, track impact, and support organic growers directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/map"><Button><MapPinned size={18} /> Explore Farm Map</Button></Link>
            {user ? (
              <Link href="/orchard"><Button variant="secondary">My Orchard <ArrowRight size={18} /></Button></Link>
            ) : (
              <>
                <Link href="/signin"><Button variant="secondary">Sign in</Button></Link>
                <Link href="/signup"><Button variant="secondary">Sign up</Button></Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-3">
        {[
          { icon: <Sprout />, title: 'Individual', text: 'Rent a full tree for the full harvest: Papaya ₹1,500/yr, Mango ₹3,000/yr.' },
          { icon: <Gift />, title: 'One Tree Two Families', text: 'Split payment and harvest 50:50 with a co-owner through Stripe Checkout.' },
          { icon: <Building2 />, title: 'Employee Gifting', text: 'Company code based bulk rentals at ₹1,200/tree for employee wellbeing gifts.' }
        ].map((item) => (
          <div key={item.title} className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded bg-grove-100 text-grove-700">{item.icon}</div>
            <h2 className="text-xl font-bold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/75">{item.text}</p>
          </div>
        ))}
      </section>

      {/* Immersive 3D Experience Preview Card */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="rounded-2xl border border-grove-100 bg-[#142018] p-6 text-white shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-grove-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex rounded bg-marigold/10 border border-marigold/30 px-2.5 py-1 text-xs font-bold text-marigold uppercase tracking-wider">
              ✨ Web3D Experience Live
            </span>
            <h2 className="text-3xl font-black leading-tight text-white">Experience Rajasthan's Groves in Immersive 3D & AR</h2>
            <p className="text-sm text-grove-100/80 leading-relaxed">
              We've mapped our active papaya and mango groves to high-fidelity 3D assets. You can rotate trees in 360°, inspect leaf health telemetry, and place a virtual tree in your living room in Augmented Reality!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/tree/mango-g-07"><Button className="bg-grove-700 hover:bg-grove-500 text-white border border-grove-500">🌳 Launch 3D Viewer Demo</Button></Link>
              <Link href="/tree/mango-g-07/ar"><Button variant="secondary" className="bg-white/5 border border-white/10 hover:bg-white/15 text-white">✨ View AR Playground</Button></Link>
            </div>
          </div>
          <Link href="/tree/mango-g-07" className="w-full md:w-80 h-56 rounded-xl overflow-hidden border border-white/10 bg-ink/50 relative flex items-center justify-center group cursor-pointer shrink-0">
            <img src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" alt="3D Tree preview" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            <div className="relative text-center p-4 flex flex-col items-center">
              <span className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-grove-700 text-white shadow-lg group-hover:scale-110 transition"><Leaf size={24} /></span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">Tree ID: mango-g-07</span>
              <span className="text-[10px] text-white/50 mt-0.5">Click to Open 3D Scene</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
