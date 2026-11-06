
import { useState } from "react";
import { Search, X } from "lucide-react";
import PokeballIcon from "../common/PokeballIcon";

export default function Header({
  activePage,
  onNavigate,
  canCompare,
  search,
  onSearchChange,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { id: "explore", label: "Explore" },
    { id: "compare", label: "Compare" },
  ];

  const handleSearchToggle = () => {
    setIsSearchOpen((current) => !current);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C17]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen(false);
            onNavigate("explore");
          }}
          className="flex items-center gap-3 text-left"
        >
          <PokeballIcon size={42} />
          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-white">
              POKÉMON<span className="text-[#F6C945]"> EXPLORER</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-500">
              EXPLORE THE POKÉMON WORLD
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.id === "compare" && !canCompare}
              onClick={() => onNavigate(item.id)}
              className={`text-sm font-medium transition ${
                activePage === item.id
                  ? "text-[#F6C945]"
                  : item.id === "compare" && !canCompare
                    ? "cursor-not-allowed text-gray-600"
                    : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Search Toggle */}
        {activePage !== "compare" && (
          <button
            type="button"
            onClick={handleSearchToggle}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-[#F6C945] md:hidden"
            aria-label={isSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isSearchOpen}
          >
            {isSearchOpen ? <X size={21} /> : <Search size={21} />}
          </button>
        )}
      </div>

      {/* Mobile Search Field */}
      {isSearchOpen && activePage !== "compare" && (
        <div className="border-t border-white/10 px-5 py-4 md:hidden">
          <div className="flex items-center gap-3 rounded-xl border border-[#263149] bg-[#111A2C] px-4 py-3 focus-within:border-[#F6C945]/60">
            <Search size={18} className="shrink-0 text-gray-500" />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search Pokémon..."
              autoFocus
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="shrink-0 text-gray-500 transition hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
