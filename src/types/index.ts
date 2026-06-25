export interface CaughtPokemon {
  uniqueId: string;
  id: number;
  name: string;
  nickname: string;
  sprite: string;
  types: string[];
  dateCaught: string;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  weight: number;
  height: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  cries?: {
    latest: string;
    legacy?: string;
  };
  sprites: {
    front_default: string;
    front_shiny?: string;
    other?: {
      showdown?: {
        front_default: string;
        front_shiny?: string;
      };
      "official-artwork"?: {
        front_default: string;
        front_shiny?: string;
      };
    };
    versions?: {
      "generation-v"?: {
        "black-white"?: {
          animated?: {
            front_default: string;
            front_shiny?: string;
          };
        };
      };
    };
  };
}

export interface PokemonSpecies {
  evolution_chain?: {
    url: string;
  };
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
}

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionNode[];
}

export interface EvolutionChain {
  chain: EvolutionNode;
}
