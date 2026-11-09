import { useEffect, useState } from "react";
import { Shield, Swords } from "lucide-react";
import PokemonTypeBadge from "./PokemonTypeBadge";

import {
  getDefensiveEffectiveness,
  getOffensiveEffectiveness,
  groupEffectiveness,
} from "../../utils/typeEffectiveness";

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

function getAdvantageSummary(data) {
  const bestA = getBestAttack(data.offensiveA);
  const bestB = getBestAttack(data.offensiveB);

  if (!bestA || !bestB) return null;

  if (bestA.multiplier > bestB.multiplier) {
    return {
      winner: data.pokemonA,
      advantage: "type advantage",
      description: `${data.pokemonA.name} has the stronger type matchup.`,
    };
  }

  if (bestB.multiplier > bestA.multiplier) {
    return {
      winner: data.pokemonB,
      advantage: "type advantage",
      description: `${data.pokemonB.name} has the stronger type matchup.`,
    };
  }

  return {
    winner: null,
    advantage: "even matchup",
    description: "Both Pokémon have the same best attacking effectiveness.",
  };
}

function TypeList({ entries, emptyMessage }) {
  if (!entries.length) {
    return (
      <p className="text-xs text-gray-500">{emptyMessage}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([type, multiplier]) => (
        <div
          key={type}
          className="flex items-center gap-1.5 rounded-full border border-[#263149] bg-[#080C17] px-2 py-1"
        >
          <PokemonTypeBadge type={type} size="sm" />
          <span className="text-[10px] font-bold text-gray-300">
            {formatMultiplier(multiplier)}
          </span>
        </div>
      ))}
    </div>
  );
}

function DefensiveCard({ pokemon, effectiveness, index }) {
  const groups = groupEffectiveness(effectiveness);

  return (
    <div className="min-w-0 rounded-xl border border-[#263149] bg-[#080C17] p-4">
      <h3
        className={`mb-5 text-sm font-bold capitalize ${
          index === 0 ? "text-white" : "text-[#F6C945]"
        }`}
      >
        {pokemon.name}
      </h3>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400">
            Weaknesses
          </p>
          <TypeList
            entries={groups.weaknesses}
            emptyMessage="No weaknesses"
          />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-green-400">
            Resistances
          </p>
          <TypeList
            entries={groups.resistances}
            emptyMessage="No resistances"
          />
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Immunities
          </p>
          <TypeList
            entries={groups.immunities}
            emptyMessage="No immunities"
          />
        </div>
      </div>
    </div>
  );
}

function AttackCard({ pokemon, results, index }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#263149] bg-[#080C17] p-4">
      <h3
        className={`mb-4 text-sm font-bold capitalize ${
          index === 0 ? "text-white" : "text-[#F6C945]"
        }`}
      >
        {pokemon.name}
      </h3>

      <p className="mb-3 text-xs text-gray-500">
        Attacking type effectiveness
      </p>

      <div className="space-y-3">
        {results.map(({ attackingType, multiplier }) => (
          <div
            key={attackingType}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <PokemonTypeBadge type={attackingType} size="sm" />

            <span
              className={`text-sm font-bold ${
                multiplier > 1
                  ? "text-green-400"
                  : multiplier === 0
                    ? "text-gray-500"
                    : multiplier < 1
                      ? "text-red-400"
                      : "text-gray-300"
              }`}
            >
              {formatMultiplier(multiplier)} damage
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TypeMatchupComparison({
  pokemonA,
  pokemonB,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pokemonA || !pokemonB) return;

    const controller = new AbortController();

    async function loadMatchups() {
      try {
        setLoading(true);
        setError("");

        const [
          defensiveA,
          defensiveB,
          offensiveA,
          offensiveB,
        ] = await Promise.all([
          getDefensiveEffectiveness(
            pokemonA.types,
            controller.signal
          ),
          getDefensiveEffectiveness(
            pokemonB.types,
            controller.signal
          ),
          getOffensiveEffectiveness(
            pokemonA.types,
            pokemonB.types,
            controller.signal
          ),
          getOffensiveEffectiveness(
            pokemonB.types,
            pokemonA.types,
            controller.signal
          ),
        ]);

        if (!controller.signal.aborted) {
          setData({
            defensiveA,
            defensiveB,
            offensiveA,
            offensiveB,
          });
        }
      } catch (err) {
        console.error("Type matchup error:", err);

        if (!controller.signal.aborted) {
          setError(err.message || "Unable to calculate type matchups.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMatchups();

    return () => controller.abort();
  }, [pokemonA, pokemonB]);

  const advantageSummary = data
    ? getAdvantageSummary({
        ...data,
        pokemonA,
        pokemonB,
      })
    : null;

  const bestAttackA = data
    ? getBestAttack(data.offensiveA)
    : null;

  const bestAttackB = data
    ? getBestAttack(data.offensiveB)
    : null;

  return (
    <section className="mt-8 rounded-2xl border border-[#263149] bg-[#111A2C] p-5 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Shield size={20} className="text-[#F6C945]" />
        <div>
          <h2 className="text-lg font-bold text-white">
            Type Matchup Analysis
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Defensive strengths and weaknesses of each Pokémon.
          </p>
        </div>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Calculating type matchups...
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/5 p-4 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && data && (
        <div className="space-y-8">
          {/* TYPE ADVANTAGE SUMMARY */}
          <div className="rounded-xl border border-[#263149] bg-[#080C17] p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-bold text-white">
                Type Advantage Overview
              </h3>

              <span
                className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  advantageSummary?.winner
                    ? "bg-[#F6C945]/10 text-[#F6C945]"
                    : "bg-gray-500/10 text-gray-400"
                }`}
              >
                {advantageSummary?.advantage}
              </span>
            </div>

            <p className="mb-5 text-xs leading-relaxed text-gray-500">
              Based on the strongest available attacking type of each Pokémon.
              This indicates type effectiveness, not a guaranteed battle winner.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                    pokemon: pokemonA,
                    best: bestAttackA,
                    index: 0,
                },
                {
                    pokemon: pokemonB,
                    best: bestAttackB,
                    index: 1,
                },
              ].map(({ pokemon, best, index }) => {
                const hasAdvantage =
                  advantageSummary?.winner?.id === pokemon.id;

                return (
                  <div
                    key={pokemon.id}
                    className={`min-w-0 rounded-xl border p-4 transition-colors ${
                      hasAdvantage
                        ? "border-[#F6C945]/40 bg-[#F6C945]/[0.05]"
                        : "border-[#263149] bg-[#111A2C]/60"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold capitalize ${
                          index === 0 ? "text-white" : "text-[#F6C945]"
                        }`}
                      >
                        {pokemon.name}
                      </h4>

                      {hasAdvantage && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#F6C945]">
                          Type edge
                        </span>
                      )}
                    </div>

                    {best && (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-2 text-[10px] text-gray-500">
                            Best attacking type
                          </p>
                          <PokemonTypeBadge
                            type={best.attackingType}
                            size="sm"
                          />
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-extrabold tabular-nums text-white">
                            {formatMultiplier(best.multiplier)}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Effectiveness
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-400">
              {advantageSummary?.description}
            </p>
          </div>

          {/* Defensive Effectiveness */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">
              Defensive Effectiveness
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DefensiveCard
                pokemon={pokemonA}
                effectiveness={data.defensiveA}
                index={0}
              />

              <DefensiveCard
                pokemon={pokemonB}
                effectiveness={data.defensiveB}
                index={1}
              />
            </div>
          </div>

          {/* Head-to-Head */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Swords size={18} className="text-[#F6C945]" />
              <h3 className="text-sm font-bold text-white">
                Head-to-Head Attacking Effectiveness
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AttackCard
                pokemon={pokemonA}
                results={data.offensiveA}
                index={0}
              />

              <AttackCard
                pokemon={pokemonB}
                results={data.offensiveB}
                index={1}
              />
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-gray-500">
              Multipliers represent the effectiveness of attacks
              matching each Pokémon's type against the opposing
              Pokémon. Actual battle damage also depends on stats,
              moves, abilities, and other battle conditions.
            </p>
            {/* EFFECTIVENESS LEGEND */}
            <div className="border-t border-[#263149] pt-6">
              <h3 className="mb-4 text-sm font-bold text-white">
                Effectiveness Guide
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
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
                ].map((item) => (
                  <div
                    key={item.multiplier}
                    className={`flex min-w-0 items-center gap-2 rounded-lg border border-[#263149] p-2.5 ${item.background}`}
                  >
                    <span className={`text-sm font-extrabold ${item.color}`}>
                      {item.multiplier}
                    </span>

                    <span className="text-[10px] font-medium leading-tight text-gray-400">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
