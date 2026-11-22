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
    class="sticky top-0 z-50 border-b border-white/10 bg-[#080C17]/95 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex w-full max-w-[1600px] flex-col px-4 sm:px-6 lg:px-8"
    >
      <!-- Logo -->
      <div
        class="flex min-h-[64px] items-center justify-between sm:min-h-20"
      >
        <button
          type="button"
          class="flex min-w-0 items-center gap-2 text-left sm:gap-3"
          aria-label="Go to Explore Pokémon"
          @click="handleLogoClick"
        >
          <PokeballIcon
            :size="36"
            class="shrink-0 sm:hidden"
          />

          <PokeballIcon
            :size="42"
            class="hidden shrink-0 sm:block"
          />

          <div class="min-w-0">
            <h1
              class="whitespace-nowrap text-sm font-extrabold tracking-wide text-white sm:text-lg"
            >
              POKÉMON<span class="text-[#F6C945]"> EXPLORER</span>
            </h1>

            <p
              class="hidden text-[9px] tracking-[0.2em] text-gray-500 sm:block sm:text-[10px]"
            >
              EXPLORE THE POKÉMON WORLD
            </p>
          </div>
        </button>

        <!-- Desktop navigation -->
        <nav class="hidden items-center gap-3 sm:flex md:gap-5">
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
              :class="`flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                activePage === item.id
                  ? 'bg-[#F6C945]/10 text-[#F6C945]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`"
              @click="handleNavigate(item.id)"
            >
              <Heart
                v-if="item.id === 'favorites'"
                :size="15"
                :fill="
                  activePage === item.id
                    ? 'currentColor'
                    : 'none'
                "
              />

              {{ item.label }}

              <span
                v-if="item.id === 'favorites'"
                class="rounded-full bg-[#263149] px-1.5 py-0.5 text-[10px] font-bold text-gray-300"
              >
                {{ favoritesCount }}
              </span>
            </button>

            <span
              role="tooltip"
              class="pointer-events-none absolute right-0 top-full z-[60] mt-3 whitespace-nowrap rounded-lg border border-[#263149] bg-[#111A2C] px-3 py-2 text-xs text-white opacity-0 shadow-xl transition group-hover/nav-tooltip:opacity-100"
            >
              {{ tooltipMessages[item.id] }}
            </span>
          </div>
        </nav>

        <!-- Mobile favorite count -->
        <span
          class="text-xs font-medium text-gray-400 sm:hidden"
        >
          {{ favoritesCount }} saved
        </span>
      </div>

      <!-- Mobile navigation -->
      <nav
        class="grid grid-cols-2 gap-2 border-t border-white/10 py-2 sm:hidden"
        aria-label="Main navigation"
      >
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          :aria-current="
            activePage === item.id ? 'page' : undefined
          "
          :class="`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
            activePage === item.id
              ? 'bg-[#F6C945]/10 text-[#F6C945]'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`"
          @click="handleNavigate(item.id)"
        >
          <Heart
            v-if="item.id === 'favorites'"
            :size="15"
            :fill="
              activePage === item.id
                ? 'currentColor'
                : 'none'
            "
          />

          {{ item.label }}

          <span
            v-if="item.id === 'favorites'"
            class="rounded-full bg-[#263149] px-1.5 py-0.5 text-[10px] text-gray-300"
          >
            {{ favoritesCount }}
          </span>
        </button>
      </nav>
    </div>
  </header>
</template>