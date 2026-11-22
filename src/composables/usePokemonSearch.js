import {
  ref,
  watch,
  toValue,
  onScopeDispose,
} from "vue";

import formatPokemon from "../utils/formatPokemon";

import {
  getPokemonList,
  getPokemonDetails,
  getAllPokemonNames,
  getPokemonByType,
} from "../services/pokemonApi";

// --------------------------------------------------
// MODULE-LEVEL CACHES
// --------------------------------------------------

let allNamesCache = null;
let allNamesFetching = null;

const typeCache = new Map();
const typeFetching = new Map();
const pokemonDetailsCache = new Map();
const MAX_CONCURRENT_REQUESTS = 5;

// Extract numeric ID from a PokéAPI URL.
function idFromUrl(url) {
  const match = url.match(/\/(\d+)\/$/);
  return match ? match[1] : null;
}

// Match Pokémon by name or exact Pokédex ID.
function matchesSearch(entry, term) {
  if (!term) return true;

  if (/^\d+$/.test(term)) {
    return idFromUrl(entry.url) === term;
  }

  return entry.name.includes(term);
}

// Fetch details for a list of Pokémon.
async function fetchDetails(entries, signal) {
  const results = new Array(entries.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < entries.length) {
      if (signal.aborted) {
        throw new DOMException("Request aborted", "AbortError");
      }

      const index = currentIndex++;
      const entry = entries[index];

      const identifier =
        entry.url ?? entry.pokemon?.url ?? entry.name;

      // Reuse previously fetched Pokémon details.
      if (pokemonDetailsCache.has(identifier)) {
        results[index] = pokemonDetailsCache.get(identifier);
        continue;
      }

      const details = await getPokemonDetails(identifier, signal);

      if (signal.aborted) {
        throw new DOMException("Request aborted", "AbortError");
      }

      // Cache only successfully fetched details.
      pokemonDetailsCache.set(identifier, details);
      results[index] = details;
    }
  }

  const workerCount = Math.min(
    MAX_CONCURRENT_REQUESTS,
    entries.length
  );

  await Promise.all(
    Array.from({ length: workerCount }, () => worker())
  );

  return results;
}


// Fetch the full Pokémon name list only once.
async function getOrFetchAllNames() {
  if (allNamesCache) return allNamesCache;

  if (!allNamesFetching) {
    allNamesFetching = getAllPokemonNames()
      .then((data) => {
        allNamesCache = data.results;
        return allNamesCache;
      })
      .catch((error) => {
        allNamesFetching = null;
        throw error;
      });
  }

  return allNamesFetching;
}

// Fetch Pokémon belonging to a type only once.
async function getOrFetchByType(type) {
  if (typeCache.has(type)) {
    return typeCache.get(type);
  }

  if (!typeFetching.has(type)) {
    const request = getPokemonByType(type)
      .then((data) => {
        const entries = data.pokemon.map((item) => ({
          name: item.pokemon.name,
          url: item.pokemon.url,
        }));

        typeCache.set(type, entries);
        typeFetching.delete(type);

        return entries;
      })
      .catch((error) => {
        typeFetching.delete(type);
        throw error;
      });

    typeFetching.set(type, request);
  }

  return typeFetching.get(type);
}

// --------------------------------------------------
// COMPOSABLE
// --------------------------------------------------

export default function usePokemonSearch({
  page = 1,
  limit = 20,
  search = "",
  type = "all",
}) {
  const pokemon = ref([]);
  const totalCount = ref(0);
  const loading = ref(true);
  const error = ref(null);

  const debouncedSearch = ref(
    toValue(search).trim().toLowerCase()
  );

  // Debounce search input by 300ms.
  let debounceTimer = null;

  watch(
    () => toValue(search),
    (value) => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        debouncedSearch.value = value.trim().toLowerCase();
      }, 300);
    }
  );

  // Clear pending debounce timer when the composable is disposed.
  onScopeDispose(() => {
    clearTimeout(debounceTimer);
  });

  // Watch search parameters and fetch the required Pokémon.
  watch(
    () => [
      toValue(page),
      toValue(limit),
      debouncedSearch.value,
      toValue(type),
    ],
    async ([currentPage, currentLimit, searchTerm, currentType], _, onCleanup) => {
      const controller = new AbortController();
      const { signal } = controller;

      onCleanup(() => controller.abort());

      try {
        loading.value = true;
        error.value = null;

        const hasSearch = searchTerm.length > 0;
        const hasType = currentType !== "all";

        // MODE A: Normal paginated browsing.
        if (!hasSearch && !hasType) {
          const offset = (currentPage - 1) * currentLimit;

          const data = await getPokemonList(
            currentLimit,
            offset,
            signal
          );

          const rawDetails = await fetchDetails(
            data.results,
            signal
          );

          if (!signal.aborted) {
            pokemon.value = rawDetails.map(formatPokemon);
            totalCount.value = data.count;
          }

          return;
        }

        // MODE B / C: Build candidate Pokémon list.
        let candidates;

        if (hasSearch && !hasType) {
          const allNames = await getOrFetchAllNames();

          candidates = allNames.filter((entry) =>
            matchesSearch(entry, searchTerm)
          );
        } else if (!hasSearch && hasType) {
          candidates = await getOrFetchByType(currentType);
        } else {
          const [allNames, typeEntries] = await Promise.all([
            getOrFetchAllNames(),
            getOrFetchByType(currentType),
          ]);

          const typeSet = new Set(
            typeEntries.map((entry) => entry.name)
          );

          candidates = allNames.filter(
            (entry) =>
              matchesSearch(entry, searchTerm) &&
              typeSet.has(entry.name)
          );
        }

        if (signal.aborted) return;

        const total = candidates.length;

        // Paginate the filtered candidates.
        const offset = (currentPage - 1) * currentLimit;

        const pageSlice = candidates.slice(
          offset,
          offset + currentLimit
        );

        // Fetch full details only for the visible page.
        const rawDetails = await fetchDetails(
          pageSlice,
          signal
        );

        if (!signal.aborted) {
          pokemon.value = rawDetails.map(formatPokemon);
          totalCount.value = total;
        }
      } catch (err) {
        if (err.name !== "AbortError" && !signal.aborted) {
          error.value = err.message ?? "Failed to load Pokémon.";
        }
      } finally {
        if (!signal.aborted) {
          loading.value = false;
        }
      }
    },
    { immediate: true }
  );

  return {
    pokemon,
    totalCount,
    loading,
    error,
  };
}