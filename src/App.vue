<script setup>
import { ref, computed, watch, nextTick } from "vue";
import {
  Heart,
  Search,
  ArrowLeft,
  ArrowLeftRight,
  X,
} from "@lucide/vue";

import MainLayout from "./components/layout/MainLayout.vue";
import SearchBar from "./components/common/SearchBar.vue";
import FilterMenu from "./components/common/FilterMenu.vue";
import PokeballIcon from "./components/common/PokeballIcon.vue";
import PokemonGrid from "./components/pokemon/PokemonGrid.vue";
import PokemonPagination from "./components/common/PokemonPagination.vue";
import PokemonModal from "./components/pokemon/PokemonModal.vue";
import PokemonComparePage from "./components/pokemon/PokemonComparePage.vue";

import usePokemonSearch from "./composables/usePokemonSearch";
import useFavorites from "./composables/useFavorites";

// --------------------------------------------------
// PAGE STATE
// --------------------------------------------------

const activePage = ref(
  sessionStorage.getItem("pokemon-explorer-active-page") || "explore"
);

watch(activePage, (value) => {
  sessionStorage.setItem("pokemon-explorer-active-page", value);
});

const comparedPokemon = ref([]);

watch(activePage, () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// --------------------------------------------------
// POKÉMON COLLECTION STATE
// --------------------------------------------------

const page = ref(1);
const limit = ref(20);

const search = ref("");
const selectedType = ref("all");
const sortBy = ref("id-asc");

const collectionRef = ref(null);
const selectedPokemon = ref(null);

// --------------------------------------------------
// POKÉMON API
// --------------------------------------------------

const {
  pokemon,
  totalCount,
  loading,
  error,
} = usePokemonSearch({
  page,
  limit,
  search,
  type: selectedType,
});

// --------------------------------------------------
// FAVORITES
// --------------------------------------------------

const {
  favorites,
  toggleFavorite,
} = useFavorites();

// --------------------------------------------------
// POKÉMON COMPARISON
// --------------------------------------------------

function handleToggleCompare(selectedPokemon) {
  const alreadySelected = comparedPokemon.value.some(
    (item) => item.id === selectedPokemon.id
  );

  if (alreadySelected) {
    comparedPokemon.value = comparedPokemon.value.filter(
      (item) => item.id !== selectedPokemon.id
    );
    return;
  }

  // Maximum of two Pokémon.
  if (comparedPokemon.value.length >= 2) return;

  comparedPokemon.value = [
    ...comparedPokemon.value,
    selectedPokemon,
  ];
}

// --------------------------------------------------
// PAGINATION
// --------------------------------------------------

const totalPages = computed(() =>
  Math.ceil(totalCount.value / limit.value)
);

async function scrollToCollection() {
  await nextTick();

  requestAnimationFrame(() => {
    collectionRef.value?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function handlePageChange(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;

  page.value = newPage;
  scrollToCollection();
}

function handleLimitChange(newLimit) {
  if (newLimit === limit.value) return;

  limit.value = newLimit;
  page.value = 1;
  scrollToCollection();
}

// Reset to page 1 whenever the search term or type changes.
function handleSearchChange(value) {
  search.value = value;
  page.value = 1;
}

function handleTypeChange(value) {
  selectedType.value = value;
  page.value = 1;
}

function handleSortChange(value) {
  sortBy.value = value;
  page.value = 1;
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

function handleExploreClick() {
  activePage.value = "explore";
  search.value = "";
  selectedType.value = "all";
  sortBy.value = "id-asc";
  page.value = 1;
}

function handleFavoritesClick() {
  activePage.value = "favorites";
  search.value = "";
  selectedType.value = "all";
  sortBy.value = "id-asc";
  page.value = 1;
}

function handleNavigation(destination) {
  switch (destination) {
    case "explore":
      handleExploreClick();
      break;

    case "favorites":
      handleFavoritesClick();
      break;

    case "compare":
      activePage.value = "compare";
      break;
  }
}

// --------------------------------------------------
// PAGE CONDITIONS
// --------------------------------------------------

const isFavoritesPage = computed(
  () => activePage.value === "favorites"
);

const isComparePage = computed(
  () => activePage.value === "compare"
);

// --------------------------------------------------
// SORT + FAVORITES FILTER
// --------------------------------------------------

const displayPokemon = computed(() => {
  const source = isFavoritesPage.value
    ? favorites.value
    : pokemon.value;

  const searchTerm = search.value.trim().toLowerCase();

  const filtered = isFavoritesPage.value
    ? source.filter((item) => {
        const matchesSearch =
          !searchTerm ||
          item.name.toLowerCase().includes(searchTerm);

        const matchesType =
          selectedType.value === "all" ||
          item.types?.includes(selectedType.value);

        return matchesSearch && matchesType;
      })
    : source;

  return [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case "id-desc":
        return b.id - a.id;

      case "name-asc":
        return a.name.localeCompare(b.name);

      case "name-desc":
        return b.name.localeCompare(a.name);

      case "id-asc":
      default:
        return a.id - b.id;
    }
  });
});

// --------------------------------------------------
// EMPTY STATES
// --------------------------------------------------

const isEmptyFavorites = computed(
  () => isFavoritesPage.value && favorites.value.length === 0
);

// Subtitle shown under the section heading.
const sectionSubtitle = computed(() => {
  if (isFavoritesPage.value) {
    return `${displayPokemon.value.length} of ${favorites.value.length} favorites`;
  }

  const isFiltered =
    search.value.trim() || selectedType.value !== "all";

  if (isFiltered && !loading.value) {
    return totalCount.value === 0
      ? "No Pokémon matched"
      : `${totalCount.value.toLocaleString()} result${totalCount.value === 1 ? "" : "s"} found`;
  }

  return `${totalCount.value.toLocaleString()} Pokémon available`;
});
</script>

<template>
  <MainLayout
    :active-page="activePage"
    :on-navigate="handleNavigation"
    :can-compare="comparedPokemon.length === 2"
    :favorites-count="favorites.length"
    :search="search"
    :on-search-change="handleSearchChange"
  >
    <!-- COMPARE PAGE -->
    <PokemonComparePage
      v-if="isComparePage"
      :compared-pokemon="comparedPokemon"
      :on-back="handleExploreClick"
    />

    <!-- EXPLORE / FAVORITES PAGE -->
    <main
      v-else
      class="min-h-screen"
      :class="comparedPokemon.length > 0 ? 'pb-40 sm:pb-32' : ''"
    >
      <div class="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <!-- PAGE HEADER -->
        <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F6C945]">
              Pokémon Explorer
            </p>

            <h1 class="text-3xl font-bold text-white sm:text-4xl">
              {{ isFavoritesPage ? "My Favorites" : "Explore Pokémon" }}
            </h1>

            <p class="mt-2 text-sm text-gray-400">
              {{
                isFavoritesPage
                  ? "Your personally collected Pokémon."
                  : "Discover and explore Pokémon from the Pokédex."
              }}
            </p>
          </div>
        </div>

        <!-- COLLECTION CONTENT -->
        <section
          ref="collectionRef"
          class="scroll-mt-24"
        >
          <!-- SEARCH AND FILTERS -->
          <div
            v-if="!isEmptyFavorites"
            class="mb-8 flex w-full items-center gap-2 sm:gap-4"
          >
            <div class="min-w-0 flex-1">
              <SearchBar
                :value="search"
                @change="handleSearchChange"
              />
            </div>

            <div class="shrink-0">
              <FilterMenu
                :selected-type="selectedType"
                :sort-by="sortBy"
                :limit="limit"
                @type-change="handleTypeChange"
                @sort-change="handleSortChange"
                @limit-change="handleLimitChange"
              />
            </div>
          </div>

          <!-- COLLECTION TITLE, COUNT AND JUMP -->
          <div class="mb-5 flex w-full min-w-0 flex-row items-center justify-between gap-2">
            <div class="min-w-0 flex-1">
              <h2 class="text-base font-bold text-white sm:text-lg">
                {{ isFavoritesPage ? "Saved Pokémon" : "Pokédex" }}
              </h2>

              <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                {{ sectionSubtitle }}
              </p>
            </div>

            <span
              v-if="isFavoritesPage && favorites.length > 0"
              class="flex items-center gap-2 text-sm text-red-400"
            >
              <Heart
                :size="15"
                fill="currentColor"
              />
              {{ favorites.length }} saved
            </span>

            <div
              v-if="!isFavoritesPage && totalPages > 1"
              class="shrink-0"
            >
              <PokemonPagination
                variant="top"
                :current-page="page"
                :total-pages="totalPages"
                @page-change="handlePageChange"
              />
            </div>
          </div>

          <!-- EMPTY FAVORITES -->
          <div
            v-if="isEmptyFavorites"
            class="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/50 px-6 text-center"
          >
            <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#263149]">
              <Heart
                :size="34"
                class="text-gray-500"
              />
            </div>

            <h3 class="text-xl font-bold text-white">
              No favorites yet
            </h3>

            <p class="mt-2 max-w-sm text-sm text-gray-400">
              You haven't saved any Pokémon yet. Explore the Pokédex
              and tap the heart icon on a Pokémon card to add it here.
            </p>

            <button
              type="button"
              class="mt-6 flex items-center gap-2 rounded-xl bg-[#F6C945] px-5 py-3 text-sm font-bold text-[#080C17] transition hover:bg-yellow-300"
              @click="handleExploreClick"
            >
              <ArrowLeft :size="16" />
              Explore Pokémon
            </button>
          </div>

          <!-- LOADING -->
          <div
            v-if="!isFavoritesPage && loading"
            class="flex min-h-[250px] items-center justify-center"
          >
            <div class="flex flex-col items-center gap-4">
              <PokeballIcon
                :size="80"
                spinning
                glowing
              />

              <p class="text-sm text-gray-400">
                {{
                  search.trim() || selectedType !== "all"
                    ? "Searching Pokédex…"
                    : "Loading Pokémon…"
                }}
              </p>
            </div>
          </div>

          <!-- API ERROR -->
          <div
            v-if="!isFavoritesPage && error && !loading"
            class="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center"
          >
            <p class="font-semibold text-red-400">
              Failed to load Pokémon
            </p>

            <p class="mt-2 text-sm text-gray-400">
              {{
                typeof error === "string"
                  ? error
                  : "Please check your connection and try again."
              }}
            </p>
          </div>

          <!-- NO RESULTS -->
          <div
            v-if="
              !loading &&
                !error &&
                !isEmptyFavorites &&
                displayPokemon.length === 0
            "
            class="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] text-center"
          >
            <Search
              :size="32"
              class="mb-4 text-gray-500"
            />

            <h3 class="text-lg font-bold text-white">
              No Pokémon found
            </h3>

            <p class="mt-2 text-sm text-gray-400">
              Try changing your search or filter settings.
            </p>
          </div>

          <!-- POKÉMON GRID -->
          <PokemonGrid
            v-if="!loading && !error && displayPokemon.length > 0"
            :pokemon="displayPokemon"
            :favorites="favorites"
            :on-toggle-favorite="toggleFavorite"
            :on-pokemon-click="(item) => (selectedPokemon = item)"
            :compared-pokemon="comparedPokemon"
            :on-toggle-compare="handleToggleCompare"
          />

          <!-- BOTTOM PAGINATION -->
          <PokemonPagination
            v-if="
              !isFavoritesPage &&
                !loading &&
                !error &&
                totalPages > 1
            "
            variant="bottom"
            :current-page="page"
            :total-pages="totalPages"
            :total-count="totalCount"
            :limit="limit"
            @page-change="handlePageChange"
          />
        </section>
      </div>
    </main>

    <!-- FLOATING COMPARISON BAR -->
    <div
      v-if="!isComparePage && comparedPokemon.length > 0"
      class="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
    >
      <div class="flex flex-col gap-3 rounded-2xl border border-[#F6C945]/30 bg-[#111A2C]/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4">
        <!-- SELECTED POKÉMON -->
        <div class="flex w-full min-w-0 flex-1 items-center gap-2 sm:w-auto">
          <div
            v-for="item in comparedPokemon"
            :key="item.id"
            class="flex min-w-0 flex-1 items-center gap-1 rounded-xl bg-[#263149]/70 px-2 py-2 sm:flex-none sm:gap-2 sm:px-3"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
            >

            <span class="min-w-0 flex-1 truncate text-xs font-semibold capitalize text-white sm:max-w-[90px]">
              {{ item.name }}
            </span>

            <button
              type="button"
              :aria-label="`Remove ${item.name}`"
              class="shrink-0 rounded-md p-1 text-gray-500 transition hover:text-red-400"
              @click="handleToggleCompare(item)"
            >
              <X :size="14" />
            </button>
          </div>

          <span
            v-if="comparedPokemon.length === 1"
            class="hidden text-xs text-gray-500 sm:block"
          >
            Select one more
          </span>
        </div>

        <!-- COMPARE BUTTON -->
        <button
          type="button"
          :disabled="comparedPokemon.length !== 2"
          class="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition sm:w-auto sm:px-5 sm:text-sm"
          :class="
            comparedPokemon.length === 2
              ? 'bg-[#F6C945] text-[#080C17] hover:bg-yellow-300'
              : 'cursor-not-allowed bg-[#263149] text-gray-500 opacity-60'
          "
          @click="activePage = 'compare'"
        >
          <ArrowLeftRight :size="16" />
          Compare

          <span class="rounded-full bg-black/10 px-2 py-0.5">
            {{ comparedPokemon.length }}/2
          </span>
        </button>
      </div>
    </div>

    <!-- POKÉMON MODAL -->
    <PokemonModal
      v-if="selectedPokemon"
      :pokemon="selectedPokemon"
      :on-close="() => (selectedPokemon = null)"
      :favorites="favorites"
      :on-toggle-favorite="toggleFavorite"
    />
  </MainLayout>
</template>