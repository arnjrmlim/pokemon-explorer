<script setup>
import { ArrowUpRight, Heart, Plus, Check } from "@lucide/vue";
import PokemonTypeBadge from "./PokemonTypeBadge.vue";

const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
  onClick: {
    type: Function,
    default: null,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  onToggleFavorite: {
    type: Function,
    default: null,
  },
  isCompared: {
    type: Boolean,
    default: false,
  },
  onToggleCompare: {
    type: Function,
    default: null,
  },
});

function handleCardKeyDown(event) {
  if (event.target !== event.currentTarget) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    props.onClick?.(props.pokemon);
  }
}

function handleImageError(event) {
  const image = event.currentTarget;

  if (
    props.pokemon.fallbackImage &&
    image.src !== props.pokemon.fallbackImage
  ) {
    image.src = props.pokemon.fallbackImage;
  } else {
    image.style.visibility = "hidden";
  }
}
</script>

<template>
  <article
    role="button"
    tabindex="0"
    :aria-label="`View ${pokemon.name}`"
    class="
      group relative flex w-full min-w-0 cursor-pointer flex-col overflow-hidden
      rounded-[22px] border border-[#263149] bg-[#111A2C]
      p-6 transition-all duration-300
      hover:-translate-y-1 hover:border-[#F6C945]/60
      hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)]
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-[#F6C945]
    "
    @click="onClick?.(pokemon)"
    @keydown="handleCardKeyDown"
  >
    <!-- Pokémon ID and Action Buttons -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold tracking-wider text-gray-500">
        #{{ String(pokemon.id).padStart(3, "0") }}
      </span>

      <div class="flex items-center gap-1">
        <!-- Compare Button -->
        <div class="group/tooltip relative">
          <button
            type="button"
            :aria-label="
              isCompared
                ? `Remove ${pokemon.name} from comparison`
                : `Add ${pokemon.name} to comparison`
            "
            :aria-pressed="isCompared"
            :class="`rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-[#263149] ${
              isCompared
                ? 'text-[#F6C945]'
                : 'text-gray-500 hover:text-[#F6C945]'
            }`"
            @click.stop="onToggleCompare?.(pokemon)"
          >
            <Check
              v-if="isCompared"
              :size="19"
            />
            <Plus
              v-else
              :size="19"
            />
          </button>

          <span
            role="tooltip"
            class="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md border border-[#263149] bg-[#080C17] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/tooltip:opacity-100"
          >
            {{ isCompared ? "Remove from Compare" : "Add to Compare" }}
          </span>
        </div>

        <!-- Favorite Button -->
        <div class="group/favorite relative">
          <button
            type="button"
            :aria-label="
              isFavorite
                ? `Remove ${pokemon.name} from favorites`
                : `Add ${pokemon.name} to favorites`
            "
            :aria-pressed="isFavorite"
            :class="`rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-[#263149] ${
              isFavorite
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-400'
            }`"
            @click.stop="onToggleFavorite?.(pokemon)"
          >
            <Heart
              :size="20"
              :stroke-width="2"
              :fill="isFavorite ? 'currentColor' : 'none'"
            />
          </button>

          <span
            role="tooltip"
            class="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md border border-[#263149] bg-[#080C17] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/favorite:opacity-100"
          >
            {{ isFavorite ? "Remove from Favorites" : "Add to Favorites" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Pokémon Artwork -->
    <div
      class="relative flex aspect-square w-full items-center justify-center p-4"
    >
      <div
        class="
          absolute h-[65%] w-[65%] rounded-full bg-white/[0.035]
          transition-all duration-300
          group-hover:scale-110 group-hover:bg-white/[0.07]
        "
      />

      <img
        :src="pokemon.image"
        :alt="pokemon.name"
        loading="lazy"
        class="
          relative z-10 h-full w-full object-contain
          drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)]
          transition-transform duration-300
          group-hover:scale-110
        "
        @error="handleImageError"
      >
    </div>

    <!-- Pokémon Name -->
    <div class="mt-2 flex items-center justify-between gap-3">
      <h3 class="text-xl font-bold capitalize text-white">
        {{ pokemon.name }}
      </h3>

      <ArrowUpRight
        :size="21"
        class="
          shrink-0 text-gray-500 transition-all duration-300
          group-hover:-translate-y-1 group-hover:translate-x-1
          group-hover:text-[#F6C945]
        "
      />
    </div>

    <!-- Pokémon Types -->
    <div class="-mt-4 flex flex-wrap gap-2">
      <PokemonTypeBadge
        v-for="type in pokemon.types"
        :key="type"
        :type="type"
        size="sm"
      />
    </div>
  </article>
</template>