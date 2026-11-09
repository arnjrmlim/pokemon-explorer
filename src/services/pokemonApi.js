
const BASE_URL = "https://pokeapi.co/api/v2";

// --------------------------------------------------
// GENERIC API REQUEST
// --------------------------------------------------

async function fetchPokemonApi(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(
      `PokéAPI request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// --------------------------------------------------
// POKÉMON LIST
// --------------------------------------------------

export async function getPokemonList(
  limit = 20,
  offset = 0,
  signal
) {
  return fetchPokemonApi(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    signal
  );
}

// --------------------------------------------------
// POKÉMON DETAILS
// Accepts an ID, name, or complete API URL.
// --------------------------------------------------

export async function getPokemonDetails(identifier, signal) {
  const url =
    typeof identifier === "string" && identifier.startsWith("http")
      ? identifier
      : `${BASE_URL}/pokemon/${identifier}`;

  return fetchPokemonApi(url, signal);
}

// --------------------------------------------------
// POKÉMON SPECIES
// Provides flavor text, evolution chain URL, and
// species information.
// --------------------------------------------------

export async function getPokemonSpecies(identifier, signal) {
  const url =
    typeof identifier === "string" && identifier.startsWith("http")
      ? identifier
      : `${BASE_URL}/pokemon-species/${identifier}`;

  return fetchPokemonApi(url, signal);
}

// --------------------------------------------------
// EVOLUTION CHAIN
// --------------------------------------------------

export async function getEvolutionChain(identifier, signal) {
  const url =
    typeof identifier === "string" && identifier.startsWith("http")
      ? identifier
      : `${BASE_URL}/evolution-chain/${identifier}`;

  return fetchPokemonApi(url, signal);
}

// --------------------------------------------------
// ALL POKÉMON NAMES
// Fetches the complete name+url list in one request.
// Used as the base for client-side name search.
// Result should be cached by the caller.
// --------------------------------------------------

export async function getAllPokemonNames(signal) {
  // 100 000 is safely above the current dex size (~1400)
  return fetchPokemonApi(
    `${BASE_URL}/pokemon?limit=100000&offset=0`,
    signal
  );
}

// --------------------------------------------------
// POKÉMON BY TYPE
// Returns every pokemon entry for a given type slug.
// --------------------------------------------------

export async function getPokemonByType(type, signal) {
  return fetchPokemonApi(
    `${BASE_URL}/type/${type}`,
    signal
  );
}

export async function getPokemonForm(identifier, signal) {
  const url =
    typeof identifier === "string" && identifier.startsWith("http")
      ? identifier
      : `${BASE_URL}/pokemon-form/${identifier}`;

  return fetchPokemonApi(url, signal);
}

// --------------------------------------------------
// POKÉMON TYPE DETAILS
// Returns type damage relations from PokéAPI.
// --------------------------------------------------

export async function getPokemonTypeDetails(type, signal) {
  return fetchPokemonApi(
    `${BASE_URL}/type/${type.toLowerCase()}`,
    signal
  );
}