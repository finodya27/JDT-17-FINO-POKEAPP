import API from "../api";

export const getPokemonList = async (limit = 20, offset = 0) => {
  return API.get(`/pokemon?limit=${limit}&offset=${offset}`);
};

export const getPokemonDetail = async (nameOrId) => {
  return API.get(`/pokemon/${nameOrId}`);
};

export const getPokemonSpecies = async (nameOrId) => {
  return API.get(`/pokemon-species/${nameOrId}`);
};

export const getEvolutionChain = async (url) => {
  // Evolution chain URLs are dynamic and fully populated in species details, so we query it directly
  return API.get(url, true);
};

export const getPokemonsByType = async (typeName) => {
  return API.get(`/type/${typeName}`);
};

