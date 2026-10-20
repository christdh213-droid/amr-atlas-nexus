import type { AMRIsolate, ResistanceGene, SeedIsolateRaw } from '../types/amr';
import { GENE_REFERENCE } from '../data/geneReference';

export function normalizeIsolateId(id: string): string {
  return (id || '').trim().toUpperCase();
}

export function normalizeGeneSymbol(symbol: string): string {
  return (symbol || '').trim().toLowerCase();
}

export function isValidHttpUrl(urlString: string): boolean {
  if (!urlString) return false;
  const trimmed = urlString.trim();
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveSourceUrl(rawUrl: string, accession: string, geneSymbol: string): string {
  const trimmedUrl = (rawUrl || '').trim();
  let validUrl = isValidHttpUrl(trimmedUrl) ? trimmedUrl : '';
  const trimmedAcc = (accession || '').trim();
  const trimmedSym = (geneSymbol || '').trim();

  if (!validUrl) {
    const accPattern = /^(NG_|NC_|NZ_|CP\d+|AP\d+|MN\d+|KX\d+|JX\d+)/i;
    if (trimmedAcc && accPattern.test(trimmedAcc)) {
      validUrl = `https://www.ncbi.nlm.nih.gov/nuccore/${encodeURIComponent(trimmedAcc)}`;
    } else if (trimmedSym) {
      const safeTerm = encodeURIComponent(trimmedSym).replace(/[()']/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
      validUrl = `https://www.ncbi.nlm.nih.gov/nuccore/?term=${safeTerm}+AND+srcdb_refseq%5BPROP%5D`;
    }
  }

  return validUrl;
}

export function deduplicateAnnotations(genes: ResistanceGene[]): ResistanceGene[] {
  const seen = new Set<string>();
  const result: ResistanceGene[] = [];

  for (const gene of genes) {
    const sym = normalizeGeneSymbol(gene.gene_symbol);
    const acc = (gene.source_accession || '').trim().toUpperCase();
    const cls = (gene.gene_class || '').trim().toUpperCase();
    const url = (gene.source_url || '').trim();
    const dedupKey = acc ? `${sym}|${acc}` : `${sym}|${cls}|${url}`;

    if (!seen.has(dedupKey)) {
      seen.add(dedupKey);
      result.push(gene);
    }
  }

  return result;
}

export function loadSeedIsolates(raw: SeedIsolateRaw[]): AMRIsolate[] {
  return raw.map((seed) => {
    const expandedGenes: ResistanceGene[] = seed.genes.map((geneStr) => {
      const trimmed = geneStr.trim();
      const ref = GENE_REFERENCE[trimmed];
      if (ref) {
        return {
          gene_symbol: ref.gene_symbol,
          gene_class: ref.gene_class,
          source_accession: ref.source_accession,
          source_url: resolveSourceUrl(ref.source_url, ref.source_accession, ref.gene_symbol),
        };
      }
      return {
        gene_symbol: trimmed,
        gene_class: '',
        source_accession: '',
        source_url: resolveSourceUrl('', '', trimmed),
      };
    });

    return {
      isolate_id: seed.isolate_id.trim(),
      organism_name: (seed.organism_name || '').trim(),
      collection_location: (seed.collection_location || '').trim(),
      collection_date: (seed.collection_date || '').trim(),
      susceptibility_result: (seed.susceptibility_result || '').trim(),
      resistance_genes: deduplicateAnnotations(expandedGenes),
    };
  });
}
