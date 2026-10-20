import { AlertTriangle, Dna, ExternalLink, ShieldCheck } from 'lucide-react';
import { CLINICAL_DISCLAIMER } from '../lib/constants';

export function AppFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 py-8 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Clinical Disclaimer Callout */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-900/40 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold tracking-wide uppercase text-[11px] text-amber-200">
              Clinical Disclaimer & Research Use Only
            </div>
            <p className="leading-relaxed text-amber-100/90 text-xs">
              {CLINICAL_DISCLAIMER}
            </p>
          </div>
        </div>

        {/* Footer Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Column 1: About AMR Atlas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
              <Dna className="w-4 h-4 text-indigo-400" />
              <span>AMR ATLAS</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              Built for the BioPulse Hackathon. Designed to support surveillance review and pairwise antimicrobial resistance isolate comparison directly in the browser with 100% client-side privacy.
            </p>
          </div>

          {/* Column 2: Data Sources & Guardrails */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Guardrails</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              All gene lookups link directly to public NCBI Pathogen Detection and Nuccore reference databases. AMR Atlas does not perform sequence alignment or verify external accession contents.
            </p>
          </div>

          {/* Column 3: External Resources */}
          <div className="space-y-2">
            <div className="text-white font-bold text-sm">Public Genomic Resources</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://www.ncbi.nlm.nih.gov/pathogens/antimicrobial-resistance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <span>NCBI Pathogen Detection AMR</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ncbi.nlm.nih.gov/pathogens/microbigge/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-indigo-400 transition-colors"
                >
                  <span>NCBI MicroBIGG-E Browser</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>© BioPulse Hackathon Project. 100% client-side React & TypeScript.</div>
          <div>All URLs rendered as plain, unverified lookup links.</div>
        </div>
      </div>
    </footer>
  );
}
