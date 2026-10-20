import type { SemanticThemeKey } from '../lib/constants';
import { SEMANTIC_STYLES } from '../lib/constants';

interface GeneBadgeProps {
  symbol: string;
  geneClass?: string;
  theme?: SemanticThemeKey;
  onClick?: () => void;
  title?: string;
  compact?: boolean;
}

export function GeneBadge({
  symbol,
  geneClass,
  theme,
  onClick,
  title,
  compact = false,
}: GeneBadgeProps) {
  const styleClasses = theme
    ? SEMANTIC_STYLES[theme].badge
    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';

  const defaultTitle = title || `Inspect gene record: ${symbol}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={defaultTitle}
        className={`inline-flex items-center gap-1.5 border font-mono font-medium rounded transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 text-left ${styleClasses} ${
          compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <span>{symbol}</span>
        {geneClass && !compact && (
          <span className="text-[10px] font-sans opacity-70 border-l border-current pl-1.5 ml-0.5">
            {geneClass}
          </span>
        )}
      </button>
    );
  }

  return (
    <span
      title={defaultTitle}
      className={`inline-flex items-center gap-1.5 border font-mono font-medium rounded ${styleClasses} ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span>{symbol}</span>
      {geneClass && !compact && (
        <span className="text-[10px] font-sans opacity-70 border-l border-current pl-1.5 ml-0.5">
          {geneClass}
        </span>
      )}
    </span>
  );
}
