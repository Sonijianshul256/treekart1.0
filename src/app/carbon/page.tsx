"use client";

import { IndianRupee, Leaf, MapPin } from 'lucide-react';
import { Button } from '@/components/Button';
import { MetricCard } from '@/components/MetricCard';
import { useAuth } from '@/context/AuthContext';
import { useUserTrees } from '@/hooks/useFirestore';
import { CARBON_BY_TREE } from '@/lib/constants';
import { createCheckoutSession } from '@/services/functions';

export default function CarbonPage() {
  const { profile } = useAuth();
  const { data: trees = [] } = useUserTrees(profile?.uid);
  const total = trees.reduce((sum, tree) => sum + CARBON_BY_TREE[tree.type], 0);
  const drivingKmLess = total * 0.004;

  async function donate() {
    const { url } = await createCheckoutSession({ plan: 'donation' });
    window.location.href = url;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-grove-700">Carbon Impact</p>
        <h1 className="text-3xl font-black text-ink">Your growing climate ledger</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total CO2 saved" value={`${total} kg`} icon={<Leaf size={18} />} />
        <MetricCard label="Driving equivalent" value={`${drivingKmLess.toFixed(2)} km less`} />
        <MetricCard label="Rented trees" value={`${trees.length}`} />
      </div>
      <section className="mt-6 rounded border border-grove-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-ink">Forest illustration</h2>
        <div className="mt-4 flex min-h-32 flex-wrap items-end gap-3 rounded bg-grove-50 p-5">
          {trees.map((tree) => (
            <div key={tree.id} title={tree.type} className="text-4xl">{tree.type === 'Mango' ? '🌳' : '🌴'}</div>
          ))}
          {trees.length === 0 && <p className="text-ink/70">Your forest appears when you rent trees.</p>}
        </div>
      </section>
      <section className="mt-6 grid gap-4 rounded border border-grove-100 bg-white p-5 shadow-sm md:grid-cols-[1fr_280px] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-grove-700"><MapPin size={16} /> Partner forest</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Donate ₹100 to extend native forest cover near Jodhpur.</h2>
          <p className="mt-2 text-sm text-ink/70">After payment, Treekart records the donation and shows the partner forest location on your impact records.</p>
        </div>
        <Button onClick={donate}><IndianRupee size={16} /> Donate ₹100</Button>
      </section>
    </main>
  );
}
