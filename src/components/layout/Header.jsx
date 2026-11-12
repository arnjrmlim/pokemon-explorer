
import { Heart } from "lucide-react";
import PokeballIcon from "../common/PokeballIcon";

export default function Header({
  activePage,
  onNavigate,
  favoritesCount = 0,
}) {
  const navItems = [
    { id: "explore", label: "Explore" },
    { id: "favorites", label: "Favorites" },
  ];

  const handleNavigate = (page) => {
    if (page === activePage) {
      window.location.reload();
      return;
    }

    onNavigate(page);
  };

  const handleLogoClick = () => {
    if (activePage === "explore") {
      window.location.reload();
      return;
    }

    onNavigate("explore");
  };

  const tooltipMessages = {
    explore: "Explore all Pokémon",
    favorites: "View your favorite Pokémon",
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C17]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex min-w-0 items-center gap-2 text-left sm:gap-3"
          aria-label="Go to Explore Pokémon"
        >
          <PokeballIcon size={42} />

          <div className="min-w-0">
            <h1 className="whitespace-nowrap text-xs font-extrabold tracking-wide text-white sm:text-lg">
              POKÉMON<span className="text-[#F6C945]"> EXPLORER</span>
            </h1>

            <p className="hidden text-[10px] tracking-[0.2em] text-gray-500 sm:block">
              EXPLORE THE POKÉMON WORLD
            </p>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3 md:gap-5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;

            return (
              <div
                key={item.id}
                className="group/nav-tooltip relative"
              >
                <button
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                    isActive
                      ? "bg-[#F6C945]/10 text-[#F6C945]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.id === "favorites" && (
                    <Heart
                      size={14}
                      className="shrink-0 sm:h-[15px] sm:w-[15px]"
                      fill={isActive ? "currentColor" : "none"}
                    />
                  )}

                  <span>{item.label}</span>

                  {item.id === "favorites" && (
                    <span
                      className={`shrink-0 rounded-full px-1 py-0.5 text-[9px] font-bold tabular-nums sm:px-1.5 sm:text-[10px] ${
                        isActive
                          ? "bg-[#F6C945]/15 text-[#F6C945]"
                          : "bg-[#263149] text-gray-300"
                      }`}
                    >
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Tooltip */}
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
      </div>
    </header>
  );
}
