import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CaughtPokemon, PokemonDetail } from "../types";

export interface PokemonState {
  myPokemon: CaughtPokemon[];
  darkMode: boolean;
  addPokemon: (pokemon: PokemonDetail, nickname: string) => void;
  releasePokemon: (uniqueId: string) => void;
  renamePokemon: (uniqueId: string, newNickname: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
}

export const usePokemonStore = create<PokemonState>()(
  persist(
    (set) => ({
      myPokemon: [],
      darkMode: false,

      addPokemon: (pokemon, nickname) =>
        set((state) => ({
          myPokemon: [
            ...state.myPokemon,
            {
              uniqueId: `${Date.now()}-${pokemon.name}`,
              id: pokemon.id,
              name: pokemon.name,
              nickname: nickname.trim() || pokemon.name,
              sprite:
                pokemon.sprites?.other?.showdown?.front_default ||
                pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default ||
                pokemon.sprites?.other?.["official-artwork"]?.front_default ||
                pokemon.sprites?.front_default ||
                "",
              types: pokemon.types?.map((t) => t.type.name) || [],
              dateCaught: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            }
          ]
        })),

      releasePokemon: (uniqueId) =>
        set((state) => ({
          myPokemon: state.myPokemon.filter((p) => p.uniqueId !== uniqueId)
        })),

      renamePokemon: (uniqueId, newNickname) =>
        set((state) => ({
          myPokemon: state.myPokemon.map((p) =>
            p.uniqueId === uniqueId ? { ...p, nickname: newNickname.trim() } : p
          )
        })),

      toggleDarkMode: () =>
        set((state) => {
          const nextMode = !state.darkMode;
          if (nextMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { darkMode: nextMode };
        }),

      setDarkMode: (val) =>
        set(() => {
          if (val) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { darkMode: val };
        })
    }),
    {
      name: "pokemon-storage" 
    }
  )
);
