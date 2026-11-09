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

export default function PokemonTypeBadge({ type, size = "md" }) {
  const normalizedType = type.toLowerCase();
  const colorClass = TYPE_COLORS[normalizedType] || TYPE_COLORS.normal;

  const sizes = {
    sm: {
      badge: "gap-1.5 px-2.5 py-1 text-[10px]",
      icon: "h-3.5 w-3.5",
    },
    md: {
      badge: "gap-2 px-3 py-1.5 text-xs",
      icon: "h-5 w-5",
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${colorClass} ${currentSize.badge}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}type-icons/${normalizedType}.svg`}
        alt=""
        aria-hidden="true"
        className={`${currentSize.icon} shrink-0 object-contain`}
      />

      {normalizedType}
    </span>
  );
}