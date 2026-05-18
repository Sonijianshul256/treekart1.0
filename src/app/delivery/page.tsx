"use client";

import { GoogleMap, LoadScript, MarkerF, PolylineF } from '@react-google-maps/api';
import { Phone, MapPin, Truck, CheckCircle2, ChevronRight, AlertCircle, Calendar, Compass, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { STATUS_STEPS, FARM_CENTER } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useDeliveries, useUserTrees } from '@/hooks/useFirestore';
import { demoDeliveries, demoTrees } from '@/lib/demoData';
import Link from 'next/link';

export default function DeliveryPage() {
  const { profile } = useAuth();
  const { data: fetchedDeliveries = [] } = useDeliveries(profile?.uid);
  const { data: fetchedTrees = [] } = useUserTrees(profile?.uid);

  const deliveries = fetchedDeliveries.length > 0 ? fetchedDeliveries : demoDeliveries;
  const userTrees = fetchedTrees.length > 0 ? fetchedTrees : demoTrees;
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Set first delivery as active by default if none is selected
  const activeDelivery = deliveries.find(d => d.id === selectedId) || deliveries[0];
  const activeTree = userTrees.find(t => t.id === activeDelivery?.treeId);

  const route = activeDelivery 
    ? [FARM_CENTER, { lat: activeDelivery.driverLocation.latitude, lng: activeDelivery.driverLocation.longitude }] 
    : [FARM_CENTER, { lat: 26.9124, lng: 75.7873 }];

  const [markerPosition, setMarkerPosition] = useState(route[0]);
  const hasMapsKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    if (!activeDelivery) return;
    setMarkerPosition(route[0]);
    let tick = 0;
    const timer = window.setInterval(() => {
      tick = (tick + 1) % 100;
      const progress = tick / 100;
      setMarkerPosition({
        lat: route[0].lat + (route[1].lat - route[0].lat) * progress,
        lng: route[0].lng + (route[1].lng - route[0].lng) * progress
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [activeDelivery]);

  const activeIndex = activeDelivery ? STATUS_STEPS.indexOf(activeDelivery.status) : 1;

  // Helper to map status to human readable strings
  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 min-h-screen bg-[#f8fbf5]">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-3 md:items-end border-b border-grove-100 pb-5">
        <div>
          <p className="text-xs font-bold text-grove-700 uppercase tracking-widest flex items-center gap-1.5">
            <Truck size={14} /> Logistics Dashboard
          </p>
          <h1 className="text-3xl font-black text-ink mt-1">Delivery Sectors & Live Tracking</h1>
        </div>
        <p className="text-xs font-semibold text-ink/65 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live transit tracking updates every 30s
        </p>
      </div>

      {/* Main Grid Layout */}
      {deliveries.length === 0 ? (
        <div className="rounded-2xl border border-grove-100 bg-white p-12 text-center max-w-xl mx-auto shadow-soft space-y-5">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-grove-50 text-grove-700 mx-auto">
            <Truck size={32} />
          </div>
          <h2 className="text-2xl font-black text-ink">No active deliveries</h2>
          <p className="text-sm leading-relaxed text-ink/70">
            You don't have any pending harvests or active deliveries in transit. Visit your orchard to track growth and trigger your next seasonal box.
          </p>
          <Link href="/orchard" className="inline-block">
            <button className="rounded-xl bg-grove-700 text-white font-bold px-6 py-3 hover:bg-grove-600 transition shadow-md">
              Go to My Orchard
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_360px]">
          {/* Left Column: Delivery Selector List */}
          <aside className="space-y-4">
            <h2 className="text-sm font-bold text-ink/80 uppercase tracking-wider">Your Harvest Shipments</h2>
            <div className="space-y-3">
              {deliveries.map((del) => {
                const tree = userTrees.find(t => t.id === del.treeId);
                const isSelected = activeDelivery?.id === del.id;
                const statusIndex = STATUS_STEPS.indexOf(del.status);
                
                return (
                  <button
                    key={del.id}
                    onClick={() => setSelectedId(del.id)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white border-grove-500 shadow-md scale-[1.01]' 
                        : 'bg-white/60 border-grove-100 hover:border-grove-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-grove-700 tracking-wide uppercase">
                          {tree?.type === 'Papaya' ? '🌱' : '🥭'} {tree?.type || 'Fruit'} Tree
                        </p>
                        <h3 className="font-black text-ink text-sm">
                          {tree?.userGivenName || `Tree ${del.treeId}`}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        statusIndex >= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {getStatusLabel(del.status)}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-grove-50 flex items-center justify-between text-xs text-ink/75">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {del.eta}</span>
                      <ChevronRight size={14} className={isSelected ? 'text-grove-600' : 'text-ink/40'} />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center Column: Live Logistics Map */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-ink/80 uppercase tracking-wider">Live Shipping Vector Route</h2>
            <div className="h-[62vh] overflow-hidden rounded-2xl border border-grove-100 bg-white shadow-soft relative">
              {hasMapsKey ? (
                <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                  <GoogleMap center={markerPosition} zoom={12} mapContainerStyle={{ width: '100%', height: '100%' }}>
                    <PolylineF path={route} options={{ strokeColor: '#2f6b45', strokeWeight: 4 }} />
                    <MarkerF position={FARM_CENTER} label="Farm" />
                    <MarkerF position={markerPosition} label="Van" />
                  </GoogleMap>
                </LoadScript>
              ) : (
                <div className="relative h-full bg-[#ecf4e8] overflow-hidden flex flex-col justify-end p-5">
                  {/* Decorative background grid elements */}
                  <div className="absolute inset-0 bg-[radial-gradient(#2f6b45_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
                  
                  {/* Visual Route Path Line */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 120 180 C 250 150, 350 420, 520 280"
                      fill="transparent"
                      stroke="#2f6b45"
                      strokeWidth="4"
                      strokeDasharray="6 6"
                      className="animate-[dash_10s_linear_infinite]"
                    />
                  </svg>

                  {/* Marker: Farm (Jobner) */}
                  <div className="absolute left-[80px] top-[150px] text-center z-10 scale-95 md:scale-100">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-grove-700 text-white font-bold text-xs shadow-md">🏡</span>
                    <p className="text-[10px] font-extrabold text-grove-800 bg-white/90 px-1.5 py-0.5 rounded shadow mt-1">Jobner Farm</p>
                  </div>

                  {/* Dynamic Van Progress Marker */}
                  <div 
                    className="absolute text-center z-10 transition-all duration-700" 
                    style={{
                      left: `${120 + (520 - 120) * ((activeIndex + 1) / STATUS_STEPS.length) - 20}px`,
                      top: `${180 + (280 - 180) * ((activeIndex + 1) / STATUS_STEPS.length) - 40}px`
                    }}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-clay text-white shadow-soft border border-white animate-bounce">🚚</span>
                    <p className="text-[9px] font-extrabold text-clay bg-white/90 px-1.5 py-0.5 rounded shadow mt-1">Logistics Van</p>
                  </div>

                  {/* Marker: Destination (Sector Address) */}
                  <div className="absolute left-[500px] top-[250px] text-center z-10 scale-95 md:scale-100">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-marigold text-ink font-bold text-xs shadow-md">📍</span>
                    <p className="text-[10px] font-extrabold text-ink bg-white/90 px-1.5 py-0.5 rounded shadow mt-1">
                      {activeDelivery?.userAddress?.split(',')[0] || 'Sector 5'}
                    </p>
                  </div>

                  {/* Telemetry Panel overlay */}
                  <div className="relative z-10 max-w-sm rounded-2xl bg-white/90 backdrop-blur border border-grove-100 p-4 shadow-soft">
                    <h3 className="text-xs font-bold text-grove-700 flex items-center gap-1"><Compass size={13} className="animate-spin" /> Live Telemetry</h3>
                    <p className="text-xs text-ink/75 mt-1">
                      Van is transit-active. Speeding coordinates from the Organic Grove straight to your Jaipur distribution hub.
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-ink bg-grove-50 p-2 rounded-lg">
                      <span>Lat: {(26.9762 + (26.9124 - 26.9762) * ((activeIndex+1)/STATUS_STEPS.length)).toFixed(4)}° N</span>
                      <span>Lng: {(75.3892 + (75.7873 - 75.3892) * ((activeIndex+1)/STATUS_STEPS.length)).toFixed(4)}° E</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Telemetry Sidebar */}
          <aside className="space-y-5">
            {/* Sector Destination Card */}
            <div className="rounded-2xl border border-grove-100 bg-white p-5 shadow-soft">
              <h2 className="text-sm font-bold text-ink/80 uppercase tracking-wider mb-3">Delivery Sector Address</h2>
              <div className="flex gap-3 items-start bg-grove-50/70 p-3 rounded-xl border border-grove-100/50">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-grove-100 text-grove-700 shrink-0">
                  <MapPin size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-ink text-sm">Jaipur Sector</h3>
                  <p className="text-xs text-ink/75 leading-relaxed mt-0.5">
                    {activeDelivery?.userAddress || 'Sector 5, Mansarovar, Jaipur, Rajasthan'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Telemetry & Ripeness */}
            <div className="rounded-2xl border border-grove-100 bg-white p-5 shadow-soft">
              <h2 className="text-sm font-bold text-ink/80 uppercase tracking-wider mb-3.5">Crop Quality & Telemetry</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                    <span className="text-ink/80">ETA Countdown</span>
                    <span className="text-grove-700 bg-grove-50 px-2 py-0.5 rounded">{activeDelivery?.eta || '42 min'}</span>
                  </div>
                  <div className="h-2 w-full bg-grove-100/50 rounded-full overflow-hidden">
                    <div className="h-full bg-grove-700 rounded-full animate-pulse" style={{ width: activeIndex >= 3 ? '85%' : '45%' }} />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                    <span className="text-ink/80">Fruit Ripeness Level</span>
                    <span className="text-marigold bg-marigold/10 px-2 py-0.5 rounded text-[10px]">{activeDelivery?.ripeness.split('-')[0] || '70% ripe'}</span>
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
                    🔍 {activeDelivery?.ripeness || '70% ripe - ready in 2 days'}. Maturing in temperature-controlled chambers to maintain vitamin integrity.
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Card */}
            <div className="rounded-2xl border border-grove-100 bg-white p-5 shadow-soft">
              <h2 className="text-sm font-bold text-ink/80 uppercase tracking-wider mb-4">Logistics Timeline</h2>
              <div className="relative pl-6 space-y-5 border-l-2 border-grove-100 ml-2">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;
                  
                  return (
                    <div key={step} className="relative group">
                      {/* Node Bullet */}
                      <span className={`absolute -left-[32px] top-1 grid h-5 w-5 place-items-center rounded-full border transition duration-300 ${
                        done 
                          ? 'bg-grove-700 border-grove-700 text-white shadow-soft scale-105' 
                          : 'bg-white border-grove-200 text-grove-300'
                      }`}>
                        {done ? (
                          <CheckCircle2 size={11} className="stroke-[3]" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-grove-200" />
                        )}
                      </span>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold transition duration-300 ${
                          isCurrent ? 'text-grove-800 scale-[1.01]' : done ? 'text-ink/75' : 'text-ink/40'
                        }`}>
                          {getStatusLabel(step)}
                        </p>
                        <p className="text-[10px] text-ink/50 leading-normal">
                          {step === 'picked' && 'Fruits carefully plucked by farm staff.'}
                          {step === 'packed' && 'Stored in zero-waste organic mesh bags.'}
                          {step === 'shipped' && 'Van dispatched from Jobner agricultural zone.'}
                          {step === 'out_for_delivery' && 'Assigned to Sector fleet driver.'}
                          {step === 'delivered' && 'Package placed at owner doorstep.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Driver Profile Contact Card */}
            {activeDelivery?.driverContact && (
              <div className="rounded-2xl border border-grove-100 bg-gradient-to-br from-white to-grove-50/50 p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-grove-700 text-white font-extrabold shadow-sm">
                    {activeDelivery.driverContact.includes('98888') ? '👨🏽' : '👨🏽'}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-xs flex items-center gap-1.5">
                      {activeDelivery.driverContact.includes('98888') ? 'Vijay Kumar' : 'Ramesh Singh'}
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[8px] font-bold text-emerald-700"><UserCheck size={9} /> Verified</span>
                    </h3>
                    <p className="text-[10px] text-ink/60">Logistics Carrier Driver</p>
                  </div>
                </div>
                <a href={`tel:${activeDelivery.driverContact}`} className="mt-3 block">
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink hover:bg-ink/90 text-white font-bold py-2.5 text-xs transition shadow-sm">
                    <Phone size={13} /> Call Logistics Driver
                  </button>
                </a>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
