"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Leaf, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/Button';
import { mapAuthError, useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('Check your inbox for a password reset link.');
    } catch (authError) {
      setError(mapAuthError(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-66px)] place-items-center bg-grove-50 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-grove-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded bg-grove-700 text-white"><Leaf /></span>
          <div>
            <h1 className="text-2xl font-black text-ink">Reset password</h1>
            <p className="text-sm text-ink/70">We will email you a link to choose a new password.</p>
          </div>
        </div>

        <label className="mb-4 block text-sm font-medium text-ink">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-grove-100 px-3 py-2"
          />
        </label>

        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="mb-4 rounded bg-grove-50 px-3 py-2 text-sm text-grove-800">{success}</p>}
        {!isFirebaseConfigured && (
          <p className="mb-4 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Firebase is not configured. Add web app keys to `.env` and restart the dev server.
          </p>
        )}

        <Button className="w-full" disabled={loading || !isFirebaseConfigured || Boolean(success)}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />} Send reset link
        </Button>

        <p className="mt-5 text-center text-sm text-ink/70">
          <Link className="font-semibold text-grove-700" href="/signin">Back to sign in</Link>
        </p>
      </form>
    </main>
  );
}
