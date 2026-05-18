"use client";

import { useParams as useNextParams, useRouter as useNextRouter } from "next/navigation";
import { ArrowLeft, Leaf, Sparkles, HelpCircle, QrCode } from "lucide-react";
import { useTree } from "@/hooks/useFirestore";
import { Button } from "@/components/Button";
import Link from "next/link";
import Script from "next/script";
import QRCode from "react-qr-code";
import dynamic from "next/dynamic";

const ModelViewer3D = dynamic(() => import("@/components/ModelViewer3D").then((mod) => mod.ModelViewer3D), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#111c14] text-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-grove-500 border-t-transparent" />
      <p className="mt-4 text-xs font-semibold tracking-wider text-grove-200">Starting Web3D Engine...</p>
    </div>
  )
});

export default function ARPlaygroundPage() {
  const treeId = useNextParams().treeId as string;
  const router = useNextRouter();
  const { data: tree } = useTree(treeId as string);

  if (!tree) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-ink text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-grove-500 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold">Retrieving tree details...</p>
      </div>
    );
  }

  // Generate current URL for mobile AR scanning
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="min-h-screen bg-ink text-white">
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        type="module"
        strategy="afterInteractive"
      />
      {/* Immersive Dark Nav Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/90 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/tree/${treeId}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-marigold">Interactive Playground</p>
              <h1 className="text-lg font-black tracking-tight">{tree.userGivenName || `${tree.type} Tree`}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-grove-900 border border-grove-700/50 px-3 py-1 text-xs font-semibold text-grove-200">
              <Leaf size={12} className="text-grove-400" />
              AR Calibrated
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <section className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[1fr_360px] lg:py-6">
        {/* Left: Beautiful Large 3D Engine */}
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 p-1 flex-1 flex flex-col justify-between">
            <ModelViewer3D 
              src="/tree.glb" 
              alt={tree.userGivenName || `${tree.type} tree`} 
              className="flex-1 w-full"
            />
          </div>
        </div>

        {/* Right: Telemetry & AR Calibration Guide */}
        <aside className="space-y-6">
          {/* Quick Specs telemetry card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-marigold flex items-center gap-1.5 mb-4">
              <Sparkles size={14} />
              Telemetry Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                <span className="text-[10px] text-white/50 block font-semibold uppercase">Zone Location</span>
                <span className="text-sm font-bold text-white mt-1 block">{tree.zone}</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                <span className="text-[10px] text-white/50 block font-semibold uppercase">Row Index</span>
                <span className="text-sm font-bold text-white mt-1 block">Row {tree.row}</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                <span className="text-[10px] text-white/50 block font-semibold uppercase">Soil Moisture</span>
                <span className="text-sm font-bold text-grove-400 mt-1 block">{tree.soilMoisture || 74}%</span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                <span className="text-[10px] text-white/50 block font-semibold uppercase">Status</span>
                <span className="text-sm font-bold text-marigold mt-1 block capitalize">{tree.status}</span>
              </div>
            </div>
          </div>

          {/* AR How-To Guide */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5 mb-4">
              <HelpCircle size={14} className="text-grove-400" />
              How to view in AR
            </h2>
            <ol className="space-y-4 text-xs text-white/80">
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grove-700 font-bold text-white">1</span>
                <div>
                  <p className="font-semibold text-white">Open on Mobile Device</p>
                  <p className="text-white/60 mt-0.5">Scan the QR code below using your phone camera to open this dynamic viewer directly.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grove-700 font-bold text-white">2</span>
                <div>
                  <p className="font-semibold text-white">Tap "View in AR"</p>
                  <p className="text-white/60 mt-0.5">Press the gold button on the bottom right of the 3D scene to start augmented reality.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grove-700 font-bold text-white">3</span>
                <div>
                  <p className="font-semibold text-white">Calibrate and Position</p>
                  <p className="text-white/60 mt-0.5">Scan any flat floor surface, tap to anchor the tree, and pinch to rotate or scale.</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Mobile QR Code Scanner Panel */}
          {shareUrl && (
            <div className="rounded-2xl border border-grove-500/20 bg-grove-950/40 p-5 backdrop-blur-md flex flex-col items-center text-center">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase mb-3">
                <QrCode size={14} className="text-marigold" />
                Scan to View on Mobile
              </h3>
              <div className="rounded-xl bg-white p-2.5 shadow-md">
                <QRCode value={shareUrl} size={120} className="w-[120px] h-[120px]" />
              </div>
              <p className="text-[10px] text-white/50 mt-3 max-w-[200px]">
                Requires iOS 12+ (Safari Quick Look) or Android 7.0+ (Chrome Scene Viewer)
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
