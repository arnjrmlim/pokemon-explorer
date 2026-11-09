import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  X,
  Heart,
  Ruler,
  Weight,
  Sparkles,
  Rotate3D,
  GitBranch,
  Zap,
} from "lucide-react";
import usePokemonDetails from "../../hooks/usePokemonDetails";
import PokeballIcon from "../common/PokeballIcon";

// ============================================================
// CONSTANTS
// ============================================================

const TYPE_COLORS = {
  normal: "bg-gray-500/15 text-gray-300 border-gray-500/20",
  fire: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  water: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  electric: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  grass: "bg-green-500/15 text-green-400 border-green-500/20",
  ice: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  fighting: "bg-red-500/15 text-red-400 border-red-500/20",
  poison: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  ground: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  flying: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  psychic: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  bug: "bg-lime-500/15 text-lime-400 border-lime-500/20",
  rock: "bg-stone-500/15 text-stone-400 border-stone-500/20",
  ghost: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  dragon: "bg-blue-600/15 text-blue-400 border-blue-600/20",
  dark: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  steel: "bg-slate-400/15 text-slate-300 border-slate-400/20",
  fairy: "bg-pink-500/15 text-pink-300 border-pink-500/20",
};

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

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatStatName(name) {
  return STAT_NAMES[name] || name;
}

function formatPokemonName(name) {
  return name.replace(/-/g, " ");
}

function formatPokemonId(id) {
  return String(id).padStart(3, "0");
}

// ============================================================
// MODAL STATE REDUCER
// Centralises the two pieces of state that change together
// (selectedId and isFlipped) and makes transitions explicit.
// ============================================================

const modalInitialState = {
  selectedId: null,
  isFlipped: false,
};

function modalReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { selectedId: action.id, isFlipped: false };
    case "SELECT_POKEMON":
      return { ...state, selectedId: action.id };
    case "FLIP":
      return { ...state, isFlipped: !state.isFlipped };
    case "SHOW_DETAILS":
      return { ...state, isFlipped: false };
    case "SHOW_EVOLUTION":
      return { ...state, isFlipped: true };
    default:
      return state;
  }
}

// ============================================================
// IMAGE COMPONENT
// Gracefully falls back to the official artwork sprite, then
// hides itself if both sources fail.
// ============================================================

function PokemonImage({ src, alt, fallback, className }) {
  const handleError = useCallback(
    (event) => {
      const img = event.currentTarget;
      if (fallback && img.src !== fallback) {
        img.src = fallback;
      } else {
        img.style.visibility = "hidden";
      }
    },
    [fallback]
  );

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
    />
  );
}

// ============================================================
// TYPE BADGE
// ============================================================

function TypeBadge({ type }) {
  const colorClass =
    TYPE_COLORS[type] || "bg-gray-500/15 text-gray-300 border-gray-500/20";
  return (
    <span
      className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${colorClass}`}
    >
      {type}
    </span>
  );
}

// ============================================================
// ABILITY BADGE
// ============================================================

function AbilityBadge({ ability }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#263149] bg-[#111A2C] px-3 py-2">
      <span className="text-sm font-medium capitalize text-white">
        {formatPokemonName(ability.name)}
      </span>
      {ability.isHidden && (
        <span className="rounded-md bg-[#F6C945]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#F6C945]">
          Hidden
        </span>
      )}
    </div>
  );
}

// ============================================================
// STAT BAR
// ============================================================

function StatBar({ stat }) {
  const percentage = Math.min((stat.value / 255) * 100, 100);
  const colorClass = STAT_COLORS[stat.name] || "bg-[#F6C945]";

  return (
    <div className="grid grid-cols-[85px_1fr_30px] items-center gap-3">
      <span className="text-xs font-semibold text-gray-400">
        {formatStatName(stat.name)}
      </span>
      <div className="h-2 overflow-hidden rounded-full bg-[#263149]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-right text-xs font-bold tabular-nums text-white">
        {stat.value}
      </span>
    </div>
  );
}

// ============================================================
// EVOLUTION CARD
// The interactive node inside the Evolution Line tree.
//
// pointer-events: auto is set explicitly so that wrapper
// containers can safely carry pointer-events: none without
// blocking clicks and hovers on the card itself.
// ============================================================

function EvolutionCard({ pokemon, isSelected, onSelect, label }) {
  const handleClick = useCallback(() => {
    onSelect(pokemon);
  }, [pokemon, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Select ${formatPokemonName(pokemon.name)}`}
      style={{ pointerEvents: "auto" }}
      className={[
        "group relative flex w-[120px] shrink-0 sm:w-[150px]",
        "flex-col items-center rounded-2xl border p-3 text-center",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:-translate-y-0.5",
        "hover:border-[#F6C945] hover:bg-[#172238]",
        "hover:shadow-[0_0_30px_rgba(246,201,69,0.25)]",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#F6C945]",
        "active:scale-95 active:duration-150",
        isSelected
          ? "border-[#F6C945] bg-[#F6C945]/10 shadow-[0_0_20px_rgba(246,201,69,0.12)]"
          : "border-[#263149] bg-[#111A2C]",
      ].join(" ")}
    >
      {/* Artwork area */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden">
        <div className="absolute h-[75%] w-[75%] rounded-full bg-white/[0.035] transition-opacity duration-300 group-hover:opacity-75" />
        {pokemon.image && (
          <PokemonImage
            src={pokemon.image}
            alt={formatPokemonName(pokemon.name)}
            fallback={pokemon.fallbackImage}
            className="relative z-10 h-full w-full object-contain transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
          />
        )}
      </div>

      {/* ID */}
      <span className="mt-2 text-[10px] font-bold tracking-wider text-gray-500 transition-colors duration-300 group-hover:text-gray-400">
        #{formatPokemonId(pokemon.id)}
      </span>

      {/* Name */}
      <span className="mt-1 w-full truncate text-xs font-bold capitalize text-white transition-transform duration-300 group-hover:scale-105 sm:text-sm">
        {formatPokemonName(pokemon.name)}
      </span>

      {/* Optional label (e.g. "Mega Evolution") */}
      {label && (
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#F6C945]">
          {label}
        </span>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <span className="mt-2 rounded-full bg-[#F6C945] px-2 py-1 text-[9px] font-bold uppercase text-[#080C17]">
          Selected
        </span>
      )}
    </button>
  );
}

// ============================================================
// EVOLUTION CONNECTOR ARROW
// A purely decorative element — no pointer events.
// ============================================================

function EvolutionArrow() {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 select-none text-xl text-[#F6C945]"
      style={{ pointerEvents: "none" }}
    >
      →
    </span>
  );
}

// ============================================================
// EVOLUTION TREE NODE
//
// Renders a single node and recursively renders its children.
//
// KEY FIX: Every wrapper/container div carries
// `style={{ pointerEvents: "none" }}`. Only the leaf
// <EvolutionCard> (a <button>) carries `pointer-events: auto`.
//
// This ensures that deeply nested cards — e.g. the third stage
// of a linear chain or any branch in a complex family like
// Eevee — receive mouse events reliably, because the
// containing divs are completely transparent to the pointer.
// ============================================================

function EvolutionTreeNode({ node, pokemonByName, selectedId, onSelect }) {
  const pokemon = pokemonByName[node.species.name];

  // Skip nodes whose species data wasn't fetched successfully.
  if (!pokemon) return null;

  const children = (node.evolves_to ?? []).filter(
    (child) => pokemonByName[child.species.name]
  );

  return (
    // Outer row: [this card] [→] [children column]
    <div
      className="flex shrink-0 items-center gap-2 sm:gap-3"
      style={{ pointerEvents: "none" }}
    >
      <EvolutionCard
        pokemon={pokemon}
        isSelected={selectedId === pokemon.id}
        onSelect={onSelect}
      />

      {children.length > 0 && (
        <>
          <EvolutionArrow />

          {/* Children column — stacks branches vertically */}
          <div
            className="flex shrink-0 flex-col gap-2 sm:gap-3"
            style={{ pointerEvents: "none" }}
          >
            {children.map((child) => (
              <EvolutionTreeNode
                key={child.species.name}
                node={child}
                pokemonByName={pokemonByName}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// EVOLUTION LINE
// Scrollable container that hosts the evolution tree.
// ============================================================

function EvolutionLine({
  evolutionChain,
  pokemonByName,
  selectedId,
  onSelect,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <PokeballIcon size={64} spinning glowing />
      </div>
    );
  }

  if (!evolutionChain || !pokemonByName[evolutionChain.species.name]) {
    return (
      <div className="rounded-2xl border border-dashed border-[#263149] p-8 text-center">
        <p className="text-sm text-gray-400">
          No evolution information available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex min-w-full items-start justify-center px-4 py-4 sm:px-8 sm:py-6">
        <EvolutionTreeNode
          node={evolutionChain}
          pokemonByName={pokemonByName}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

// ============================================================
// MEGA EVOLUTIONS
// ============================================================

function MegaEvolutions({ megaEvolutions, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex min-h-[100px] items-center justify-center">
        <PokeballIcon size={52} spinning glowing />
      </div>
    );
  }

  if (megaEvolutions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/40 p-6 text-center">
        <Zap size={22} className="mx-auto mb-2 text-gray-600" />
        <p className="text-sm font-semibold text-gray-400">
          No Mega Evolutions available
        </p>
        <p className="mt-1 text-xs text-gray-600">
          This evolution family has no listed Mega forms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {megaEvolutions.map((mega) => (
        <EvolutionCard
          key={mega.id}
          pokemon={mega}
          isSelected={selectedId === mega.id}
          onSelect={onSelect}
          label="Mega Evolution"
        />
      ))}
    </div>
  );
}

// ============================================================
// MODAL HEADER
// Shared by both front and back faces.
// ============================================================

function ModalHeader({ isFlipped, onFlip, onClose }) {
  return (
    <div className="relative mb-3 grid shrink-0 grid-cols-[1fr_auto] items-center gap-y-3 px-1 sm:flex sm:justify-between">

      {/* Branding */}
      <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-xs font-bold tracking-[0.2em] text-[#F6C945]">
          POKÉDEX
        </span>

        <span className="text-xs text-gray-500">
          Pokémon Profile
        </span>
      </div>

      {/* Evolution toggle */}
      <button
        type="button"
        onClick={onFlip}
        aria-label={isFlipped ? "View Pokémon details" : "View evolution line"}
        className="col-span-2 row-start-2 mx-auto flex w-fit items-center justify-center gap-2 whitespace-nowrap text-xs font-semibold text-gray-500 transition hover:text-[#F6C945]"
      >
        <Rotate3D size={15} />

        <span className="hidden sm:inline">
          {isFlipped ? "View Pokémon Details" : "Flip to Evolution Line"}
        </span>

        <span className="sm:hidden">
          {isFlipped ? "View Details" : "Evolution"}
        </span>
      </button>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="col-start-2 row-start-1 justify-self-end rounded-full border border-[#263149] bg-[#111A2C] p-2.5 text-gray-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
      >
        <X size={20} />
      </button>
    </div>
  );
}

// ============================================================
// MODAL FRONT — ARTWORK PANEL
// ============================================================

function ModalArtwork({ details, loading, error, isFavorite, onFavorite }) {
  const [isShiny, setIsShiny] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleShinyToggle = () => {
    if (isFlipping || !details?.shinyImage) return;

    setIsFlipping(true);
    setIsShiny((current) => !current);

    window.setTimeout(() => {
      setIsFlipping(false);
    }, 700);
  };

  useEffect(() => {
    setIsShiny(false);
    setIsFlipping(false);
  }, [details?.id]);

  return (
    <div className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden border-b border-[#263149] bg-[#111A2C] p-4 sm:p-6 lg:border-b-0 lg:border-r">
      {/* Background glow */}
      <div className="absolute h-[220px] w-[220px] rounded-full bg-[#F6C945]/[0.07] blur-3xl sm:h-[300px] sm:w-[300px]" />
      {/* Background ring */}
      <div className="absolute h-[min(55vw,220px)] w-[min(55vw,220px)] rounded-full border border-white/[0.04] bg-white/[0.02] sm:h-[320px] sm:w-[320px]" />

      {loading ? (
        <PokeballIcon size={80} spinning glowing />
      ) : details ? (
        <>
          {isShiny && (
            <span className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#F6C945]/40 bg-[#F6C945]/15 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#F6C945] shadow-[0_0_15px_rgba(246,201,69,0.15)]">
              <Sparkles size={13} strokeWidth={2.5} />
              SHINY
            </span>
          )}
          <button
            type="button"
            disabled={!details.shinyImage || isFlipping}
            onClick={handleShinyToggle}
            aria-label={isShiny ? "Show normal Pokémon" : "Show shiny Pokémon"}
            aria-pressed={isShiny}
            className="group relative z-10 h-[min(24vh,220px)] w-full max-w-[360px] shrink-0 cursor-pointer rounded-2xl outline-none transition-transform duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#F6C945] focus-visible:ring-offset-4 focus-visible:ring-offset-[#111A2C] disabled:cursor-default disabled:hover:scale-100 sm:h-[min(34vh,280px)]"
            style={{ perspective: "1000px" }}
          >
            <div
              className="relative h-full w-full"
              style={{
                transformStyle: "preserve-3d",
                transform: isShiny ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: "transform 700ms ease",
              }}
            >
              {/* Normal artwork - front face */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden" }}
              >
                <PokemonImage
                  src={details.image ?? details.fallbackImage}
                  alt={formatPokemonName(details.name)}
                  fallback={details.fallbackImage}
                  className="h-full w-full scale-[1] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)] sm:scale-100"
                />
              </div>

              {/* Shiny artwork - back face */}
              <div
                className="absolute inset-0"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <PokemonImage
                  src={details.shinyImage}
                  alt={`${formatPokemonName(details.name)} shiny`}
                  fallback={details.image ?? details.fallbackImage}
                  className="h-full w-full scale-[1] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.4)] sm:scale-100"
                />
              </div>
            </div>
          </button>

          {/* Shiny interaction hint */}
          {details.shinyImage && (
            <p className="relative z-10 mt-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-gray-500">
              <Sparkles size={12} />
              Click Pokémon to reveal shiny form
            </p>
          )}

          <div className="relative z-10 mt-2 text-center">
            <p className="mb-2 text-xs font-bold tracking-widest text-gray-500">
              #{formatPokemonId(details.id)}
            </p>
            <h2 className="text-3xl font-black capitalize text-white sm:text-4xl">
              {formatPokemonName(details.name)}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:mt-4">
              {details.types.map((type) => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-red-400">
          {error ?? "Unable to load Pokémon."}
        </p>
      )}

      {/* Favourite button */}
      <button
        type="button"
        disabled={!details}
        onClick={onFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite}
        className={[
          "absolute right-6 top-6 z-20 rounded-full border border-[#263149]",
          "bg-[#080C17]/70 p-3 backdrop-blur transition hover:scale-110",
          isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400",
        ].join(" ")}
      >
        <Heart size={21} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

// ============================================================
// MODAL FRONT — INFO PANEL
// ============================================================

function ModalInfo({ details, description, loading }) {
  const totalStats = useMemo(
    () => details?.stats?.reduce((sum, stat) => sum + stat.value, 0) ?? 0,
    [details?.stats]
  );

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <PokeballIcon size={72} spinning glowing />
      </div>
    );
  }

  if (!details) return null;

  return (
    <>
      {/* Pokédex description */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#F6C945]" />
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#F6C945]">
            Pokédex Description
          </h3>
        </div>
        <p className="text-sm leading-7 text-gray-300">
          {description || "No description available."}
        </p>
      </section>

      {/* Height / Weight */}
      <section className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#263149] bg-[#111A2C] p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Ruler size={15} />
            <span className="text-xs font-semibold uppercase">Height</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">
            {details.height.toFixed(1)}
            <span className="ml-1 text-xs font-medium text-gray-500">m</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#263149] bg-[#111A2C] p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Weight size={15} />
            <span className="text-xs font-semibold uppercase">Weight</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">
            {details.weight.toFixed(1)}
            <span className="ml-1 text-xs font-medium text-gray-500">kg</span>
          </p>
        </div>
      </section>

      {/* Abilities */}
      <section className="mt-7">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          Abilities
        </h3>
        <div className="flex flex-wrap gap-2">
          {details.abilities.map((ability) => (
            <AbilityBadge key={ability.name} ability={ability} />
          ))}
        </div>
      </section>

      {/* Base stats */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
            Base Stats
          </h3>
          <span className="text-xs font-semibold text-[#F6C945]">
            Total: {totalStats}
          </span>
        </div>
        <div className="space-y-4">
          {details.stats.map((stat) => (
            <StatBar key={stat.name} stat={stat} />
          ))}
        </div>
      </section>
    </>
  );
}

// ============================================================
// MODAL FRONT (first face of the flip card)
// ============================================================

function ModalFront({ details, description, loading, error, isFavorite, onFavorite, isHidden }) {
  return (
    <section
      aria-label="Pokémon details"
      aria-hidden={isHidden}
      className="relative grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1.2fr)_minmax(0,0.8fr)] overflow-hidden rounded-[28px] border border-[#263149] bg-[#080C17] shadow-2xl lg:grid-cols-2 lg:grid-rows-1"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        pointerEvents: isHidden ? "none" : "auto",
      }}
    >
      <ModalArtwork
        details={details}
        loading={loading}
        error={error}
        isFavorite={isFavorite}
        onFavorite={onFavorite}
      />
      <div className="modal-scrollbar min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
        <ModalInfo
          details={details}
          description={description}
          loading={loading}
        />
      </div>
    </section>
  );
}

// ============================================================
// MODAL BACK (second face of the flip card)
// ============================================================

function ModalBack({
  evolutionChain,
  pokemonByName,
  selectedId,
  onSelect,
  loading,
  evolutionPokemon,
  megaEvolutions,
  isHidden,
}) {
  return (
    <section
      aria-label="Evolution line"
      aria-hidden={isHidden}
      className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-[#263149] bg-[#080C17] shadow-2xl"
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        pointerEvents: isHidden ? "none" : "auto",
      }}
    >
      {/* Back header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#263149] px-5 py-4 sm:px-8">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#F6C945]">
            POKÉDEX DATABASE
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">Evolution Line</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-8 sm:pt-8 lg:px-10">

        {/* Evolution Family section */}
        <div className="mb-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch size={17} className="text-[#F6C945]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                Evolution Family
              </h3>
            </div>
            {!loading && evolutionPokemon.length > 0 && (
              <span className="rounded-full border border-[#263149] bg-[#111A2C] px-3 py-1 text-[10px] font-semibold text-gray-400">
                {evolutionPokemon.length} Pokémon
              </span>
            )}
          </div>

          <EvolutionLine
            evolutionChain={evolutionChain}
            pokemonByName={pokemonByName}
            selectedId={selectedId}
            onSelect={onSelect}
            loading={loading}
          />
        </div>

        {/* Mega Evolutions section */}
        <div className="border-t border-[#263149] pt-6">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={17} className="text-[#F6C945]" />
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
              Mega Evolutions
            </h3>
            {megaEvolutions.length > 0 && (
              <span className="rounded-full bg-[#F6C945]/10 px-2 py-0.5 text-[10px] font-bold text-[#F6C945]">
                {megaEvolutions.length}
              </span>
            )}
          </div>

          <MegaEvolutions
            megaEvolutions={megaEvolutions}
            selectedId={selectedId}
            onSelect={onSelect}
            loading={loading}
          />
        </div>
      </div>

      {/* Back footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-[#263149] px-5 py-4 sm:px-8">
        <p className="text-[10px] uppercase tracking-wider text-gray-600">
          Select a Pokémon to view its details
        </p>
      </div>
    </section>
  );
}

// ============================================================
// FLIP CONTAINER
// Handles the 3D perspective and respects prefers-reduced-motion.
// ============================================================

function FlipContainer({ isFlipped, children }) {
  // Detect reduced-motion preference once on mount.
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  return (
    <div
      className="relative min-h-0 w-full flex-1"
      style={{ perspective: "1800px" }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: prefersReducedMotion.current
            ? "none"
            : "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================
// MAIN MODAL COMPONENT
// ============================================================

function PokemonModal({ pokemon, onClose, favorites = [], onToggleFavorite }) {
  const [{ selectedId, isFlipped }, dispatch] = useReducer(
    modalReducer,
    { ...modalInitialState, selectedId: pokemon?.id }
  );

  const {
    pokemon: details,
    description,
    evolutionChain,
    evolutionPokemon,
    megaEvolutions,
    loading,
    error,
  } = usePokemonDetails(selectedId);

  // Build a name→pokemon lookup used by the evolution tree.
  const pokemonByName = useMemo(
    () => Object.fromEntries(evolutionPokemon.map((p) => [p.name, p])),
    [evolutionPokemon]
  );

  const isFavorite = useMemo(
    () => (details ? favorites.some((item) => item.id === details.id) : false),
    [details, favorites]
  );

  // Reset state whenever a new Pokémon card is opened.
  useEffect(() => {
    dispatch({ type: "INIT", id: pokemon?.id });
  }, [pokemon?.id]);

  // Keyboard shortcuts + scroll-lock.
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          onClose?.();
          break;
        case "ArrowLeft":
          dispatch({ type: "SHOW_DETAILS" });
          break;
        case "ArrowRight":
          dispatch({ type: "SHOW_EVOLUTION" });
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleFlip = useCallback(() => {
    dispatch({ type: "FLIP" });
  }, []);

  // When a Pokémon node in the evolution tree is clicked,
  // update the selected ID (which triggers a new fetch) and
  // stay on the evolution back-face.
  const handleSelectPokemon = useCallback((selectedPokemon) => {
    dispatch({ type: "SELECT_POKEMON", id: selectedPokemon.id });
  }, []);

  const handleFavorite = useCallback(() => {
    if (details) {
      onToggleFavorite?.(details);
    }
  }, [details, onToggleFavorite]);

  // Click on the backdrop to close.
  const handleBackdropMouseDown = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        onClose?.();
      }
    },
    [onClose]
  );

  if (!pokemon) return null;

  return (
    <div
      className="modal-overlay-scrollbar fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/80 p-3 backdrop-blur-md sm:p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pokémon details"
        className="relative flex h-[calc(100dvh-24px)] max-h-[900px] w-full max-w-5xl min-h-0 flex-col sm:h-[calc(100dvh-32px)]"
      >
        <ModalHeader
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onClose={onClose}
        />

        <FlipContainer isFlipped={isFlipped}>
          <ModalFront
            details={details}
            description={description}
            loading={loading}
            error={error}
            isFavorite={isFavorite}
            onFavorite={handleFavorite}
            isHidden={isFlipped}
          />

          <ModalBack
            evolutionChain={evolutionChain}
            pokemonByName={pokemonByName}
            selectedId={details?.id}
            onSelect={handleSelectPokemon}
            loading={loading}
            evolutionPokemon={evolutionPokemon}
            megaEvolutions={megaEvolutions}
            isHidden={!isFlipped}
          />
        </FlipContainer>
      </div>
    </div>
  );
}

export default PokemonModal;
