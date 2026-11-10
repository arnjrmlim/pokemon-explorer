import { ArrowUpRight, Heart, Plus, Check } from "lucide-react";
import PokemonTypeBadge from "./PokemonTypeBadge";

function PokemonCard({
  pokemon,
  onClick,
  isFavorite = false,
  onToggleFavorite,
  isCompared = false,
  onToggleCompare,
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
      {/* Pokémon ID and Action Buttons */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-gray-500">
          #{String(pokemon.id).padStart(3, "0")}
        </span>

        <div className="flex items-center gap-1">
          <div className="group/tooltip relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleCompare?.(pokemon);
              }}
              aria-label={
                isCompared
                  ? `Remove ${pokemon.name} from comparison`
                  : `Add ${pokemon.name} to comparison`
              }
              aria-pressed={isCompared}
              className={`rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-[#263149] ${
                isCompared
                  ? "text-[#F6C945]"
                  : "text-gray-500 hover:text-[#F6C945]"
              }`}
            >
              {isCompared ? <Check size={19} /> : <Plus size={19} />}
            </button>

            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md border border-[#263149] bg-[#080C17] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/tooltip:opacity-100"
            >
              {isCompared ? "Remove from Compare" : "Add to Compare"}
            </span>
          </div>

          <div className="group/favorite relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite?.(pokemon);
              }}
              aria-label={
                isFavorite
                  ? `Remove ${pokemon.name} from favorites`
                  : `Add ${pokemon.name} to favorites`
              }
              aria-pressed={isFavorite}
              className={`rounded-full p-2 transition-all duration-200 hover:scale-110 hover:bg-[#263149] ${
                isFavorite
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-400"
              }`}
            >
              <Heart
                size={20}
                strokeWidth={2}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>

            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md border border-[#263149] bg-[#080C17] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover/favorite:opacity-100"
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </span>
          </div>
        </div>
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
        {pokemon.types.map((type) => (
          <PokemonTypeBadge
            key={type}
            type={type}
            size="sm"
          />
        ))}
      </div>
    </article>
  );
}

export default PokemonCard;
