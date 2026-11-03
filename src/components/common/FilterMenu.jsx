
import { useEffect, useRef, useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Check,
} from "lucide-react";

const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const SORT_OPTIONS = [
  { value: "id-asc", label: "ID: Low to High" },
  { value: "id-desc", label: "ID: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const LIMIT_OPTIONS = [20, 40, 60];

const TYPE_COLORS = {
  normal: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  fire: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  water: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  electric: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  grass: "bg-green-500/20 text-green-400 border-green-500/30",
  ice: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  fighting: "bg-red-500/20 text-red-400 border-red-500/30",
  poison: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ground: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  flying: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  psychic: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  bug: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  rock: "bg-stone-600/20 text-stone-400 border-stone-600/30",
  ghost: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  dragon: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
  dark: "bg-gray-600/30 text-gray-300 border-gray-500/30",
  steel: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  fairy: "bg-pink-400/20 text-pink-300 border-pink-400/30",
};

export default function FilterMenu({
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
  limit,
  onLimitChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Count active settings
  const activeCount = [
    selectedType !== "all",
    sortBy !== "id-asc",
    limit !== 20,
  ].filter(Boolean).length;

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Reset all settings
  function handleReset() {
    onTypeChange("all");
    onSortChange("id-asc");
    onLimitChange(20);
  }

  return (
    <div ref={menuRef} className="relative shrink-0">

      {/* Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
          isOpen
            ? "border-[#F6C945] bg-[#F6C945] text-[#080C17]"
            : "border-white/10 bg-[#111A2C] text-gray-300 hover:border-[#F6C945]/50 hover:text-[#F6C945]"
        }`}
      >
        <SlidersHorizontal size={17} />
        Filters

        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F6C945] px-1 text-[10px] font-bold text-[#080C17]">
            {activeCount}
          </span>
        )}

        <ChevronDown
          size={15}
          className={`transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Filter Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#111A2C] shadow-2xl shadow-black/40">

          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Filter & Display
              </h3>

              <p className="mt-1 text-[11px] text-gray-500">
                Customize your Pokémon collection
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close filters"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>

          <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 dark-scrollbar">

            {/* Pokémon Types */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Pokémon Type
                </h4>

                <span className="text-[10px] text-gray-500">
                  {selectedType === "all"
                    ? "All selected"
                    : selectedType}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() => onTypeChange("all")}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    selectedType === "all"
                      ? "border-[#F6C945] bg-[#F6C945] text-[#080C17]"
                      : "border-white/10 bg-[#080C17] text-gray-400 hover:border-[#F6C945]/50"
                  }`}
                >
                  All Types
                </button>

                {POKEMON_TYPES.map((type) => {
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onTypeChange(type)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${
                        isSelected
                          ? "border-[#F6C945] bg-[#F6C945]/15 text-[#F6C945]"
                          : `${TYPE_COLORS[type]} hover:brightness-125`
                      }`}
                    >
                      {type}

                      {isSelected && (
                        <Check size={12} />
                      )}
                    </button>
                  );
                })}

              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Sort By */}
            <section>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
                Sort By
              </h4>

              <div className="space-y-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSortChange(option.value)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition ${
                      sortBy === option.value
                        ? "border-[#F6C945]/50 bg-[#F6C945]/10 text-[#F6C945]"
                        : "border-white/5 bg-[#080C17] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {option.label}

                    {sortBy === option.value && (
                      <Check size={15} />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <div className="border-t border-white/10" />

            {/* Items Per Page */}
            <section>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
                Items Per Page
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {LIMIT_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onLimitChange(value)}
                    aria-pressed={limit === value}
                    className={`rounded-lg border py-2.5 text-xs font-bold transition ${
                      limit === value
                        ? "border-[#F6C945] bg-[#F6C945] text-[#080C17]"
                        : "border-white/10 bg-[#080C17] text-gray-400 hover:border-[#F6C945]/50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </section>

          </div>

          {/* Panel Footer */}
          <div className="flex justify-end border-t border-[#263149] px-6 py-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <RotateCcw size={15} />
              Reset filters
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
