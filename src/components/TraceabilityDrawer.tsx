import { useEffect, useRef } from 'react';
import { AlertTriangle, Database, ExternalLink, Info, X } from 'lucide-react';
import type { DrawerItemState } from '../hooks/useAMRAtlas';
import { isValidHttpUrl } from '../lib/normalizeData';

interface TraceabilityDrawerProps {
  drawerItem: DrawerItemState | null;
  onClose: () => void;
}

export function TraceabilityDrawer({ drawerItem, onClose }: TraceabilityDrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerItem, onClose]);

  if (!drawerItem) return null;

  const { gene, allAnnotationsForSymbol, isolate, provenance } = drawerItem;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const formatText = (val?: string) => (val && val.trim() ? val.trim() : 'Not provided');

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Gene traceability drawer for ${gene.gene_symbol}`}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm transition-all"
    >
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-slideInRight border-l border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold tracking-tight">Gene Traceability Drawer</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 text-slate-800">
          {/* Provenance Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                provenance === 'demo'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-sky-100 text-sky-900 border border-sky-300'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              {provenance === 'demo' ? 'Demo Modeled Isolate' : 'User-Imported Record'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Isolate: <strong>{isolate.isolate_id}</strong>
            </span>
          </div>

          {/* Gene Symbol & Class Header Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Resistance Gene Symbol
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 break-words">
              {gene.gene_symbol}
            </div>
            <div className="flex items-center gap-2 pt-1 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Resistance Class:</span>
              <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 text-xs font-medium">
                {formatText(gene.gene_class)}
              </span>
            </div>
          </div>

          {/* Primary Verification Link */}
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              NCBI Database Reference
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Source Accession:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatText(gene.source_accession)}
                </span>
              </div>

              {isValidHttpUrl(gene.source_url) ? (
                <a
                  href={gene.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  <span>Look up at NCBI ↗</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <div className="w-full text-center py-2 px-3 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200">
                  No verification link available
                </div>
              )}
            </div>
          </div>

          {/* Multiple Annotations List if applicable */}
          {allAnnotationsForSymbol.length > 1 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                All Recorded Annotations for {gene.gene_symbol} ({allAnnotationsForSymbol.length})
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                {allAnnotationsForSymbol.map((ann, idx) => (
                  <div key={idx} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-slate-700">Record #{idx + 1}</span>
                      <span className="text-slate-600">Acc: {formatText(ann.source_accession)}</span>
                    </div>
                    {isValidHttpUrl(ann.source_url) ? (
                      <a
                        href={ann.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium pt-1"
                      >
                        <span>Look up at NCBI ↗</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">No link available</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Isolate Context Metadata */}
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Isolate Context
            </div>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white text-xs">
              <div className="flex justify-between px-3.5 py-2.5">
                <span className="text-slate-500 font-medium">Isolate ID:</span>
                <span className="font-mono font-semibold text-slate-900">{isolate.isolate_id}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2.5">
                <span className="text-slate-500 font-medium">Organism:</span>
                <span className="italic text-slate-800">{formatText(isolate.organism_name)}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2.5">
                <span className="text-slate-500 font-medium">Collection Location:</span>
                <span className="text-slate-800">{formatText(isolate.collection_location)}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2.5">
                <span className="text-slate-500 font-medium">Collection Date:</span>
                <span className="text-slate-800">{formatText(isolate.collection_date)}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2.5">
                <span className="text-slate-500 font-medium">Reported Susceptibility:</span>
                <span className="text-slate-800">{formatText(isolate.susceptibility_result)}</span>
              </div>
            </div>
          </div>

          {/* Conditional Provenance Caveat Alert */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Scientific & Provenance Caveat</span>
            </div>
            {provenance === 'demo' ? (
              <p className="leading-relaxed">
                Reference record for this gene symbol; not this isolate&apos;s sequence. Presence of an annotation does not prove phenotypic resistance.
              </p>
            ) : (
              <p className="leading-relaxed">
                Accession and link come from the imported file, or were generated by AMR Atlas as a gene-name search link. AMR Atlas has not checked them. Presence of an annotation does not prove phenotypic resistance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
