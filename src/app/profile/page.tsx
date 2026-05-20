"use client";

import { LogOut, MessageCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useFirestore';
import { cancelSubscription } from '@/services/functions';
import { setAutoRenew } from '@/services/firestore';
import { formatDate } from '@/utils/dates';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: subscriptions = [] } = useSubscriptions(user?.id);
  const queryClient = useQueryClient();
  const autoRenewMutation = useMutation({
    mutationFn: ({ id, autoRenew }: { id: string; autoRenew: boolean }) => setAutoRenew(id, autoRenew),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] })
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded border border-grove-100 bg-white p-5 shadow-sm">
          <img src={user?.picture || 'https://api.dicebear.com/8.x/initials/svg?seed=Treekart'} alt="" className="h-20 w-20 rounded-full" />
          <h1 className="mt-4 text-2xl font-black text-ink">{user?.name}</h1>
          <p className="text-sm text-ink/70">{user?.email}</p>
          <div className="mt-5 rounded bg-grove-50 p-3">
            <p className="text-xs font-semibold text-grove-700">Username</p>
            <p className="text-lg font-black text-ink">{user?.userName}</p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"><Button variant="secondary" className="w-full"><MessageCircle size={16} /> WhatsApp support</Button></a>
            <Button variant="secondary" onClick={logout}><LogOut size={16} /> Logout</Button>
          </div>
        </aside>
        <div className="space-y-6">
          <section className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Active subscriptions</h2>
            <div className="mt-4 divide-y divide-grove-100">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <p className="font-semibold text-ink">Tree {sub.treeId}</p>
                    <p className="text-sm text-ink/70">Renewal {formatDate(sub.renewalDate || sub.endDate)} · ₹{sub.amount}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={sub.autoRenew} onChange={(event) => autoRenewMutation.mutate({ id: sub.id, autoRenew: event.target.checked })} />
                    Auto-renew
                  </label>
                  <Button variant="secondary" onClick={() => cancelSubscription(sub.id)}>Cancel</Button>
                </div>
              ))}
              {subscriptions.length === 0 && <p className="py-4 text-ink/70">No active subscriptions.</p>}
            </div>
          </section>
          <section className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-ink">Payment history</h2>
            <p className="mt-2 text-sm text-ink/70">Stripe invoices are fetched through the profile billing portal in production; webhook records are mirrored into Firestore subscriptions.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
