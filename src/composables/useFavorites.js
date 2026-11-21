import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { getPokemonDetails } from "../services/pokemonApi";
import formatPokemon from "../utils/formatPokemon";

const STORAGE_KEY = "pokemon-explorer-favorites";

export default function useFavorites() {
  const favorites = ref([]);

  let refreshController = null;

  // Load saved favorites from localStorage.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    favorites.value = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load favorites:", error);
    favorites.value = [];
  }

  // Refresh saved Pokémon using the latest formatter.
  onMounted(async () => {
    if (!favorites.value.length) return;

    refreshController = new AbortController();

    try {
      const results = await Promise.all(
        favorites.value.map(async (pokemon) => {
          try {
            const data = await getPokemonDetails(
              pokemon.id,
              refreshController.signal
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

      if (refreshController.signal.aborted) return;

      const refreshedById = new Map(
        results
          .filter(Boolean)
          .map((pokemon) => [pokemon.id, pokemon])
      );

      favorites.value = favorites.value.map((pokemon) => ({
        ...pokemon,
        ...(refreshedById.get(pokemon.id) || {}),
      }));
    } catch (error) {
      console.error("Failed to refresh favorites:", error);
    }
  });

  // Cancel outstanding requests when the component is unmounted.
  onBeforeUnmount(() => {
    refreshController?.abort();
  });

  // Persist favorites whenever they change.
  watch(
    favorites,
    (current) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(current)
        );
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    },
    { deep: true }
  );

  const isFavorite = (pokemonId) => {
    return favorites.value.some(
      (pokemon) => pokemon.id === pokemonId
    );
  };

  const toggleFavorite = (pokemon) => {
    const alreadyFavorite = isFavorite(pokemon.id);

    if (alreadyFavorite) {
      favorites.value = favorites.value.filter(
        (item) => item.id !== pokemon.id
      );
      return;
    }

    favorites.value = [...favorites.value, pokemon];
  };

  const removeFavorite = (pokemonId) => {
    favorites.value = favorites.value.filter(
      (pokemon) => pokemon.id !== pokemonId
    );
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}