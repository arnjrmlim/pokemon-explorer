function getPokemonImage(data, priority, shiny = false) {
  const sprites = data.sprites || {};

  const sources = {
    home: sprites.other?.home || {},
    letsGo:
      sprites.versions?.["generation-vii"]?.[
        "lets-go-pikachu-lets-go-eevee"
      ] || {},
    official:
      sprites.other?.["official-artwork"] || {},
    default: sprites,
  };

  const spriteKey = shiny ? "front_shiny" : "front_default";

  for (const source of priority) {
    const image = sources[source]?.[spriteKey];

    if (image) return image;
  }

  return null;
}

// Pokémon Explorer: Cards, Favorites, Compare
export function getExplorerImage(data, shiny = false) {
  return getPokemonImage(
    data,
    ["home", "letsGo", "official", "default"],
    shiny
  );
}

// Pokémon Comparison: Let's Go → HOME → Official → Default
export function getComparisonImage(data, shiny = false) {
  return getPokemonImage(
    data,
    ["letsGo", "home", "official", "default"],
    shiny
  );
}

// Pokémon Profile: Modal
export function getProfileImage(data, shiny = false) {
  return getPokemonImage(
    data,
    ["letsGo", "home", "official", "default"],
    shiny
  );
}

// Shared Pokémon data formatter
export default function formatPokemon(data) {
  return {
    id: data.id,
    name: data.name,

    // Default artwork uses Explorer priority.
    image: getExplorerImage(data),

    shinyImage: getExplorerImage(data, true),

    fallbackImage:
      getExplorerImage(data) || null,

    types: (data.types || []).map(
      (item) => item.type.name
    ),

    abilities: (data.abilities || []).map((item) => ({
      name: item.ability.name,
      isHidden: item.is_hidden,
    })),

    stats: (data.stats || []).map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),

    height: data.height / 10,
    weight: data.weight / 10,

    baseExperience: data.base_experience,
    species: data.species?.name || null,
    forms: data.forms || [],
  };
}
