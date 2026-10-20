import type { AMRIsolate, ComparisonResult, GeneGroup, ResistanceGene } from '../types/amr';
import { normalizeGeneSymbol } from './normalizeData';

export function compareIsolates(isolateA: AMRIsolate, isolateB: AMRIsolate): ComparisonResult {
  const mapA = new Map<string, { display: string; annotations: ResistanceGene[] }>();
  const mapB = new Map<string, { display: string; annotations: ResistanceGene[] }>();

  for (const gene of isolateA.resistance_genes || []) {
    const key = normalizeGeneSymbol(gene.gene_symbol);
    if (!key) continue;
    const existing = mapA.get(key);
    if (!existing) {
      mapA.set(key, {
        display: (gene.gene_symbol || '').trim(),
        annotations: [gene],
      });
    } else {
      existing.annotations.push(gene);
    }
  }

  for (const gene of isolateB.resistance_genes || []) {
    const key = normalizeGeneSymbol(gene.gene_symbol);
    if (!key) continue;
    const existing = mapB.get(key);
    if (!existing) {
      mapB.set(key, {
        display: (gene.gene_symbol || '').trim(),
        annotations: [gene],
      });
    } else {
      existing.annotations.push(gene);
    }
  }

  const allKeys = new Set<string>([...mapA.keys(), ...mapB.keys()]);
  const shared: GeneGroup[] = [];
  const uniqueToA: GeneGroup[] = [];
  const uniqueToB: GeneGroup[] = [];

  for (const key of allKeys) {
    const entryA = mapA.get(key);
    const entryB = mapB.get(key);

    if (entryA && entryB) {
      shared.push({
        key,
        display: entryA.display,
        annotationsA: entryA.annotations,
        annotationsB: entryB.annotations,
      });
    } else if (entryA) {
      uniqueToA.push({
        key,
        display: entryA.display,
        annotationsA: entryA.annotations,
        annotationsB: [],
      });
    } else if (entryB) {
      uniqueToB.push({
        key,
        display: entryB.display,
        annotationsA: [],
        annotationsB: entryB.annotations,
      });
    }
  }

  shared.sort((a, b) => a.key.localeCompare(b.key));
  uniqueToA.sort((a, b) => a.key.localeCompare(b.key));
  uniqueToB.sort((a, b) => a.key.localeCompare(b.key));

  const unionCount = shared.length + uniqueToA.length + uniqueToB.length;
  const jaccardOverlapPercent =
    unionCount === 0 ? 0 : Math.round((shared.length / unionCount) * 1000) / 10;

  return {
    shared,
    uniqueToA,
    uniqueToB,
    unionCount,
    jaccardOverlapPercent,
  };
}
