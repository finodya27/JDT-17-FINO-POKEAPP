import React from "react";
import { TYPE_COLORS } from "../../constant";

export interface SearchAndFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  search,
  setSearch,
  selectedType,
  setSelectedType,
  sortBy,
  setSortBy
}) => {
  const types = Object.keys(TYPE_COLORS);

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-gray-200/40 dark:border-gray-800/40 shadow-sm flex flex-col gap-3">
      
      <div className="relative w-full">
        
        <label htmlFor="pokemon-search" className="sr-only">
          Search Pokémon by name or ID
        </label>
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          id="pokemon-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Pokémon by name or ID..."
          aria-label="Search Pokémon by name or ID"
          className="w-full pl-9 pr-4 py-2 bg-white/20 dark:bg-black/20 focus:bg-white/40 dark:focus:bg-black/30 border border-gray-300/30 dark:border-gray-700/30 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
        />
      </div>

      
      <div className="flex gap-2.5 w-full">
        
        <div className="flex-1">
          <label htmlFor="type-select" className="sr-only">
            Filter by Pokémon type
          </label>
          <select
            id="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by Pokémon type"
            className="w-full px-3 py-2 bg-white/20 dark:bg-black/20 border border-gray-300/30 dark:border-gray-700/30 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-700 dark:text-gray-300 cursor-pointer appearance-none relative transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2523999' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.8rem center",
              backgroundSize: "0.8em"
            }}
          >
            <option value="" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">All Types</option>
            {types.map((type) => (
              <option
                key={type}
                value={type}
                className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 capitalize"
              >
                {type}
              </option>
            ))}
          </select>
        </div>

        
        <div className="flex-1">
          <label htmlFor="sort-select" className="sr-only">
            Sort Pokémon list
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort Pokémon list"
            className="w-full px-3 py-2 bg-white/20 dark:bg-black/20 border border-gray-300/30 dark:border-gray-700/30 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-700 dark:text-gray-300 cursor-pointer appearance-none relative transition-all"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2523999' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.8rem center",
              backgroundSize: "0.8em"
            }}
          >
            <option value="id-asc" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Lowest ID</option>
            <option value="id-desc" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Highest ID</option>
            <option value="name-asc" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Name (A - Z)</option>
            <option value="name-desc" className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">Name (Z - A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
