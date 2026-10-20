import { useState } from 'react';
import type { AMRIsolate, ComparisonResult, DatasetProvenance, GeneGroup, ResistanceGene } from '../types/amr';

interface GeneNetworkProps {
  isolateA: AMRIsolate;
  isolateB: AMRIsolate;
  comparison: ComparisonResult;
  onOpenDrawer: (gene: ResistanceGene, isolate: AMRIsolate, provenance?: DatasetProvenance) => void;
  datasetProvenance: DatasetProvenance;
}

export function GeneNetwork({
  isolateA,
  isolateB,
  comparison,
  onOpenDrawer,
  datasetProvenance,
}: GeneNetworkProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const { uniqueToA, shared, uniqueToB } = comparison;

  const maxVisualNodes = 12;
  const visualA = uniqueToA.slice(0, maxVisualNodes);
  const visualShared = shared.slice(0, maxVisualNodes);
  const visualB = uniqueToB.slice(0, maxVisualNodes);

  const overflowA = uniqueToA.length - visualA.length;
  const overflowShared = shared.length - visualShared.length;
  const overflowB = uniqueToB.length - visualB.length;

  const maxRowCount = Math.max(
    visualA.length + (overflowA > 0 ? 1 : 0),
    visualShared.length + (overflowShared > 0 ? 1 : 0),
    visualB.length + (overflowB > 0 ? 1 : 0),
    1
  );

  const rowHeight = 44;
  const startY = 120;
  const svgHeight = Math.max(380, startY + maxRowCount * rowHeight + 40);

  // Layout Coordinates
  const hubAX = 200;
  const hubAY = 50;
  const hubBX = 700;
  const hubBY = 50;

  const colAX = 160;
  const colSharedX = 450;
  const colBX = 740;

  const handleGeneClick = (group: GeneGroup, preferredIsolate: 'A' | 'B' | 'any') => {
    let gene: ResistanceGene | undefined;
    let iso: AMRIsolate;

    if (preferredIsolate === 'A' || (preferredIsolate === 'any' && group.annotationsA.length > 0)) {
      gene = group.annotationsA[0];
      iso = isolateA;
    } else {
      gene = group.annotationsB[0];
      iso = isolateB;
    }

    if (gene) {
      onOpenDrawer(gene, iso, datasetProvenance);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, group: GeneGroup, preferredIsolate: 'A' | 'B' | 'any') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleGeneClick(group, preferredIsolate);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Legend & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
        <div className="font-semibold text-slate-800">
          Pairwise Resistance Bipartite Network
        </div>

        {/* Visual Non-Color Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600">
          <div className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>● [A] Unique to Isolate A</span>
          </div>
          <div className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 inline-block" />
            <span>◆ [A+B] Shared Gene</span>
          </div>
          <div className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
            <span>■ [B] Unique to Isolate B</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-x-auto border border-slate-200 rounded-xl bg-slate-950/2">
        <svg
          role="img"
          aria-label={`Bipartite resistance network between ${isolateA.isolate_id} and ${isolateB.isolate_id}`}
          viewBox={`0 0 900 ${svgHeight}`}
          className="w-full min-w-[760px] h-auto select-none font-sans"
        >
          <defs>
            {/* Subtle Dot Grid Pattern */}
            <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#94a3b8" fillOpacity="0.25" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="900" height={svgHeight} fill="url(#dot-grid)" />

          {/* Edges Layer */}
          <g className="edges">
            {/* Edges from Hub A to Unique A */}
            {visualA.map((g, idx) => {
              const targetY = startY + idx * rowHeight;
              const isHovered = hoveredKey === g.key;
              const d = `M ${hubAX} ${hubAY} C ${hubAX} ${(hubAY + targetY) / 2}, ${colAX} ${
                (hubAY + targetY) / 2
              }, ${colAX} ${targetY}`;
              return (
                <path
                  key={`edge-a-${g.key}`}
                  d={d}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 0.95 : 0.45}
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Edges from Hub A to Shared */}
            {visualShared.map((g, idx) => {
              const targetY = startY + idx * rowHeight;
              const isHovered = hoveredKey === g.key;
              const d = `M ${hubAX} ${hubAY} C ${hubAX + 80} ${(hubAY + targetY) / 2}, ${
                colSharedX - 60
              } ${(hubAY + targetY) / 2}, ${colSharedX} ${targetY}`;
              return (
                <path
                  key={`edge-shared-a-${g.key}`}
                  d={d}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 0.95 : 0.5}
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Edges from Hub B to Shared */}
            {visualShared.map((g, idx) => {
              const targetY = startY + idx * rowHeight;
              const isHovered = hoveredKey === g.key;
              const d = `M ${hubBX} ${hubBY} C ${hubBX - 80} ${(hubBY + targetY) / 2}, ${
                colSharedX + 60
              } ${(hubBY + targetY) / 2}, ${colSharedX} ${targetY}`;
              return (
                <path
                  key={`edge-shared-b-${g.key}`}
                  d={d}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 0.95 : 0.5}
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Edges from Hub B to Unique B */}
            {visualB.map((g, idx) => {
              const targetY = startY + idx * rowHeight;
              const isHovered = hoveredKey === g.key;
              const d = `M ${hubBX} ${hubBY} C ${hubBX} ${(hubBY + targetY) / 2}, ${colBX} ${
                (hubBY + targetY) / 2
              }, ${colBX} ${targetY}`;
              return (
                <path
                  key={`edge-b-${g.key}`}
                  d={d}
                  fill="none"
                  stroke="#059669"
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 0.95 : 0.45}
                  className="transition-all duration-150"
                />
              );
            })}
          </g>

          {/* Isolate Hub A */}
          <g transform={`translate(${hubAX}, ${hubAY})`}>
            <circle cx="0" cy="0" r="26" fill="#2563eb" className="shadow-md" />
            <circle cx="0" cy="0" r="21" fill="#1d4ed8" />
            <text textAnchor="middle" dy="-3" fill="#ffffff" fontSize="11" fontWeight="bold">
              Isolate A
            </text>
            <text textAnchor="middle" dy="12" fill="#bfdbfe" fontSize="9" fontFamily="monospace">
              {isolateA.isolate_id.length > 14
                ? `${isolateA.isolate_id.slice(0, 12)}…`
                : isolateA.isolate_id}
            </text>
          </g>

          {/* Isolate Hub B */}
          <g transform={`translate(${hubBX}, ${hubBY})`}>
            <circle cx="0" cy="0" r="26" fill="#059669" className="shadow-md" />
            <circle cx="0" cy="0" r="21" fill="#047857" />
            <text textAnchor="middle" dy="-3" fill="#ffffff" fontSize="11" fontWeight="bold">
              Isolate B
            </text>
            <text textAnchor="middle" dy="12" fill="#a7f3d0" fontSize="9" fontFamily="monospace">
              {isolateB.isolate_id.length > 14
                ? `${isolateB.isolate_id.slice(0, 12)}…`
                : isolateB.isolate_id}
            </text>
          </g>

          {/* Column Headers */}
          <text x={colAX} y={startY - 25} textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">
            Unique to A ({uniqueToA.length})
          </text>
          <text x={colSharedX} y={startY - 25} textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="bold">
            Shared Genes ({shared.length})
          </text>
          <text x={colBX} y={startY - 25} textAnchor="middle" fill="#065f46" fontSize="12" fontWeight="bold">
            Unique to B ({uniqueToB.length})
          </text>

          {/* Unique to A Nodes */}
          {visualA.map((g, idx) => {
            const y = startY + idx * rowHeight;
            const isHovered = hoveredKey === g.key;
            return (
              <g
                key={`node-a-${g.key}`}
                role="button"
                tabIndex={0}
                onClick={() => handleGeneClick(g, 'A')}
                onKeyDown={(e) => handleKeyDown(e, g, 'A')}
                onMouseEnter={() => setHoveredKey(g.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(g.key)}
                onBlur={() => setHoveredKey(null)}
                transform={`translate(${colAX}, ${y})`}
                className="cursor-pointer outline-none"
              >
                <title>{`[Unique to A] ${g.display} — Click to inspect traceability`}</title>
                <rect
                  x="-75"
                  y="-14"
                  width="150"
                  height="28"
                  rx="6"
                  fill={isHovered ? '#dbeafe' : '#eff6ff'}
                  stroke={isHovered ? '#2563eb' : '#bfdbfe'}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <circle cx="-60" cy="0" r="4.5" fill="#2563eb" />
                <text
                  x="-48"
                  y="4"
                  fill="#1e3a8a"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {g.display.length > 13 ? `${g.display.slice(0, 12)}…` : g.display}
                </text>
              </g>
            );
          })}
          {overflowA > 0 && (
            <g transform={`translate(${colAX}, ${startY + visualA.length * rowHeight})`}>
              <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
              <text x="0" y="4" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                +{overflowA} more in list below
              </text>
            </g>
          )}

          {/* Shared Nodes */}
          {visualShared.map((g, idx) => {
            const y = startY + idx * rowHeight;
            const isHovered = hoveredKey === g.key;
            return (
              <g
                key={`node-shared-${g.key}`}
                role="button"
                tabIndex={0}
                onClick={() => handleGeneClick(g, 'any')}
                onKeyDown={(e) => handleKeyDown(e, g, 'any')}
                onMouseEnter={() => setHoveredKey(g.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(g.key)}
                onBlur={() => setHoveredKey(null)}
                transform={`translate(${colSharedX}, ${y})`}
                className="cursor-pointer outline-none"
              >
                <title>{`[Shared] ${g.display} — Click to inspect traceability`}</title>
                <rect
                  x="-80"
                  y="-14"
                  width="160"
                  height="28"
                  rx="6"
                  fill={isHovered ? '#fef3c7' : '#fffbeb'}
                  stroke={isHovered ? '#d97706' : '#fde68a'}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <polygon
                  points="-65,-4 -61,0 -65,4 -69,0"
                  fill="#d97706"
                />
                <text
                  x="-52"
                  y="4"
                  fill="#78350f"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {g.display.length > 14 ? `${g.display.slice(0, 13)}…` : g.display}
                </text>
              </g>
            );
          })}
          {overflowShared > 0 && (
            <g transform={`translate(${colSharedX}, ${startY + visualShared.length * rowHeight})`}>
              <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
              <text x="0" y="4" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                +{overflowShared} more in list below
              </text>
            </g>
          )}

          {/* Unique to B Nodes */}
          {visualB.map((g, idx) => {
            const y = startY + idx * rowHeight;
            const isHovered = hoveredKey === g.key;
            return (
              <g
                key={`node-b-${g.key}`}
                role="button"
                tabIndex={0}
                onClick={() => handleGeneClick(g, 'B')}
                onKeyDown={(e) => handleKeyDown(e, g, 'B')}
                onMouseEnter={() => setHoveredKey(g.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(g.key)}
                onBlur={() => setHoveredKey(null)}
                transform={`translate(${colBX}, ${y})`}
                className="cursor-pointer outline-none"
              >
                <title>{`[Unique to B] ${g.display} — Click to inspect traceability`}</title>
                <rect
                  x="-75"
                  y="-14"
                  width="150"
                  height="28"
                  rx="6"
                  fill={isHovered ? '#d1fae5' : '#ecfdf5'}
                  stroke={isHovered ? '#059669' : '#a7f3d0'}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <rect x="-64" y="-4" width="8" height="8" rx="1.5" fill="#059669" />
                <text
                  x="-48"
                  y="4"
                  fill="#064e3b"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {g.display.length > 13 ? `${g.display.slice(0, 12)}…` : g.display}
                </text>
              </g>
            );
          })}
          {overflowB > 0 && (
            <g transform={`translate(${colBX}, ${startY + visualB.length * rowHeight})`}>
              <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1" />
              <text x="0" y="4" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
                +{overflowB} more in list below
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Screen-reader and accessible summary paragraph */}
      <p className="text-xs text-slate-500 leading-relaxed">
        Bipartite visualization of resistance genes for <strong>{isolateA.isolate_id}</strong> (Isolate A) and{' '}
        <strong>{isolateB.isolate_id}</strong> (Isolate B). Displays {visualShared.length} of {shared.length} shared resistance genes in amber,{' '}
        {visualA.length} of {uniqueToA.length} unique genes to Isolate A in blue, and {visualB.length} of {uniqueToB.length} unique genes to Isolate B in emerald.
        Click or press Enter on any node to view accession and reference records in the Traceability Drawer.
      </p>
    </div>
  );
}
