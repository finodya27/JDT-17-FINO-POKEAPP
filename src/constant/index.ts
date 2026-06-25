export const BASE_URL = "https://pokeapi.co/api/v2";

export interface TypeColorInfo {
  bg: string;
  border: string;
  text: string;
  hex: string;
}

export const TYPE_COLORS: Record<string, TypeColorInfo> = {
  normal: { bg: "bg-type-normal", border: "border-type-normal", text: "text-type-normal", hex: "#A8A77A" },
  fire: { bg: "bg-type-fire", border: "border-type-fire", text: "text-type-fire", hex: "#EE8130" },
  water: { bg: "bg-type-water", border: "border-type-water", text: "text-type-water", hex: "#6390F0" },
  electric: { bg: "bg-type-electric", border: "border-type-electric", text: "text-type-electric", hex: "#F7D02C" },
  grass: { bg: "bg-type-grass", border: "border-type-grass", text: "text-type-grass", hex: "#7AC74C" },
  ice: { bg: "bg-type-ice", border: "border-type-ice", text: "text-type-ice", hex: "#96D9D6" },
  fighting: { bg: "bg-type-fighting", border: "border-type-fighting", text: "text-type-fighting", hex: "#C22E28" },
  poison: { bg: "bg-type-poison", border: "border-type-poison", text: "text-type-poison", hex: "#A33EA1" },
  ground: { bg: "bg-type-ground", border: "border-type-ground", text: "text-type-ground", hex: "#E2BF65" },
  flying: { bg: "bg-type-flying", border: "border-type-flying", text: "text-type-flying", hex: "#A98FF3" },
  psychic: { bg: "bg-type-psychic", border: "border-type-psychic", text: "text-type-psychic", hex: "#F95587" },
  bug: { bg: "bg-type-bug", border: "border-type-bug", text: "text-type-bug", hex: "#A6B91A" },
  rock: { bg: "bg-type-rock", border: "border-type-rock", text: "text-type-rock", hex: "#B6A136" },
  ghost: { bg: "bg-type-ghost", border: "border-type-ghost", text: "text-type-ghost", hex: "#735797" },
  dragon: { bg: "bg-type-dragon", border: "border-type-dragon", text: "text-type-dragon", hex: "#6F35FC" },
  steel: { bg: "bg-type-steel", border: "border-type-steel", text: "text-type-steel", hex: "#B7B7CE" },
  fairy: { bg: "bg-type-fairy", border: "border-type-fairy", text: "text-type-fairy", hex: "#D685AD" },
  dark: { bg: "bg-type-dark", border: "border-type-dark", text: "text-type-dark", hex: "#705746" }
};
