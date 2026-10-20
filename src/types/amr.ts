export interface ResistanceGene {
  gene_symbol: string;
  gene_class: string;
  source_accession: string;
  source_url: string;
}

export interface AMRIsolate {
  isolate_id: string;
  organism_name: string;
  collection_location: string;
  collection_date: string;
  susceptibility_result: string;
  resistance_genes: ResistanceGene[];
}

export type DatasetProvenance = 'demo' | 'imported';

export interface SeedIsolateRaw {
  isolate_id: string;
  organism_name: string;
  collection_location: string;
  collection_date: string;
  susceptibility_result: string;
  genes: string[];
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  warnings: string[];
  isolates: AMRIsolate[];
  rowsRead: number;
  isolatesCreated: number;
  genesAdded: number;
  duplicatesIgnored: number;
  nonAmrRowsSkipped: number;
  metadataConflicts: number;
  invalidRowsSkipped: number;
  invalidRowNumbers: number[];
}

export interface GeneGroup {
  key: string;                          // normalized gene symbol
  display: string;                      // first-seen display casing
  annotationsA: ResistanceGene[];       // all annotations for this symbol in Isolate A (may be empty)
  annotationsB: ResistanceGene[];       // all annotations for this symbol in Isolate B (may be empty)
}

export interface ComparisonResult {
  shared: GeneGroup[];
  uniqueToA: GeneGroup[];
  uniqueToB: GeneGroup[];
  unionCount: number;
  jaccardOverlapPercent: number;
}

export interface ReportData {
  generatedAtIso: string;
  provenance: DatasetProvenance;
  isolateA: AMRIsolate;
  isolateB: AMRIsolate;
  comparison: ComparisonResult;
  missingAnnotations: { isolate_id: string; gene_symbol: string; missing: 'accession' | 'url' | 'both' }[];
}
