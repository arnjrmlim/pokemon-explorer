
import PokemonCard from "./PokemonCard";

function PokemonGrid({
  pokemon = [],
  onPokemonClick,
  favorites = [],
  onToggleFavorite,
  comparedPokemon = [],
  onToggleCompare,
}) {
  if (!pokemon.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pokemon.map((item) => {
        const isFavorite = favorites.some(
          (favorite) => favorite.id === item.id
        );

        const isCompared = comparedPokemon.some(
          (compared) => compared.id === item.id
        );

        return (
          <PokemonCard
            key={item.id}
            pokemon={item}
            onClick={onPokemonClick}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            isCompared={isCompared}
            onToggleCompare={onToggleCompare}
          />
        );
      })}
    </div>
  );
}

export default PokemonGrid;
