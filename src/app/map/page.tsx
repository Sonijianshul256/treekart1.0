"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const FarmMapView = dynamic(() => import('@/components/FarmMapView').then((mod) => mod.FarmMapView), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid h-[72vh] place-items-center rounded border border-grove-100 bg-white text-grove-700">
        <Loader2 className="animate-spin" />
      </div>
    </main>
  )
});

export default function MapPage() {
  return <FarmMapView />;
}
