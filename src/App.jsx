import { useMemo, useRef, useState } from "react";
import {
  Heart,
  Search,
  ArrowLeft,
  ArrowLeftRight,
  X,
} from "lucide-react";

import MainLayout from "./components/layout/MainLayout";
import SearchBar from "./components/common/SearchBar";
import FilterMenu from "./components/common/FilterMenu";
import PokeballIcon from "./components/common/PokeballIcon";
import PokemonGrid from "./components/pokemon/PokemonGrid";
import Pagination from "./components/common/Pagination";
import PokemonModal from "./components/pokemon/PokemonModal";
import ComparePage from "./components/pokemon/ComparePage";

import usePokemonSearch from "./hooks/usePokemonSearch";
import useFavorites from "./hooks/useFavorites";

function App() {
  // --------------------------------------------------
  // PAGE STATE
  // --------------------------------------------------

  const [activePage, setActivePage] = useState("explore");
  const [comparedPokemon, setComparedPokemon] = useState([]);

  // --------------------------------------------------
  // POKÉMON COLLECTION STATE
  // --------------------------------------------------

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("id-asc");

  const collectionRef = useRef(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // --------------------------------------------------
  // POKÉMON API
  // Search and type filter are handled inside the hook —
  // it queries across the full Pokédex, not just the page.
  // --------------------------------------------------

  const {
    pokemon = [],
    totalCount = 0,
    loading,
    error,
  } = usePokemonSearch({ page, limit, search, type: selectedType });

  // --------------------------------------------------
  // FAVORITES
  // --------------------------------------------------

  const { favorites, toggleFavorite } = useFavorites();

  // --------------------------------------------------
  // POKÉMON COMPARISON
  // --------------------------------------------------

  const handleToggleCompare = (pokemon) => {
    setComparedPokemon((current) => {
      const alreadySelected = current.some(
        (item) => item.id === pokemon.id
      );

      // Remove if already selected
      if (alreadySelected) {
        return current.filter((item) => item.id !== pokemon.id);
      }

      // Maximum of 2 Pokémon
      if (current.length >= 2) {
        return current;
      }

      return [...current, pokemon];
    });
  };

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const totalPages = Math.ceil(totalCount / limit);

  const scrollToCollection = () => {
    requestAnimationFrame(() => {
      collectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    scrollToCollection();
  };

  const handleLimitChange = (newLimit) => {
    if (newLimit === limit) return;
    setLimit(newLimit);
    setPage(1);
    scrollToCollection();
  };

  // Reset to page 1 whenever the search term or type changes
  // so we never land on an out-of-range page.
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setPage(1);
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  const handleExploreClick = () => {
    setActivePage("explore");
    setSearch("");
    setSelectedType("all");
    setSortBy("id-asc");
    setPage(1);
  };

  const handleFavoritesClick = () => {
    setActivePage("favorites");
    setSearch("");
    setSelectedType("all");
    setSortBy("id-asc");
  };

  // --------------------------------------------------
  // SORT + FAVORITES FILTER
  // The hook delivers the right pokemon for the page.
  // We only sort here (API has no sort param) and apply
  // search/type client-side when on the favorites page.
  // --------------------------------------------------

  const isFavoritesPage = activePage === "favorites";
  const isComparePage = activePage === "compare";

  const displayPokemon = useMemo(() => {
    // On the favorites page, work from the local favorites list.
    const source = isFavoritesPage ? favorites : pokemon;
    const searchTerm = search.trim().toLowerCase();

    const filtered = isFavoritesPage
      ? source.filter((item) => {
          const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm);
          const matchesType = selectedType === "all" || item.types?.includes(selectedType);
          return matchesSearch && matchesType;
        })
      : source; // explore: hook already filtered

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "id-desc":  return b.id - a.id;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc":return b.name.localeCompare(a.name);
        case "id-asc":
        default:         return a.id - b.id;
      }
    });
  }, [isFavoritesPage, favorites, pokemon, search, selectedType, sortBy]);

  // --------------------------------------------------
  // EMPTY STATES
  // --------------------------------------------------

  const isEmptyFavorites = isFavoritesPage && favorites.length === 0;

  // Subtitle shown under the section heading
  const sectionSubtitle = useMemo(() => {
    if (isFavoritesPage) {
      return `${displayPokemon.length} of ${favorites.length} favorites`;
    }
    const isFiltered = search.trim() || selectedType !== "all";
    if (isFiltered && !loading) {
      return totalCount === 0
        ? "No Pokémon matched"
        : `${totalCount.toLocaleString()} result${totalCount === 1 ? "" : "s"} found`;
    }
    return `${totalCount.toLocaleString()} Pokémon available`;
  }, [isFavoritesPage, displayPokemon.length, favorites.length, search, selectedType, totalCount, loading]);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={setActivePage}
      canCompare={comparedPokemon.length === 2}
    >
      {isComparePage ? (
        <ComparePage
          comparedPokemon={comparedPokemon}
          onRemove={handleToggleCompare}
          onBack={handleExploreClick}
        />
      ) : (
        <main className="min-h-screen">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F6C945]">
                  Pokémon Explorer
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                  {isFavoritesPage ? "My Favorites" : "Explore Pokémon"}
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  {isFavoritesPage
                    ? "Your personally collected Pokémon."
                    : "Discover and explore Pokémon from the Pokédex."}
                </p>
              </div>

              {/* PAGE NAVIGATION */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExploreClick}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    !isFavoritesPage
                      ? "bg-[#F6C945] text-[#080C17]"
                      : "border border-[#263149] text-gray-400 hover:text-white"
                  }`}
                >
                  <Search size={16} />
                  Explore
                </button>

                <button
                  type="button"
                  onClick={handleFavoritesClick}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isFavoritesPage
                      ? "bg-[#F6C945] text-[#080C17]"
                      : "border border-[#263149] text-gray-400 hover:text-white"
                  }`}
                >
                  <Heart size={16} fill={isFavoritesPage ? "currentColor" : "none"} />
                  Favorites
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isFavoritesPage
                        ? "bg-[#080C17]/10 text-[#080C17]"
                        : "bg-[#263149] text-gray-300"
                    }`}
                  >
                    {favorites.length}
                  </span>
                </button>
              </div>
            </div>

            {/* COLLECTION CONTENT */}
            <section ref={collectionRef} className="scroll-mt-24">

              {/* SEARCH AND FILTERS */}
              {!isEmptyFavorites && (
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <SearchBar value={search} onChange={handleSearchChange} />
                  </div>
                  <FilterMenu
                    selectedType={selectedType}
                    onTypeChange={handleTypeChange}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    limit={limit}
                    onLimitChange={handleLimitChange}
                  />
                </div>
              )}

              {/* COLLECTION TITLE, COUNT AND JUMP */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {isFavoritesPage ? "Saved Pokémon" : "Pokédex"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{sectionSubtitle}</p>
                </div>

                {isFavoritesPage && favorites.length > 0 && (
                  <span className="flex items-center gap-2 text-sm text-red-400">
                    <Heart size={15} fill="currentColor" />
                    {favorites.length} saved
                  </span>
                )}

                {!isFavoritesPage && totalPages > 1 && (
                  <Pagination
                    variant="top"
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>

              {/* EMPTY FAVORITES */}
              {isEmptyFavorites && (
                <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] bg-[#111A2C]/50 px-6 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#263149]">
                    <Heart size={34} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No favorites yet</h3>
                  <p className="mt-2 max-w-sm text-sm text-gray-400">
                    You haven't saved any Pokémon yet. Explore the Pokédex and tap
                    the heart icon on a Pokémon card to add it here.
                  </p>
                  <button
                    type="button"
                    onClick={handleExploreClick}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-[#F6C945] px-5 py-3 text-sm font-bold text-[#080C17] transition hover:bg-yellow-300"
                  >
                    <ArrowLeft size={16} />
                    Explore Pokémon
                  </button>
                </div>
              )}

              {/* LOADING */}
              {!isFavoritesPage && loading && (
                <div className="flex min-h-[250px] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <PokeballIcon size={80} spinning glowing />
                    <p className="text-sm text-gray-400">
                      {search.trim() || selectedType !== "all"
                        ? "Searching Pokédex…"
                        : "Loading Pokémon…"}
                    </p>
                  </div>
                </div>
              )}

              {/* API ERROR */}
              {!isFavoritesPage && error && !loading && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                  <p className="font-semibold text-red-400">Failed to load Pokémon</p>
                  <p className="mt-2 text-sm text-gray-400">
                    {typeof error === "string"
                      ? error
                      : "Please check your connection and try again."}
                  </p>
                </div>
              )}

              {/* NO RESULTS */}
              {!loading &&
                !error &&
                !isEmptyFavorites &&
                displayPokemon.length === 0 && (
                  <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#263149] text-center">
                    <Search size={32} className="mb-4 text-gray-500" />
                    <h3 className="text-lg font-bold text-white">No Pokémon found</h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Try changing your search or filter settings.
                    </p>
                  </div>
                )}

              {/* POKÉMON GRID */}
              {!loading && !error && displayPokemon.length > 0 && (
                <PokemonGrid
                  pokemon={displayPokemon}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onPokemonClick={setSelectedPokemon}
                  comparedPokemon={comparedPokemon}
                  onToggleCompare={handleToggleCompare}
                />
              )}

              {/* BOTTOM PAGINATION — explore only */}
              {!isFavoritesPage && !loading && !error && totalPages > 1 && (
                <Pagination
                  variant="bottom"
                  currentPage={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  limit={limit}
                  onPageChange={handlePageChange}
                />
              )}
            </section>
          </div>
        </main>
      )}
      
      {/* FLOATING COMPARISON BAR */}
      {!isComparePage && comparedPokemon.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#F6C945]/30 bg-[#111A2C]/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-4">

            {/* SELECTED POKÉMON */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {comparedPokemon.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="flex min-w-0 items-center gap-1 rounded-xl bg-[#263149]/70 px-2 py-2 sm:gap-2 sm:px-3"
                >
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="h-8 w-8 shrink-0 object-contain"
                  />

                  <span className="max-w-[65px] truncate text-xs font-semibold capitalize text-white sm:max-w-[90px]">
                    {pokemon.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleCompare(pokemon)}
                    aria-label={`Remove ${pokemon.name}`}
                    className="shrink-0 text-gray-500 transition hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {comparedPokemon.length === 1 && (
                <span className="hidden text-xs text-gray-500 sm:block">
                  Select one more
                </span>
              )}
            </div>

            {/* COMPARE BUTTON */}
            <button
              type="button"
              disabled={comparedPokemon.length !== 2}
              onClick={() => {
                if (comparedPokemon.length === 2) {
                  setActivePage("compare");
                }
              }}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition sm:px-5 sm:text-sm ${
                comparedPokemon.length === 2
                  ? "bg-[#F6C945] text-[#080C17] hover:bg-yellow-300"
                  : "cursor-not-allowed bg-[#263149] text-gray-500 opacity-60"
              }`}
            >
              <ArrowLeftRight size={16} />
              Compare
              <span className="rounded-full bg-black/10 px-2 py-0.5">
                {comparedPokemon.length}/2
              </span>
            </button>
          </div>
        </div>
      )}

      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </MainLayout>
  );
}

export default App;
