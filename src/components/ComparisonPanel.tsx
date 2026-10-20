import { ArrowRight, Dna, GitCompare } from 'lucide-react';
import type { AMRIsolate, ComparisonResult, DatasetProvenance, ResistanceGene } from '../types/amr';
import { compareIsolates } from '../lib/comparison';
import { GeneNetwork } from './GeneNetwork';
import { GeneBadge } from './GeneBadge';

interface ComparisonPanelProps {
  isolateA: AMRIsolate | null;
  isolateB: AMRIsolate | null;
  onOpenDrawer: (gene: ResistanceGene, isolate: AMRIsolate, provenance?: DatasetProvenance) => void;
  datasetProvenance: DatasetProvenance;
  onProceedToReport: () => void;
}

export function ComparisonPanel({
  isolateA,
  isolateB,
  onOpenDrawer,
  datasetProvenance,
  onProceedToReport,
}: ComparisonPanelProps) {
  if (!isolateA || !isolateB) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <GitCompare className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Pairwise Comparison Unavailable</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select two distinct isolates to view comparison and generate an evidence report.
          </p>
        </div>
      </div>
    );
  }

  const comparison: ComparisonResult = compareIsolates(isolateA, isolateB);

  return (
    <div className="space-y-6">
      {/* Top Header & Proceed Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pairwise Isolate Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Comparing resistance profiles between <strong>{isolateA.isolate_id}</strong> (Isolate A) and{' '}
            <strong>{isolateB.isolate_id}</strong> (Isolate B).
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <span>Step 4: Create & Export Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Shared Genes Card */}
        <div className="bg-white rounded-xl border-t-4 border-t-amber-500 border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Shared Gene Symbols
          </div>
          <div className="text-2xl font-mono font-bold text-amber-700">
            {comparison.shared.length}
          </div>
          <p className="text-[10px] text-slate-400">Annotated in both isolates</p>
        </div>

        {/* Unique A Card */}
        <div className="bg-white rounded-xl border-t-4 border-t-blue-600 border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            Unique to {isolateA.isolate_id}
          </div>
          <div className="text-2xl font-mono font-bold text-blue-700">
            {comparison.uniqueToA.length}
          </div>
          <p className="text-[10px] text-slate-400">Present in Isolate A only</p>
        </div>

        {/* Unique B Card */}
        <div className="bg-white rounded-xl border-t-4 border-t-emerald-600 border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            Unique to {isolateB.isolate_id}
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700">
            {comparison.uniqueToB.length}
          </div>
          <p className="text-[10px] text-slate-400">Present in Isolate B only</p>
        </div>

        {/* Jaccard Overlap Card */}
        <div className="bg-white rounded-xl border-t-4 border-t-indigo-600 border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Gene-Set Overlap
          </div>
          <div className="text-2xl font-mono font-bold text-indigo-700">
            {comparison.jaccardOverlapPercent}%
          </div>
          <p className="text-[10px] text-slate-400">
            Gene-set overlap (not genetic relatedness)
          </p>
        </div>
      </div>

      {/* SVG Network Graph */}
      <GeneNetwork
        isolateA={isolateA}
        isolateB={isolateB}
        comparison={comparison}
        onOpenDrawer={onOpenDrawer}
        datasetProvenance={datasetProvenance}
      />

      {/* Complete Uncapped Gene Lists (3 Columns) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Dna className="w-4 h-4 text-indigo-600" />
          <span>Full Resistance Gene Profiles (Uncapped)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Unique A Column */}
          <div className="space-y-3 p-4 rounded-xl bg-blue-50/30 border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">
                Unique to Isolate A ({comparison.uniqueToA.length})
              </span>
              <span className="text-[10px] font-mono text-blue-700">{isolateA.isolate_id}</span>
            </div>

            {comparison.uniqueToA.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No unique resistance genes annotated for Isolate A.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {comparison.uniqueToA.map((g) => (
                  <GeneBadge
                    key={g.key}
                    symbol={g.display}
                    theme="isolateA"
                    onClick={() => {
                      if (g.annotationsA.length > 0) {
                        onOpenDrawer(g.annotationsA[0], isolateA, datasetProvenance);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shared Column */}
          <div className="space-y-3 p-4 rounded-xl bg-amber-50/30 border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Shared Resistance Genes ({comparison.shared.length})
              </span>
              <span className="text-[10px] text-amber-700">Both Isolates</span>
            </div>

            {comparison.shared.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No shared annotated resistance genes between Isolate A and Isolate B.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {comparison.shared.map((g) => (
                  <GeneBadge
                    key={g.key}
                    symbol={g.display}
                    theme="shared"
                    onClick={() => {
                      const sampleGene = g.annotationsA[0] || g.annotationsB[0];
                      const sampleIso = g.annotationsA.length > 0 ? isolateA : isolateB;
                      if (sampleGene) {
                        onOpenDrawer(sampleGene, sampleIso, datasetProvenance);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Unique B Column */}
          <div className="space-y-3 p-4 rounded-xl bg-emerald-50/30 border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                Unique to Isolate B ({comparison.uniqueToB.length})
              </span>
              <span className="text-[10px] font-mono text-emerald-700">{isolateB.isolate_id}</span>
            </div>

            {comparison.uniqueToB.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No unique resistance genes annotated for Isolate B.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {comparison.uniqueToB.map((g) => (
                  <GeneBadge
                    key={g.key}
                    symbol={g.display}
                    theme="isolateB"
                    onClick={() => {
                      if (g.annotationsB.length > 0) {
                        onOpenDrawer(g.annotationsB[0], isolateB, datasetProvenance);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
