
import { ArrowUpRight, Heart } from "lucide-react";

const typeColors = {
  normal: "bg-gray-500/15 text-gray-300",
  fire: "bg-orange-500/15 text-orange-400",
  water: "bg-blue-500/15 text-blue-400",
  electric: "bg-yellow-500/15 text-yellow-400",
  grass: "bg-green-500/15 text-green-400",
  ice: "bg-cyan-500/15 text-cyan-400",
  fighting: "bg-red-500/15 text-red-400",
  poison: "bg-purple-500/15 text-purple-400",
  ground: "bg-amber-500/15 text-amber-400",
  flying: "bg-indigo-500/15 text-indigo-400",
  psychic: "bg-pink-500/15 text-pink-400",
  bug: "bg-lime-500/15 text-lime-400",
  rock: "bg-stone-500/15 text-stone-400",
  ghost: "bg-violet-500/15 text-violet-400",
  dragon: "bg-blue-600/15 text-blue-400",
  dark: "bg-slate-500/15 text-slate-300",
  steel: "bg-slate-400/15 text-slate-300",
  fairy: "bg-pink-500/15 text-pink-300",
};

function PokemonCard({
  pokemon,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}) {
  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    onToggleFavorite?.(pokemon);
  };

  const handleCardKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.(pokemon);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(pokemon)}
      onKeyDown={handleCardKeyDown}
      aria-label={`View ${pokemon.name}`}
      className="
        group relative flex cursor-pointer flex-col overflow-hidden
        rounded-[22px] border border-[#263149] bg-[#111A2C]
        p-6 transition-all duration-300
        hover:-translate-y-1 hover:border-[#F6C945]/60
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#F6C945]
      "
    >
      {/* Pokémon ID and Favorite Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-gray-500">
          #{String(pokemon.id).padStart(3, "0")}
        </span>

        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={
            isFavorite
              ? `Remove ${pokemon.name} from favorites`
              : `Add ${pokemon.name} to favorites`
          }
          aria-pressed={isFavorite}
          className={`
            rounded-full p-2 transition-all duration-200
            hover:scale-110 hover:bg-[#263149]
            ${
              isFavorite
                ? "text-red-500"
                : "text-gray-500 hover:text-red-400"
            }
          `}
        >
          <Heart
            size={20}
            strokeWidth={2}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Pokémon Artwork */}
      <div className="relative flex aspect-square w-full items-center justify-center p-4">
        <div
          className="
            absolute h-[65%] w-[65%] rounded-full bg-white/[0.035]
            transition-all duration-300
            group-hover:scale-110 group-hover:bg-white/[0.07]
          "
        />

        <img
          src={pokemon.image}
          alt={pokemon.name}
          loading="lazy"
          onError={(event) => {
            const image = event.currentTarget;

            if (
              pokemon.fallbackImage &&
              image.src !== pokemon.fallbackImage
            ) {
              image.src = pokemon.fallbackImage;
            } else {
              image.style.visibility = "hidden";
            }
          }}
          className="
            relative z-10 h-full w-full object-contain
            drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)]
            transition-transform duration-300
            group-hover:scale-110
          "
        />
      </div>

      {/* Pokémon Name */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold capitalize text-white">
          {pokemon.name}
        </h3>

        <ArrowUpRight
          size={21}
          className="
            shrink-0 text-gray-500 transition-all duration-300
            group-hover:-translate-y-1 group-hover:translate-x-1
            group-hover:text-[#F6C945]
          "
        />
      </div>

      {/* Pokémon Types */}
      <div className="mt-4 flex flex-wrap gap-2">
        {pokemon.types?.map((type) => (
          <span
            key={type}
            className={`
              rounded-full px-4 py-1.5 text-xs font-bold capitalize
              ${typeColors[type] || "bg-gray-500/15 text-gray-300"}
            `}
          >
            {type}
          </span>
        ))}
      </div>
    </article>
  );
}

export default PokemonCard;
