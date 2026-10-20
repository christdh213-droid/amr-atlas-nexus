import Papa from 'papaparse';
import type { AMRIsolate, ImportResult } from '../types/amr';
import { normalizeGeneSymbol, normalizeIsolateId, resolveSourceUrl } from './normalizeData';

const FIELD_ALIASES: Record<string, string[]> = {
  isolate_id: ['isolate_id', 'isolate', 'biosample', 'strain'],
  gene_symbol: ['gene_symbol', 'element_symbol', 'gene'],
  organism_name: ['organism_name', 'organism', 'species', 'scientific_name'],
  collection_location: ['collection_location', 'location', 'geo_loc_name', 'country'],
  collection_date: ['collection_date', 'date'],
  susceptibility_result: ['susceptibility_result', 'phenotype', 'amr_phenotype'],
  gene_class: ['gene_class', 'class', 'subclass', 'resistance_class'],
  source_accession: ['source_accession', 'reference_accession', 'refseq_accession', 'nucleotide_accession'],
  source_url: ['source_url', 'url', 'reference_url'],
};

export function importCsvText(csvText: string): ImportResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_-]+/g, '_'),
  });

  const baseResult: ImportResult = {
    ok: false,
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
  };

  // Inspect syntax/format errors
  for (const err of result.errors) {
    if (err.type === 'Quotes' || err.type === 'Delimiter') {
      return {
        ...baseResult,
        error: `CSV parse error (${err.type}): ${err.message}. Please verify the file is not malformed and uses comma delimiters.`,
      };
    }
  }

  const rows = result.data || [];
  baseResult.rowsRead = rows.length;

  if (rows.length > 2500) {
    return {
      ...baseResult,
      error: `CSV row count (${rows.length}) exceeds the maximum limit of 2,500 rows. Please filter your dataset before importing.`,
    };
  }

  const fields = result.meta.fields || [];

  // Match columns using alias order
  const resolveCol = (fieldKey: string): string | null => {
    const aliases = FIELD_ALIASES[fieldKey] || [];
    for (const alias of aliases) {
      if (fields.includes(alias)) {
        return alias;
      }
    }
    return null;
  };

  const colIsolateId = resolveCol('isolate_id');
  const colGeneSymbol = resolveCol('gene_symbol');
  const colOrganism = resolveCol('organism_name');
  const colLocation = resolveCol('collection_location');
  const colDate = resolveCol('collection_date');
  const colPhenotype = resolveCol('susceptibility_result');
  const colGeneClass = resolveCol('gene_class');
  const colAccession = resolveCol('source_accession');
  const colUrl = resolveCol('source_url');

  if (!colIsolateId || !colGeneSymbol) {
    return {
      ...baseResult,
      error:
        'AMR Atlas requires a flat one-gene-per-row CSV table containing both isolate_id and gene_symbol columns (please check column names or download the Sample CSV).',
    };
  }

  // Resolve element_type column
  let colElementType: string | null = null;
  if (fields.includes('element_type')) {
    colElementType = 'element_type';
  } else if (fields.includes('type')) {
    const validTypes = new Set(['AMR', 'STRESS', 'VIRULENCE', 'BIOCIDE', 'METAL']);
    let allMatch = true;
    let hasNonEmpty = false;
    for (const row of rows) {
      const val = (row['type'] || '').trim().toUpperCase();
      if (val) {
        hasNonEmpty = true;
        if (!validTypes.has(val)) {
          allMatch = false;
          break;
        }
      }
    }
    if (allMatch && hasNonEmpty) {
      colElementType = 'type';
    }
  }

  // Handle FieldMismatch errors
  const mismatchedRowIndices = new Set<number>();
  for (const err of result.errors) {
    if (err.type === 'FieldMismatch' && typeof err.row === 'number') {
      mismatchedRowIndices.add(err.row);
      baseResult.invalidRowsSkipped++;
      baseResult.invalidRowNumbers.push(err.row + 2);
    }
  }

  const isolateMap = new Map<
    string,
    {
      isolate: AMRIsolate;
      seenAnnotations: Set<string>;
    }
  >();

  for (let i = 0; i < rows.length; i++) {
    if (mismatchedRowIndices.has(i)) {
      continue;
    }

    const row = rows[i];
    const rowNumber = i + 2;
    const rawIsolateId = (row[colIsolateId] || '').trim();

    if (!rawIsolateId) {
      baseResult.invalidRowsSkipped++;
      baseResult.invalidRowNumbers.push(rowNumber);
      continue;
    }

    const isolateKey = normalizeIsolateId(rawIsolateId);
    let entry = isolateMap.get(isolateKey);

    const rowOrg = colOrganism ? (row[colOrganism] || '').trim() : '';
    const rowLoc = colLocation ? (row[colLocation] || '').trim() : '';
    const rowDate = colDate ? (row[colDate] || '').trim() : '';
    const rowPheno = colPhenotype ? (row[colPhenotype] || '').trim() : '';

    if (!entry) {
      entry = {
        isolate: {
          isolate_id: rawIsolateId,
          organism_name: rowOrg,
          collection_location: rowLoc,
          collection_date: rowDate,
          susceptibility_result: rowPheno,
          resistance_genes: [],
        },
        seenAnnotations: new Set<string>(),
      };
      isolateMap.set(isolateKey, entry);
      baseResult.isolatesCreated++;
    } else {
      // Check metadata conflicts: first non-empty value wins
      const checkConflict = (current: string, incoming: string, setter: (v: string) => void) => {
        if (!current && incoming) {
          setter(incoming);
        } else if (current && incoming && current !== incoming) {
          baseResult.metadataConflicts++;
        }
      };

      checkConflict(entry.isolate.organism_name, rowOrg, (v) => {
        entry!.isolate.organism_name = v;
      });
      checkConflict(entry.isolate.collection_location, rowLoc, (v) => {
        entry!.isolate.collection_location = v;
      });
      checkConflict(entry.isolate.collection_date, rowDate, (v) => {
        entry!.isolate.collection_date = v;
      });
      checkConflict(entry.isolate.susceptibility_result, rowPheno, (v) => {
        entry!.isolate.susceptibility_result = v;
      });
    }

    // Check element_type
    if (colElementType) {
      const elemType = (row[colElementType] || '').trim().toUpperCase();
      if (elemType && elemType !== 'AMR') {
        baseResult.nonAmrRowsSkipped++;
        continue;
      }
    }

    // Check gene_symbol
    const rawGene = (row[colGeneSymbol] || '').trim();
    if (!rawGene) {
      // Row has blank gene_symbol: isolate is preserved as zero-gene isolate
      continue;
    }

    const geneClass = colGeneClass ? (row[colGeneClass] || '').trim() : '';
    const accession = colAccession ? (row[colAccession] || '').trim() : '';
    const rawUrl = colUrl ? (row[colUrl] || '').trim() : '';
    const sourceUrl = resolveSourceUrl(rawUrl, accession, rawGene);

    const sym = normalizeGeneSymbol(rawGene);
    const acc = accession.toUpperCase();
    const cls = geneClass.toUpperCase();
    const dedupKey = acc ? `${sym}|${acc}` : `${sym}|${cls}|${sourceUrl}`;

    if (entry.seenAnnotations.has(dedupKey)) {
      baseResult.duplicatesIgnored++;
    } else {
      entry.seenAnnotations.add(dedupKey);
      entry.isolate.resistance_genes.push({
        gene_symbol: rawGene,
        gene_class: geneClass,
        source_accession: accession,
        source_url: sourceUrl,
      });
      baseResult.genesAdded++;
    }
  }

  const finalIsolates = Array.from(isolateMap.values()).map((e) => e.isolate);

  if (finalIsolates.length === 0) {
    return {
      ...baseResult,
      error: 'CSV import produced 0 valid isolates. Please ensure the file contains valid isolate data rows.',
    };
  }

  if (baseResult.genesAdded === 0 && baseResult.nonAmrRowsSkipped > 0) {
    baseResult.warnings.push(
      'All gene annotations in this file were skipped because their element_type was marked as non-AMR (e.g., STRESS, VIRULENCE).'
    );
  }

  baseResult.ok = true;
  baseResult.isolates = finalIsolates;
  return baseResult;
}
