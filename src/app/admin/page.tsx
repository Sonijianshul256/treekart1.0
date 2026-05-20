"use client";

import { FormEvent, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { uploadFarmerVoiceNote } from '@/services/admin';
import { adminMarkDelivery } from '@/services/functions';

export default function AdminPage() {
  const { user } = useAuth();
  const [treeId, setTreeId] = useState('');
  const [voiceFile, setVoiceFile] = useState<File>();
  const [deliveryId, setDeliveryId] = useState('');
  const [status, setStatus] = useState('packed');
  const [ripeness, setRipeness] = useState('70% ripe - ready in 2 days');

  async function submitVoice(event: FormEvent) {
    event.preventDefault();
    if (!voiceFile || !user) return;
    await uploadFarmerVoiceNote(user.id, treeId, voiceFile);
    setVoiceFile(undefined);
  }

  async function submitDelivery(event: FormEvent) {
    event.preventDefault();
    await adminMarkDelivery({ deliveryId, status, ripeness, eta: '42 min', driverContact: '+91 90000 00000' });
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2">
      <form onSubmit={submitVoice} className="rounded border border-grove-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-black text-ink">Farmer audio upload</h1>
        <input required value={treeId} onChange={(event) => setTreeId(event.target.value)} placeholder="Tree ID" className="mt-4 w-full rounded border border-grove-100 px-3 py-2" />
        <label className="mt-3 flex cursor-pointer items-center gap-2 rounded border border-dashed border-grove-100 p-3 text-sm text-grove-700">
          <Upload size={18} /> {voiceFile?.name || 'Upload audio'}
          <input required type="file" accept="audio/*" className="hidden" onChange={(event) => setVoiceFile(event.target.files?.[0])} />
        </label>
        <Button className="mt-4">Save voice note</Button>
      </form>

      <form onSubmit={submitDelivery} className="rounded border border-grove-100 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black text-ink">Delivery status</h2>
        <input required value={deliveryId} onChange={(event) => setDeliveryId(event.target.value)} placeholder="Delivery ID" className="mt-4 w-full rounded border border-grove-100 px-3 py-2" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-3 w-full rounded border border-grove-100 px-3 py-2">
          <option value="picked">Picked</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
        </select>
        <input value={ripeness} onChange={(event) => setRipeness(event.target.value)} className="mt-3 w-full rounded border border-grove-100 px-3 py-2" />
        <Button className="mt-4">Update delivery</Button>
      </form>
    </main>
  );
}
