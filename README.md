# AMR Atlas — Client-Side Antimicrobial Resistance Research & Comparison Workspace

> Built for the BioPulse Hackathon. A 100% client-side privacy-first surveillance review and pairwise antimicrobial resistance (AMR) isolate comparator.

---

## 1. Problem, Users & Context

### The Challenge
Public genomic surveillance repositories such as NCBI Pathogen Detection and NCBI MicroBIGG-E catalog hundreds of thousands of bacterial isolates with annotated antimicrobial resistance determinants. However, the data is typically distributed as flat, multi-row tables (one row per detected resistance element). Researchers frequently encounter friction when attempting to:
- Visually explore cohort resistance patterns across multiple isolates without writing custom scripts.
- Audit pairwise differences between two isolates to understand shared versus unique resistance mechanisms.
- Trace individual gene annotations back to source NCBI nucleotide records (RefSeq / GenBank).
- Synthesize findings into standardized evidence briefs for lab meetings or surveillance logs.

### Target Audience
- **Microbiology Researchers & Lab Scientists** auditing resistance profiles across clinical and environmental bacterial isolates.
- **Genomic Epidemiology Students** exploring resistance mechanisms, gene classes, and cohort surveillance matrices.
- **Surveillance Analysts & Public Health Teams** rapidly inspecting isolate gene tables and generating shareable markdown summaries.

---

## 2. Key Features

1. **Cohort Gene Presence Matrix (`SurveillanceHeatmap.tsx`)**
   - Automatically computes and displays the top 12 most frequent resistance gene symbols across active filtered isolates.
   - Deterministic tie-breaking (count descending, then alphabetical).
   - High-density matrix supporting up to 50 filtered isolates with visual highlight rows for selected Isolate A and Isolate B.
   - Interactive cell buttons (`●`) that immediately reveal gene traceability and source accessions in the drawer.
   - Labeled strictly with the caveat: *"Counts reflect frequency within the active filtered dataset only, not clinical or population prevalence."*

2. **Pairwise Isolate Comparator & Bipartite SVG Network (`ComparisonPanel.tsx` & `GeneNetwork.tsx`)**
   - Interactive Slot A and Slot B isolate selection with bidirectional swapping (`Swap A ⇄ B`).
   - Comparative metric cards: Shared Gene Symbols, Unique to Isolate A, Unique to Isolate B, and Gene-Set Overlap percentage.
   - Dynamic SVG Bipartite Network connecting Isolate A and Isolate B hubs to three visual columns (Unique to A, Shared, Unique to B) via smooth cubic Bézier curves.
   - Accessibility-first: full keyboard navigation (`Tab`, `Enter`, `Space`), SVG `<title>` tooltips, node hover highlighting, and non-color cues (`● [A]`, `◆ [A+B]`, `■ [B]`).
   - Visual cap of 12 nodes per column in SVG with clear overflow indicators (`+N more in list below`), backed by complete uncapped lists below the graph.

3. **Gene Traceability Drawer & Evidence Brief Exporter (`TraceabilityDrawer.tsx` & `EvidenceReportView.tsx`)**
   - Slide-over drawer with isolate metadata, gene symbol, resistance class, source accession, and external NCBI lookup links (`Look up at NCBI ↗`).
   - Distinguishes multiple recorded annotations for the same symbol.
   - Evidence Brief view rendering complete isolate metadata, metric cards, partition lists, full accession tables, and explicit missing accessions auditing.
   - One-click **Download Markdown (.md)** export with sanitized filenames and **Copy Markdown** clipboard support.

4. **100% Client-Side Privacy & Offline Capability**
   - Zero runtime network calls, zero backend servers, zero database dependencies, and zero tracking scripts.
   - Data uploaded by the user stays entirely in browser memory.

---

## 3. Demo Data & Clinical Disclaimer

### Demo Dataset Provenance
AMR Atlas includes **16 modeled demo isolates** (prefixed with `DEMO-`, e.g., `DEMO-KP-001`, `DEMO-EC-002`) across *Klebsiella pneumoniae* and *Escherichia coli*. 
- The accession IDs in the demo dataset (e.g., `NG_049326.1`, `NG_048935.1`) are genuine NCBI reference records for the corresponding gene symbols.
- The demo isolates themselves and their resistance combinations are modeled for demonstration and comparison testing.

### Mandatory Clinical Disclaimer
AMR Atlas is a research support tool, not a clinical diagnostic test or antibiotic-prescribing system. The presence of a resistance-associated gene in public records does not by itself prove clinical phenotypic resistance.

---

## 4. Live Demo & Visuals

- **Live Deployment Link**: https://amr-atlas.pages.dev/
- **Repository**: https://github.com/example/amr-atlas

### Application Preview

```text
+-----------------------------------------------------------------------------------------+
| [Dna] AMR ATLAS  [BioPulse]         DEMO DATA - Modeled Isolates (Reference Accessions) |
| Active Pair: [A: DEMO-KP-001] <--> [B: DEMO-EC-002]  |  [Import CSV]  [Download Sample] |
+-----------------------------------------------------------------------------------------+
| [1. Choose & Filter]  -->  [2. Explore Evidence]  -->  [3. Compare]  -->  [4. Export]   |
+-----------------------------------------------------------------------------------------+
| Metric Summary:                                                                         |
| [ Shared: 3 ]   [ Unique A: 2 ]   [ Unique B: 3 ]   [ Overlap: 37.5% ]                  |
|                                                                                         |
| Bipartite Resistance Graph:                                                             |
|   ( Hub A: KP-001 )                         ( Hub B: EC-002 )                           |
|          \      \                             /      /                                  |
|     Unique to A    ---    Shared Genes    ---    Unique to B                            |
|     ● blaOXA-48           ◆ blaNDM-1             ■ mcr-1.1                              |
|     ● aac(6')-Ib          ◆ blaCTX-M-15          ■ qnrS1                                |
|                           ◆ sul1                 ■ tet(A)                               |
+-----------------------------------------------------------------------------------------+
```

---

## 5. How to Obtain a Real MicroBIGG-E CSV Export

You can export flat isolate resistance tables directly from NCBI:
1. Navigate to the NCBI MicroBIGG-E browser:
   https://www.ncbi.nlm.nih.gov/pathogens/microbigge/
2. Use the search filters (e.g., select Taxon: *Klebsiella pneumoniae*, Element type: `AMR`).
3. Click the **Download** button at the top right of the search results table.
4. Choose **Custom tabular (CSV)** or **All fields (CSV)**.
5. In AMR Atlas, click **Import CSV** in the top navigation bar and select your downloaded file.
6. AMR Atlas automatically normalizes header aliases (`isolate_id`, `strain`, `biosample`, `gene_symbol`, `element_symbol`, `gene_class`, `refseq_accession`, etc.) and filters out non-AMR elements like `STRESS` or `VIRULENCE`.

---

## 6. Scientific Honesty & Security Guardrails

- **No Remote Sequence Alignment**: AMR Atlas operates exclusively on tabular metadata. It does not perform BLAST, de novo assembly, or raw sequence alignments.
- **Gene-Set Overlap != Genetic Relatedness**: The Jaccard metric is labeled strictly as *"Gene-set overlap (not genetic relatedness)"*. Shared resistance genes frequently travel via horizontal gene transfer on plasmids and do not imply clonal descent.
- **Lookups, Not Remote Verification**: External links are labeled *"Look up at NCBI ↗"* and navigate directly to public NCBI records. AMR Atlas does not assert that external accession records have been remotely validated.
- **Zero XSS Exposure**: All imported values are rendered through safe React JSX text bindings. Dynamic HTML injection (`dangerouslySetInnerHTML`) is strictly prohibited.
- **Privacy & Storage**: No `localStorage` is used. `sessionStorage` is utilized solely for the intro splash display flag and is always guarded with `try/catch` fallbacks.

---

## 7. Local Development & Verification

### Prerequisites
- Node.js version 20.19+ or 22.12+ (tested on Node v24)
- npm version 9+

### Installation & Execution
```bash
# Clone the repository
git clone https://github.com/example/amr-atlas.git
cd amr-atlas

# Install pinned dependencies
npm install

# Run the automated verification assertion suite (all 9 assertions + tsc -b)
npm run check

# Start the local Vite development server
npm run dev

# Compile the production bundle
npm run build
```

---

## 8. Deployment

Because AMR Atlas is built with `base: './'` in `vite.config.ts`, the generated `dist/` directory can be deployed to any static host:

### Cloudflare Pages
```bash
npm run build
# Deploy the 'dist' output directory
```

### GitHub Pages
1. Push your repository to GitHub.
2. In Repository Settings -> Pages, select **GitHub Actions** as the source.
3. Configure the standard Vite deployment workflow targeting `dist/`.

### Netlify / Vercel
- Build command: `npm run build`
- Publish directory: `dist`

---

## 9. Technology Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v3.4 (with explicit semantic lookup objects)
- **Icons**: Lucide React
- **Parsing**: PapaParse (Excel BOM-safe with streaming header normalization)
- **Assertion Runner**: tsx
