import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileText,
} from 'lucide-react';
import type { AMRIsolate, DatasetProvenance } from '../types/amr';
import { compareIsolates } from '../lib/comparison';
import { buildReportData, formatReportMarkdown } from '../lib/report';
import { CLINICAL_DISCLAIMER } from '../lib/constants';
import { isValidHttpUrl } from '../lib/normalizeData';

interface EvidenceReportViewProps {
  isolateA: AMRIsolate | null;
  isolateB: AMRIsolate | null;
  datasetProvenance: DatasetProvenance;
}

export function EvidenceReportView({
  isolateA,
  isolateB,
  datasetProvenance,
}: EvidenceReportViewProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  const reportData = useMemo(() => {
    if (!isolateA || !isolateB) return null;
    const comparison = compareIsolates(isolateA, isolateB);
    return buildReportData(isolateA, isolateB, comparison, datasetProvenance);
  }, [isolateA, isolateB, datasetProvenance]);

  const markdownContent = useMemo(() => {
    if (!reportData) return '';
    return formatReportMarkdown(reportData);
  }, [reportData]);

  const handleDownload = () => {
    if (!isolateA || !isolateB || !markdownContent) return;

    const safeId = (id: string) => id.replace(/[^A-Za-z0-9._-]/g, '_');
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `amr-atlas-report-${safeId(isolateA.isolate_id)}-vs-${safeId(
      isolateB.isolate_id
    )}-${today}.md`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!markdownContent) return;
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopyStatus('Copied to clipboard!');
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(
        'Clipboard permission denied — please use Download Markdown (.md) or select the text below.'
      );
      setTimeout(() => setCopyStatus(null), 5000);
    }
  };

  if (!isolateA || !isolateB || !reportData) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Evidence Report Locked</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select two distinct isolates to generate and download an evidence report.
          </p>
        </div>
      </div>
    );
  }

  const formatText = (val?: string) => (val && val.trim() ? val.trim() : 'Not provided');

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AMR Atlas Evidence Brief
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured audit brief comparing {isolateA.isolate_id} and {isolateB.isolate_id}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Toggle View */}
          <button
            type="button"
            onClick={() => setShowRawMarkdown(!showRawMarkdown)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showRawMarkdown ? 'Show Rendered Brief' : 'Show Markdown Text'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {copyStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Markdown</span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Markdown (.md)</span>
          </button>
        </div>
      </div>

      {copyStatus && (
        <div
          role="status"
          className="p-3 text-xs bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg"
        >
          {copyStatus}
        </div>
      )}

      {showRawMarkdown ? (
        /* Raw Markdown View */
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
          <pre className="whitespace-pre-wrap leading-relaxed">{markdownContent}</pre>
        </div>
      ) : (
        /* Rendered Brief View */
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 text-slate-800">
          {/* Metadata & Provenance Header */}
          <div className="border-b border-slate-200 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Generated: <strong>{reportData.generatedAtIso}</strong>
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                  reportData.provenance === 'demo'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-sky-50 text-sky-900 border-sky-300'
                }`}
              >
                {reportData.provenance === 'demo'
                  ? 'Demo Modeled Dataset (Reference Accessions)'
                  : 'User-Imported CSV Dataset (Unverified)'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Antimicrobial Resistance Comparison Evidence Brief
            </h1>
          </div>

          {/* Section 1: Isolate Metadata Table */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Isolate Metadata Comparison
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Metadata Attribute</th>
                    <th className="px-4 py-2.5 text-blue-900 bg-blue-50/50">
                      Isolate A: {isolateA.isolate_id}
                    </th>
                    <th className="px-4 py-2.5 text-emerald-900 bg-emerald-50/50">
                      Isolate B: {isolateB.isolate_id}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-600">Organism Species</td>
                    <td className="px-4 py-2 italic">{formatText(isolateA.organism_name)}</td>
                    <td className="px-4 py-2 italic">{formatText(isolateB.organism_name)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-600">Collection Location</td>
                    <td className="px-4 py-2">{formatText(isolateA.collection_location)}</td>
                    <td className="px-4 py-2">{formatText(isolateB.collection_location)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-600">Collection Date</td>
                    <td className="px-4 py-2">{formatText(isolateA.collection_date)}</td>
                    <td className="px-4 py-2">{formatText(isolateB.collection_date)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-600">Susceptibility Phenotype</td>
                    <td className="px-4 py-2">{formatText(isolateA.susceptibility_result)}</td>
                    <td className="px-4 py-2">{formatText(isolateB.susceptibility_result)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-600">Resistance Genes Count</td>
                    <td className="px-4 py-2 font-mono font-bold text-blue-800">
                      {isolateA.resistance_genes.length}
                    </td>
                    <td className="px-4 py-2 font-mono font-bold text-emerald-800">
                      {isolateB.resistance_genes.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Resistance Gene-Set Metrics */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Resistance Gene-Set Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] text-slate-500">Shared Symbols</div>
                <div className="text-xl font-bold font-mono text-amber-700">
                  {reportData.comparison.shared.length}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] text-slate-500">Unique to Isolate A</div>
                <div className="text-xl font-bold font-mono text-blue-700">
                  {reportData.comparison.uniqueToA.length}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] text-slate-500">Unique to Isolate B</div>
                <div className="text-xl font-bold font-mono text-emerald-700">
                  {reportData.comparison.uniqueToB.length}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] text-slate-500">Gene-set Overlap</div>
                <div className="text-xl font-bold font-mono text-indigo-700">
                  {reportData.comparison.jaccardOverlapPercent}%
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Gene-set overlap (not genetic relatedness): {reportData.comparison.jaccardOverlapPercent}%.
              Computed as Jaccard index (shared count / total union count).
            </p>
          </section>

          {/* Section 3: Gene Partition Lists */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Gene Partition Lists
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-lg space-y-2">
                <h4 className="font-bold text-xs text-amber-900">
                  Shared Resistance Genes ({reportData.comparison.shared.length})
                </h4>
                {reportData.comparison.shared.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No shared genes.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                    {reportData.comparison.shared.map((g) => (
                      <li key={g.key}>{g.display}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-lg space-y-2">
                <h4 className="font-bold text-xs text-blue-900">
                  Unique to Isolate A ({reportData.comparison.uniqueToA.length})
                </h4>
                {reportData.comparison.uniqueToA.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No unique genes.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                    {reportData.comparison.uniqueToA.map((g) => (
                      <li key={g.key}>{g.display}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg space-y-2">
                <h4 className="font-bold text-xs text-emerald-900">
                  Unique to Isolate B ({reportData.comparison.uniqueToB.length})
                </h4>
                {reportData.comparison.uniqueToB.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No unique genes.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                    {reportData.comparison.uniqueToB.map((g) => (
                      <li key={g.key}>{g.display}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Complete Source Accessions & Reference Links */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Complete Source Accessions & Reference Links
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Isolate ID</th>
                    <th className="px-4 py-2.5">Gene Symbol</th>
                    <th className="px-4 py-2.5">Resistance Class</th>
                    <th className="px-4 py-2.5">Source Accession</th>
                    <th className="px-4 py-2.5">Reference Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isolateA.resistance_genes.map((g, idx) => (
                    <tr key={`a-${idx}`} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2 font-mono text-blue-900 font-medium">
                        {isolateA.isolate_id}
                      </td>
                      <td className="px-4 py-2 font-mono font-semibold">{g.gene_symbol}</td>
                      <td className="px-4 py-2">{formatText(g.gene_class)}</td>
                      <td className="px-4 py-2 font-mono">{formatText(g.source_accession)}</td>
                      <td className="px-4 py-2">
                        {isValidHttpUrl(g.source_url) ? (
                          <a
                            href={g.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <span>Look up at NCBI ↗</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">No link available</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {isolateB.resistance_genes.map((g, idx) => (
                    <tr key={`b-${idx}`} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2 font-mono text-emerald-900 font-medium">
                        {isolateB.isolate_id}
                      </td>
                      <td className="px-4 py-2 font-mono font-semibold">{g.gene_symbol}</td>
                      <td className="px-4 py-2">{formatText(g.gene_class)}</td>
                      <td className="px-4 py-2 font-mono">{formatText(g.source_accession)}</td>
                      <td className="px-4 py-2">
                        {isValidHttpUrl(g.source_url) ? (
                          <a
                            href={g.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <span>Look up at NCBI ↗</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">No link available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Missing Accessions or Links */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Missing Accessions or Reference Links
            </h3>
            {reportData.missingAnnotations.length === 0 ? (
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                None — all annotations include an accession or search link.
              </p>
            ) : (
              <div className="overflow-x-auto border border-amber-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse bg-amber-50/40">
                  <thead className="bg-amber-100/60 text-amber-900 font-semibold border-b border-amber-200">
                    <tr>
                      <th className="px-4 py-2">Isolate ID</th>
                      <th className="px-4 py-2">Gene Symbol</th>
                      <th className="px-4 py-2">Missing Information</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200/60">
                    {reportData.missingAnnotations.map((m, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 font-mono">{m.isolate_id}</td>
                        <td className="px-4 py-2 font-mono font-semibold">{m.gene_symbol}</td>
                        <td className="px-4 py-2 text-amber-800 font-medium">Missing {m.missing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 6: Methodology & Verification Caveat */}
          <section className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="font-bold text-slate-800">6. Methodology & Verification Caveat</div>
            <p className="leading-relaxed">
              Methodology: Case-insensitive and whitespace-trimmed gene matching, annotation deduplication using pipe-delimited keys (symbol|accession or symbol|class|url), and pairwise Jaccard gene-set overlap calculation. External URLs are lookup pathways not automatically checked or verified by AMR Atlas.
            </p>
          </section>

          {/* Section 7: Clinical Disclaimer */}
          <section className="space-y-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>7. Clinical Disclaimer</span>
            </div>
            <p className="leading-relaxed">{CLINICAL_DISCLAIMER}</p>
          </section>
        </div>
      )}
    </div>
  );
}
