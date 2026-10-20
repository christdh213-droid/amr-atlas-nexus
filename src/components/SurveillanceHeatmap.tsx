import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Grid, Info } from 'lucide-react';
import type { AMRIsolate, DatasetProvenance, ResistanceGene } from '../types/amr';
import { normalizeGeneSymbol } from '../lib/normalizeData';
import { SEMANTIC_STYLES } from '../lib/constants';

interface SurveillanceHeatmapProps {
  filteredIsolates: AMRIsolate[];
  isolateAId: string | null;
  isolateBId: string | null;
  onOpenDrawer: (gene: ResistanceGene, isolate: AMRIsolate, provenance?: DatasetProvenance) => void;
  datasetProvenance: DatasetProvenance;
}

export function SurveillanceHeatmap({
  filteredIsolates,
  isolateAId,
  isolateBId,
  onOpenDrawer,
  datasetProvenance,
}: SurveillanceHeatmapProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute top 12 gene symbols across filtered isolates
  const topGenes = useMemo(() => {
    const counts = new Map<string, { display: string; count: number }>();

    for (const iso of filteredIsolates) {
      const seenInIso = new Set<string>();
      for (const g of iso.resistance_genes || []) {
        const key = normalizeGeneSymbol(g.gene_symbol);
        if (!key || seenInIso.has(key)) continue;
        seenInIso.add(key);

        const cur = counts.get(key);
        if (!cur) {
          counts.set(key, { display: g.gene_symbol.trim(), count: 1 });
        } else {
          cur.count++;
        }
      }
    }

    // Sort deterministically: count descending, then alphabetical by key
    const sorted = Array.from(counts.entries()).sort((a, b) => {
      if (b[1].count !== a[1].count) {
        return b[1].count - a[1].count;
      }
      return a[0].localeCompare(b[0]);
    });

    return sorted.slice(0, 12).map(([key, val]) => ({
      key,
      display: val.display,
      count: val.count,
    }));
  }, [filteredIsolates]);

  // Display up to 50 filtered isolates
  const displayIsolates = useMemo(
    () => filteredIsolates.slice(0, 50),
    [filteredIsolates]
  );

  if (filteredIsolates.length === 0 || topGenes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar with toggle */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Grid className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Cohort Gene Presence Matrix (Top {topGenes.length} Genes)
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 cursor-pointer"
        >
          <span>{isExpanded ? 'Collapse Matrix' : 'Expand Matrix'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Caption */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Counts reflect frequency within the active filtered dataset only, not clinical or population prevalence.
              {filteredIsolates.length > 50 && (
                <span className="font-semibold text-slate-700 ml-1">
                  Showing first 50 of {filteredIsolates.length} filtered isolates in matrix.
                </span>
              )}
            </p>
          </div>

          {/* Matrix Table Container */}
          <div className="max-h-96 overflow-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 border-b border-slate-200 shadow-xs">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-semibold min-w-[150px] bg-slate-100">
                    Isolate ID
                  </th>
                  {topGenes.map((gene) => (
                    <th
                      key={gene.key}
                      scope="col"
                      className="px-2 py-2 text-center font-mono text-[11px] font-semibold min-w-[85px] bg-slate-100"
                      title={`${gene.display} (in ${gene.count} filtered isolates)`}
                    >
                      <div className="truncate">{gene.display}</div>
                      <div className="text-[10px] text-slate-500 font-sans font-normal">
                        ({gene.count})
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayIsolates.map((iso) => {
                  const isA = iso.isolate_id === isolateAId;
                  const isB = iso.isolate_id === isolateBId;

                  const rowClass = isA
                    ? 'bg-blue-50/60 font-medium'
                    : isB
                    ? 'bg-emerald-50/60 font-medium'
                    : 'hover:bg-slate-50';

                  // Map genes present in this isolate
                  const isoGenesMap = new Map<string, ResistanceGene>();
                  for (const g of iso.resistance_genes || []) {
                    const key = normalizeGeneSymbol(g.gene_symbol);
                    if (!isoGenesMap.has(key)) {
                      isoGenesMap.set(key, g);
                    }
                  }

                  return (
                    <tr key={iso.isolate_id} className={`transition-colors ${rowClass}`}>
                      <td className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{iso.isolate_id}</span>
                          {isA && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              A
                            </span>
                          )}
                          {isB && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              B
                            </span>
                          )}
                        </div>
                      </td>

                      {topGenes.map((gene) => {
                        const presentGene = isoGenesMap.get(gene.key);

                        if (presentGene) {
                          const themeKey = isA ? 'isolateA' : isB ? 'isolateB' : 'shared';
                          const badgeStyle = SEMANTIC_STYLES[themeKey].badge;

                          return (
                            <td key={gene.key} className="px-2 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => onOpenDrawer(presentGene, iso, datasetProvenance)}
                                title={`Inspect ${presentGene.gene_symbol} in ${iso.isolate_id}`}
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs border transition-transform hover:scale-110 cursor-pointer ${badgeStyle}`}
                              >
                                ●
                              </button>
                            </td>
                          );
                        }

                        return (
                          <td key={gene.key} className="px-2 py-1.5 text-center text-slate-300 select-none">
                            —
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
