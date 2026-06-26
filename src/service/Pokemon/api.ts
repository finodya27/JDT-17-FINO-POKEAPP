import API from "../api";
import type { PokemonDetail, PokemonSpecies, EvolutionChain } from "../../types";

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  results: PokemonListItem[];
}

export interface TypePokemonListItem {
  pokemon: PokemonListItem;
  slot: number;
}

export interface TypePokemonResponse {
  pokemon: TypePokemonListItem[];
}

export const getPokemonList = async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
  return API.get<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
};

export const getPokemonDetail = async (nameOrId: string | number): Promise<PokemonDetail> => {
  return API.get<PokemonDetail>(`/pokemon/${nameOrId}`);
};

export const getPokemonSpecies = async (nameOrId: string | number): Promise<PokemonSpecies> => {
  return API.get<PokemonSpecies>(`/pokemon-species/${nameOrId}`);
};

export const getEvolutionChain = async (url: string): Promise<EvolutionChain> => {
  
  return API.get<EvolutionChain>(url, true);
};

export const getPokemonsByType = async (typeName: string): Promise<TypePokemonResponse> => {
  return API.get<TypePokemonResponse>(`/type/${typeName}`);
};
