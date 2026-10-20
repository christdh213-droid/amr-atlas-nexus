import type { AMRIsolate, ComparisonResult, DatasetProvenance, ReportData } from '../types/amr';
import { CLINICAL_DISCLAIMER } from './constants';

export function escapeMd(val: string): string {
  return (val || '')
    .replace(/\r?\n/g, ' ')
    .replace(/([\\`*_<>|[\]])/g, '\\$1')
    .trim();
}

export function encodeMdUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27');
}

export function buildReportData(
  isolateA: AMRIsolate,
  isolateB: AMRIsolate,
  comparison: ComparisonResult,
  provenance: DatasetProvenance,
  generatedAt: Date = new Date()
): ReportData {
  const missingAnnotations: ReportData['missingAnnotations'] = [];

  const checkGene = (isolateId: string, gene: { gene_symbol: string; source_accession: string; source_url: string }) => {
    const hasAcc = Boolean((gene.source_accession || '').trim());
    const hasUrl = Boolean((gene.source_url || '').trim());
    if (!hasAcc && !hasUrl) {
      missingAnnotations.push({
        isolate_id: isolateId,
        gene_symbol: gene.gene_symbol,
        missing: 'both',
      });
    } else if (!hasAcc) {
      missingAnnotations.push({
        isolate_id: isolateId,
        gene_symbol: gene.gene_symbol,
        missing: 'accession',
      });
    } else if (!hasUrl) {
      missingAnnotations.push({
        isolate_id: isolateId,
        gene_symbol: gene.gene_symbol,
        missing: 'url',
      });
    }
  };

  for (const g of isolateA.resistance_genes || []) {
    checkGene(isolateA.isolate_id, g);
  }
  for (const g of isolateB.resistance_genes || []) {
    checkGene(isolateB.isolate_id, g);
  }

  return {
    generatedAtIso: generatedAt.toISOString(),
    provenance,
    isolateA,
    isolateB,
    comparison,
    missingAnnotations,
  };
}

export function formatReportMarkdown(report: ReportData): string {
  const provText =
    report.provenance === 'demo'
      ? 'Demo Modeled Dataset (Reference Accessions)'
      : 'User-Imported CSV Dataset (Unverified)';

  const formatField = (val: string) => (val && val.trim() ? escapeMd(val.trim()) : 'Not provided');

  const lines: string[] = [
    '# AMR Atlas Evidence Brief',
    '',
    `- **Generated**: ${report.generatedAtIso}`,
    `- **Dataset Provenance**: ${provText}`,
    '',
    '## 1. Isolate Metadata Comparison',
    '',
    `| Metadata Attribute | Isolate A: ${escapeMd(report.isolateA.isolate_id)} | Isolate B: ${escapeMd(report.isolateB.isolate_id)} |`,
    '|---|---|---|',
    `| Organism | *${formatField(report.isolateA.organism_name)}* | *${formatField(report.isolateB.organism_name)}* |`,
    `| Location | ${formatField(report.isolateA.collection_location)} | ${formatField(report.isolateB.collection_location)} |`,
    `| Collection Date | ${formatField(report.isolateA.collection_date)} | ${formatField(report.isolateB.collection_date)} |`,
    `| Susceptibility Phenotype | ${formatField(report.isolateA.susceptibility_result)} | ${formatField(report.isolateB.susceptibility_result)} |`,
    `| Annotated Resistance Genes | ${report.isolateA.resistance_genes.length} | ${report.isolateB.resistance_genes.length} |`,
    '',
    '## 2. Resistance Gene-Set Metrics',
    '',
    `- **Shared Gene Symbols**: ${report.comparison.shared.length}`,
    `- **Unique to Isolate A**: ${report.comparison.uniqueToA.length}`,
    `- **Unique to Isolate B**: ${report.comparison.uniqueToB.length}`,
    `- **Total Gene Union**: ${report.comparison.unionCount}`,
    `- **Gene-set overlap (not genetic relatedness)**: ${report.comparison.jaccardOverlapPercent}%`,
    '',
    '## 3. Gene Partition Lists',
    '',
    '### Shared Gene Symbols',
  ];

  if (report.comparison.shared.length === 0) {
    lines.push('_No shared annotated resistance genes between Isolate A and Isolate B._', '');
  } else {
    for (const g of report.comparison.shared) {
      lines.push(`- **${escapeMd(g.display)}**`);
    }
    lines.push('');
  }

  lines.push(`### Unique to Isolate A (${escapeMd(report.isolateA.isolate_id)})`);
  if (report.comparison.uniqueToA.length === 0) {
    lines.push('_No unique resistance genes annotated for Isolate A._', '');
  } else {
    for (const g of report.comparison.uniqueToA) {
      lines.push(`- **${escapeMd(g.display)}**`);
    }
    lines.push('');
  }

  lines.push(`### Unique to Isolate B (${escapeMd(report.isolateB.isolate_id)})`);
  if (report.comparison.uniqueToB.length === 0) {
    lines.push('_No unique resistance genes annotated for Isolate B._', '');
  } else {
    for (const g of report.comparison.uniqueToB) {
      lines.push(`- **${escapeMd(g.display)}**`);
    }
    lines.push('');
  }

  lines.push('## 4. Complete Source Accessions & Reference Links');
  lines.push('');
  lines.push('| Isolate | Gene Symbol | Resistance Class | Source Accession | Reference Link |');
  lines.push('|---|---|---|---|---|');

  const addGeneRow = (isoId: string, g: { gene_symbol: string; gene_class: string; source_accession: string; source_url: string }) => {
    const sym = escapeMd(g.gene_symbol);
    const cls = formatField(g.gene_class);
    const acc = formatField(g.source_accession);
    const url = g.source_url ? `[NCBI Record](${encodeMdUrl(g.source_url)})` : 'No link available';
    lines.push(`| ${escapeMd(isoId)} | ${sym} | ${cls} | ${acc} | ${url} |`);
  };

  for (const g of report.isolateA.resistance_genes) {
    addGeneRow(report.isolateA.isolate_id, g);
  }
  for (const g of report.isolateB.resistance_genes) {
    addGeneRow(report.isolateB.isolate_id, g);
  }

  if (report.isolateA.resistance_genes.length === 0 && report.isolateB.resistance_genes.length === 0) {
    lines.push('| — | — | — | — | — |');
  }

  lines.push('');
  lines.push('## 5. Explicit Missing Accessions or Links');
  lines.push('');

  if (report.missingAnnotations.length === 0) {
    lines.push('None — all annotations include an accession or search link.', '');
  } else {
    lines.push('| Isolate ID | Gene Symbol | Missing Information |');
    lines.push('|---|---|---|');
    for (const m of report.missingAnnotations) {
      lines.push(`| ${escapeMd(m.isolate_id)} | ${escapeMd(m.gene_symbol)} | Missing ${m.missing} |`);
    }
    lines.push('');
  }

  lines.push('## 6. Methodology & Verification Caveat');
  lines.push('');
  lines.push(
    'Methodology: Case-insensitive and whitespace-trimmed gene matching, annotation deduplication using pipe-delimited keys (symbol|accession or symbol|class|url), and pairwise Jaccard gene-set overlap calculation. External URLs are lookup pathways not automatically checked or verified by AMR Atlas.'
  );
  lines.push('');
  lines.push('## 7. Clinical Disclaimer');
  lines.push('');
  lines.push(CLINICAL_DISCLAIMER);
  lines.push('');

  return lines.join('\n');
}
