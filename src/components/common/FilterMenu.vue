<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

import {
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Check,
} from "@lucide/vue";

const props = defineProps({
  selectedType: {
    type: String,
    default: "all",
  },
  sortBy: {
    type: String,
    default: "id-asc",
  },
  limit: {
    type: Number,
    default: 20,
  },
});

const emit = defineEmits([
  "type-change",
  "sort-change",
  "limit-change",
]);

const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const TYPE_IDS = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

const TYPE_SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vii/lets-go-pikachu-lets-go-eevee/small";

const SORT_OPTIONS = [
  { value: "id-asc", label: "ID: Low to High" },
  { value: "id-desc", label: "ID: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const LIMIT_OPTIONS = [20, 40, 60];

const isOpen = ref(false);
const menuRef = ref(null);

// Count active settings.
const activeCount = computed(() => {
  return [
    props.selectedType !== "all",
    props.sortBy !== "id-asc",
    props.limit !== 20,
  ].filter(Boolean).length;
});

// Close menu when clicking outside.
function handleOutsideClick(event) {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target)
  ) {
    isOpen.value = false;
  }
}

// Close menu when pressing Escape.
function handleEscape(event) {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutsideClick);
  document.removeEventListener("keydown", handleEscape);
});

// Reset all settings.
function handleReset() {
  emit("type-change", "all");
  emit("sort-change", "id-asc");
  emit("limit-change", 20);
}
</script>

<template>
  <div
    ref="menuRef"
    class="relative shrink-0"
  >
    <!-- Filter Button -->
    <button
      type="button"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      class="flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition"
      :class="
        isOpen
          ? 'border-[#F6C945] bg-[#F6C945] text-[#080C17]'
          : 'border-white/10 bg-[#111A2C] text-gray-300 hover:border-[#F6C945]/50 hover:text-[#F6C945]'
      "
      @click="isOpen = !isOpen"
    >
      <SlidersHorizontal :size="17" />

      Filters

      <span
        v-if="activeCount > 0"
        class="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F6C945] px-1 text-[10px] font-bold text-[#080C17]"
      >
        {{ activeCount }}
      </span>

      <ChevronDown
        :size="15"
        class="transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Filter Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-3 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#111A2C] shadow-2xl shadow-black/40"
    >
      <!-- Panel Header -->
      <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 class="text-sm font-bold text-white">
            Filter & Display
          </h3>

          <p class="mt-1 text-[11px] text-gray-500">
            Customize your Pokémon collection
          </p>
        </div>

        <button
          type="button"
          aria-label="Close filters"
          class="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
          @click="isOpen = false"
        >
          <X :size="17" />
        </button>
      </div>

      <div class="max-h-[65vh] space-y-5 overflow-y-auto p-5 dark-scrollbar">
        <!-- Pokémon Types -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-gray-300">
              Pokémon Type
            </h4>

            <span class="text-[10px] text-gray-500">
              {{ selectedType === "all" ? "All selected" : selectedType }}
            </span>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-lg border px-3 py-2 text-xs font-semibold transition"
              :class="
                selectedType === 'all'
                  ? 'border-[#F6C945] bg-[#F6C945] text-[#080C17]'
                  : 'border-white/10 bg-[#080C17] text-gray-400 hover:border-[#F6C945]/50'
              "
              @click="emit('type-change', 'all')"
            >
              All Types
            </button>

            <button
              v-for="type in POKEMON_TYPES"
              :key="type"
              type="button"
              :aria-pressed="selectedType === type"
              class="flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition"
              :class="
                selectedType === type
                  ? 'border-[#F6C945] bg-[#F6C945]/10 text-[#F6C945]'
                  : 'border-white/10 bg-[#080C17] text-gray-300 hover:border-[#F6C945]/40 hover:bg-white/5'
              "
              @click="emit('type-change', type)"
            >
              <img
                :src="`${TYPE_SPRITE_BASE}/${TYPE_IDS[type]}.png`"
                alt=""
                aria-hidden="true"
                loading="lazy"
                class="h-6 w-6 shrink-0 object-contain"
              >

              <span>{{ type }}</span>

              <Check
                v-if="selectedType === type"
                :size="12"
              />
            </button>
          </div>
        </section>

        <div class="border-t border-white/10" />

        <!-- Sort By -->
        <section>
          <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
            Sort By
          </h4>

          <div class="space-y-2">
            <button
              v-for="option in SORT_OPTIONS"
              :key="option.value"
              type="button"
              class="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition"
              :class="
                sortBy === option.value
                  ? 'border-[#F6C945]/50 bg-[#F6C945]/10 text-[#F6C945]'
                  : 'border-white/5 bg-[#080C17] text-gray-400 hover:border-white/20'
              "
              @click="emit('sort-change', option.value)"
            >
              {{ option.label }}

              <Check
                v-if="sortBy === option.value"
                :size="15"
              />
            </button>
          </div>
        </section>

        <div class="border-t border-white/10" />

        <!-- Items Per Page -->
        <section>
          <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
            Items Per Page
          </h4>

          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="value in LIMIT_OPTIONS"
              :key="value"
              type="button"
              :aria-pressed="limit === value"
              class="rounded-lg border py-2.5 text-xs font-bold transition"
              :class="
                limit === value
                  ? 'border-[#F6C945] bg-[#F6C945] text-[#080C17]'
                  : 'border-white/10 bg-[#080C17] text-gray-400 hover:border-[#F6C945]/50'
              "
              @click="emit('limit-change', value)"
            >
              {{ value }}
            </button>
          </div>
        </section>
      </div>

      <!-- Panel Footer -->
      <div class="flex justify-end border-t border-[#263149] px-6 py-4">
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          @click="handleReset"
        >
          <RotateCcw :size="15" />
          Reset filters
        </button>
      </div>
    </div>
  </div>
</template>