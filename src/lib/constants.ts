export const CLINICAL_DISCLAIMER =
  "AMR Atlas is a research support tool, not a clinical diagnostic test or antibiotic-prescribing system. The presence of a resistance-associated gene in public records does not by itself prove clinical phenotypic resistance.";

export type SemanticThemeKey = 'isolateA' | 'isolateB' | 'shared';

export interface SemanticStyle {
  badge: string;
  cardBorder: string;
  svgHex: string;
  textHex: string;
  label: string;
}

export const SEMANTIC_STYLES: Record<SemanticThemeKey, SemanticStyle> = {
  isolateA: {
    badge: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    cardBorder: 'border-t-4 border-t-blue-600',
    svgHex: '#2563eb',
    textHex: 'text-blue-600',
    label: 'Isolate A',
  },
  isolateB: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    cardBorder: 'border-t-4 border-t-emerald-600',
    svgHex: '#059669',
    textHex: 'text-emerald-600',
    label: 'Isolate B',
  },
  shared: {
    badge: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    cardBorder: 'border-t-4 border-t-amber-600',
    svgHex: '#d97706',
    textHex: 'text-amber-600',
    label: 'Shared',
  },
};
