import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPokemonDetail } from "../../service/Pokemon";
import { capitalize, padId } from "../../lib/utils";
import { TYPE_COLORS } from "../../constant";

export interface PokemonCardProps {
  name: string;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ name }) => {
  const { data: pokemon, isLoading, error } = useQuery({
    queryKey: ["pokemon-card-detail", name],
    queryFn: () => getPokemonDetail(name),
    staleTime: 15 * 60 * 1000 // 15 minutes cache
  });

  if (isLoading) {
    return (
      <div className="relative h-44 rounded-2xl solid-card animate-pulse flex flex-col justify-between p-3.5">
        <div className="flex justify-between items-start">
          <div className="w-12 h-3.5 bg-gray-250 dark:bg-gray-700 rounded"></div>
          <div className="w-8 h-3 bg-gray-250 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="self-center w-16 h-16 bg-gray-250 dark:bg-gray-700 rounded-full"></div>
        <div className="w-10 h-4 bg-gray-250 dark:bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="h-44 rounded-2xl bg-red-100/50 dark:bg-red-950/20 text-red-500 flex items-center justify-center p-3 text-center border border-red-200/50">
        <p className="text-[10px] font-bold">Failed to load Pokémon</p>
      </div>
    );
  }

  const primaryType = pokemon.types?.[0]?.type?.name || "normal";
  const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;

  // Resolve sprite URL
  const animatedUrl =
    pokemon.sprites?.other?.showdown?.front_default ||
    pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default;
  const staticUrl =
    pokemon.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon.sprites?.front_default;
  const spriteUrl = animatedUrl || staticUrl || "";

  return (
    <Link to={`/pokemon/${pokemon.name}`} className="no-underline block group">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-44 rounded-2xl solid-card flex flex-col justify-between p-3.5 overflow-hidden transition-theme"
      >
        {/* Soft solid type indicator disc in background */}
        <div
          className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-10 dark:opacity-15 group-hover:opacity-25 transition-opacity duration-300"
          style={{ backgroundColor: typeStyle.hex }}
        ></div>

        {/* Top Header Row (Name & ID) */}
        <div className="flex justify-between items-start z-10">
          <div>
            <h3 className="m-0 text-xs font-extrabold tracking-wide text-gray-800 dark:text-gray-100 transition-colors duration-200 group-hover:text-red-500 dark:group-hover:text-red-400">
              {capitalize(pokemon.name)}
            </h3>
            <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-gray-500">
              {padId(pokemon.id)}
            </span>
          </div>
        </div>

        {/* Center Artwork Image - GIF or fallback */}
        <div className="relative w-20 h-20 self-center flex items-center justify-center z-10">
          <div
            style={{ backgroundColor: `${typeStyle.hex}10` }}
            className="absolute inset-2 rounded-full border border-dashed border-gray-400/10 group-hover:scale-105 transition-transform duration-300"
          ></div>
          <img
            src={spriteUrl}
            alt={pokemon.name}
            className="w-16 h-16 object-contain z-20 group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Bottom Type Badges - solid colors with white text for maximum readability */}
        <div className="flex flex-wrap gap-1 z-10">
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
                className="px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider uppercase shadow-sm"
              >
                {tName}
              </span>
            );
          })}
        </div>
      </motion.div>
    </Link>
  );
};

export default PokemonCard;
