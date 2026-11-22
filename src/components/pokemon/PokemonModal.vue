<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import {
  X,
  Heart,
  Ruler,
  Weight,
  Sparkles,
  Rotate3D,
  GitBranch,
  Zap,
} from "@lucide/vue";

import usePokemonDetails from "../../composables/usePokemonDetails";
import PokeballIcon from "../common/PokeballIcon.vue";
import PokemonTypeBadge from "./PokemonTypeBadge.vue";
import EvolutionTreeNode from "./EvolutionTreeNode.vue";

const props = defineProps({
  pokemon: { type: Object, default: null },
  onClose: { type: Function, default: null },
  favorites: { type: Array, default: () => [] },
  onToggleFavorite: { type: Function, default: null },
});

const STAT_COLORS = {
  hp: "bg-green-400",
  attack: "bg-red-400",
  defense: "bg-orange-400",
  "special-attack": "bg-blue-400",
  "special-defense": "bg-teal-400",
  speed: "bg-yellow-400",
};

const STAT_NAMES = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

const selectedId = ref(props.pokemon?.id ?? null);
const isFlipped = ref(false);
const isShiny = ref(false);
const isShinyFlipping = ref(false);

let shinyTimer = null;
let previousOverflow = "";

const modalData = usePokemonDetails(selectedId);

const details = computed(() => modalData.value.pokemon);
const description = computed(() => modalData.value.description);
const evolutionChain = computed(() => modalData.value.evolutionChain);
const evolutionPokemon = computed(() => modalData.value.evolutionPokemon);
const megaEvolutions = computed(() => modalData.value.megaEvolutions);
const loading = computed(() => modalData.value.loading);
const error = computed(() => modalData.value.error);

const pokemonByName = computed(() =>
  Object.fromEntries(evolutionPokemon.value.map((item) => [item.name, item]))
);

const isFavorite = computed(() =>
  details.value
    ? props.favorites.some((item) => item.id === details.value.id)
    : false
);

const totalStats = computed(() =>
  details.value?.stats?.reduce((sum, stat) => sum + stat.value, 0) ?? 0
);

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

watch(
  () => props.pokemon?.id,
  (id) => {
    selectedId.value = id ?? null;
    isFlipped.value = false;
    isShiny.value = false;
    isShinyFlipping.value = false;
  }
);

function formatStatName(name) {
  return STAT_NAMES[name] || name;
}

function formatPokemonName(name) {
  return (name || "").replace(/-/g, " ");
}

function formatPokemonId(id) {
  return String(id).padStart(3, "0");
}

function handleImageError(event, fallback) {
  const image = event.currentTarget;

  if (fallback && image.src !== fallback) {
    image.src = fallback;
  } else {
    image.style.visibility = "hidden";
  }
}

function handleFlip() {
  isFlipped.value = !isFlipped.value;
}

function showDetails() {
  isFlipped.value = false;
}

function showEvolution() {
  isFlipped.value = true;
}

function handleSelectPokemon(pokemon) {
  selectedId.value = pokemon.id;
  isShiny.value = false;

  // Keep the evolution side visible while the new Pokémon loads.
  isFlipped.value = true;
}

function handleFavorite() {
  if (details.value) {
    props.onToggleFavorite?.(details.value);
  }
}

function handleShinyToggle() {
  if (isShinyFlipping.value || !details.value?.shinyImage) return;

  isShinyFlipping.value = true;
  isShiny.value = !isShiny.value;

  clearTimeout(shinyTimer);

  shinyTimer = window.setTimeout(() => {
    isShinyFlipping.value = false;
  }, 700);
}

function handleKeyDown(event) {
  switch (event.key) {
    case "Escape":
      props.onClose?.();
      break;
    case "ArrowLeft":
      showDetails();
      break;
    case "ArrowRight":
      showEvolution();
      break;
  }
}

function handleBackdropMouseDown(event) {
  if (event.target === event.currentTarget) {
    props.onClose?.();
  }
}

onMounted(() => {
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow;
  document.removeEventListener("keydown", handleKeyDown);
  clearTimeout(shinyTimer);
});
</script>

<template>
  <div
    v-if="pokemon"
    class="modal-overlay-scrollbar fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md sm:p-4"
    @mousedown="handleBackdropMouseDown"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pokémon details"
      class="relative flex h-[calc(100dvh-24px)] max-h-[900px] min-h-0 w-full max-w-5xl flex-col sm:h-[calc(100dvh-32px)]"
    >
      <!-- Shared modal header -->
      <div class="relative mb-3 grid shrink-0 grid-cols-[1fr_auto] items-center gap-y-3 px-1 sm:flex sm:justify-between">
        <div class="col-start-1 row-start-1 flex min-w-0 items-center gap-2">
          <span class="shrink-0 text-xs font-bold tracking-[0.2em] text-[#F6C945]">
            POKÉDEX
          </span>
          <span class="text-xs text-gray-500">Pokémon Profile</span>
        </div>

        <button
          type="button"
          :aria-label="isFlipped ? 'View Pokémon details' : 'View evolution line'"
          class="col-span-2 row-start-2 mx-auto flex w-fit items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold text-gray-500 transition hover:text-[#F6C945]"
          @click="handleFlip"
        >
          <Rotate3D :size="15" />
          <span class="hidden sm:inline">
            {{ isFlipped ? "View Pokémon Details" : "Flip to Evolution Line" }}
          </span>
          <span class="sm:hidden">
            {{ isFlipped ? "View Details" : "Evolution" }}
          </span>
        </button>

        <button
          type="button"
          aria-label="Close modal"
          class="col-start-2 row-start-1 justify-self-end rounded-full border border-[#263149] bg-[#111A2C] p-2.5 text-gray-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          @click="onClose?.()"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- 3D flip container -->
      <div
        class="relative min-h-0 w-full flex-1"
        style="perspective: 1800px"
      >
        <div
          class="relative h-full w-full"
          :style="{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: prefersReducedMotion
              ? 'none'
              : 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
          }"
        >
          <!-- FRONT: Pokémon details -->
          <section
            aria-label="Pokémon details"
            :aria-hidden="isFlipped"
            class="relative grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1.2fr)_minmax(0,0.8fr)] overflow-hidden rounded-[28px] border border-[#263149] bg-[#080C17] shadow-2xl lg:grid-cols-2 lg:grid-rows-1"
            :style="{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'none' : 'auto',
            }"
          >
            <!-- Artwork panel -->
            <div class="relative flex min-h-0 flex-col items-center justify-center overflow-hidden border-b border-[#263149] bg-[#111A2C] p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div class="absolute h-[220px] w-[220px] rounded-full bg-[#F6C945]/[0.07] blur-3xl sm:h-[300px] sm:w-[300px]" />
              <div class="absolute h-[min(55vw,220px)] w-[min(55vw,220px)] rounded-full border border-white/[0.04] bg-white/[0.02] sm:h-[320px] sm:w-[320px]" />

              <template v-if="loading">
                <PokeballIcon
                  :size="80"
                  spinning
                  glowing
                />
              </template>

              <template v-else-if="details">
                <span
                  v-if="isShiny"
                  class="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#F6C945]/40 bg-[#F6C945]/15 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#F6C945] shadow-[0_0_15px_rgba(246,201,69,0.15)]"
                >
                  <Sparkles
                    :size="13"
                    :stroke-width="2.5"
                  />
                  SHINY
                </span>

                <button
                  type="button"
                  :disabled="!details.shinyImage || isShinyFlipping"
                  :aria-label="isShiny ? 'Show normal Pokémon' : 'Show shiny Pokémon'"
                  :aria-pressed="isShiny"
                  class="group relative z-10 h-[min(24vh,220px)] w-full max-w-[360px] shrink-0 cursor-pointer rounded-2xl outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#F6C945] focus-visible:ring-offset-4 focus-visible:ring-offset-[#111A2C] disabled:cursor-default disabled:hover:scale-100 sm:h-[min(34vh,280px)]"
                  style="perspective: 1000px"
                  @click="handleShinyToggle"
                >
                  <div
                    class="relative h-full w-full"
                    :style="{
                      transformStyle: 'preserve-3d',
                      transform: isShiny ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transition: 'transform 700ms ease',
                    }"
                  >
                    <div
                      class="absolute inset-0"
                      style="backface-visibility: hidden"
                    >
                      <img
                        :src="details.image ?? details.fallbackImage"
                        :alt="formatPokemonName(details.name)"
                        loading="lazy"
                        class="h-full w-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
                        @error="handleImageError($event, details.fallbackImage)"
                      >
                    </div>

                    <div
                      class="absolute inset-0"
                      :style="{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                      }"
                    >
                      <img
                        :src="details.shinyImage"
                        :alt="`${formatPokemonName(details.name)} shiny`"
                        loading="lazy"
                        class="h-full w-full object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)]"
                        @error="handleImageError($event, details.image ?? details.fallbackImage)"
                      >
                    </div>
                  </div>
                </button>

                <p
                  v-if="details.shinyImage"
                  class="relative z-10 mt-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-gray-500"
                >
                  <Sparkles :size="12" />
                  Click Pokémon to reveal shiny form
                </p>

                <div class="relative z-10 mt-2 text-center">
                  <p class="mb-2 text-xs font-bold tracking-widest text-gray-500">
                    #{{ formatPokemonId(details.id) }}
                  </p>

                  <h2 class="text-3xl font-black capitalize text-white sm:text-4xl">
                    {{ formatPokemonName(details.name) }}
                  </h2>

                  <div class="-mt-5 flex flex-wrap justify-center gap-2">
                    <PokemonTypeBadge
                      v-for="type in details.types"
                      :key="type"
                      :type="type"
                    />
                  </div>
                </div>
              </template>

              <p
                v-else
                class="text-sm text-red-400"
              >
                {{ error ?? "Unable to load Pokémon." }}
              </p>

              <div class="group absolute right-6 top-6 z-20">
                <button
                  type="button"
                  :disabled="!details"
                  :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                  :aria-pressed="isFavorite"
                  class="relative rounded-full border border-[#263149] bg-[#080C17]/70 p-3 backdrop-blur transition hover:scale-110 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C945]"
                  :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                  @click="handleFavorite"
                >
                  <Heart
                    :size="21"
                    :fill="isFavorite ? 'currentColor' : 'none'"
                  />
                </button>

                <!-- Favorite Tooltip -->
                <span
                  role="tooltip"
                  class="pointer-events-none absolute right-0 top-full mt-2
                        whitespace-nowrap rounded-lg border border-[#263149]
                        bg-[#111A2C] px-3 py-2 text-xs font-medium text-white
                        shadow-lg opacity-0 translate-y-1
                        transition-all duration-200
                        group-hover:translate-y-0 group-hover:opacity-100
                        group-focus-within:translate-y-0
                        group-focus-within:opacity-100"
                >
                  {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
                </span>
              </div>
            </div>

            <!-- Information panel -->
            <div class="modal-scrollbar min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
              <div
                v-if="loading"
                class="flex min-h-[350px] items-center justify-center"
              >
                <PokeballIcon
                  :size="72"
                  spinning
                  glowing
                />
              </div>

              <template v-else-if="details">
                <section>
                  <div class="mb-3 flex items-center gap-2">
                    <Sparkles
                      :size="16"
                      class="text-[#F6C945]"
                    />
                    <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-[#F6C945]">
                      Pokédex Description
                    </h3>
                  </div>

                  <p class="text-sm leading-7 text-gray-300">
                    {{ description || "No description available." }}
                  </p>
                </section>

                <section class="mt-7 grid grid-cols-2 gap-3">
                  <div class="rounded-2xl border border-[#263149] bg-[#111A2C] p-4">
                    <div class="flex items-center gap-2 text-gray-500">
                      <Ruler :size="15" />
                      <span class="text-xs font-semibold uppercase">Height</span>
                    </div>
                    <p class="mt-2 text-xl font-bold text-white">
                      {{ details.height.toFixed(1) }}
                      <span class="ml-1 text-xs font-medium text-gray-500">m</span>
                    </p>
                  </div>

                  <div class="rounded-2xl border border-[#263149] bg-[#111A2C] p-4">
                    <div class="flex items-center gap-2 text-gray-500">
                      <Weight :size="15" />
                      <span class="text-xs font-semibold uppercase">Weight</span>
                    </div>
                    <p class="mt-2 text-xl font-bold text-white">
                      {{ details.weight.toFixed(1) }}
                      <span class="ml-1 text-xs font-medium text-gray-500">kg</span>
                    </p>
                  </div>
                </section>

                <section class="mt-7">
                  <h3 class="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Abilities
                  </h3>

                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="ability in details.abilities"
                      :key="ability.name"
                      class="flex items-center gap-2 rounded-xl border border-[#263149] bg-[#111A2C] px-3 py-2"
                    >
                      <span class="text-sm font-medium capitalize text-white">
                        {{ formatPokemonName(ability.name) }}
                      </span>

                      <span
                        v-if="ability.isHidden"
                        class="rounded-md bg-[#F6C945]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#F6C945]"
                      >
                        Hidden
                      </span>
                    </div>
                  </div>
                </section>

                <section class="mt-8">
                  <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                      Base Stats
                    </h3>
                    <span class="text-xs font-semibold text-[#F6C945]">
                      Total: {{ totalStats }}
                    </span>
                  </div>

                  <div class="space-y-4">
                    <div
                      v-for="stat in details.stats"
                      :key="stat.name"
                      class="grid grid-cols-[85px_1fr_30px] items-center gap-3"
                    >
                      <span class="text-xs font-semibold text-gray-400">
                        {{ formatStatName(stat.name) }}
                      </span>

                      <div class="h-2 overflow-hidden rounded-full bg-[#263149]">
                        <div
                          class="h-full rounded-full transition-all duration-700 ease-out"
                          :class="STAT_COLORS[stat.name] || 'bg-[#F6C945]'"
                          :style="{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }"
                        />
                      </div>

                      <span class="text-right text-xs font-bold tabular-nums text-white">
                        {{ stat.value }}
                      </span>
                    </div>
                  </div>
                </section>
              </template>
            </div>
          </section>

          <!-- BACK: Evolution line -->
          <section
            aria-label="Evolution line"
            :aria-hidden="!isFlipped"
            class="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-[#263149] bg-[#080C17] shadow-2xl"
            :style="{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'auto' : 'none',
            }"
          >
            <div class="flex shrink-0 items-center justify-between border-b border-[#263149] px-5 py-4 sm:px-8">
              <div>
                <p class="text-xs font-bold tracking-[0.2em] text-[#F6C945]">
                  POKÉDEX DATABASE
                </p>
                <h2 class="mt-1 text-lg font-bold text-white">
                  Evolution Line
                </h2>
              </div>
            </div>

            <div class="modal-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-8 sm:pt-8 lg:px-10">
              <div class="mb-6">
                <div class="mb-5 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <GitBranch
                      :size="17"
                      class="text-[#F6C945]"
                    />
                    <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                      Evolution Family
                    </h3>
                  </div>

                  <span
                    v-if="!loading && evolutionPokemon.length > 0"
                    class="rounded-full border border-[#263149] bg-[#111A2C] px-3 py-1 text-[10px] font-semibold text-gray-400"
                  >
                    {{ evolutionPokemon.length }} Pokémon
                  </span>
                </div>

                <div
                  v-if="loading"
                  class="flex min-h-[180px] items-center justify-center"
                >
                  <PokeballIcon
                    :size="64"
                    spinning
                    glowing
                  />
                </div>

                <div
                  v-else-if="!evolutionChain || !pokemonByName[evolutionChain.species.name]"
                  class="rounded-2xl border border-dashed border-[#263149] p-8 text-center"
                >
                  <p class="text-sm text-gray-400">
                    No evolution information available.
                  </p>
                </div>

                <div
                  v-else
                  class="overflow-x-auto pb-4"
                >
                  <div class="inline-flex min-w-full items-start justify-center px-4 py-4 sm:px-8 sm:py-6">
                    <EvolutionTreeNode
                      :node="evolutionChain"
                      :pokemon-by-name="pokemonByName"
                      :selected-id="details?.id ?? selectedId"
                      @select="handleSelectPokemon"
                    />
                  </div>
                </div>
              </div>

              <div class="border-t border-[#263149] pt-6">
                <div class="mb-4 flex items-center gap-2">
                  <Zap
                    :size="17"
                    class="text-[#F6C945]"
                  />
                  <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                    Mega Evolutions
                  </h3>

                  <span
                    v-if="megaEvolutions.length > 0"
                    class="rounded-full bg-[#F6C945]/10 px-2 py-0.5 text-[10px] font-bold text-[#F6C945]"
                  >
                    {{ megaEvolutions.length }}
                  </span>
                </div>

                <div
                  v-if="loading"
                  class="flex min-h-[100px] items-center justify-center"
                >
                  <PokeballIcon
                    :size="52"
                    spinning
                    glowing
                  />
                </div>

                <div
                  v-else-if="megaEvolutions.length === 0"
                  class="rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/40 p-6 text-center"
                >
                  <Zap
                    :size="22"
                    class="mx-auto mb-2 text-gray-600"
                  />
                  <p class="text-sm font-semibold text-gray-400">
                    No Mega Evolutions available
                  </p>
                  <p class="mt-1 text-xs text-gray-600">
                    This evolution family has no listed Mega forms.
                  </p>
                </div>

                <div
                  v-else
                  class="flex flex-wrap justify-center gap-3"
                >
                  <button
                    v-for="mega in megaEvolutions"
                    :key="mega.id"
                    type="button"
                    :aria-pressed="selectedId === mega.id"
                    :aria-label="`Select ${formatPokemonName(mega.name)}`"
                    class="group relative flex w-[120px] shrink-0 flex-col items-center rounded-2xl border p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F6C945] hover:bg-[#172238] hover:shadow-[0_0_30px_rgba(246,201,69,0.25)] sm:w-[150px]"
                    :class="selectedId === mega.id
                      ? 'border-[#F6C945] bg-[#F6C945]/10'
                      : 'border-[#263149] bg-[#111A2C]'"
                    @click="handleSelectPokemon(mega)"
                  >
                    <div class="relative flex aspect-square w-full items-center justify-center">
                      <img
                        :src="mega.image"
                        :alt="formatPokemonName(mega.name)"
                        loading="lazy"
                        class="h-full w-full object-contain"
                        @error="handleImageError($event, mega.fallbackImage)"
                      >
                    </div>

                    <span class="mt-2 text-[10px] font-bold tracking-wider text-gray-500">
                      #{{ formatPokemonId(mega.id) }}
                    </span>

                    <span class="mt-1 w-full truncate text-xs font-bold capitalize text-white sm:text-sm">
                      {{ formatPokemonName(mega.name) }}
                    </span>

                    <span class="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#F6C945]">
                      Mega Evolution
                    </span>

                    <span
                      v-if="selectedId === mega.id"
                      class="mt-2 rounded-full bg-[#F6C945] px-2 py-1 text-[9px] font-bold uppercase text-[#080C17]"
                    >
                      Selected
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex shrink-0 items-center justify-between border-t border-[#263149] px-5 py-4 sm:px-8">
              <p class="text-[10px] uppercase tracking-wider text-gray-600">
                Select a Pokémon to view its details
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>