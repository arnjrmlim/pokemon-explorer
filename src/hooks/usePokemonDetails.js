
import { useEffect, useState } from "react";

import {
  getPokemonDetails,
  getPokemonSpecies,
  getEvolutionChain,
  getPokemonList,
} from "../services/pokemonApi";

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------

const initialState = {
  pokemon: null,
  species: null,
  description: "",
  evolutionChain: null,
  evolutionPokemon: [],
  megaEvolutions: [],
  loading: false,
  error: null,
};

// Cache the PokéAPI Pokémon name list.
// This prevents downloading the complete list every time
// the user selects another Pokémon in the modal.
let pokemonListPromise = null;

async function getAllPokemon() {
  if (!pokemonListPromise) {
    pokemonListPromise = getPokemonList(2000, 0).catch((error) => {
      pokemonListPromise = null;
      throw error;
    });
  }

  return pokemonListPromise;
}

// --------------------------------------------------
// FORMAT POKÉMON DATA
// --------------------------------------------------

function formatPokemon(data) {
  return {
    id: data.id,
    name: data.name,

    image:
      data.sprites.other?.home?.front_default ||
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default,
      
    shinyImage:
      data.sprites.other?.home?.front_shiny ||
      data.sprites.front_shiny ||
      null,
      
    fallbackImage:
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default,

    types: data.types.map((item) => item.type.name),

    abilities: data.abilities.map((item) => ({
      name: item.ability.name,
      isHidden: item.is_hidden,
    })),

    stats: data.stats.map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),

    height: data.height / 10,
    weight: data.weight / 10,

    baseExperience: data.base_experience,
    species: data.species.name,
    forms: data.forms,
  };
}

// --------------------------------------------------
// GET ENGLISH FLAVOR TEXT
// --------------------------------------------------

function getEnglishDescription(species) {
  const entries = species.flavor_text_entries || [];

  const englishEntries = entries.filter(
    (entry) => entry.language.name === "en"
  );

  if (!englishEntries.length) {
    return "No Pokédex description available.";
  }

  const selectedEntry =
    englishEntries[englishEntries.length - 1];

  return selectedEntry.flavor_text
    .replace(/[\n\f\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------------------------------------
// FLATTEN EVOLUTION TREE
// Supports branching evolution families.
// --------------------------------------------------

function flattenEvolutionChain(chain, result = []) {
  if (!chain) return result;

  result.push({
    name: chain.species.name,
    url: chain.species.url,
    evolutionDetails: chain.evolution_details || [],
    isBaby: chain.is_baby,
  });

  chain.evolves_to?.forEach((evolution) => {
    flattenEvolutionChain(evolution, result);
  });

  return result;
}

// --------------------------------------------------
// GET MEGA EVOLUTIONS
// Discover Mega Pokémon across the entire family.
// --------------------------------------------------

async function getMegaEvolutionsFromFamily(
  evolutionSpecies,
  signal
) {
  const allPokemon = await getAllPokemon();

  if (signal.aborted) return [];

  const familyNames = evolutionSpecies.map(
    (species) => species.name
  );

  // Mega Pokémon are separate PokéAPI Pokémon entries.
  const megaCandidates = allPokemon.results.filter(
    (pokemon) =>
      familyNames.some(
        (speciesName) =>
          pokemon.name.startsWith(`${speciesName}-mega`) ||
          pokemon.name.startsWith(`mega-${speciesName}`)
      )
  );

  const megaResults = await Promise.all(
    megaCandidates.map(async (candidate) => {
      try {
        const data = await getPokemonDetails(
          candidate.url,
          signal
        );

        return {
          ...formatPokemon(data),
          formName: data.name,
          formId: data.id,
          isMega: true,
        };
      } catch (error) {
        if (error.name === "AbortError") throw error;

        console.warn(
          `Unable to load Mega Evolution: ${candidate.name}`,
          error
        );

        return null;
      }
    })
  );

  if (signal.aborted) return [];

  // Remove duplicate entries.
  const uniqueMegaEvolutions = new Map();

  megaResults
    .filter(Boolean)
    .forEach((mega) => {
      uniqueMegaEvolutions.set(mega.id, mega);
    });

  return [...uniqueMegaEvolutions.values()].sort(
    (a, b) => a.id - b.id
  );
}

// --------------------------------------------------
// MAIN HOOK
// --------------------------------------------------

export default function usePokemonDetails(identifier) {
  const [data, setData] = useState(initialState);

  useEffect(() => {
    if (!identifier) {
      setData(initialState);
      return;
    }

    const controller = new AbortController();

    async function fetchPokemonData() {
      try {
        setData({
          ...initialState,
          loading: true,
        });

        // 1. Fetch selected Pokémon.
        const pokemonData = await getPokemonDetails(
          identifier,
          controller.signal
        );

        // 2. Fetch species information.
        const speciesData = await getPokemonSpecies(
          pokemonData.species.url,
          controller.signal
        );

        // 3. Fetch evolution chain.
        const evolutionChainUrl =
          speciesData.evolution_chain?.url;

        const chainData = evolutionChainUrl
          ? await getEvolutionChain(
              evolutionChainUrl,
              controller.signal
            )
          : null;

        // 4. Flatten evolution family.
        const evolutionSpecies = chainData
          ? flattenEvolutionChain(chainData.chain)
          : [];

        // 5. Fetch Pokémon details for each evolution.
        const evolutionDetails = await Promise.all(
          evolutionSpecies.map(async (species) => {
            try {
              const pokemon = await getPokemonDetails(
                species.name,
                controller.signal
              );

              return {
                ...formatPokemon(pokemon),
                isBaby: species.isBaby,
                evolutionDetails: species.evolutionDetails,
              };
            } catch (error) {
              if (error.name === "AbortError") throw error;

              console.warn(
                `Unable to load ${species.name}:`,
                error
              );

              return null;
            }
          })
        );

        const validEvolutionDetails =
          evolutionDetails.filter(Boolean);

        // 6. Find Mega Evolutions across the entire family.
        const megaEvolutions =
          await getMegaEvolutionsFromFamily(
            evolutionSpecies,
            controller.signal
          );

        // 7. Format selected Pokémon.
        const formattedPokemon = {
          ...formatPokemon(pokemonData),
          isMega: pokemonData.name.includes("-mega"),
        };

        if (!controller.signal.aborted) {
          setData({
            pokemon: formattedPokemon,
            species: speciesData,
            description: getEnglishDescription(speciesData),
            evolutionChain: chainData?.chain || null,
            evolutionPokemon: validEvolutionDetails,
            megaEvolutions,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error(
          "Failed to load Pokémon modal data:",
          error
        );

        if (!controller.signal.aborted) {
          setData({
            ...initialState,
            loading: false,
            error:
              error.message ||
              "Unable to load Pokémon details.",
          });
        }
      }
    }

    fetchPokemonData();

    return () => {
      controller.abort();
    };
  }, [identifier]);

  return data;
}
