import { FormEvent, useState } from 'react';
import { Gift, Loader2, Users } from 'lucide-react';
import { Tree } from '@/types';
import { Button } from './Button';
import { createCheckoutSession } from '@/services/functions';

export function RentTreeModal({ tree, onClose, defaultGift = false }: { tree: Tree; onClose: () => void; defaultGift?: boolean }) {
  const [plan, setPlan] = useState<'individual' | 'shared' | 'employee_gift' | 'gift'>(defaultGift ? 'gift' : 'individual');
  const [email, setEmail] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const { url } = await createCheckoutSession({
        treeId: tree.id,
        plan,
        coOwnerEmail: plan === 'shared' ? email : undefined,
        giftEmail: plan === 'gift' ? email : undefined,
        companyCode: plan === 'employee_gift' ? companyCode : undefined
      });
      window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-grove-700">{tree.type} rental</p>
            <h2 className="text-2xl font-bold text-ink">{tree.userGivenName || `${tree.zone} ${tree.row}`}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded px-2 py-1 text-xl">×</button>
        </div>
        <div className="mt-5 grid gap-3">
          {[
            ['individual', `Individual - ₹${tree.price}/yr`],
            ['shared', 'One Tree Two Families - split 50:50'],
            ['employee_gift', 'Employee Gifting - ₹1,200/tree'],
            ['gift', 'Gift a Tree']
          ].map(([value, label]) => (
            <label key={value} className={`flex cursor-pointer items-center gap-3 rounded border p-3 ${plan === value ? 'border-grove-700 bg-grove-50' : 'border-grove-100'}`}>
              <input type="radio" name="plan" value={value} checked={plan === value} onChange={() => setPlan(value as typeof plan)} />
              <span className="font-medium text-ink">{label}</span>
            </label>
          ))}
        </div>
        {(plan === 'shared' || plan === 'gift') && (
          <label className="mt-4 block text-sm font-medium text-ink">
            {plan === 'shared' ? 'Co-owner email' : "Friend's email"}
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded border border-grove-100 px-3 py-2" />
          </label>
        )}
        {plan === 'employee_gift' && (
          <label className="mt-4 block text-sm font-medium text-ink">
            Company code
            <input required value={companyCode} onChange={(event) => setCompanyCode(event.target.value)} className="mt-1 w-full rounded border border-grove-100 px-3 py-2" />
          </label>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" size={16} /> : plan === 'gift' ? <Gift size={16} /> : <Users size={16} />} Continue to Stripe</Button>
        </div>
      </form>
    </div>
  );
}
