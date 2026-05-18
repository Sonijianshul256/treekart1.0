"use client";

import { QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { TreeCard } from '@/components/TreeCard';
import { useAuth } from '@/context/AuthContext';
import { useUserTrees } from '@/hooks/useFirestore';

export default function OrchardPage() {
  const { profile } = useAuth();
  const { data: trees = [] } = useUserTrees(profile?.uid);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-grove-700">My Orchard</p>
        <h1 className="text-3xl font-black text-ink">Your rented trees</h1>
      </div>
      {trees.length === 0 ? (
        <div className="rounded border border-grove-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-ink">No trees yet</h2>
          <p className="mt-2 text-ink/70">Rent a tree from the farm map to start your orchard dashboard.</p>
        </div>
      ) : (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
          {trees.map((tree) => <TreeCard key={tree.id} tree={tree} />)}
        </div>
      )}

      <section className="mt-8 rounded border border-grove-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-grove-700"><QrCode /> <h2 className="text-xl font-bold text-ink">Printable tree tags</h2></div>
        <div className="flex flex-wrap gap-5">
          {trees.map((tree) => (
            <div key={tree.id} className="rounded border border-grove-100 p-4 text-center">
              <QRCode value={origin ? `${origin}/tree/${tree.id}` : `/tree/${tree.id}`} size={120} />
              <p className="mt-2 text-sm font-semibold">{tree.userGivenName || tree.type}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
