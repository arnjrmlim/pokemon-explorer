import { useState, useEffect, useRef } from "react";
import formatPokemon from "../utils/formatPokemon";
import {
  getPokemonList,
  getPokemonDetails,
  getAllPokemonNames,
  getPokemonByType,
} from "../services/pokemonApi";

// ─────────────────────────────────────────────────────────────
// Module-level caches — survive re-renders and hook remounts,
// but reset on full page reload (acceptable for a SPA).
// ─────────────────────────────────────────────────────────────

// { name, url }[]  — full dex name list, fetched once
let allNamesCache = null;
let allNamesFetching = null; // in-flight Promise so we don't double-fetch

// Map<type, { name, url }[]>  — per-type name lists
const typeCache = new Map();
const typeFetching = new Map();

// Extract the numeric ID from a PokeAPI URL.
// "https://pokeapi.co/api/v2/pokemon/25/" → "25"
function idFromUrl(url) {
  const match = url.match(/\/(\d+)\/$/);
  return match ? match[1] : null;
}

// Returns true if the entry matches the search term.
// Matches:
//   - name contains the term  (e.g. "char" → charmander, charmeleon…)
//   - id equals the term exactly  (e.g. "25" → pikachu only)
//   - id starts with the term  (e.g. "25" also matches 250, 251…) — disabled
//     by design: an exact numeric match is less surprising.
function matchesSearch(entry, term) {
  if (!term) return true;
  // Pure-numeric input → match by dex ID only, skip name check
  if (/^\d+$/.test(term)) {
    return idFromUrl(entry.url) === term;
  }
  return entry.name.includes(term);
}

async function fetchDetails(entries, signal) {
  return Promise.all(
    entries.map((entry) => getPokemonDetails(entry.url ?? entry.pokemon?.url ?? entry.name, signal))
  );
}

// Returns cached full name list, fetching only once globally.
// Shared requests must not use an individual hook's AbortSignal.
async function getOrFetchAllNames() {
  if (allNamesCache) return allNamesCache;

  if (!allNamesFetching) {
    allNamesFetching = getAllPokemonNames()
      .then((data) => {
        allNamesCache = data.results;
        return allNamesCache;
      })
      .catch((error) => {
        // Allow a future search to retry after a failed request.
        allNamesFetching = null;
        throw error;
      });
  }

  return allNamesFetching;
}

// Returns cached type entry list, fetching only once per type.
async function getOrFetchByType(type) {
  if (typeCache.has(type)) return typeCache.get(type);

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
        // Remove failed requests so the next search can retry.
        typeFetching.delete(type);
        throw error;
      });

    typeFetching.set(type, request);
  }

  return typeFetching.get(type);
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Three operating modes, selected automatically:
 *
 * MODE A — normal paginated browse
 *   Condition: no search term, type === "all"
 *   Source: /pokemon?limit&offset  (existing behaviour)
 *
 * MODE B — type filter only
 *   Condition: no search term, type !== "all"
 *   Source: /type/{type}  → paginate client-side
 *
 * MODE C — name search (+ optional type filter)
 *   Condition: search term present
 *   Source: full name list filtered by search,
 *           then type filtered against the type cache,
 *           then details fetched for the visible page only
 */
export default function usePokemonSearch({
  page = 1,
  limit = 20,
  search = "",
  type = "all",
}) {
  const [pokemon, setPokemon] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search so we don't fire on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceTimer = useRef(null);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const hasSearch = debouncedSearch.length > 0;
        const hasType = type !== "all";

        // ── MODE A: plain paginated browse ──────────────────
        if (!hasSearch && !hasType) {
          const offset = (page - 1) * limit;
          const data = await getPokemonList(limit, offset, signal);
          const rawDetails = await fetchDetails(data.results, signal);

          if (!signal.aborted) {
            setPokemon(rawDetails.map(formatPokemon));
            setTotalCount(data.count);
          }
          return;
        }

        // ── MODE B / C: need a candidate name list ───────────
        let candidates; // [{ name, url }]

        if (hasSearch && !hasType) {
          // All names, filtered by search term
          const allNames = await getOrFetchAllNames();
          candidates = allNames.filter((p) => matchesSearch(p, debouncedSearch));
        } else if (!hasSearch && hasType) {
          // All names for this type
          candidates = await getOrFetchByType(type);
        } else {
          // Both: intersect search results with type
          const [allNames, typeEntries] = await Promise.all([
            getOrFetchAllNames(),
            getOrFetchByType(type),
          ]);
          const typeSet = new Set(typeEntries.map((p) => p.name));
          candidates = allNames.filter(
            (p) => matchesSearch(p, debouncedSearch) && typeSet.has(p.name)
          );
        }

        if (signal.aborted) return;

        const total = candidates.length;

        // Paginate candidate list client-side
        const offset = (page - 1) * limit;
        const pageSlice = candidates.slice(offset, offset + limit);

        // Fetch full details only for the visible page
        const rawDetails = await fetchDetails(pageSlice, signal);

        if (!signal.aborted) {
          setPokemon(rawDetails.map(formatPokemon));
          setTotalCount(total);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !signal.aborted) {
          setError(err.message ?? "Failed to load Pokémon.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    run();

    return () => controller.abort();
  }, [page, limit, debouncedSearch, type]);

  return { pokemon, totalCount, loading, error };
}
