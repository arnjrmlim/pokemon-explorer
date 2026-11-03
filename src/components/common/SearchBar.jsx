import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <Search
        size={19}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
      />

      <input
        id="pokemon-search"
        name="pokemon-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search Pokémon..."
        aria-label="Search Pokémon"
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-white/10 bg-[#111A2C] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#F6C945]/60"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          aria-label="Clear search"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}