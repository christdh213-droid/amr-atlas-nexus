import fs from 'node:fs';
import path from 'node:path';
import type { AMRIsolate, SeedIsolateRaw } from '../src/types/amr';
import { CLINICAL_DISCLAIMER } from '../src/lib/constants';
import {
  deduplicateAnnotations,
  loadSeedIsolates,
  normalizeGeneSymbol,
} from '../src/lib/normalizeData';
import { compareIsolates } from '../src/lib/comparison';
import { importCsvText } from '../src/lib/csvImport';
import { buildReportData, escapeMd, formatReportMarkdown } from '../src/lib/report';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASSED: ${message}`);
}

console.log('Running AMR Atlas automated verification assertions...\n');

// 1. Case-insensitive & whitespace gene matching
const symA = normalizeGeneSymbol(' BLANDM-1 ');
const symB = normalizeGeneSymbol('blaNDM-1');
assert(
  symA === 'blandm-1' && symA === symB,
  'Assertion 1: Case-insensitive & whitespace gene matching (" BLANDM-1 " matches "blaNDM-1")'
);

// 2. Annotation deduplication within an isolate using pipe-delimited key
const testGenes = [
  {
    gene_symbol: 'blaNDM-1',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_049326.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_049326.1',
  },
  {
    gene_symbol: ' BLANDM-1 ',
    gene_class: 'BETA-LACTAM',
    source_accession: 'ng_049326.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_049326.1',
  },
  {
    gene_symbol: 'blaCTX-M-15',
    gene_class: 'BETA-LACTAM',
    source_accession: 'NG_048935.1',
    source_url: 'https://www.ncbi.nlm.nih.gov/nuccore/NG_048935.1',
  },
];
const deduped = deduplicateAnnotations(testGenes);
assert(
  deduped.length === 2 && deduped[0].gene_symbol === 'blaNDM-1' && deduped[1].gene_symbol === 'blaCTX-M-15',
  'Assertion 2: Annotation deduplication within an isolate using pipe-delimited key'
);

// Read demo seed data
const demoDataPath = path.resolve(process.cwd(), 'src/data/demo_seed_data.json');
const rawSeed: SeedIsolateRaw[] = JSON.parse(fs.readFileSync(demoDataPath, 'utf-8'));
const seedIsolates = loadSeedIsolates(rawSeed);

// 3. Zero-gene isolate (DEMO-EC-008) has resistance_genes.length === 0
const iso008 = seedIsolates.find((i: AMRIsolate) => i.isolate_id === 'DEMO-EC-008');
assert(
  Boolean(iso008 && iso008.resistance_genes.length === 0),
  'Assertion 3: Zero-gene isolate (DEMO-EC-008) has resistance_genes.length === 0'
);

// 4. Seed pair DEMO-KP-001 vs DEMO-EC-002 returns 3 shared, 2 unique to A, 3 unique to B, and 37.5% overlap
const kp001 = seedIsolates.find((i: AMRIsolate) => i.isolate_id === 'DEMO-KP-001')!;
const ec002 = seedIsolates.find((i: AMRIsolate) => i.isolate_id === 'DEMO-EC-002')!;
const pairRes = compareIsolates(kp001, ec002);
assert(
  pairRes.shared.length === 3 &&
    pairRes.uniqueToA.length === 2 &&
    pairRes.uniqueToB.length === 3 &&
    pairRes.unionCount === 8 &&
    pairRes.jaccardOverlapPercent === 37.5,
  'Assertion 4: Seed pair DEMO-KP-001 vs DEMO-EC-002 returns 3 shared, 2 unique A, 3 unique B, union 8, and 37.5% overlap'
);

// 5. Zero-overlap pair returns 0% overlap
const zeroOverlapRes = compareIsolates(kp001, iso008!);
assert(
  zeroOverlapRes.shared.length === 0 &&
    zeroOverlapRes.uniqueToA.length === kp001.resistance_genes.length &&
    zeroOverlapRes.jaccardOverlapPercent === 0,
  'Assertion 5: Zero-overlap pair returns 0% overlap (jaccardOverlapPercent === 0)'
);

// 6. formatReportMarkdown contains CLINICAL_DISCLAIMER verbatim and properly escapes special Markdown characters via escapeMd
const testDate = new Date('2025-01-01T00:00:00Z');
const reportData = buildReportData(kp001, ec002, pairRes, 'demo', testDate);
const reportMd = formatReportMarkdown(reportData);
assert(
  reportMd.includes(CLINICAL_DISCLAIMER),
  'Assertion 6a: formatReportMarkdown contains CLINICAL_DISCLAIMER verbatim'
);
const escaped = escapeMd('gene*name [1] | text `code`');
assert(
  escaped === 'gene\\*name \\[1\\] \\| text \\`code\\`',
  'Assertion 6b: escapeMd properly escapes special Markdown characters'
);

// 7. Reading public/sample-isolates.csv via Node fs.readFileSync and passing to importCsvText succeeds and produces exactly 8 isolates
const sampleCsvPath = path.resolve(process.cwd(), 'public/sample-isolates.csv');
const sampleCsvContent = fs.readFileSync(sampleCsvPath, 'utf-8');
const sampleImport = importCsvText(sampleCsvContent);
assert(
  sampleImport.ok && sampleImport.isolates.length === 8,
  `Assertion 7: public/sample-isolates.csv produces exactly 8 isolates (got ${sampleImport.isolates.length})`
);

// 8. Passing inline CSV string with blank gene_symbol row AND STRESS element_type row preserves zero-gene isolate and increments nonAmrRowsSkipped
const inlineCsv = [
  'isolate_id,organism_name,collection_location,collection_date,susceptibility_result,gene_symbol,gene_class,element_type,source_accession,source_url',
  'ISO-TEST-1,Test organism,Test City,2024-01,Resistant,,,,AMR,,',
  'ISO-TEST-1,Test organism,Test City,2024-01,Resistant,qacE,DISINFECTANT,STRESS,NG_0000.1,https://example.com',
].join('\n');
const inlineImport = importCsvText(inlineCsv);
assert(
  inlineImport.ok &&
    inlineImport.isolates.length === 1 &&
    inlineImport.isolates[0].resistance_genes.length === 0 &&
    inlineImport.nonAmrRowsSkipped === 1,
  'Assertion 8: Blank gene_symbol row and STRESS element_type row preserve zero-gene isolate and increment nonAmrRowsSkipped'
);

// 9. Passing invalid CSV string (missing isolate_id or gene_symbol header) to importCsvText returns ok: false with error message
const invalidCsv = 'wrong_col,another_col\nval1,val2';
const invalidImport = importCsvText(invalidCsv);
assert(
  !invalidImport.ok && typeof invalidImport.error === 'string' && invalidImport.error.length > 0,
  'Assertion 9: Missing required headers returns ok: false with error message'
);

console.log('\nAll 9 verification assertions passed successfully!');
