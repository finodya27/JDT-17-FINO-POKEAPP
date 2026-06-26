import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getPokemonList, getPokemonsByType } from "../../service/Pokemon";
import type { PokemonListItem } from "../../service/Pokemon/api";
import SearchAndFilters from "../../components/search-filters";
import PokemonCard from "../../components/pokemon-card";
import Button from "../../components/button";

// ------------------------------------------------------------------
// PERFORMANCE: Server-side pagination constants
// Instead of loading all 1025 at once, we fetch pages of PAGE_SIZE.
// When the user searches or filters by type, we switch to a full
// dataset fetch once (type queries return all matching Pokémon).
// ------------------------------------------------------------------
const PAGE_SIZE = 20;
const TOTAL_POKEMON = 1025;
const TOTAL_PAGES = Math.ceil(TOTAL_POKEMON / PAGE_SIZE);

const getPokemonIdFromUrl = (url: string): number => {
  const parts = url.split("/").filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

// ---------------------- Skeleton Loader ----------------------
const SkeletonGrid = () => (
  <div className="grid grid-cols-2 gap-4 mt-3" aria-label="Loading Pokémon..." role="status">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="h-44 rounded-2xl solid-card animate-pulse flex flex-col justify-between p-3.5"
        aria-hidden="true"
      >
        <div className="w-12 h-3.5 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="self-center w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="w-10 h-4 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>
    ))}
  </div>
);

// ---------------------- Pagination Controls ----------------------
interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6 px-1 z-10">
      <Button
        variant="secondary"
        disabled={page === 1}
        onClick={onPrev}
        className="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 select-none"
        aria-label="Previous page"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Prev</span>
      </Button>

      <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 font-mono tracking-wider" aria-live="polite">
        Page {page} of {totalPages}
      </span>

      <Button
        variant="secondary"
        disabled={page === totalPages}
        onClick={onNext}
        className="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 select-none"
        aria-label="Next page"
      >
        <span>Next</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
};

// ---------------------- Pokemon Grid ----------------------
interface PokemonGridProps {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const PokemonGrid: React.FC<PokemonGridProps> = ({
  pokemonList,
  isLoading,
  page,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (isLoading) return <SkeletonGrid />;

  if (pokemonList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full solid-card rounded-2xl p-10 text-center mt-4"
      >
        <div className="text-3xl mb-3" aria-hidden="true">🔍</div>
        <h2 className="m-0 text-sm font-bold text-gray-900 dark:text-white mb-1.5">
          No Pokémon Found
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto m-0 leading-relaxed">
          Try searching another Pokémon name or ID, or clear type filters to view the Pokémon database.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col justify-between flex-1">
      <div className="grid grid-cols-2 gap-4 mt-2">
        <AnimatePresence mode="popLayout">
          {pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.name} name={pokemon.name} />
          ))}
        </AnimatePresence>
      </div>
      <Pagination page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
    </div>
  );
};

// ---------------------- Homepage ----------------------
const Homepage: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("id-asc");

  // Server-side paginated browsing (no search/filter active)
  const [browsePage, setBrowsePage] = useState<number>(1);
  const browseOffset = (browsePage - 1) * PAGE_SIZE;

  // ------------------------------------------------------------------
  // Query 1: Paginated browsing — only fetches PAGE_SIZE at a time.
  // This eliminates the 16,000ms TBT from loading 1025 Pokémon upfront.
  // ------------------------------------------------------------------
  const { data: pagedData, isLoading: isLoadingPaged } = useQuery({
    queryKey: ["pokemon-list-paged", browsePage],
    queryFn: () => getPokemonList(PAGE_SIZE, browseOffset),
    enabled: selectedType === "" && search === "",
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  // ------------------------------------------------------------------
  // Query 2: When filtering by type, fetch all Pokémon of that type.
  // Type queries are already bounded (e.g. fire has ~64 Pokémon).
  // ------------------------------------------------------------------
  const { data: typePokemonData, isLoading: isLoadingType } = useQuery({
    queryKey: ["pokemon-list-type", selectedType],
    queryFn: () => getPokemonsByType(selectedType),
    enabled: selectedType !== "",
    staleTime: 60 * 60 * 1000,
  });

  // ------------------------------------------------------------------
  // Query 3: When searching, load the full list to search across all IDs/names.
  // We only trigger this when the user types something.
  // ------------------------------------------------------------------
  const { data: allPokemonData, isLoading: isLoadingAll } = useQuery({
    queryKey: ["pokemon-list-all"],
    queryFn: () => getPokemonList(TOTAL_POKEMON, 0),
    enabled: search !== "" && selectedType === "",
    staleTime: 60 * 60 * 1000,
  });

  const isLoading = search !== ""
    ? isLoadingAll
    : selectedType !== ""
    ? isLoadingType
    : isLoadingPaged;

  // ------------------------------------------------------------------
  // Filtered + sorted list (only used when search/type filter is active)
  // ------------------------------------------------------------------
  const filteredList = useMemo((): PokemonListItem[] => {
    // Browsing mode — return raw paged results (no filtering)
    if (search === "" && selectedType === "") return [];

    const rawList: PokemonListItem[] =
      selectedType !== ""
        ? typePokemonData?.pokemon?.map((p) => p.pokemon) ?? []
        : allPokemonData?.results ?? [];

    const searchClean = search.toLowerCase().trim();
    let filtered = rawList;

    if (searchClean) {
      filtered = rawList.filter((item) => {
        const id = getPokemonIdFromUrl(item.url).toString();
        return item.name.toLowerCase().includes(searchClean) || id === searchClean;
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      const idA = getPokemonIdFromUrl(a.url);
      const idB = getPokemonIdFromUrl(b.url);
      return sortBy === "id-desc" ? idB - idA : idA - idB;
    });
  }, [allPokemonData, typePokemonData, selectedType, search, sortBy]);

  // Pagination for filtered results (client-side)
  const [filterPage, setFilterPage] = useState<number>(1);
  const filterTotalPages = Math.max(Math.ceil(filteredList.length / PAGE_SIZE), 1);
  const visibleFiltered = filteredList.slice((filterPage - 1) * PAGE_SIZE, filterPage * PAGE_SIZE);

  // Reset filter page when filters change
  const handleSetSearch = (val: string) => { setSearch(val); setFilterPage(1); };
  const handleSetType = (val: string) => { setSelectedType(val); setFilterPage(1); setBrowsePage(1); };
  const handleSetSort = (val: string) => { setSortBy(val); setFilterPage(1); };
  const handleBrowsePrev = () => setBrowsePage((p) => Math.max(1, p - 1));
  const handleBrowseNext = () => setBrowsePage((p) => Math.min(TOTAL_PAGES, p + 1));
  const handleFilterPrev = () => setFilterPage((p) => Math.max(1, p - 1));
  const handleFilterNext = () => setFilterPage((p) => Math.min(filterTotalPages, p + 1));

  // Determine what to show
  const isFiltering = search !== "" || selectedType !== "";
  const displayList = isFiltering ? visibleFiltered : (pagedData?.results ?? []);
  const displayPage = isFiltering ? filterPage : browsePage;
  const displayTotalPages = isFiltering ? filterTotalPages : TOTAL_PAGES;
  const displayPrev = isFiltering ? handleFilterPrev : handleBrowsePrev;
  const displayNext = isFiltering ? handleFilterNext : handleBrowseNext;

  return (
    <div className="flex flex-col gap-4 w-full min-h-[70vh]">
      {/* Title banner */}
      <div className="text-center space-y-1 py-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white m-0">
          Pokémon Database
        </h1>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed m-0">
          Explore stats, animated sprites, and capture wild Pokémon dynamically from the PokéAPI database.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchAndFilters
        search={search}
        setSearch={handleSetSearch}
        selectedType={selectedType}
        setSelectedType={handleSetType}
        sortBy={sortBy}
        setSortBy={handleSetSort}
      />

      {/* Pokémon Grid */}
      <PokemonGrid
        key={`${search}-${selectedType}-${sortBy}-${displayPage}`}
        pokemonList={displayList}
        isLoading={isLoading}
        page={displayPage}
        totalPages={displayTotalPages}
        onPrev={displayPrev}
        onNext={displayNext}
      />
    </div>
  );
};

export default Homepage;
