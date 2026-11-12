const TYPE_IDS = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

const TYPE_SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vii/lets-go-pikachu-lets-go-eevee";

export default function PokemonTypeBadge({ type, size = "md" }) {
  const normalizedType = type.toLowerCase();
  const typeId = TYPE_IDS[normalizedType];

  const sizes = {
    sm: {
      container: "gap-1.5",
      icon: "h-[65px] w-[65px]",
    },
    md: {
      container: "gap-2",
      icon: "h-[80px] w-[80px]",
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider text-gray-200 ${currentSize.container}`}
    >
      {typeId && (
        <img
          src={`${TYPE_SPRITE_BASE}/${typeId}.png`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`${currentSize.icon} shrink-0 object-contain`}
        />
      )}

    </span>
  );
}
