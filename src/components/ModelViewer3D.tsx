"use client";

import { useEffect, useRef, useState } from "react";
import { 
  RotateCw, 
  Sun, 
  UploadCloud, 
  Sparkles, 
  RefreshCw, 
  Info,
  Maximize2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ModelViewer3DProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ModelViewer3D({ src: defaultSrc, alt = "3D Tree Model", className = "" }: ModelViewer3DProps) {
  const [src, setSrc] = useState(defaultSrc);
  const [isCustom, setIsCustom] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [exposure, setExposure] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const modelViewerRef = useRef<any>(null);

  // Monitor source changes to trigger loading spinner
  useEffect(() => {
    setIsLoading(true);
    setUploadError("");
  }, [src]);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setUploadError("Failed to render 3D model. Ensure it is a valid GLTF/GLB file.");
    };

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [src]);

  // Handle local GLB upload
  const handleGlbFile = (file: File) => {
    if (!file.name.endsWith(".glb") && !file.name.endsWith(".gltf")) {
      setUploadError("Please upload only .glb or .gltf files.");
      setUploadSuccess(false);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setSrc(url);
      setIsCustom(true);
      setUploadError("");
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError("Error loading file. Please try again.");
      setUploadSuccess(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleGlbFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleGlbFile(e.target.files[0]);
    }
  };

  const resetToDefault = () => {
    setSrc(defaultSrc);
    setIsCustom(false);
    setUploadError("");
  };

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl border border-grove-100 bg-[#142018] text-white shadow-soft ${className}`}>
      {/* Main 3D Canvas */}
      <div 
        className={`relative flex-1 min-h-[400px] w-full transition-all duration-300 ${dragActive ? "bg-grove-900/50 scale-[0.99]" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink/80 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-grove-500 border-t-transparent" />
            <p className="mt-4 text-sm font-semibold tracking-wide text-grove-100">Loading 3D Engine...</p>
          </div>
        )}

        {/* Drag Over Immersive Mask */}
        {dragActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center border-4 border-dashed border-grove-500 bg-grove-900/90 m-3 rounded-xl animate-pulse">
            <UploadCloud size={48} className="text-grove-100 animate-bounce" />
            <p className="mt-4 text-lg font-bold text-grove-50">Drop your .glb model here!</p>
            <p className="text-sm text-grove-100/70">It will load instantly in the interactive scene</p>
          </div>
        )}

        <model-viewer
          ref={modelViewerRef}
          src={src}
          alt={alt}
          camera-controls
          auto-rotate={autoRotate ? true : undefined}
          shadow-intensity={shadows ? "1" : "0"}
          exposure={exposure.toString()}
          ar
          ar-modes="webxr scene-viewer quick-look"
          interaction-prompt="auto"
          style={{ width: "100%", height: "100%", minHeight: "400px", display: "block" }}
        >
          {/* AR Prompt Overlay Button */}
          <button 
            slot="ar-button" 
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-marigold px-4 py-2 text-sm font-bold text-ink shadow-soft hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles size={16} /> View in AR
          </button>
        </model-viewer>

        {/* Floating Top Left Controls */}
        <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
          <div className="rounded-xl bg-ink/75 backdrop-blur border border-white/10 px-3 py-1.5 text-xs font-semibold text-grove-50 flex items-center gap-1.5 shadow-md">
            <Info size={14} className="text-marigold" />
            {isCustom ? "Custom .GLB Model" : "Rajasthan Papaya Tree"}
          </div>
          {isCustom && (
            <button 
              onClick={resetToDefault}
              className="w-fit flex items-center gap-1.5 rounded-lg bg-red-950/80 hover:bg-red-900/90 text-red-100 px-3 py-1.5 text-xs font-bold border border-red-500/30 transition shadow-md"
            >
              <RefreshCw size={12} /> Reset to Default
            </button>
          )}
        </div>

        {/* Dynamic State Overlay Alerts */}
        <div className="absolute left-4 bottom-4 max-w-xs z-10 space-y-2">
          {uploadError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-900/90 border border-red-500/50 p-2.5 text-xs text-white shadow-lg animate-slide-in">
              <AlertCircle size={16} className="shrink-0 text-red-200" />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-grove-700/90 border border-grove-500/50 p-2.5 text-xs text-white shadow-lg animate-slide-in">
              <CheckCircle size={16} className="shrink-0 text-grove-200" />
              <span>Successfully loaded custom 3D model!</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Dashboard Controls */}
      <div className="border-t border-white/10 bg-ink/90 p-4 backdrop-blur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Left: Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                autoRotate 
                  ? "bg-grove-700 text-white border border-grove-500" 
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              <RotateCw size={14} className={autoRotate ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
              Auto-Rotate: {autoRotate ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => setShadows(!shadows)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                shadows 
                  ? "bg-grove-700 text-white border border-grove-500" 
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
              }`}
            >
              <Sparkles size={14} />
              Shadows: {shadows ? "REALISTIC" : "OFF"}
            </button>
          </div>

          {/* Right: Lighting Exposure & Upload File Picker */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white/70">
              <Sun size={14} className="text-marigold" />
              <span>Exposure</span>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.1"
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-24 accent-grove-500 h-1 rounded bg-white/20"
              />
              <span className="min-w-[20px] text-right">{exposure.toFixed(1)}</span>
            </div>

            {/* Custom GLB Picker */}
            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2 text-xs font-bold text-white transition active:scale-95">
              <UploadCloud size={14} className="text-grove-100" />
              <span>Import custom .glb</span>
              <input
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Small tips overlay */}
        <p className="mt-3 text-[10px] text-white/40 flex items-center justify-center gap-1">
          <Maximize2 size={10} />
          Drag and rotate to view 3D details. Double click to focus camera. Drag & Drop any local `.glb` file onto the window to display it.
        </p>
      </div>
    </div>
  );
}
