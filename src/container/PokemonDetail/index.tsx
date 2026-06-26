import React, { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPokemonDetail,
  getPokemonSpecies,
  getEvolutionChain
} from "../../service/Pokemon";
import type { EvolutionNode } from "../../types";
import { capitalize, padId } from "../../lib/utils";
import { TYPE_COLORS } from "../../constant";
import Button from "../../components/button";
import { usePokemonStore } from "../../store";

// Helper to extract Pokemon ID from PokeAPI URL
const getPokemonIdFromUrl = (url: string): number => {
  const parts = url.split("/").filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

interface EvolutionChainItem {
  name: string;
  id: number;
}

// Recursive helper to flatten evolution chain pathways
const getEvolutionList = (chainNode: EvolutionNode | undefined | null): EvolutionChainItem[] => {
  if (!chainNode) return [];
  const list = [
    {
      name: chainNode.species.name,
      id: getPokemonIdFromUrl(chainNode.species.url)
    }
  ];

  if (chainNode.evolves_to && chainNode.evolves_to.length > 0) {
    chainNode.evolves_to.forEach((branch) => {
      list.push(...getEvolutionList(branch));
    });
  }

  return list;
};

const PokemonDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addPokemon, myPokemon, releasePokemon } = usePokemonStore();

  const isFromBag = (location.state as any)?.from === "bag";
  const targetUniqueId = (location.state as any)?.uniqueId;

  // Search for the caught Pokémon instance by uniqueId or name
  const caughtInstance = myPokemon.find((p) =>
    (targetUniqueId && p.uniqueId === targetUniqueId) ||
    (!targetUniqueId && p.name.toLowerCase() === name?.toLowerCase())
  );

  // Catch gameplay states
  const [catchState, setCatchState] = useState<"idle" | "throwing" | "success" | "fail">("idle");
  const [nickname, setNickname] = useState<string>("");
  const [showReleaseConfirm, setShowReleaseConfirm] = useState<boolean>(false);

  // Query 1: Get standard detailed stats, types, weight, height, cries
  const { data: pokemon, isLoading: isLoadingDetail, error: errorDetail } = useQuery({
    queryKey: ["pokemon-detail", name],
    queryFn: () => getPokemonDetail(name || ""),
    enabled: !!name,
    staleTime: 15 * 60 * 1000 // 15 mins cache
  });

  // Query 2: Get species data (flavor text description, egg groups, capture_rate, evolution_chain url)
  const { data: species, isLoading: isLoadingSpecies } = useQuery({
    queryKey: ["pokemon-species", name],
    queryFn: () => getPokemonSpecies(name || ""),
    enabled: !!pokemon && !!name,
    staleTime: 15 * 60 * 1000
  });

  // Query 3: Get evolution chain hierarchy
  const evolutionChainUrl = species?.evolution_chain?.url;
  const { data: evolutionData, isLoading: isLoadingEvolution } = useQuery({
    queryKey: ["pokemon-evolution", evolutionChainUrl],
    queryFn: () => getEvolutionChain(evolutionChainUrl || ""),
    enabled: !!evolutionChainUrl,
    staleTime: 15 * 60 * 1000
  });

  const isLoading = isLoadingDetail || isLoadingSpecies || isLoadingEvolution;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center min-h-[60vh] w-full">
        <div className="relative w-12 h-12 flex items-center justify-center bg-red-500 rounded-full border-4 border-gray-900 shadow-md animate-spin">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-red-500 rounded-t-full"></div>
          <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white rounded-b-full"></div>
          <div className="w-full h-0.5 bg-gray-900 z-10"></div>
          <div className="absolute w-3 h-3 bg-white border border-gray-900 rounded-full z-20"></div>
        </div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
          Loading Pokémon details...
        </p>
      </div>
    );
  }

  if (errorDetail || !pokemon) {
    return (
      <div className="text-center py-10 solid-card rounded-2xl border border-red-200/50 mt-4 max-w-sm mx-auto">
        <div className="text-3xl mb-3">⚠️</div>
        <h3 className="m-0 text-sm font-bold text-red-500 mb-1">Failed to load Pokémon</h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Internet connection issues or invalid Pokémon data.
        </p>
        <Link to="/" className="no-underline">
          <Button variant="secondary" className="px-4 py-2 text-xs">Back to Pokedex</Button>
        </Link>
      </div>
    );
  }

  // Formatting primary elements
  const primaryType = pokemon.types?.[0]?.type?.name || "normal";
  const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  // Resolve animated sprites
  const animatedFront =
    pokemon.sprites?.other?.showdown?.front_default ||
    pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
    pokemon.sprites?.front_default ||
    "";
  const animatedShiny =
    pokemon.sprites?.other?.showdown?.front_shiny ||
    pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny ||
    pokemon.sprites?.front_shiny ||
    "";

  // Extract English Genus / Category
  const categoryName = species?.genera?.find((g) => g.language.name === "en")?.genus || "Pokémon";

  // Extract English flavor description
  const descriptionText =
    species?.flavor_text_entries
      ?.find((entry) => entry.language.name === "en")
      ?.flavor_text.replace(/\f/g, " ")
      .replace(/\n/g, " ") || "No description available.";

  // Fetch evolutions list
  const evolutionList = evolutionData ? getEvolutionList(evolutionData.chain) : [];

  // Plays cry sound
  const handlePlayCry = () => {
    const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy;
    if (cryUrl) {
      const audio = new Audio(cryUrl);
      audio.volume = 0.45;
      audio.play().catch((err) => console.error("Error playing audio cry:", err));
    }
  };

  // Handles Gacha Catch RNG Mechanic (50% probability success)
  const handleCatchPokemon = () => {
    setCatchState("throwing");
    setNickname(capitalize(pokemon.name)); // Default nickname is species name

    setTimeout(() => {
      const success = Math.random() < 0.5;
      if (success) {
        setCatchState("success");
      } else {
        setCatchState("fail");
      }
    }, 1500); // 1.5s wiggling suspense
  };

  const handleSaveToBag = () => {
    addPokemon(pokemon, nickname);
    setCatchState("idle");
    navigate("/my-pokemon");
  };

  return (
    <div className="flex flex-col gap-4 w-full relative">
      {/* Back Button */}
      <div className="self-start">
        <Link to={isFromBag ? "/my-pokemon" : "/"} className="no-underline">
          <Button variant="secondary" className="px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{isFromBag ? "Back to Bag" : "Back to Pokedex"}</span>
          </Button>
        </Link>
      </div>

      {/* Profile Card & Info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl solid-card p-5 flex flex-col items-center relative overflow-hidden transition-theme"
      >
        {/* Background glow disc */}
        <div
          className="absolute -top-14 -right-14 w-28 h-28 rounded-full blur-2xl opacity-10 dark:opacity-15"
          style={{ backgroundColor: typeStyle.hex }}
        ></div>

        {/* Title block */}
        <div className="text-center w-full z-10">
          <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">
            {padId(pokemon.id)}
          </span>
          <h2 className="m-0 mt-0.5 text-xl font-extrabold tracking-wide text-gray-800 dark:text-gray-100">
            {caughtInstance ? caughtInstance.nickname : capitalize(pokemon.name)}
          </h2>
          <p className="text-[9px] font-extrabold text-gray-550 dark:text-gray-400 mt-0.5 tracking-wider uppercase">
            {caughtInstance && caughtInstance.nickname.toLowerCase() !== pokemon.name.toLowerCase()
              ? `${capitalize(pokemon.name)} • ${categoryName}`
              : categoryName}
          </p>
        </div>

        {/* Animated Showcase Layout (Normal & Shiny side by side) */}
        <div className="flex justify-center items-center gap-6 my-4 w-full z-10">
          {/* Normal Animated GIF */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 border border-gray-400/10 dark:border-gray-800/10 rounded-2xl flex items-center justify-center p-2">
              <img src={animatedFront} alt={pokemon.name} className="w-14 h-14 object-contain" />
            </div>
            <span className="text-[9px] font-extrabold text-gray-550 dark:text-gray-300 tracking-wider uppercase">Normal</span>
          </div>

          {/* Shiny Animated GIF */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 border border-gray-400/10 dark:border-gray-800/10 rounded-2xl flex items-center justify-center p-2">
              <img src={animatedShiny} alt={`${pokemon.name}-shiny`} className="w-14 h-14 object-contain" />
            </div>
            <span className="text-[9px] font-extrabold text-gray-555 dark:text-gray-300 tracking-wider uppercase">Shiny</span>
          </div>
        </div>

        {/* Type badges - solid colored for high contrast */}
        <div className="flex gap-1.5 mb-5 z-10">
          {pokemon.types?.map((t) => {
            const tName = t.type.name;
            const tStyle = TYPE_COLORS[tName] || TYPE_COLORS.normal;
            return (
              <span
                key={tName}
                style={{
                  backgroundColor: tStyle.hex,
                  color: "#ffffff"
                }}
                className="px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm"
              >
                {tName}
              </span>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="flex gap-2.5 w-full z-10">
          <Button
            variant="secondary"
            onClick={handlePlayCry}
            className="flex-1 py-2 rounded-xl text-xs"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>Sound</span>
          </Button>

          {isFromBag ? (
            <Button
              variant="danger"
              onClick={() => setShowReleaseConfirm(true)}
              className="flex-2 py-2 rounded-xl text-xs shadow-md shadow-red-650/15"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Release</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCatchPokemon}
              className="flex-2 py-2 rounded-xl text-xs shadow-md shadow-red-500/15"
            >
              <div className="w-3.5 h-3.5 relative flex items-center justify-center bg-white rounded-full border border-gray-900">
                <div className="absolute top-0 left-0 w-full h-[40%] bg-red-500 rounded-t-full"></div>
                <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white rounded-b-full"></div>
                <div className="w-full h-0.5 bg-gray-900 z-10"></div>
                <div className="w-1 h-1 bg-white border border-gray-900 rounded-full z-20"></div>
              </div>
              <span>Catch!</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Description, Profile Info & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl solid-card p-4.5 shadow-sm flex flex-col gap-4 transition-theme"
      >
        {/* Description */}
        <div className="space-y-1">
          <h2 className="m-0 text-xs font-extrabold uppercase tracking-wider text-gray-555 dark:text-gray-300">
            Description
          </h2>
          <p className="text-xs text-gray-655 dark:text-gray-300 leading-relaxed m-0">
            {descriptionText}
          </p>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-2 gap-3 border-t border-b border-gray-250/20 dark:border-gray-800/40 py-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-gray-550 dark:text-gray-300 uppercase tracking-wide">
              Height
            </span>
            <p className="m-0 text-xs font-bold text-gray-800 dark:text-white">
              {(pokemon.height / 10).toFixed(1)} m
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold text-gray-555 dark:text-gray-300 uppercase tracking-wide">
              Weight
            </span>
            <p className="m-0 text-xs font-bold text-gray-800 dark:text-white">
              {(pokemon.weight / 10).toFixed(1)} kg
            </p>
          </div>
          <div className="col-span-2 space-y-0.5">
            <span className="text-[9px] font-extrabold text-gray-555 dark:text-gray-300 uppercase tracking-wide">
              Abilities
            </span>
            <p className="m-0 text-xs font-bold text-gray-800 dark:text-white capitalize">
              {pokemon.abilities?.map((a) => a.ability.name.replace("-", " ")).join(", ")}
            </p>
          </div>
        </div>

        {/* Base Stats */}
        <div className="space-y-2">
          <h2 className="m-0 text-xs font-extrabold uppercase tracking-wider text-gray-555 dark:text-gray-300 mb-1">
            Base Stats
          </h2>
          <div className="space-y-2">
            {pokemon.stats?.map((stat) => {
              const statLabel = stat.stat.name
                .replace("special-attack", "Sp. Atk")
                .replace("special-defense", "Sp. Def")
                .toUpperCase();
              const value = stat.base_stat;
              const percentage = Math.min((value / 180) * 100, 100);

              return (
                <div key={stat.stat.name} className="flex items-center text-[10px] font-bold">
                  <span className="w-16 text-gray-555 dark:text-gray-300 text-[9px] uppercase tracking-wide">
                    {statLabel}
                  </span>
                  <span className="w-8 text-right font-mono font-bold text-gray-800 dark:text-gray-100 pr-2.5">
                    {value}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: typeStyle.hex
                      }}
                      className="h-full stat-bar-fill rounded-full"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Evolution Chain Component */}
      {evolutionList.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl solid-card p-4.5 shadow-sm flex flex-col gap-3 transition-theme"
        >
          <h2 className="m-0 text-xs font-extrabold uppercase tracking-wider text-gray-555 dark:text-gray-400">
            Evolution Chain
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 py-1">
            {evolutionList.map((evol, idx) => {
              const evolSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${evol.id}.gif`;
              const isCurrent = evol.name === name;

              return (
                <div key={evol.name} className="flex items-center gap-2">
                  {idx > 0 && (
                    <div className="text-gray-300 dark:text-gray-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                  <Link
                    to={`/pokemon/${evol.name}`}
                    className={`no-underline flex flex-col items-center p-2.5 rounded-xl border transition-all duration-200 group ${
                      isCurrent
                        ? "bg-red-500/10 border-red-500/30 scale-102"
                        : "border-gray-200/50 dark:border-gray-800/50 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <img
                      src={evolSprite}
                      alt={evol.name}
                      className="w-10 h-10 object-contain group-hover:scale-108 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evol.id}.png`;
                      }}
                    />
                    <span
                      className={`text-[9px] font-bold mt-1 capitalize ${
                        isCurrent ? "text-red-500 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {evol.name}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Catch System Gameplay Overlay Modal */}
      <AnimatePresence>
        {catchState !== "idle" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-[28px] md:rounded-[26px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs solid-card rounded-2xl p-5 shadow-xl"
            >
              {/* State 1: Ball Throwing Suspense */}
              {catchState === "throwing" && (
                <div className="text-center py-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 relative flex items-center justify-center bg-white rounded-full border-4 border-gray-900 shadow-md pokeball-shake shadow-red-500/15">
                    <div className="absolute top-0 left-0 w-full h-[40%] bg-red-500 rounded-t-full"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white rounded-b-full"></div>
                    <div className="w-full h-0.5 bg-gray-900 z-10"></div>
                    <div className="absolute w-3.5 h-3.5 bg-white border-2 border-gray-900 rounded-full z-20"></div>
                  </div>
                  <div>
                    <h3 className="m-0 text-xs font-extrabold text-gray-800 dark:text-gray-100">
                      Throwing Poké Ball...
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 m-0 mt-1">
                      Calculating catch probability for {capitalize(pokemon.name)}
                    </p>
                  </div>
                </div>
              )}

              {/* State 2: Catch Gacha Failure */}
              {catchState === "fail" && (
                <div className="text-center space-y-3 py-1">
                  <div className="text-3xl animate-bounce">😢</div>
                  <div>
                    <h3 className="m-0 text-sm font-extrabold text-red-500">
                      Catch Failed!
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 mt-1.5 leading-relaxed">
                      Oh no! <strong>{capitalize(pokemon.name)}</strong> broke free and ran away. Don't give up, try again!
                    </p>
                  </div>
                  <div className="flex justify-center pt-1">
                    <Button variant="secondary" onClick={() => setCatchState("idle")} className="px-5 py-1.5 rounded-lg text-[10px]">
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* State 3: Catch Gacha Success */}
              {catchState === "success" && (
                <div className="space-y-3 py-1">
                  <div className="text-center text-3xl animate-pulse">🎉</div>
                  <div className="text-center">
                    <h3 className="m-0 text-sm font-extrabold text-green-500">
                      Successfully Caught!
                    </h3>
                    <p className="text-xs text-gray-550 dark:text-gray-400 m-0 mt-1">
                      Awesome! You successfully caught <strong>{capitalize(pokemon.name)}</strong>.
                    </p>
                  </div>

                  {/* Nickname input form */}
                  <div className="space-y-1 bg-white/20 dark:bg-black/20 p-3 rounded-xl border border-gray-300/10">
                    <label className="text-[9px] font-extrabold text-gray-550 dark:text-gray-400 uppercase tracking-wide">
                      Give Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter nickname..."
                      maxLength={15}
                      className="w-full px-2.5 py-1.5 bg-white/30 dark:bg-black/30 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex justify-center pt-1">
                    <Button variant="success" onClick={handleSaveToBag} className="px-5 py-2 rounded-xl text-xs w-full shadow-md shadow-green-500/10">
                      Save To Bag
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Release Confirmation Dialog Overlay */}
      <AnimatePresence>
        {showReleaseConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-[28px] md:rounded-[26px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs solid-card rounded-2xl p-5 shadow-xl"
            >
              <div className="text-center space-y-3.5">
                <div className="text-3xl">🕊️</div>
                <h3 className="m-0 text-sm font-extrabold text-gray-800 dark:text-gray-100">
                  Release Pokémon?
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
                  Are you sure you want to release{" "}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {caughtInstance?.nickname || capitalize(pokemon.name)}
                  </strong>{" "}
                  back into the wild? This action cannot be undone.
                </p>
                <div className="flex gap-2.5 justify-center pt-1.5 text-xs font-bold">
                  <Button
                    variant="secondary"
                    onClick={() => setShowReleaseConfirm(false)}
                    className="px-4 py-1.5 rounded-lg text-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (caughtInstance) {
                        releasePokemon(caughtInstance.uniqueId);
                      }
                      setShowReleaseConfirm(false);
                      navigate("/my-pokemon");
                    }}
                    className="px-4 py-1.5 rounded-lg text-[10px] shadow-md shadow-red-650/10"
                  >
                    Yes, Release
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PokemonDetail;
