"use client";

import { FormEvent, useState } from 'react';
import { Leaf, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { mapAuthError, useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const { profile, completeOnboarding } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [city, setCity] = useState(profile?.city || '');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await completeOnboarding({ name, city, referralCode: referralCode || undefined });
    } catch (authError) {
      setError(mapAuthError(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-grove-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded bg-grove-700 text-white"><Leaf /></span>
          <div>
            <h1 className="text-2xl font-bold text-ink">Welcome to Treekart</h1>
            <p className="text-sm text-ink/70">Set up your orchard profile.</p>
          </div>
        </div>

        <label className="mb-4 block text-sm font-medium text-ink">
          Name
          <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded border border-grove-100 px-3 py-2" />
        </label>
        <label className="mb-4 block text-sm font-medium text-ink">
          City
          <input required value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full rounded border border-grove-100 px-3 py-2" />
        </label>
        <label className="mb-6 block text-sm font-medium text-ink">
          Referral code <span className="font-normal text-ink/50">(optional)</span>
          <input value={referralCode} onChange={(event) => setReferralCode(event.target.value)} className="mt-1 w-full rounded border border-grove-100 px-3 py-2" />
        </label>

        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <Button className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : null} Enter Treekart
        </Button>
      </form>
    </main>
  );
}
