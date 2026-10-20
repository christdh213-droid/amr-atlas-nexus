import { useState } from 'react';
import { useAMRAtlas } from './hooks/useAMRAtlas';
import { BrandIntroSplash } from './components/BrandIntroSplash';
import { AppHeader } from './components/AppHeader';
import { WorkflowStepper } from './components/WorkflowStepper';
import { IsolateFilters } from './components/IsolateFilters';
import { IsolateSelector } from './components/IsolateSelector';
import { SurveillanceHeatmap } from './components/SurveillanceHeatmap';
import { ComparisonPanel } from './components/ComparisonPanel';
import { EvidenceReportView } from './components/EvidenceReportView';
import { TraceabilityDrawer } from './components/TraceabilityDrawer';
import { AppFooter } from './components/AppFooter';
import { GeneBadge } from './components/GeneBadge';
import { SEMANTIC_STYLES } from './lib/constants';
import { ArrowRight } from 'lucide-react';

export function App() {
  const atlas = useAMRAtlas();

  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem('amr_intro_seen') !== 'true';
    } catch {
      return false;
    }
  });

  const formatText = (val?: string) => (val && val.trim() ? val.trim() : 'Not provided');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Brand Intro Splash Modal */}
      <BrandIntroSplash isOpen={showSplash} onClose={() => setShowSplash(false)} />

      {/* App Header & Comparison Dock */}
      <AppHeader
        datasetProvenance={atlas.datasetProvenance}
        isolateA={atlas.isolateA}
        isolateB={atlas.isolateB}
        onSwapSlots={atlas.swapSlots}
        onResetToDemo={atlas.resetToDemo}
        onImportResult={atlas.handleImportResult}
        onReplayIntro={() => setShowSplash(true)}
        importFeedback={atlas.importFeedback}
        onDismissFeedback={() => atlas.setImportFeedback(null)}
        onJumpToCompare={() => atlas.setActiveStep(3)}
      />

      {/* Workflow Stepper */}
      <WorkflowStepper
        activeStep={atlas.activeStep}
        onStepChange={atlas.setActiveStep}
        isolateA={atlas.isolateA}
        isolateB={atlas.isolateB}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1: Choose & Filter Bacteria */}
        {atlas.activeStep === 1 && (
          <section aria-labelledby="step1-heading" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="step1-heading" className="text-xl font-bold text-slate-900 tracking-tight">
                  Step 1: Choose & Filter Bacteria
                </h2>
                <p className="text-xs text-slate-500">
                  Filter surveillance isolates and pick two isolates into Slot A and Slot B for pairwise resistance comparison.
                </p>
              </div>

              {atlas.isolateA && atlas.isolateB && (
                <button
                  type="button"
                  onClick={() => atlas.setActiveStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <span>Step 2: Resistance Evidence</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <IsolateFilters
              searchQuery={atlas.searchQuery}
              onSearchChange={atlas.setSearchQuery}
              organismFilter={atlas.organismFilter}
              onOrganismChange={atlas.setOrganismFilter}
              geneFilter={atlas.geneFilter}
              onGeneChange={atlas.setGeneFilter}
              classFilter={atlas.classFilter}
              onClassChange={atlas.setClassFilter}
              organismOptions={atlas.organismOptions}
              geneOptions={atlas.geneOptions}
              classOptions={atlas.classOptions}
              totalCount={atlas.isolates.length}
              filteredCount={atlas.filteredIsolates.length}
              onResetFilters={atlas.resetFilters}
            />

            {/* Cohort Gene Presence Matrix */}
            <SurveillanceHeatmap
              filteredIsolates={atlas.filteredIsolates}
              isolateAId={atlas.isolateAId}
              isolateBId={atlas.isolateBId}
              onOpenDrawer={atlas.openDrawer}
              datasetProvenance={atlas.datasetProvenance}
            />

            {/* Isolate Table */}
            <IsolateSelector
              isolates={atlas.filteredIsolates}
              isolateAId={atlas.isolateAId}
              isolateBId={atlas.isolateBId}
              onSelectA={atlas.selectIsolateA}
              onSelectB={atlas.selectIsolateB}
              onOpenDrawer={atlas.openDrawer}
              datasetProvenance={atlas.datasetProvenance}
              onResetFilters={atlas.resetFilters}
            />
          </section>
        )}

        {/* Step 2: Explore Resistance Evidence */}
        {atlas.activeStep === 2 && (
          <section aria-labelledby="step2-heading" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 id="step2-heading" className="text-xl font-bold text-slate-900 tracking-tight">
                  Step 2: Explore Resistance Evidence
                </h2>
                <p className="text-xs text-slate-500">
                  Audit annotated resistance genes, resistance classes, and NCBI reference accessions for the active isolate pair.
                </p>
              </div>

              {atlas.isolateA && atlas.isolateB && (
                <button
                  type="button"
                  onClick={() => atlas.setActiveStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <span>Step 3: Compare Bacteria</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Side-by-side Isolate Evidence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A */}
              {atlas.isolateA ? (
                <div
                  className={`bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 ${SEMANTIC_STYLES.isolateA.cardBorder}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Isolate A
                      </span>
                      <h3 className="text-lg font-mono font-bold text-slate-900 mt-1">
                        {atlas.isolateA.isolate_id}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {atlas.isolateA.resistance_genes.length} annotated genes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organism</span>
                      <span className="italic text-slate-800 font-medium">
                        {formatText(atlas.isolateA.organism_name)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                      <span className="text-slate-800">{formatText(atlas.isolateA.collection_location)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date</span>
                      <span className="text-slate-800">{formatText(atlas.isolateA.collection_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phenotype</span>
                      <span className="text-slate-800">{formatText(atlas.isolateA.susceptibility_result)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Annotated Resistance Genes:
                    </span>
                    {atlas.isolateA.resistance_genes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No resistance genes annotated for this isolate in the active dataset.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {atlas.isolateA.resistance_genes.map((g, i) => (
                          <GeneBadge
                            key={`a-${g.gene_symbol}-${i}`}
                            symbol={g.gene_symbol}
                            geneClass={g.gene_class}
                            theme="isolateA"
                            onClick={() => atlas.openDrawer(g, atlas.isolateA!, atlas.datasetProvenance)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                  No isolate selected for Slot A.
                </div>
              )}

              {/* Card B */}
              {atlas.isolateB ? (
                <div
                  className={`bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 ${SEMANTIC_STYLES.isolateB.cardBorder}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Isolate B
                      </span>
                      <h3 className="text-lg font-mono font-bold text-slate-900 mt-1">
                        {atlas.isolateB.isolate_id}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {atlas.isolateB.resistance_genes.length} annotated genes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Organism</span>
                      <span className="italic text-slate-800 font-medium">
                        {formatText(atlas.isolateB.organism_name)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                      <span className="text-slate-800">{formatText(atlas.isolateB.collection_location)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date</span>
                      <span className="text-slate-800">{formatText(atlas.isolateB.collection_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phenotype</span>
                      <span className="text-slate-800">{formatText(atlas.isolateB.susceptibility_result)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Annotated Resistance Genes:
                    </span>
                    {atlas.isolateB.resistance_genes.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No resistance genes annotated for this isolate in the active dataset.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {atlas.isolateB.resistance_genes.map((g, i) => (
                          <GeneBadge
                            key={`b-${g.gene_symbol}-${i}`}
                            symbol={g.gene_symbol}
                            geneClass={g.gene_class}
                            theme="isolateB"
                            onClick={() => atlas.openDrawer(g, atlas.isolateB!, atlas.datasetProvenance)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                  No isolate selected for Slot B.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 3: Compare Bacteria */}
        {atlas.activeStep === 3 && (
          <section aria-labelledby="step3-heading">
            <ComparisonPanel
              isolateA={atlas.isolateA}
              isolateB={atlas.isolateB}
              onOpenDrawer={atlas.openDrawer}
              datasetProvenance={atlas.datasetProvenance}
              onProceedToReport={() => atlas.setActiveStep(4)}
            />
          </section>
        )}

        {/* Step 4: Create & Export Report */}
        {atlas.activeStep === 4 && (
          <section aria-labelledby="step4-heading">
            <EvidenceReportView
              isolateA={atlas.isolateA}
              isolateB={atlas.isolateB}
              datasetProvenance={atlas.datasetProvenance}
            />
          </section>
        )}
      </main>

      {/* Gene Traceability Slide-over Drawer */}
      <TraceabilityDrawer drawerItem={atlas.drawerItem} onClose={atlas.closeDrawer} />

      {/* Clinical Disclaimer & Guardrails Footer */}
      <AppFooter />
    </div>
  );
}

export default App;
