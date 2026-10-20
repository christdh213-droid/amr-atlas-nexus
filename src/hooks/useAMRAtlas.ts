import { useMemo, useState } from 'react';
import rawDemoSeed from '../data/demo_seed_data.json';
import { loadSeedIsolates, normalizeGeneSymbol } from '../lib/normalizeData';
import type { AMRIsolate, DatasetProvenance, ImportResult, ResistanceGene } from '../types/amr';

export interface DrawerItemState {
  gene: ResistanceGene;
  allAnnotationsForSymbol: ResistanceGene[];
  isolate: AMRIsolate;
  provenance: DatasetProvenance;
}

export interface ImportFeedbackState {
  type: 'success' | 'error';
  summary: string;
  details?: string[];
}

export function useAMRAtlas() {
  const [isolates, setIsolates] = useState<AMRIsolate[]>(() =>
    loadSeedIsolates(rawDemoSeed)
  );
  const [datasetProvenance, setDatasetProvenance] = useState<DatasetProvenance>('demo');
  const [searchQuery, setSearchQuery] = useState('');
  const [organismFilter, setOrganismFilter] = useState('');
  const [geneFilter, setGeneFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [isolateAId, setIsolateAId] = useState<string | null>('DEMO-KP-001');
  const [isolateBId, setIsolateBId] = useState<string | null>('DEMO-EC-002');

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [drawerItem, setDrawerItem] = useState<DrawerItemState | null>(null);
  const [importFeedback, setImportFeedback] = useState<ImportFeedbackState | null>(null);

  // Look up selected isolates from full active isolates array (pinned selection rule)
  const isolateA = useMemo(
    () => (isolateAId ? isolates.find((i) => i.isolate_id === isolateAId) ?? null : null),
    [isolates, isolateAId]
  );
  const isolateB = useMemo(
    () => (isolateBId ? isolates.find((i) => i.isolate_id === isolateBId) ?? null : null),
    [isolates, isolateBId]
  );

  // Bidirectional swap logic
  const selectIsolateA = (id: string | null) => {
    if (id === null) {
      setIsolateAId(null);
      return;
    }
    if (id === isolateAId) return; // no-op
    if (id === isolateBId) {
      setIsolateBId(isolateAId);
      setIsolateAId(id);
      return;
    }
    setIsolateAId(id);
  };

  const selectIsolateB = (id: string | null) => {
    if (id === null) {
      setIsolateBId(null);
      return;
    }
    if (id === isolateBId) return; // no-op
    if (id === isolateAId) {
      setIsolateAId(isolateBId);
      setIsolateBId(id);
      return;
    }
    setIsolateBId(id);
  };

  const swapSlots = () => {
    const tempA = isolateAId;
    const tempB = isolateBId;
    setIsolateAId(tempB);
    setIsolateBId(tempA);
  };

  // Dropdown filter options
  const organismOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const iso of isolates) {
      const raw = (iso.organism_name || '').trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, raw);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [isolates]);

  const geneOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const iso of isolates) {
      for (const g of iso.resistance_genes || []) {
        const raw = (g.gene_symbol || '').trim();
        if (!raw) continue;
        const key = normalizeGeneSymbol(raw);
        if (!seen.has(key)) {
          seen.set(key, raw);
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [isolates]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const iso of isolates) {
      for (const g of iso.resistance_genes || []) {
        const raw = (g.gene_class || '').trim();
        if (!raw) continue;
        const tokens = raw.split('/').map((t) => t.trim().toUpperCase()).filter(Boolean);
        for (const tok of tokens) {
          set.add(tok);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [isolates]);

  // Combined filtering
  const filteredIsolates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const org = organismFilter.trim().toLowerCase();
    const geneNorm = geneFilter ? normalizeGeneSymbol(geneFilter) : '';
    const clsNorm = classFilter.trim().toUpperCase();

    return isolates.filter((iso) => {
      if (org && (iso.organism_name || '').trim().toLowerCase() !== org) {
        return false;
      }
      if (geneNorm) {
        const hasGene = iso.resistance_genes.some(
          (g) => normalizeGeneSymbol(g.gene_symbol) === geneNorm
        );
        if (!hasGene) return false;
      }
      if (clsNorm) {
        const hasClass = iso.resistance_genes.some((g) => {
          const clsTokens = (g.gene_class || '')
            .split('/')
            .map((t) => t.trim().toUpperCase());
          return clsTokens.includes(clsNorm);
        });
        if (!hasClass) return false;
      }
      if (q) {
        const idMatch = iso.isolate_id.toLowerCase().includes(q);
        const orgMatch = iso.organism_name.toLowerCase().includes(q);
        const locMatch = iso.collection_location.toLowerCase().includes(q);
        if (!idMatch && !orgMatch && !locMatch) return false;
      }
      return true;
    });
  }, [isolates, searchQuery, organismFilter, geneFilter, classFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setOrganismFilter('');
    setGeneFilter('');
    setClassFilter('');
  };

  const resetToDemo = () => {
    const initial = loadSeedIsolates(rawDemoSeed);
    setIsolates(initial);
    setDatasetProvenance('demo');
    setDrawerItem(null);
    resetFilters();
    setIsolateAId('DEMO-KP-001');
    setIsolateBId('DEMO-EC-002');
    setImportFeedback({
      type: 'success',
      summary: 'Restored 16 modeled demo isolates with reference accessions.',
    });
  };

  const handleImportResult = (res: ImportResult) => {
    if (!res.ok) {
      setImportFeedback({
        type: 'error',
        summary: res.error || 'Failed to import CSV.',
      });
      return;
    }

    setDrawerItem(null);
    resetFilters();
    setIsolates(res.isolates);
    setDatasetProvenance('imported');
    setIsolateAId(res.isolates[0]?.isolate_id ?? null);
    setIsolateBId(res.isolates[1]?.isolate_id ?? null);

    if (res.isolates.length < 2) {
      setActiveStep(1);
    }

    const details: string[] = [];
    if (res.invalidRowsSkipped > 0) {
      details.push(`Skipped invalid CSV rows: ${res.invalidRowNumbers.join(', ')}`);
    }
    if (res.warnings.length > 0) {
      details.push(...res.warnings);
    }

    setImportFeedback({
      type: 'success',
      summary: `Rows read: ${res.rowsRead} | Isolates created: ${res.isolatesCreated} | Genes added: ${res.genesAdded} | Duplicates ignored: ${res.duplicatesIgnored} | Non-AMR skipped: ${res.nonAmrRowsSkipped} | Metadata conflicts: ${res.metadataConflicts} | Invalid rows skipped: ${res.invalidRowsSkipped}`,
      details: details.length > 0 ? details : undefined,
    });
  };

  const openDrawer = (
    gene: ResistanceGene,
    isolate: AMRIsolate,
    provenance: DatasetProvenance = datasetProvenance
  ) => {
    const symNorm = normalizeGeneSymbol(gene.gene_symbol);
    const allAnnotations = isolate.resistance_genes.filter(
      (g) => normalizeGeneSymbol(g.gene_symbol) === symNorm
    );
    setDrawerItem({
      gene,
      allAnnotationsForSymbol: allAnnotations,
      isolate,
      provenance,
    });
  };

  const closeDrawer = () => {
    setDrawerItem(null);
  };

  return {
    isolates,
    filteredIsolates,
    datasetProvenance,
    searchQuery,
    setSearchQuery,
    organismFilter,
    setOrganismFilter,
    geneFilter,
    setGeneFilter,
    classFilter,
    setClassFilter,
    resetFilters,
    isolateAId,
    isolateBId,
    isolateA,
    isolateB,
    selectIsolateA,
    selectIsolateB,
    swapSlots,
    activeStep,
    setActiveStep,
    drawerItem,
    openDrawer,
    closeDrawer,
    importFeedback,
    setImportFeedback,
    organismOptions,
    geneOptions,
    classOptions,
    resetToDemo,
    handleImportResult,
  };
}
