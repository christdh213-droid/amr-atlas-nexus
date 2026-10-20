import { Check, Dna, RotateCcw } from 'lucide-react';
import type { AMRIsolate, DatasetProvenance, ResistanceGene } from '../types/amr';
import { GeneBadge } from './GeneBadge';

interface IsolateSelectorProps {
  isolates: AMRIsolate[];
  isolateAId: string | null;
  isolateBId: string | null;
  onSelectA: (id: string | null) => void;
  onSelectB: (id: string | null) => void;
  onOpenDrawer: (gene: ResistanceGene, isolate: AMRIsolate, provenance?: DatasetProvenance) => void;
  datasetProvenance: DatasetProvenance;
  onResetFilters: () => void;
}

export function IsolateSelector({
  isolates,
  isolateAId,
  isolateBId,
  onSelectA,
  onSelectB,
  onOpenDrawer,
  datasetProvenance,
  onResetFilters,
}: IsolateSelectorProps) {
  const formatField = (val?: string) => (val && val.trim() ? val.trim() : 'Not provided');

  if (isolates.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Dna className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">No isolates match the active filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, organism, gene symbol, or resistance class filters.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th scope="col" className="px-4 py-3 min-w-[140px]">
                Isolate ID
              </th>
              <th scope="col" className="px-4 py-3 min-w-[160px]">
                Organism
              </th>
              <th scope="col" className="px-4 py-3 min-w-[140px]">
                Location
              </th>
              <th scope="col" className="px-4 py-3 min-w-[110px]">
                Collection Date
              </th>
              <th scope="col" className="px-4 py-3 min-w-[160px]">
                Susceptibility Phenotype
              </th>
              <th scope="col" className="px-4 py-3 min-w-[240px]">
                Resistance Genes
              </th>
              <th scope="col" className="px-4 py-3 min-w-[160px] text-center">
                Compare Selection
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isolates.map((iso) => {
              const isSelectedA = iso.isolate_id === isolateAId;
              const isSelectedB = iso.isolate_id === isolateBId;

              const rowBg = isSelectedA
                ? 'bg-blue-50/40 hover:bg-blue-50/70'
                : isSelectedB
                ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                : 'hover:bg-slate-50/70';

              return (
                <tr key={iso.isolate_id} className={`transition-colors ${rowBg}`}>
                  {/* Isolate ID */}
                  <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{iso.isolate_id}</span>
                      {isSelectedA && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-sans bg-blue-100 text-blue-800 border border-blue-200">
                          Isolate A
                        </span>
                      )}
                      {isSelectedB && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-sans bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Isolate B
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Organism */}
                  <td className="px-4 py-3 italic whitespace-nowrap font-medium text-slate-800">
                    {formatField(iso.organism_name)}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 whitespace-nowrap">{formatField(iso.collection_location)}</td>

                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap">{formatField(iso.collection_date)}</td>

                  {/* Susceptibility */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {formatField(iso.susceptibility_result)}
                    </span>
                  </td>

                  {/* Genes */}
                  <td className="px-4 py-3">
                    {iso.resistance_genes.length === 0 ? (
                      <span className="text-slate-400 italic text-[11px]">
                        No resistance genes annotated
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                        <span className="text-[10px] font-semibold text-slate-500 mr-1">
                          ({iso.resistance_genes.length})
                        </span>
                        {iso.resistance_genes.map((g, idx) => (
                          <GeneBadge
                            key={`${g.gene_symbol}-${idx}`}
                            symbol={g.gene_symbol}
                            compact
                            onClick={() => onOpenDrawer(g, iso, datasetProvenance)}
                            title={`Inspect ${g.gene_symbol} in ${iso.isolate_id}`}
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Compare Selection */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectA(isSelectedA ? null : iso.isolate_id)}
                        aria-pressed={isSelectedA}
                        title={isSelectedA ? 'Unselect Isolate A' : 'Select as Isolate A'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          isSelectedA
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                        }`}
                      >
                        {isSelectedA && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>Select A</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectB(isSelectedB ? null : iso.isolate_id)}
                        aria-pressed={isSelectedB}
                        title={isSelectedB ? 'Unselect Isolate B' : 'Select as Isolate B'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          isSelectedB
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
                        }`}
                      >
                        {isSelectedB && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>Select B</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
