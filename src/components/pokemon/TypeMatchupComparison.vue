<script setup>
import { ref, computed, watch } from "vue";
import { Shield, Swords } from "@lucide/vue";
import PokemonTypeBadge from "./PokemonTypeBadge.vue";
import PokeballIcon from "../common/PokeballIcon.vue";

import {
  getDefensiveEffectiveness,
  getOffensiveEffectiveness,
  groupEffectiveness,
} from "../../utils/typeEffectiveness";

const props = defineProps({
  pokemonA: {
    type: Object,
    required: true,
  },
  pokemonB: {
    type: Object,
    required: true,
  },
});

const data = ref(null);
const loading = ref(true);
const error = ref("");

function formatMultiplier(value) {
  const fractions = {
    0: "0×",
    0.25: "¼×",
    0.5: "½×",
    1: "1×",
    2: "2×",
    4: "4×",
  };

  return fractions[value] ?? `${value}×`;
}

function getBestAttack(results) {
  if (!results?.length) return null;

  return results.reduce((best, current) =>
    current.multiplier > best.multiplier ? current : best
  );
}

const bestAttackA = computed(() =>
  data.value ? getBestAttack(data.value.offensiveA) : null
);

const bestAttackB = computed(() =>
  data.value ? getBestAttack(data.value.offensiveB) : null
);

const advantageSummary = computed(() => {
  if (!data.value) return null;

  const bestA = bestAttackA.value;
  const bestB = bestAttackB.value;

  if (!bestA || !bestB) return null;

  if (bestA.multiplier > bestB.multiplier) {
    return {
      winner: props.pokemonA,
      advantage: "type advantage",
      description: `${props.pokemonA.name} has the stronger type matchup.`,
    };
  }

  if (bestB.multiplier > bestA.multiplier) {
    return {
      winner: props.pokemonB,
      advantage: "type advantage",
      description: `${props.pokemonB.name} has the stronger type matchup.`,
    };
  }

  return {
    winner: null,
    advantage: "even matchup",
    description: "Both Pokémon have the same best attacking effectiveness.",
  };
});

const defensiveGroupsA = computed(() =>
  data.value ? groupEffectiveness(data.value.defensiveA) : null
);

const defensiveGroupsB = computed(() =>
  data.value ? groupEffectiveness(data.value.defensiveB) : null
);

const effectivenessGuide = [
  {
    multiplier: "4×",
    label: "Extremely weak",
    color: "text-red-400",
    background: "bg-red-500/10",
  },
  {
    multiplier: "2×",
    label: "Weak",
    color: "text-orange-400",
    background: "bg-orange-500/10",
  },
  {
    multiplier: "1×",
    label: "Normal",
    color: "text-gray-300",
    background: "bg-gray-500/10",
  },
  {
    multiplier: "½×",
    label: "Resistant",
    color: "text-green-400",
    background: "bg-green-500/10",
  },
  {
    multiplier: "¼×",
    label: "Highly resistant",
    color: "text-emerald-400",
    background: "bg-emerald-500/10",
  },
  {
    multiplier: "0×",
    label: "Immune",
    color: "text-blue-400",
    background: "bg-blue-500/10",
  },
];

async function loadMatchups(signal) {
  try {
    loading.value = true;
    error.value = "";
    data.value = null;

    const [
      defensiveA,
      defensiveB,
      offensiveA,
      offensiveB,
    ] = await Promise.all([
      getDefensiveEffectiveness(props.pokemonA.types, signal),
      getDefensiveEffectiveness(props.pokemonB.types, signal),
      getOffensiveEffectiveness(
        props.pokemonA.types,
        props.pokemonB.types,
        signal
      ),
      getOffensiveEffectiveness(
        props.pokemonB.types,
        props.pokemonA.types,
        signal
      ),
    ]);

    if (signal.aborted) return;

    data.value = {
      defensiveA,
      defensiveB,
      offensiveA,
      offensiveB,
    };
  } catch (err) {
    if (err.name === "AbortError" || signal.aborted) return;

    console.error("Type matchup error:", err);
    error.value = err.message || "Unable to calculate type matchups.";
  } finally {
    if (!signal.aborted) {
      loading.value = false;
    }
  }
}

watch(
  () => [props.pokemonA, props.pokemonB],
  ([pokemonA, pokemonB], _, onCleanup) => {
    if (!pokemonA || !pokemonB) {
      data.value = null;
      loading.value = false;
      return;
    }

    const controller = new AbortController();

    onCleanup(() => controller.abort());

    loadMatchups(controller.signal);
  },
  { immediate: true }
);
</script>

<template>
  <section
    class="mt-5 rounded-2xl border border-[#263149] bg-[#111A2C] p-4 sm:p-6"
  >
    <div class="mb-6 flex items-center gap-3">
      <Shield
        :size="20"
        class="text-[#F6C945]"
      />

      <div>
        <h2 class="text-lg font-bold text-white">
          Type Matchup Analysis
        </h2>

        <p class="mt-1 text-xs text-gray-500">
          Defensive strengths and weaknesses of each Pokémon.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex min-h-[240px] flex-col items-center justify-center gap-5"
      role="status"
      aria-live="polite"
    >
      <PokeballIcon
        :size="68"
        spinning
        glowing
        class-name="drop-shadow-[0_0_16px_rgba(246,201,69,0.25)]"
      />

      <div class="text-center">
        <p class="text-sm font-bold text-[#F6C945]">
          Calculating type matchups...
        </p>

        <p class="mt-2 text-xs text-gray-500">
          Analyzing strengths, weaknesses, and resistances
        </p>
      </div>
    </div>

    <!-- Error -->
    <p
      v-else-if="error"
      class="rounded-xl bg-red-500/5 p-4 text-center text-sm text-red-400"
    >
      {{ error }}
    </p>

    <div
      v-else-if="data"
      class="space-y-2"
    >
      <!-- Type Advantage Summary -->
      <div
        class="rounded-xl border border-[#263149] bg-[#080C17] p-4 sm:p-5"
      >
        <div
          class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
        >
          <h3 class="text-sm font-bold text-white">
            Type Advantage Overview
          </h3>

          <span
            :class="`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              advantageSummary?.winner
                ? 'bg-[#F6C945]/10 text-[#F6C945]'
                : 'bg-gray-500/10 text-gray-400'
            }`"
          >
            {{ advantageSummary?.advantage }}
          </span>
        </div>

        <p class="mb-5 text-xs leading-relaxed text-gray-500">
          Based on the strongest available attacking type of each Pokémon.
          This indicates type effectiveness, not a guaranteed battle winner.
        </p>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="(item, index) in [
              { pokemon: pokemonA, best: bestAttackA },
              { pokemon: pokemonB, best: bestAttackB },
            ]"
            :key="item.pokemon.id"
            :class="`min-w-0 rounded-xl border p-4 transition-colors ${
              advantageSummary?.winner?.id === item.pokemon.id
                ? 'border-[#F6C945]/40 bg-[#F6C945]/[0.05]'
                : 'border-[#263149] bg-[#111A2C]/60'
            }`"
          >
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4
                :class="`text-sm font-bold capitalize ${
                  index === 0 ? 'text-white' : 'text-[#F6C945]'
                }`"
              >
                {{ item.pokemon.name }}
              </h4>

              <span
                v-if="advantageSummary?.winner?.id === item.pokemon.id"
                class="text-[9px] font-bold uppercase tracking-wider text-[#F6C945]"
              >
                Type edge
              </span>
            </div>

            <div
              v-if="item.best"
              class="flex flex-wrap items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="mb-2 text-[10px] text-gray-500">
                  Best attacking type
                </p>

                <PokemonTypeBadge
                  :type="item.best.attackingType"
                  size="md"
                />
              </div>

              <div class="text-right">
                <p class="text-2xl font-extrabold tabular-nums text-white">
                  {{ formatMultiplier(item.best.multiplier) }}
                </p>

                <p class="text-[10px] text-gray-500">
                  Effectiveness
                </p>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-xs text-gray-400">
          {{ advantageSummary?.description }}
        </p>
      </div>

      <!-- Defensive Effectiveness -->
      <div>
        <h3 class="mb-3 text-sm font-bold text-white">
          Defensive Effectiveness
        </h3>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div
            v-for="(item, index) in [
              { pokemon: pokemonA, groups: defensiveGroupsA },
              { pokemon: pokemonB, groups: defensiveGroupsB },
            ]"
            :key="item.pokemon.id"
            class="min-w-0 rounded-xl border border-[#263149] bg-[#080C17] p-4"
          >
            <h3
              :class="`mb-3 text-sm font-bold capitalize ${
                index === 0 ? 'text-white' : 'text-[#F6C945]'
              }`"
            >
              {{ item.pokemon.name }}
            </h3>

            <div class="space-y-2">
              <div
                v-for="category in [
                  {
                    label: 'Weaknesses',
                    entries: item.groups.weaknesses,
                    empty: 'No weaknesses',
                    heading: 'text-red-400',
                  },
                  {
                    label: 'Resistances',
                    entries: item.groups.resistances,
                    empty: 'No resistances',
                    heading: 'text-green-400',
                  },
                  {
                    label: 'Immunities',
                    entries: item.groups.immunities,
                    empty: 'No immunities',
                    heading: 'text-blue-400',
                  },
                ]"
                :key="category.label"
              >
                <p
                  class="mb-1.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="category.heading"
                >
                  {{ category.label }}
                </p>

                <p
                  v-if="!category.entries.length"
                  class="text-xs text-gray-500"
                >
                  {{ category.empty }}
                </p>

                <div
                  v-else
                  class="flex flex-wrap items-center gap-3"
                >
                  <div
                    v-for="[type, multiplier] in category.entries"
                    :key="type"
                    class="flex items-center gap-1.5"
                  >
                    <PokemonTypeBadge
                      :type="type"
                      size="md"
                    />

                    <span
                      :class="`text-[10px] font-bold ${
                        multiplier === 0
                          ? 'text-gray-500'
                          : multiplier < 1
                            ? 'text-green-400'
                            : multiplier > 1
                              ? 'text-red-400'
                              : 'text-gray-300'
                      }`"
                    >
                      {{ formatMultiplier(multiplier) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Head-to-Head -->
      <div>
        <div class="mb-4 flex items-center gap-3">
          <Swords
            :size="18"
            class="text-[#F6C945]"
          />

          <h3 class="text-sm font-bold text-white">
            Head-to-Head Attacking Effectiveness
          </h3>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div
            v-for="(item, index) in [
              { pokemon: pokemonA, results: data.offensiveA },
              { pokemon: pokemonB, results: data.offensiveB },
            ]"
            :key="item.pokemon.id"
            class="min-w-0 rounded-xl border border-[#263149] bg-[#080C17] p-4"
          >
            <h3
              :class="`mb-2 text-sm font-bold capitalize ${
                index === 0 ? 'text-white' : 'text-[#F6C945]'
              }`"
            >
              {{ item.pokemon.name }}
            </h3>

            <p class="mb-2 text-xs text-gray-500">
              Attacking type effectiveness
            </p>

            <div class="space-y-2">
              <div
                v-for="result in item.results"
                :key="result.attackingType"
                class="flex flex-wrap items-center justify-between gap-2"
              >
                <PokemonTypeBadge
                  :type="result.attackingType"
                  size="md"
                />

                <span
                  :class="`text-sm font-bold ${
                    result.multiplier > 1
                      ? 'text-green-400'
                      : result.multiplier === 0
                        ? 'text-gray-500'
                        : result.multiplier < 1
                          ? 'text-red-400'
                          : 'text-gray-300'
                  }`"
                >
                  {{ formatMultiplier(result.multiplier) }} damage
                </span>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-[11px] leading-relaxed text-gray-500">
          Multipliers represent the effectiveness of attacks matching each
          Pokémon's type against the opposing Pokémon. Actual battle damage
          also depends on stats, moves, abilities, and other battle conditions.
        </p>

        <!-- Effectiveness Legend -->
        <div class="border-t border-[#263149] pt-6">
          <h3 class="mb-3 text-sm font-bold text-white">
            Effectiveness Guide
          </h3>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div
              v-for="item in effectivenessGuide"
              :key="item.multiplier"
              :class="`flex min-w-0 items-center gap-2 rounded-lg border border-[#263149] p-2.5 ${item.background}`"
            >
              <span
                :class="`text-sm font-extrabold ${item.color}`"
              >
                {{ item.multiplier }}
              </span>

              <span class="text-[10px] font-medium leading-tight text-gray-400">
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>