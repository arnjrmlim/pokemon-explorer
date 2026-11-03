
import { useEffect, useState } from "react";

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
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
        return current.filter((item) => item.id !== pokemon.id);
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
