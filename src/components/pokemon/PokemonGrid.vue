<script setup>
import PokemonCard from "./PokemonCard.vue";

defineProps({
  pokemon: {
    type: Array,
    default: () => [],
  },
  onPokemonClick: {
    type: Function,
    default: null,
  },
  favorites: {
    type: Array,
    default: () => [],
  },
  onToggleFavorite: {
    type: Function,
    default: null,
  },
  comparedPokemon: {
    type: Array,
    default: () => [],
  },
  onToggleCompare: {
    type: Function,
    default: null,
  },
});
</script>

<template>
  <div
    v-if="pokemon.length"
    class="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    <PokemonCard
      v-for="item in pokemon"
      :key="item.id"
      :pokemon="item"
      :on-click="onPokemonClick"
      :is-favorite="favorites.some((favorite) => favorite.id === item.id)"
      :on-toggle-favorite="onToggleFavorite"
      :is-compared="
        comparedPokemon.some((compared) => compared.id === item.id)
      "
      :on-toggle-compare="onToggleCompare"
    />
  </div>
</template>