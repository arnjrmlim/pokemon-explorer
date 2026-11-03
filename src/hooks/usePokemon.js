import { useState, useEffect } from "react";

import {
  getPokemonList,
  getPokemonDetails,
} from "../services/pokemonApi";

export default function usePokemon(page = 1, limit = 20) {
  const [pokemon, setPokemon] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPokemon() {
      try {
        setLoading(true);
        setError(null);

        // Calculate the API offset
        const offset = (page - 1) * limit;

        // Fetch the current page
        const data = await getPokemonList(
          limit,
          offset,
          controller.signal
        );

        setTotalCount(data.count);

        // Fetch individual Pokémon details
        const details = await Promise.all(
          data.results.map((item) =>
            getPokemonDetails(item.url, controller.signal)
          )
        );

        // Format the API response
        const formattedPokemon = details.map((item) => ({
          id: item.id,
          name: item.name,

          types: item.types.map(
            (type) => type.type.name
          ),

          image:
            item.sprites.other?.home?.front_default ||
            item.sprites.other?.["official-artwork"]?.front_default ||
            item.sprites.front_default,

          fallbackImage:
            item.sprites.other?.["official-artwork"]?.front_default ||
            item.sprites.front_default,
        }));

        if (!controller.signal.aborted) {
          setPokemon(formattedPokemon);
        }

      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPokemon();

    return () => {
      controller.abort();
    };
  }, [page, limit]);

  return {
    pokemon,
    totalCount,
    loading,
    error,
  };
}