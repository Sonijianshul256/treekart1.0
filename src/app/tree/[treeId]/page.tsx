"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, CalendarDays, Gift, Leaf, Play, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { ProgressRing } from '@/components/ProgressRing';
import { RentTreeModal } from '@/components/RentTreeModal';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { CARBON_BY_TREE } from '@/lib/constants';
import { renameTree, uploadVoiceReply } from '@/services/firestore';
import { useTree, useTreeUpdates, useVoiceNotes } from '@/hooks/useFirestore';
import { daysUntil, formatDate } from '@/utils/dates';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const ModelViewer3D = dynamic(() => import('@/components/ModelViewer3D').then((mod) => mod.ModelViewer3D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#111c14] text-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-grove-500 border-t-transparent" />
      <p className="mt-4 text-xs font-semibold tracking-wider text-grove-200">Starting Web3D Engine...</p>
    </div>
  )
});

export default function TreeDetailPage() {
  const treeId = useParams().treeId as string;
  const { profile } = useAuth();
  const { data: tree } = useTree(treeId);
  const { data: updates = [] } = useTreeUpdates(treeId);
  const { data: notes = [] } = useVoiceNotes(treeId);
  const [name, setName] = useState('');
  const [giftOpen, setGiftOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'photo' | '3d'>('3d');
  const queryClient = useQueryClient();

  const rename = useMutation({
    mutationFn: () => renameTree(treeId!, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tree', treeId] })
  });

  if (!tree) return <main className="p-8">Loading tree...</main>;

  const latest = updates[0];
  const carbon = CARBON_BY_TREE[tree.type];

  return (
    <main>
      <section className="relative min-h-[60vh] bg-ink text-white overflow-hidden flex flex-col justify-end">
        {viewMode === 'photo' ? (
          <>
            <img src={latest?.photoUrl || tree.photoUrl || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1600&q=85'} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 animate-fade-in" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 h-full w-full bg-[#111c14] flex items-center justify-end">
            <ModelViewer3D src="/tree.glb" className="w-full h-full border-none rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent pointer-events-none" />
          </div>
        )}

        {/* View Mode Toggle Switch */}
        <div className="absolute right-4 top-4 z-20 flex gap-1 rounded-xl bg-ink/80 p-1 border border-white/10 backdrop-blur">
          <button 
            onClick={() => setViewMode('photo')} 
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${viewMode === 'photo' ? 'bg-grove-700 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
          >
            📷 Photo View
          </button>
          <button 
            onClick={() => setViewMode('3d')} 
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${viewMode === '3d' ? 'bg-grove-700 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
          >
            🌳 3D Model View
          </button>
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <p className="text-sm font-semibold text-marigold">{tree.zone} · Row {tree.row}</p>
            <h1 className="text-4xl font-black">{tree.userGivenName || `${tree.type} tree`}</h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Edit name plaque" className="rounded border-0 px-3 py-2 text-ink" />
              <Button onClick={() => rename.mutate()} disabled={!name}>Save name</Button>
              <Button variant="secondary" onClick={() => setGiftOpen(true)}><Gift size={16} /> Gift</Button>
              <Link href={`/tree/${treeId}/ar`}><Button variant="secondary">View in AR Playground</Button></Link>
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-ink">Growth timeline</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {['Planted', 'Rooted', 'Flowering', 'Fruit set', 'Harvest'].map((step, index) => (
                <div key={step} className="min-w-36 rounded bg-grove-50 p-4">
                  <div className={`mb-2 grid h-8 w-8 place-items-center rounded-full ${index < 3 ? 'bg-grove-700 text-white' : 'bg-white text-grove-700'}`}>{index + 1}</div>
                  <p className="font-semibold">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-ink">Blockchain farm log</h2>
            <div className="space-y-3">
              {updates.map((update) => (
                <div key={update.id} className="flex items-center justify-between rounded bg-grove-50 p-3">
                  <div>
                    <p className="font-medium text-ink">{update.activity}</p>
                    <p className="text-sm text-ink/60">{formatDate(update.timestamp)}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-semibold text-grove-700"><ShieldCheck size={14} /> verified</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-ink">Farmer voice notes</h2>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="rounded bg-grove-50 p-4">
                  {note.farmerAudioUrl && <audio controls src={note.farmerAudioUrl} className="w-full" />}
                  {note.replyAudioUrl && <audio controls src={note.replyAudioUrl} className="mt-3 w-full" />}
                  <p className="mt-2 text-xs text-ink/60">{formatDate(note.timestamp)}</p>
                </div>
              ))}
              <VoiceRecorder onSave={(blob) => uploadVoiceReply(profile!.uid, tree.id, blob, notes[0]?.id)} />
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              <ProgressRing value={tree.soilMoisture || 74} label="Soil" />
              <ProgressRing value={tree.leafHealth || 82} label="Leaf" />
              <ProgressRing value={tree.pestRisk || 18} label="Pest" tone={(tree.pestRisk || 18) > 50 ? 'red' : 'yellow'} />
            </div>
          </div>
          <div className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-grove-700"><CalendarDays size={16} /> Harvest countdown</p>
            <h2 className="mt-2 text-3xl font-black text-ink">{daysUntil(tree.harvestMonth)} days</h2>
          </div>
          <div className="rounded border border-grove-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-grove-700"><Leaf size={16} /> Carbon saved</p>
            <h2 className="mt-2 text-3xl font-black text-ink">{carbon} kg CO2/year</h2>
          </div>
          <a href="/how-we-grow" className="block"><Button className="w-full">How It’s Grown <ArrowDown size={16} /></Button></a>
          <Button variant="secondary" className="w-full" onClick={() => document.getElementById('root')?.scrollIntoView({ behavior: 'smooth' })}><Play size={16} /> Latest farm media</Button>
        </aside>
      </section>
      {giftOpen && <RentTreeModal tree={tree} defaultGift onClose={() => setGiftOpen(false)} />}
    </main>
  );
}
