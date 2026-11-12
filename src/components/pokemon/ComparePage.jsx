import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Scale,
  Ruler,
  Weight,
  Zap,
} from "lucide-react";
import { getPokemonDetails } from "../../services/pokemonApi";
import TypeMatchupComparison from "./TypeMatchupComparison";
import PokemonTypeBadge from "./PokemonTypeBadge";
import { getComparisonImage } from "../../utils/formatPokemon";

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

function StatBar({ stat }) {
  const statName = stat.stat.name;
  const value = stat.base_stat;
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <div className="grid grid-cols-[85px_1fr_30px] items-center gap-3">
      <span className="text-xs font-semibold text-gray-400">
        {statLabels[statName] || statName}
      </span>

      <div className="h-2 overflow-hidden rounded-full bg-[#263149]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            STAT_COLORS[statName] || "bg-[#F6C945]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-right text-xs font-bold tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

function ComparePage({ comparedPokemon = [], onBack }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!comparedPokemon.length) {
      setDetails([]);
      return;
    }

    const controller = new AbortController();

    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          comparedPokemon.map((pokemon) =>
            getPokemonDetails(pokemon.id, controller.signal)
          )
        );

        if (!controller.signal.aborted) {
          setDetails(results);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError("Unable to load Pokémon comparison data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [comparedPokemon]);

  const formatHeight = (height) =>
    height !== undefined ? `${(height / 10).toFixed(1)} m` : "—";

  const formatWeight = (weight) =>
    weight !== undefined ? `${(weight / 10).toFixed(1)} kg` : "—";

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 xl:px-10">

        {/* Page Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#F6C945]"
          >
            <ArrowLeft size={16} />
            Back to Pokédex
          </button>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F6C945]">
            Pokémon Analysis
          </p>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Compare Pokémon
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Compare abilities, physical attributes, and base stats.
          </p>
        </div>

        {/* Empty State */}
        {comparedPokemon.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/50 px-6 text-center">
            <Scale size={48} className="mb-5 text-gray-500" />

            <h2 className="text-xl font-bold text-white">
              No Pokémon selected
            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-400">
              Select up to two Pokémon from the Pokédex to start comparing
              their stats and attributes.
            </p>

            <button
              type="button"
              onClick={onBack}
              className="mt-6 rounded-xl bg-[#F6C945] px-5 py-3 text-sm font-bold text-[#080C17] transition hover:bg-yellow-300"
            >
              Select Pokémon
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-gray-400">
              Loading comparison data...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Comparison Content */}
        {!loading && !error && comparedPokemon.length > 0 && (
          <>
            {/* Pokémon Cards */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {comparedPokemon.map((pokemon, index) => {
                const pokemonData = details[index];
                const comparisonImage = pokemonData
                  ? getComparisonImage(pokemonData)
                  : pokemon.image;

                return (
                <div
                  key={pokemon.id}
                  className="relative overflow-hidden rounded-2xl border border-[#263149] bg-[#111A2C] p-3 sm:p-4"
                >
                  <div className="mb-3 text-xs font-bold tracking-wider text-gray-500">
                    #{String(pokemon.id).padStart(3, "0")}
                  </div>

                  <div className="relative mx-auto flex aspect-square max-w-[190px] items-center justify-center">
                    <div className="absolute h-[75%] w-[75%] rounded-full bg-white/[0.04]" />

                    <img
                      src={comparisonImage}
                      alt={pokemon.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          pokemonData?.sprites?.other?.["official-artwork"]?.front_default ||
                          pokemonData?.sprites?.front_default ||
                          pokemon.image;
                      }}
                      className="relative z-10 h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                    />
                  </div>

                  <h2 className="mt-1 text-center text-lg font-extrabold capitalize text-white sm:text-2xl">
                    {pokemon.name}
                  </h2>

                  <div className="-mt-3 flex flex-wrap justify-center gap-2">
                    {pokemon.types.map((type) => (
                      <PokemonTypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                </div>
                );
              })}

              {/* Empty Second Slot */}
              {comparedPokemon.length === 1 && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/40 p-4 text-center transition hover:border-[#F6C945]/50 hover:bg-[#111A2C]"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#263149]">
                    <Scale size={28} className="text-[#F6C945]" />
                  </div>

                  <span className="font-bold text-white">
                    Add another Pokémon
                  </span>

                  <span className="mt-2 text-xs text-gray-500">
                    Return to the Pokédex to select one
                  </span>
                </button>
              )}
            </div>
            
            {/* TYPE MATCHUP COMPARISON */}
            {details.length === 2 && comparedPokemon.length === 2 && (
              <TypeMatchupComparison
                pokemonA={details[0]}
                pokemonB={details[1]}
              />
            )}

            {/* Base Stats Comparison */}
            {details.length === 2 && comparedPokemon.length === 2 && (
              <section className="mt-5 rounded-2xl border border-[#263149] bg-[#111A2C] p-4 sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Zap size={20} className="text-[#F6C945]" />
                  <h2 className="text-lg font-bold text-white">
                    Base Stats Comparison
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
                  {details.map((pokemon, index) => (
                    <div key={pokemon.id} className="min-w-0">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3
                          className={`text-sm font-bold capitalize ${
                            index === 0 ? "text-white" : "text-[#F6C945]"
                          }`}
                        >
                          {pokemon.name}
                        </h3>
                        <span className="shrink-0 text-xs font-semibold text-[#F6C945]">
                          Total:{" "}
                          {pokemon.stats.reduce(
                            (total, stat) => total + stat.base_stat,
                            0
                          )}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {pokemon.stats.map((stat) => (
                          <StatBar key={stat.stat.name} stat={stat} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Physical Attributes */}
            {details.length === 2 && comparedPokemon.length === 2 && (
              <section className="mt-4 rounded-2xl border border-[#263149] bg-[#111A2C] p-4 sm:p-6">
                <h2 className="mb-6 text-lg font-bold text-white">
                  Physical Attributes
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {details.map((pokemon, index) => (
                    <div
                      key={pokemon.id}
                      className="rounded-xl bg-[#080C17] p-4"
                    >
                      <h3
                        className={`mb-4 text-center text-sm font-bold capitalize ${
                          index === 0 ? "text-white" : "text-[#F6C945]"
                        }`}
                      >
                        {pokemon.name}
                      </h3>

                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <Ruler size={16} />
                          <span className="text-xs">Height</span>
                        </div>

                        <p className="text-xl font-bold text-white">
                          {formatHeight(pokemon.height)}
                        </p>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <Weight size={16} />
                          <span className="text-xs">Weight</span>
                        </div>

                        <p className="text-xl font-bold text-white">
                          {formatWeight(pokemon.weight)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Abilities */}
            {details.length === 2 && comparedPokemon.length === 2 && (
              <section className="mt-6 rounded-2xl border border-[#263149] bg-[#111A2C] p-5 sm:p-8">
                <h2 className="mb-5 text-lg font-bold text-white">
                  Abilities
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {details.map((pokemon) => (
                    <div key={pokemon.id}>
                      <h3 className="mb-3 text-sm font-bold capitalize text-gray-300">
                        {pokemon.name}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {pokemon.abilities.map((item) => (
                          <span
                            key={item.ability.name}
                            className="rounded-lg border border-[#263149] bg-[#080C17] px-3 py-2 text-xs capitalize text-gray-400"
                          >
                            {item.ability.name.replaceAll("-", " ")}
                            {item.is_hidden && (
                              <span className="ml-1 text-[#F6C945]">
                                (Hidden)
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Legend */}
            {details.length === 2 && (
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  {comparedPokemon[0].name}
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F6C945]" />
                  {comparedPokemon[1].name}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default ComparePage;
