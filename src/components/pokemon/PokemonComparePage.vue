<script setup>
import { ref, watch } from "vue";
import {
  ArrowLeft,
  Scale,
  Ruler,
  Weight,
  Zap,
} from "@lucide/vue";

import PokeballIcon from "../common/PokeballIcon.vue";
import { getPokemonDetails } from "../../services/pokemonApi";
import TypeMatchupComparison from "./TypeMatchupComparison.vue";
import PokemonTypeBadge from "./PokemonTypeBadge.vue";
import { getComparisonImage } from "../../utils/formatPokemon";

const props = defineProps({
  comparedPokemon: {
    type: Array,
    default: () => [],
  },
  onBack: {
    type: Function,
    default: null,
  },
});

const details = ref([]);
const loading = ref(false);
const error = ref(null);

const statLabels = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

const STAT_COLORS = {
  hp: "bg-green-400",
  attack: "bg-red-400",
  defense: "bg-orange-400",
  "special-attack": "bg-blue-400",
  "special-defense": "bg-teal-400",
  speed: "bg-yellow-400",
};

const comparisonIds = () =>
  props.comparedPokemon.map((pokemon) => pokemon.id).join(",");

watch(
  comparisonIds,
  async (_, __, onCleanup) => {
    if (!props.comparedPokemon.length) {
      details.value = [];
      loading.value = false;
      error.value = null;
      return;
    }

    const controller = new AbortController();

    onCleanup(() => controller.abort());

    try {
      loading.value = true;
      error.value = null;

      const results = await Promise.all(
        props.comparedPokemon.map((pokemon) =>
          getPokemonDetails(pokemon.id, controller.signal)
        )
      );

      if (!controller.signal.aborted) {
        details.value = results;
      }
    } catch (err) {
      if (err.name !== "AbortError" && !controller.signal.aborted) {
        error.value = "Unable to load Pokémon comparison data.";
      }
    } finally {
      if (!controller.signal.aborted) {
        loading.value = false;
      }
    }
  },
  { immediate: true }
);

function formatHeight(height) {
  return height !== undefined
    ? `${(height / 10).toFixed(1)} m`
    : "—";
}

function formatWeight(weight) {
  return weight !== undefined
    ? `${(weight / 10).toFixed(1)} kg`
    : "—";
}

function getStatPercentage(value) {
  return Math.min((value / 255) * 100, 100);
}

function getComparisonImageSource(pokemonData, pokemon) {
  if (pokemonData) {
    return getComparisonImage(pokemonData);
  }

  return pokemon.image;
}

function handleComparisonImageError(event, pokemonData, pokemon) {
  const image = event.currentTarget;

  image.onerror = null;

  image.src =
    pokemonData?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemonData?.sprites?.front_default ||
    pokemon.image;
}
</script>

<template>
  <main class="min-h-screen">
    <div class="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <!-- Page Header -->
      <div class="mb-8">
        <button
          type="button"
          class="mb-5 flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#F6C945]"
          @click="onBack?.()"
        >
          <ArrowLeft :size="16" />
          Back to Pokédex
        </button>

        <p
          class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F6C945]"
        >
          Pokémon Analysis
        </p>

        <h1 class="text-3xl font-bold text-white sm:text-4xl">
          Compare Pokémon
        </h1>

        <p class="mt-2 text-sm text-gray-400">
          Compare abilities, physical attributes, and base stats.
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-if="comparedPokemon.length === 0"
        class="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/50 px-6 text-center"
      >
        <Scale
          :size="48"
          class="mb-5 text-gray-500"
        />

        <h2 class="text-xl font-bold text-white">
          No Pokémon selected
        </h2>

        <p class="mt-2 max-w-sm text-sm text-gray-400">
          Select up to two Pokémon from the Pokédex to start comparing
          their stats and attributes.
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-[#F6C945] px-5 py-3 text-sm font-bold text-[#080C17] transition hover:bg-yellow-300"
          @click="onBack?.()"
        >
          Select Pokémon
        </button>
      </div>

      <!-- Loading -->
      <div
        v-else-if="loading"
        class="flex min-h-[280px] flex-col items-center justify-center gap-5"
        role="status"
        aria-live="polite"
      >
        <PokeballIcon
          :size="76"
          spinning
          glowing
          class-name="drop-shadow-[0_0_18px_rgba(246,201,69,0.25)]"
        />

        <div class="text-center">
          <p class="text-sm font-bold text-[#F6C945]">
            Loading comparison data...
          </p>

          <p class="mt-2 text-xs text-gray-500">
            Preparing Pokémon statistics and attributes
          </p>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center text-sm text-red-400"
      >
        {{ error }}
      </div>

      <!-- Comparison Content -->
      <template v-else-if="comparedPokemon.length > 0">
        <!-- Pokémon Cards -->
        <div class="grid grid-cols-2 gap-4 sm:gap-6">
          <div
            v-for="(pokemon, index) in comparedPokemon"
            :key="pokemon.id"
            class="relative overflow-hidden rounded-2xl border border-[#263149] bg-[#111A2C] p-3 sm:p-4"
          >
            <div class="mb-3 text-xs font-bold tracking-wider text-gray-500">
              #{{ String(pokemon.id).padStart(3, "0") }}
            </div>

            <div
              class="relative mx-auto flex aspect-square max-w-[190px] items-center justify-center"
            >
              <div
                class="absolute h-[75%] w-[75%] rounded-full bg-white/[0.04]"
              />

              <img
                :src="getComparisonImageSource(details[index], pokemon)"
                :alt="pokemon.name"
                class="relative z-10 h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                @error="
                  handleComparisonImageError($event, details[index], pokemon)
                "
              >
            </div>

            <h2
              class="mt-1 text-center text-lg font-extrabold capitalize text-white sm:text-2xl"
            >
              {{ pokemon.name }}
            </h2>

            <div class="-mt-3 flex flex-wrap justify-center gap-2">
              <PokemonTypeBadge
                v-for="type in pokemon.types"
                :key="type"
                :type="type"
                size="sm"
              />
            </div>
          </div>

          <!-- Empty Second Slot -->
          <button
            v-if="comparedPokemon.length === 1"
            type="button"
            class="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/40 p-4 text-center transition hover:border-[#F6C945]/50 hover:bg-[#111A2C]"
            @click="onBack?.()"
          >
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#263149]"
            >
              <Scale
                :size="28"
                class="text-[#F6C945]"
              />
            </div>

            <span class="font-bold text-white">
              Add another Pokémon
            </span>

            <span class="mt-2 text-xs text-gray-500">
              Return to the Pokédex to select one
            </span>
          </button>
        </div>

        <!-- Type Matchup Comparison -->
        <TypeMatchupComparison
          v-if="details.length === 2 && comparedPokemon.length === 2"
          :pokemon-a="details[0]"
          :pokemon-b="details[1]"
        />

        <!-- Base Stats Comparison -->
        <section
          v-if="details.length === 2 && comparedPokemon.length === 2"
          class="mt-5 rounded-2xl border border-[#263149] bg-[#111A2C] p-4 sm:p-6"
        >
          <div class="mb-6 flex items-center gap-3">
            <Zap
              :size="20"
              class="text-[#F6C945]"
            />

            <h2 class="text-lg font-bold text-white">
              Base Stats Comparison
            </h2>
          </div>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
            <div
              v-for="(pokemon, index) in details"
              :key="pokemon.id"
              class="min-w-0"
            >
              <div class="mb-4 flex items-center justify-between gap-3">
                <h3
                  :class="`text-sm font-bold capitalize ${
                    index === 0 ? 'text-white' : 'text-[#F6C945]'
                  }`"
                >
                  {{ pokemon.name }}
                </h3>

                <span
                  class="shrink-0 text-xs font-semibold text-[#F6C945]"
                >
                  Total:
                  {{
                    pokemon.stats.reduce(
                      (total, stat) => total + stat.base_stat,
                      0
                    )
                  }}
                </span>
              </div>

              <div class="space-y-4">
                <div
                  v-for="stat in pokemon.stats"
                  :key="stat.stat.name"
                  class="grid grid-cols-[85px_1fr_30px] items-center gap-3"
                >
                  <span class="text-xs font-semibold text-gray-400">
                    {{ statLabels[stat.stat.name] || stat.stat.name }}
                  </span>

                  <div
                    class="h-2 overflow-hidden rounded-full bg-[#263149]"
                  >
                    <div
                      :class="`h-full rounded-full transition-all duration-700 ease-out ${
                        STAT_COLORS[stat.stat.name] || 'bg-[#F6C945]'
                      }`"
                      :style="{
                        width: `${getStatPercentage(stat.base_stat)}%`,
                      }"
                    />
                  </div>

                  <span
                    class="text-right text-xs font-bold tabular-nums text-white"
                  >
                    {{ stat.base_stat }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Physical Attributes -->
        <section
          v-if="details.length === 2 && comparedPokemon.length === 2"
          class="mt-4 rounded-2xl border border-[#263149] bg-[#111A2C] p-4 sm:p-6"
        >
          <h2 class="mb-6 text-lg font-bold text-white">
            Physical Attributes
          </h2>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(pokemon, index) in details"
              :key="pokemon.id"
              class="rounded-xl bg-[#080C17] p-4"
            >
              <h3
                :class="`mb-4 text-center text-sm font-bold capitalize ${
                  index === 0 ? 'text-white' : 'text-[#F6C945]'
                }`"
              >
                {{ pokemon.name }}
              </h3>

              <div class="mb-4">
                <div class="mb-2 flex items-center gap-2 text-gray-400">
                  <Ruler :size="16" />
                  <span class="text-xs">Height</span>
                </div>

                <p class="text-xl font-bold text-white">
                  {{ formatHeight(pokemon.height) }}
                </p>
              </div>

              <div>
                <div class="mb-2 flex items-center gap-2 text-gray-400">
                  <Weight :size="16" />
                  <span class="text-xs">Weight</span>
                </div>

                <p class="text-xl font-bold text-white">
                  {{ formatWeight(pokemon.weight) }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Abilities -->
        <section
          v-if="details.length === 2 && comparedPokemon.length === 2"
          class="mt-6 rounded-2xl border border-[#263149] bg-[#111A2C] p-5 sm:p-8"
        >
          <h2 class="mb-5 text-lg font-bold text-white">
            Abilities
          </h2>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="pokemon in details"
              :key="pokemon.id"
            >
              <h3 class="mb-3 text-sm font-bold capitalize text-gray-300">
                {{ pokemon.name }}
              </h3>

              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in pokemon.abilities"
                  :key="item.ability.name"
                  class="rounded-lg border border-[#263149] bg-[#080C17] px-3 py-2 text-xs capitalize text-gray-400"
                >
                  {{ item.ability.name.replaceAll("-", " ") }}

                  <span
                    v-if="item.is_hidden"
                    class="ml-1 text-[#F6C945]"
                  >
                    (Hidden)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Legend -->
        <div
          v-if="details.length === 2 && comparedPokemon.length === 2"
          class="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400"
        >
          <span class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-white" />
            {{ comparedPokemon[0].name }}
          </span>

          <span class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-[#F6C945]" />
            {{ comparedPokemon[1].name }}
          </span>
        </div>
      </template>
    </div>
  </main>
</template>