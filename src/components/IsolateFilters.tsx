import { Filter, RotateCcw, Search } from 'lucide-react';

interface IsolateFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  organismFilter: string;
  onOrganismChange: (val: string) => void;
  geneFilter: string;
  onGeneChange: (val: string) => void;
  classFilter: string;
  onClassChange: (val: string) => void;
  organismOptions: string[];
  geneOptions: string[];
  classOptions: string[];
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

export function IsolateFilters({
  searchQuery,
  onSearchChange,
  organismFilter,
  onOrganismChange,
  geneFilter,
  onGeneChange,
  classFilter,
  onClassChange,
  organismOptions,
  geneOptions,
  classOptions,
  totalCount,
  filteredCount,
  onResetFilters,
}: IsolateFiltersProps) {
  const hasActiveFilters = Boolean(
    searchQuery.trim() || organismFilter || geneFilter || classFilter
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Isolate Surveillance Filters</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Showing <strong className="text-slate-900">{filteredCount}</strong> of{' '}
            <strong className="text-slate-900">{totalCount}</strong> isolates
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Search Input */}
        <div className="space-y-1">
          <label htmlFor="search-input" className="block text-xs font-semibold text-slate-700">
            Search Isolates
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ID, organism, location..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Organism Select */}
        <div className="space-y-1">
          <label htmlFor="organism-select" className="block text-xs font-semibold text-slate-700">
            Organism Species
          </label>
          <select
            id="organism-select"
            value={organismFilter}
            onChange={(e) => onOrganismChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="">All Organisms ({organismOptions.length})</option>
            {organismOptions.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </div>

        {/* Gene Symbol Select */}
        <div className="space-y-1">
          <label htmlFor="gene-select" className="block text-xs font-semibold text-slate-700">
            Resistance Gene Symbol
          </label>
          <select
            id="gene-select"
            value={geneFilter}
            onChange={(e) => onGeneChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="">All Gene Symbols ({geneOptions.length})</option>
            {geneOptions.map((gene) => (
              <option key={gene} value={gene}>
                {gene}
              </option>
            ))}
          </select>
        </div>

        {/* Resistance Class Select */}
        <div className="space-y-1">
          <label htmlFor="class-select" className="block text-xs font-semibold text-slate-700">
            Resistance Class
          </label>
          <select
            id="class-select"
            value={classFilter}
            onChange={(e) => onClassChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="">All Resistance Classes ({classOptions.length})</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
