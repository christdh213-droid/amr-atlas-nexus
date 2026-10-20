import { useRef } from 'react';
import {
  ArrowLeftRight,
  Download,
  Dna,
  Play,
  RotateCcw,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { ImportFeedbackState } from '../hooks/useAMRAtlas';
import type { AMRIsolate, DatasetProvenance, ImportResult } from '../types/amr';
import { importCsvText } from '../lib/csvImport';

interface AppHeaderProps {
  datasetProvenance: DatasetProvenance;
  isolateA: AMRIsolate | null;
  isolateB: AMRIsolate | null;
  onSwapSlots: () => void;
  onResetToDemo: () => void;
  onImportResult: (res: ImportResult) => void;
  onReplayIntro: () => void;
  importFeedback: ImportFeedbackState | null;
  onDismissFeedback: () => void;
  onJumpToCompare: () => void;
}

export function AppHeader({
  datasetProvenance,
  isolateA,
  isolateB,
  onSwapSlots,
  onResetToDemo,
  onImportResult,
  onReplayIntro,
  importFeedback,
  onDismissFeedback,
  onJumpToCompare,
}: AppHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow re-uploading the same file if desired
    e.target.value = '';

    // Check extension only (do NOT check MIME type due to Windows registry variations)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onImportResult({
        ok: false,
        error: 'Invalid file format: Please select a file with a .csv extension.',
        warnings: [],
        isolates: [],
        rowsRead: 0,
        isolatesCreated: 0,
        genesAdded: 0,
        duplicatesIgnored: 0,
        nonAmrRowsSkipped: 0,
        metadataConflicts: 0,
        invalidRowsSkipped: 0,
        invalidRowNumbers: [],
      });
      return;
    }

    // Size limit check (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      onImportResult({
        ok: false,
        error: 'File size exceeds the 2 MB limit. Please filter your dataset before importing.',
        warnings: [],
        isolates: [],
        rowsRead: 0,
        isolatesCreated: 0,
        genesAdded: 0,
        duplicatesIgnored: 0,
        nonAmrRowsSkipped: 0,
        metadataConflicts: 0,
        invalidRowsSkipped: 0,
        invalidRowNumbers: [],
      });
      return;
    }

    try {
      const text = await file.text();
      const parsed = importCsvText(text);
      onImportResult(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error reading file';
      onImportResult({
        ok: false,
        error: `Could not read CSV file: ${message}`,
        warnings: [],
        isolates: [],
        rowsRead: 0,
        isolatesCreated: 0,
        genesAdded: 0,
        duplicatesIgnored: 0,
        nonAmrRowsSkipped: 0,
        metadataConflicts: 0,
        invalidRowsSkipped: 0,
        invalidRowNumbers: [],
      });
    }
  };

  const sampleCsvUrl = `${import.meta.env.BASE_URL}sample-isolates.csv`;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Provenance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  AMR ATLAS
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  BioPulse
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light">
                Antimicrobial Resistance Surveillance & Isolate Comparator
              </p>
            </div>
          </div>

          {/* Dataset Provenance Badge */}
          <div className="hidden lg:block">
            {datasetProvenance === 'demo' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                DEMO DATA — Modeled Isolates (Reference Accessions)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-950/70 text-sky-300 border border-sky-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                IMPORTED CSV DATA — Unverified User File
              </span>
            )}
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload isolate CSV file"
          />

          <button
            type="button"
            onClick={handleTriggerUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <a
            href={sampleCsvUrl}
            download="amr-atlas-sample-isolates.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </a>

          {datasetProvenance === 'imported' && (
            <button
              type="button"
              onClick={onResetToDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/70 text-amber-300 text-xs font-medium transition-colors border border-amber-800/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReplayIntro}
            title="Replay intro splash animation"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intro</span>
          </button>
        </div>
      </div>

      {/* Persistent Comparison Dock */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="text-slate-400 font-medium">Active Pair:</span>

            {/* Isolate A Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 border border-blue-700/80">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-semibold text-blue-200">A:</span>
              <span className="font-mono">{isolateA ? isolateA.isolate_id : 'None selected'}</span>
              {isolateA && (
                <span className="text-[10px] text-blue-400 font-sans">
                  ({isolateA.resistance_genes.length} genes)
                </span>
              )}
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={onSwapSlots}
              disabled={!isolateA && !isolateB}
              title="Swap Isolate A and Isolate B"
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-400" />
              <span>Swap A ⇄ B</span>
            </button>

            {/* Isolate B Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-200">B:</span>
              <span className="font-mono">{isolateB ? isolateB.isolate_id : 'None selected'}</span>
              {isolateB && (
                <span className="text-[10px] text-emerald-400 font-sans">
                  ({isolateB.resistance_genes.length} genes)
                </span>
              )}
            </div>
          </div>

          {/* Quick Jump Action */}
          {isolateA && isolateB && (
            <button
              type="button"
              onClick={onJumpToCompare}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              View Pair Comparison →
            </button>
          )}
        </div>
      </div>

      {/* Dismissible Import Feedback Banner */}
      {importFeedback && (
        <div
          role={importFeedback.type === 'error' ? 'alert' : 'status'}
          className={`border-b px-4 sm:px-6 lg:px-8 py-2.5 text-xs transition-all ${
            importFeedback.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-800'
              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {importFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-medium font-mono">{importFeedback.summary}</div>
                {importFeedback.details && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] opacity-90">
                    {importFeedback.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onDismissFeedback}
              aria-label="Dismiss message"
              className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
