import { useState } from "react";
import { Search, X, Heart } from "lucide-react";
import PokeballIcon from "../common/PokeballIcon";

export default function Header({
  activePage,
  onNavigate,
  canCompare,
  favoritesCount = 0,
  search,
  onSearchChange,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { id: "explore", label: "Explore" },
    { id: "favorites", label: "Favorites" },
    { id: "compare", label: "Compare" },
  ];

  const handleNavigate = (page) => {
    setIsSearchOpen(false);
    onNavigate(page);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((current) => !current);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C17]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => {
            setIsSearchOpen(false);

            if (activePage !== "explore") {
              onNavigate("explore");
            }

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          className="flex min-w-0 items-center gap-2 sm:gap-3 text-left"
        >
          <PokeballIcon size={42} />

          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-sm font-extrabold tracking-wide text-white sm:text-lg">
              POKÉMON<span className="text-[#F6C945]"> EXPLORER</span>
            </h1>
            <p className="hidden text-[10px] tracking-[0.2em] text-gray-500 sm:block">
              EXPLORE THE POKÉMON WORLD
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-3 sm:gap-5 md:gap-8">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const isDisabled = item.id === "compare" && !canCompare;

            const tooltipMessages = {
              explore: "Explore all Pokémon",
              favorites: "View your favorite Pokémon",
              compare: isDisabled
                ? "Select two Pokémon to compare"
                : "Compare Pokémon",
            };

            return (
              <div key={item.id} className="group/nav-tooltip relative">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleNavigate(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 text-xs font-medium transition sm:gap-2 sm:text-sm ${
                    isActive
                      ? "text-[#F6C945]"
                      : isDisabled
                        ? "cursor-not-allowed text-gray-600"
                        : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.id === "favorites" && (
                    <Heart
                      size={15}
                      fill={isActive ? "currentColor" : "none"}
                    />
                  )}

                  <span>{item.label}</span>

                  {item.id === "favorites" && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        isActive
                          ? "bg-[#F6C945]/15 text-[#F6C945]"
                          : "bg-[#263149] text-gray-300"
                      }`}
                    >
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-[60] mt-3 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-[#263149] bg-[#111A2C] px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover/nav-tooltip:translate-y-0 group-hover/nav-tooltip:opacity-100"
                >
                  {tooltipMessages[item.id]}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Mobile Search Toggle */}
        {activePage !== "compare" && (
          <button
            type="button"
            onClick={handleSearchToggle}
            className="ml-2 rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-[#F6C945] md:hidden"
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
