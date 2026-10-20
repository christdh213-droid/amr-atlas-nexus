import { useState } from 'react';
import { useAMRAtlas } from './hooks/useAMRAtlas';
import { BrandIntroSplash } from './components/BrandIntroSplash';
import { AppHeader } from './components/AppHeader';
import { WorkflowStepper } from './components/WorkflowStepper';
import { IsolateFilters } from './components/IsolateFilters';
import { IsolateSelector } from './components/IsolateSelector';
import { TraceabilityDrawer } from './components/TraceabilityDrawer';
import { AppFooter } from './components/AppFooter';
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
                  <span>Proceed to Step 2: Resistance Evidence</span>
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

        {/* Step 2 placeholder for Phase 2 verification */}
        {atlas.activeStep === 2 && (
          <section aria-labelledby="step2-heading" className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="step2-heading" className="text-xl font-bold text-slate-900">
                  Step 2: Explore Resistance Evidence
                </h2>
                <p className="text-xs text-slate-500">
                  Audit annotated resistance genes and accessions for Isolate A and Isolate B.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A */}
              {atlas.isolateA && (
                <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs ${SEMANTIC_STYLES.isolateA.cardBorder}`}>
                  <h3 className="font-bold text-base text-blue-900">Isolate A: {atlas.isolateA.isolate_id}</h3>
                  <p className="text-xs text-slate-500 italic mb-4">{atlas.isolateA.organism_name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atlas.isolateA.resistance_genes.map((g, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => atlas.openDrawer(g, atlas.isolateA!, atlas.datasetProvenance)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border ${SEMANTIC_STYLES.isolateA.badge}`}
                      >
                        {g.gene_symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Card B */}
              {atlas.isolateB && (
                <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs ${SEMANTIC_STYLES.isolateB.cardBorder}`}>
                  <h3 className="font-bold text-base text-emerald-900">Isolate B: {atlas.isolateB.isolate_id}</h3>
                  <p className="text-xs text-slate-500 italic mb-4">{atlas.isolateB.organism_name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atlas.isolateB.resistance_genes.map((g, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => atlas.openDrawer(g, atlas.isolateB!, atlas.datasetProvenance)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border ${SEMANTIC_STYLES.isolateB.badge}`}
                      >
                        {g.gene_symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 3 placeholder for Phase 2 verification */}
        {atlas.activeStep === 3 && (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Step 3: Compare Bacteria</h2>
            <p className="text-xs text-slate-500">Pairwise comparator & bipartite network will be wired in Phase 3.</p>
          </div>
        )}

        {/* Step 4 placeholder for Phase 2 verification */}
        {atlas.activeStep === 4 && (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Step 4: Create & Export Report</h2>
            <p className="text-xs text-slate-500">Evidence Brief & Markdown export will be wired in Phase 3.</p>
          </div>
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
