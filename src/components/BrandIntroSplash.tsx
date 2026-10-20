import { useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface BrandIntroSplashProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrandIntroSplash({ isOpen, onClose }: BrandIntroSplashProps) {
  useEffect(() => {
    if (!isOpen) return;

    let reducedMotion = false;
    try {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reducedMotion = false;
    }

    const duration = reducedMotion ? 300 : 1800;

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem('amr_intro_seen', 'true');
      } catch {
        // Safe fallback for restricted storage environments
      }
      onClose();
    }, duration);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        try {
          sessionStorage.setItem('amr_intro_seen', 'true');
        } catch {
          // ignore
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleManualDismiss = () => {
    try {
      sessionStorage.setItem('amr_intro_seen', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to AMR Atlas"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 backdrop-blur-md transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-lg text-center space-y-6 animate-fadeIn">
        {/* Animated SVG Network Emblem */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="50" cy="50" r="42" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 6" className="animate-spin-slow opacity-60" />
            <circle cx="50" cy="22" r="7" fill="#2563eb" />
            <circle cx="26" cy="68" r="7" fill="#d97706" />
            <circle cx="74" cy="68" r="7" fill="#059669" />
            <line x1="50" y1="22" x2="26" y2="68" stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1="50" y1="22" x2="74" y2="68" stroke="#10b981" strokeWidth="2.5" strokeOpacity="0.8" />
            <line x1="26" y1="68" x2="74" y2="68" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="10" fill="#4f46e5" className="animate-ping opacity-40" />
            <circle cx="50" cy="50" r="5" fill="#ffffff" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-medium text-indigo-300 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Genomic Surveillance Workspace
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            AMR ATLAS
          </h1>
          <p className="text-base sm:text-lg font-light text-slate-300 tracking-wide">
            Explore. Trace. Compare.
          </p>
        </div>

        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Transform flat isolate-gene records into interactive cohort surveillance heatmaps, pairwise bipartite networks, and auditable evidence briefs.
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleManualDismiss}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <span>Skip Intro / Enter Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
