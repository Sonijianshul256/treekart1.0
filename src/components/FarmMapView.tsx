"use client";

import { GoogleMap, InfoWindowF, MarkerF, PolygonF, useJsApiLoader } from '@react-google-maps/api';
import { Gift, IndianRupee, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { RentTreeModal } from '@/components/RentTreeModal';
import { FARM_BOUNDARY, FARM_CENTER, FARM_ZONES } from '@/lib/constants';
import { useTrees } from '@/hooks/useFirestore';
import type { Tree } from '@/types';
import { markerIcon } from '@/utils/maps';

function treePosition(tree: Tree) {
  return { lat: tree.location.latitude, lng: tree.location.longitude };
}

export function FarmMapView() {
  const { data: trees = [], isLoading } = useTrees();
  const [selected, setSelected] = useState<Tree | null>(null);
  const [rentTree, setRentTree] = useState<Tree | null>(null);
  const [giftTree, setGiftTree] = useState<Tree | null>(null);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasMapsKey = Boolean(mapsApiKey);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-grove-700">Live farm map</p>
          <h1 className="text-3xl font-black text-ink">Choose your organic fruit tree</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded bg-green-100 px-3 py-1 text-green-700">Available</span>
          <span className="rounded bg-blue-100 px-3 py-1 text-blue-700">Rented</span>
          <span className="rounded bg-yellow-100 px-3 py-1 text-yellow-700">Soon available</span>
        </div>
      </div>

      <div className="h-[72vh] overflow-hidden rounded border border-grove-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="grid h-full place-items-center text-grove-700"><Loader2 className="animate-spin" /></div>
        ) : !hasMapsKey ? (
          <div className="relative h-full overflow-hidden bg-[linear-gradient(135deg,#dcefd9_0%,#dcefd9_45%,#f6e5b8_45%,#f6e5b8_100%)] p-5">
            <div className="absolute inset-6 rounded border-2 border-grove-700/50 bg-grove-700/10" />
            <div className="absolute left-[10%] top-[12%] h-[42%] w-[42%] rounded border border-white/80 bg-marigold/25 p-3 text-sm font-bold text-ink">Papaya Block A</div>
            <div className="absolute bottom-[14%] right-[10%] h-[44%] w-[48%] rounded border border-white/80 bg-grove-700/20 p-3 text-sm font-bold text-ink">Mango Grove</div>
            {trees.map((tree, index) => (
              <button
                key={tree.id}
                onClick={() => setSelected(tree)}
                className={`absolute grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-black text-white shadow-soft ${
                  tree.status === 'available' ? 'bg-green-600' : tree.status === 'rented' ? 'bg-blue-600' : 'bg-yellow-500'
                }`}
                style={{ left: `${22 + index * 22}%`, top: `${28 + (index % 2) * 24}%` }}
                title={`${tree.type} ${tree.row}`}
              >
                {tree.type[0]}
              </button>
            ))}
            <div className="absolute bottom-5 left-5 max-w-md rounded bg-white/95 p-4 shadow-soft">
              <p className="text-sm font-semibold text-grove-700">Local demo map</p>
              <p className="text-sm text-ink/70">Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env` for live Google polygons, markers, and directions.</p>
            </div>
            {selected && (
              <div className="absolute right-5 top-5 w-80 rounded bg-white p-4 shadow-soft">
                <button onClick={() => setSelected(null)} className="float-right text-xl">×</button>
                <img src={selected.photoUrl || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=500&q=80'} alt="" className="mb-3 h-32 w-full rounded object-cover" />
                <h2 className="font-bold text-ink">{selected.type} · {selected.zone}</h2>
                <p className="text-sm text-ink/70">₹{selected.price}/year · Harvest: {selected.harvestMonth}</p>
                <p className="text-sm text-ink/70">Soil {selected.soilMoisture || 72}% · Pest risk {selected.pestRisk || 18}%</p>
                <div className="mt-3 flex gap-2">
                  <Button disabled={selected.status !== 'available'} onClick={() => setRentTree(selected)}><IndianRupee size={15} /> Rent</Button>
                  <Button variant="secondary" onClick={() => setGiftTree(selected)}><Gift size={15} /> Gift</Button>
                </div>
              </div>
            )}
          </div>
        ) : isLoaded ? (
          <GoogleMap mapContainerClassName="h-full w-full" center={FARM_CENTER} zoom={16} options={{ mapTypeId: 'satellite', streetViewControl: false }}>
            <PolygonF path={FARM_BOUNDARY} options={{ fillColor: '#2f6b45', fillOpacity: 0.08, strokeColor: '#2f6b45', strokeWeight: 2 }} />
            {FARM_ZONES.map((zone) => (
              <PolygonF
                key={zone.name}
                path={zone.path}
                options={{
                  fillColor: zone.name.includes('Papaya') ? '#e9a93a' : '#2f6b45',
                  fillOpacity: 0.16,
                  strokeColor: '#ffffff',
                  strokeWeight: 1
                }}
              />
            ))}
            {trees.map((tree) => (
              <MarkerF
                key={tree.id}
                position={treePosition(tree)}
                icon={markerIcon(tree.status)}
                onClick={() => setSelected(tree)}
              />
            ))}
            {selected && (
              <InfoWindowF position={treePosition(selected)} onCloseClick={() => setSelected(null)}>
                <div className="map-info-window text-ink">
                  <img src={selected.photoUrl || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=500&q=80'} alt="" className="mb-2 h-28 w-full rounded object-cover" />
                  <h3 className="font-bold">{selected.type}</h3>
                  <p className="text-xs">Zone {selected.zone} · {selected.row}</p>
                  <p className="text-xs">₹{selected.price}/year · Harvest: {selected.harvestMonth}</p>
                  <div className="mt-2 flex gap-2">
                    <Button className="h-7 px-2 text-xs" disabled={selected.status !== 'available'} onClick={() => setRentTree(selected)}>Rent</Button>
                    <Button variant="secondary" className="h-7 px-2 text-xs" onClick={() => setGiftTree(selected)}>Gift</Button>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="grid h-full place-items-center text-grove-700"><Loader2 className="animate-spin" /></div>
        )}
      </div>
      {rentTree && <RentTreeModal tree={rentTree} onClose={() => setRentTree(null)} />}
      {giftTree && <RentTreeModal tree={giftTree} defaultGift onClose={() => setGiftTree(null)} />}
    </main>
  );
}
