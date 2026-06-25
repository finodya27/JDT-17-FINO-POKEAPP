import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getPokemonList, getPokemonsByType } from "../../service/Pokemon";
import SearchAndFilters from "../../components/search-filters";
import PokemonCard from "../../components/pokemon-card";
import Button from "../../components/button";

const getPokemonIdFromUrl = (url) => {
  const parts = url.split("/").filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

// Keyed sub-component to manage pagination state and auto-reset when filters change
const PokemonGrid = ({ processedPokemonList, isLoading }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.max(Math.ceil(processedPokemonList.length / itemsPerPage), 1);

  const visiblePokemon = useMemo(() => {
    return processedPokemonList.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [processedPokemonList, page]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3.5 mt-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-44 rounded-2xl solid-card animate-pulse flex flex-col justify-between p-3.5"
          >
            <div className="w-12 h-3.5 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="self-center w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="w-10 h-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (visiblePokemon.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full solid-card rounded-2xl p-10 text-center mt-4"
      >
        <div className="text-3xl mb-3">🔍</div>
        <h3 className="m-0 text-sm font-bold text-gray-900 dark:text-white mb-1.5">
          No Pokémon Found
        </h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto m-0 leading-relaxed">
          Try searching another Pokémon name or ID, or clear type filters to view the Pokedex database.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col justify-between flex-1">
      {/* 2-Column Mobile-First Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5 mt-1.5">
        <AnimatePresence mode="popLayout">
          {visiblePokemon.map((pokemon) => (
            <PokemonCard key={pokemon.name} name={pokemon.name} />
          ))}
        </AnimatePresence>
      </div>

      {/* Structured Numeric Page Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-1 z-10">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 select-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Prev</span>
          </Button>

          <span className="text-[10px] font-extrabold text-gray-450 dark:text-gray-500 font-mono tracking-wider">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1 select-none"
          >
            <span>Next</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

const Homepage = () => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("id-asc");

  // Query 1: Fetch all mainline Pokémon (1025)
  const { data: allPokemonData, isLoading: isLoadingAll } = useQuery({
    queryKey: ["pokemon-list-all"],
    queryFn: () => getPokemonList(1025, 0),
    enabled: selectedType === "",
    staleTime: 60 * 60 * 1000 // Cache for 1 hour
  });

  // Query 2: Fetch Pokémon by type
  const { data: typePokemonData, isLoading: isLoadingType } = useQuery({
    queryKey: ["pokemon-list-type", selectedType],
    queryFn: () => getPokemonsByType(selectedType),
    enabled: selectedType !== "",
    staleTime: 60 * 60 * 1000 // Cache for 1 hour
  });

  const isLoading = selectedType === "" ? isLoadingAll : isLoadingType;

  // Memoized process: Filter and sort list client-side
  const processedPokemonList = useMemo(() => {
    const rawList =
      selectedType === ""
        ? allPokemonData?.results || []
        : typePokemonData?.pokemon?.map((p) => p.pokemon) || [];

    // Filter by name or ID
    const searchClean = search.toLowerCase().trim();
    let filtered = rawList;

    if (searchClean) {
      filtered = rawList.filter((item) => {
        const id = getPokemonIdFromUrl(item.url).toString();
        return item.name.toLowerCase().includes(searchClean) || id === searchClean;
      });
    }

    // Sort list
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      const idA = getPokemonIdFromUrl(a.url);
      const idB = getPokemonIdFromUrl(b.url);

      if (sortBy === "id-desc") {
        return idB - idA;
      }
      return idA - idB; // Default: id-asc
    });

    return sorted;
  }, [allPokemonData, typePokemonData, selectedType, search, sortBy]);

  // Unique key to force React to reset pagination state in child component when filters/search change
  const gridKey = `${search}-${selectedType}-${sortBy}`;

  return (
    <div className="flex flex-col gap-4 w-full min-h-[70vh]">
      {/* Title banner */}
      <div className="text-center space-y-1 py-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white m-0">
          Pokédex Database
        </h1>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed m-0">
          Explore stats, animated sprites, and capture wild Pokémon dynamically from the PokéAPI database.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchAndFilters
        search={search}
        setSearch={setSearch}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Render the Grid component */}
      <PokemonGrid
        key={gridKey}
        processedPokemonList={processedPokemonList}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Homepage;
