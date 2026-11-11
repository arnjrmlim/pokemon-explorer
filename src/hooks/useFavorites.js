
import { useEffect, useState } from "react";
import { getPokemonDetails } from "../services/pokemonApi";
import formatPokemon from "../utils/formatPokemon";

const STORAGE_KEY = "pokemon-explorer-favorites";

function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load favorites:", error);
      return [];
    }
  });

  // Refresh saved Pokémon using the latest formatter.
  useEffect(() => {
    if (!favorites.length) return;

    const controller = new AbortController();

    async function refreshFavorites() {
      const results = await Promise.all(
        favorites.map(async (pokemon) => {
          try {
            const data = await getPokemonDetails(
              pokemon.id,
              controller.signal
            );

            return {
              id: pokemon.id,
              ...formatPokemon(data),
            };
          } catch (error) {
            if (error.name === "AbortError") return null;

            console.warn(
              `Unable to refresh favorite ${pokemon.name}:`,
              error
            );

            return null;
          }
        })
      );

      if (controller.signal.aborted) return;

      const refreshedById = new Map(
        results
          .filter(Boolean)
          .map((pokemon) => [pokemon.id, pokemon])
      );

      setFavorites((current) =>
        current.map((pokemon) => ({
          ...pokemon,
          ...(refreshedById.get(pokemon.id) || {}),
        }))
      );
    }

    refreshFavorites();

    return () => controller.abort();

    // Refresh only when the hook initially loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist favorites.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites]);

  const isFavorite = (pokemonId) =>
    favorites.some((pokemon) => pokemon.id === pokemonId);

  const toggleFavorite = (pokemon) => {
    setFavorites((current) => {
      const alreadyFavorite = current.some(
        (item) => item.id === pokemon.id
      );

      if (alreadyFavorite) {
        return current.filter(
          (item) => item.id !== pokemon.id
        );
      }

      return [...current, pokemon];
    });
  };

  const removeFavorite = (pokemonId) => {
    setFavorites((current) =>
      current.filter((pokemon) => pokemon.id !== pokemonId)
    );
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}

export default useFavorites;
