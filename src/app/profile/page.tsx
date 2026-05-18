"use client";

import { LogOut, MessageCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { mapAuthError, useAuth } from '@/context/AuthContext';
import { useSubscriptions } from '@/hooks/useFirestore';
import { cancelSubscription } from '@/services/functions';
import { setAutoRenew, upsertUser } from '@/services/firestore';
import { formatDate } from '@/utils/dates';

const notificationKeys = [
  ['morningPhoto', 'Morning photo'],
  ['soilAlert', 'Soil moisture alert'],
  ['growthUpdate', 'Growth update'],
  ['weeklyVideo', 'Weekly video'],
  ['harvestAlert', 'Harvest alert']
] as const;

export default function ProfilePage() {
  const { profile, logout, deleteAccount, firebaseUser } = useAuth();
  const router = useRouter();
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { data: subscriptions = [] } = useSubscriptions(profile?.uid);
  const queryClient = useQueryClient();
  const autoRenewMutation = useMutation({
    mutationFn: ({ id, autoRenew }: { id: string; autoRenew: boolean }) => setAutoRenew(id, autoRenew),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions', profile?.uid] })
  });

  async function updateNotification(key: string, enabled: boolean) {
    if (!profile) return;
    await upsertUser({ ...profile, notificationSettings: { ...profile.notificationSettings, [key]: enabled } });
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Delete your Treekart account permanently? This cannot be undone.')) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteAccount();
      router.replace('/');
    } catch (error) {
      setDeleteError(mapAuthError(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded border border-grove-100 bg-white p-5 shadow-sm">
          <img src={profile?.photoURL || 'https://api.dicebear.com/8.x/initials/svg?seed=Treekart'} alt="" className="h-20 w-20 rounded-full" />
          <h1 className="mt-4 text-2xl font-black text-ink">{profile?.name}</h1>
          <p className="text-sm text-ink/70">{profile?.email}</p>
          {firebaseUser && !firebaseUser.emailVerified && (
            <p className="mt-2 rounded bg-yellow-50 px-3 py-2 text-xs text-yellow-800">Verify your email using the link we sent after sign-up.</p>
          )}
          <div className="mt-5 rounded bg-grove-50 p-3">
            <p className="text-xs font-semibold text-grove-700">Referral code</p>
            <p className="text-lg font-black text-ink">{profile?.referralCode}</p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"><Button variant="secondary" className="w-full"><MessageCircle size={16} /> WhatsApp support</Button></a>
            <Button variant="secondary" onClick={logout}><LogOut size={16} /> Logout</Button>
            {deleteError && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-700">{deleteError}</p>}
            <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
              <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete account'}
            </Button>
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
            <h2 className="text-xl font-bold text-ink">Notification preferences</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {notificationKeys.map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded bg-grove-50 px-4 py-3">
                  <span className="font-medium text-ink">{label}</span>
                  <input type="checkbox" defaultChecked={profile?.notificationSettings?.[key]} onChange={(event) => updateNotification(key, event.target.checked)} />
                </label>
              ))}
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
