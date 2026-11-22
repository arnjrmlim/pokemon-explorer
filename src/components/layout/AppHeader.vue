<script setup>
import { Heart } from "@lucide/vue";
import PokeballIcon from "../common/PokeballIcon.vue";

const props = defineProps({
  activePage: {
    type: String,
    required: true,
  },
  onNavigate: {
    type: Function,
    required: true,
  },
  favoritesCount: {
    type: Number,
    default: 0,
  },
});

const navItems = [
  { id: "explore", label: "Explore" },
  { id: "favorites", label: "Favorites" },
];

const tooltipMessages = {
  explore: "Explore all Pokémon",
  favorites: "View your favorite Pokémon",
};

function handleNavigate(page) {
  if (page === props.activePage) {
    window.location.reload();
    return;
  }

  props.onNavigate(page);
}

function handleLogoClick() {
  if (props.activePage === "explore") {
    window.location.reload();
    return;
  }

  props.onNavigate("explore");
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/10 bg-[#080C17]/90 backdrop-blur-xl"
  >
    <!-- Shared width and alignment with the main content -->
    <div
      class="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8"
    >
      <!-- Logo -->
      <button
        type="button"
        class="flex shrink-0 items-center gap-3 text-left"
        aria-label="Go to Explore Pokémon"
        @click="handleLogoClick"
      >
        <PokeballIcon :size="42" />

        <div>
          <h1 class="whitespace-nowrap text-lg font-extrabold tracking-wide text-white">
            POKÉMON<span class="text-[#F6C945]"> EXPLORER</span>
          </h1>

          <p class="text-[10px] tracking-[0.2em] text-gray-500">
            EXPLORE THE POKÉMON WORLD
          </p>
        </div>
      </button>

      <!-- Navigation -->
      <nav class="flex shrink-0 items-center gap-3 md:gap-5">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="group/nav-tooltip relative"
        >
          <button
            type="button"
            :aria-current="
              activePage === item.id ? 'page' : undefined
            "
            :class="`flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              activePage === item.id
                ? 'bg-[#F6C945]/10 text-[#F6C945]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`"
            @click="handleNavigate(item.id)"
          >
            <Heart
              v-if="item.id === 'favorites'"
              :size="15"
              class="shrink-0"
              :fill="
                activePage === item.id
                  ? 'currentColor'
                  : 'none'
              "
            />

            <span>{{ item.label }}</span>

            <span
              v-if="item.id === 'favorites'"
              :class="`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                activePage === item.id
                  ? 'bg-[#F6C945]/15 text-[#F6C945]'
                  : 'bg-[#263149] text-gray-300'
              }`"
            >
              {{ favoritesCount }}
            </span>
          </button>

          <!-- Tooltip -->
          <span
            role="tooltip"
            class="pointer-events-none absolute right-0 top-full z-[60] mt-3 translate-y-1 whitespace-nowrap rounded-lg border border-[#263149] bg-[#111A2C] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover/nav-tooltip:translate-y-0 group-hover/nav-tooltip:opacity-100"
          >
            {{ tooltipMessages[item.id] }}
          </span>
        </div>
      </nav>
    </div>
  </header>
</template>