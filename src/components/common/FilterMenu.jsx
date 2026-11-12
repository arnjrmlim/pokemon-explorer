
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
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vii/lets-go-pikachu-lets-go-eevee/small";

const SORT_OPTIONS = [
  { value: "id-asc", label: "ID: Low to High" },
  { value: "id-desc", label: "ID: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const LIMIT_OPTIONS = [20, 40, 60];

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
                      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize transition ${
                        isSelected
                          ? "border-[#F6C945] bg-[#F6C945]/10 text-[#F6C945]"
                          : "border-white/10 bg-[#080C17] text-gray-300 hover:border-[#F6C945]/40 hover:bg-white/5"
                      }`}
                    >
                      <img
                        src={`${TYPE_SPRITE_BASE}/${TYPE_IDS[type]}.png`}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="h-6 w-6 shrink-0 object-contain"
                      />

                      <span>{type}</span>

                      {isSelected && <Check size={12} />}
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
