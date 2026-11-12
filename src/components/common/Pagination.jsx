
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
} from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "bottom",
  limit = 20,
  totalCount = 0,
}) {
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport and respond to resizing
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleResize();
    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  // Synchronize input when the current page changes
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1) return null;

  // Calculate Pokémon range
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  // Handle direct page navigation
  function handleJump(event) {
    event.preventDefault();

    const requestedPage = Number(pageInput);

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      requestedPage > totalPages
    ) {
      setPageInput(String(currentPage));
      return;
    }

    onPageChange(requestedPage);
  }

  // Generate visible page numbers
  function getVisiblePages() {
    const pages = new Set();

    pages.add(1);
    pages.add(totalPages);

    const range = isMobile ? 1 : 2;

    for (
      let page = Math.max(2, currentPage - range);
      page <= Math.min(totalPages - 1, currentPage + range);
      page++
    ) {
      pages.add(page);
    }

    return [...pages].sort((a, b) => a - b);
  }

  const visiblePages = getVisiblePages();

  // Shared button styling
  const buttonClass =
    "flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#111A2C] text-gray-300 transition hover:border-[#F6C945]/50 hover:text-[#F6C945] disabled:cursor-not-allowed disabled:opacity-30";

  // TOP: Compact Jump to Page
  if (variant === "top") {
    return (
      <form
        onSubmit={handleJump}
        className="flex items-center justify-center gap-1.5 sm:gap-2"
      >
        <label
          htmlFor="top-page-jump"
          className="whitespace-nowrap text-[11px] font-medium text-gray-500 sm:text-xs"
        >
          Jump to:
        </label>

        <input
          id="top-page-jump"
          name="top-page-jump"
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={(event) => setPageInput(event.target.value)}
          aria-label={`Page number, maximum ${totalPages}`}
          className="h-8 w-12 rounded-lg border border-white/10 bg-[#111A2C] px-1 text-center text-xs font-semibold text-white outline-none transition focus:border-[#F6C945]/60 sm:h-9 sm:w-16 sm:px-2 sm:text-sm"
        />

        <button
          type="submit"
          className="flex h-8 items-center gap-1 rounded-lg bg-[#F6C945] px-2.5 text-[11px] font-bold text-[#080C17] transition hover:bg-yellow-300 sm:h-9 sm:px-3 sm:text-xs"
        >
          Go
          <ArrowRight size={13} />
        </button>

        <span className="hidden whitespace-nowrap text-xs text-gray-600 sm:inline">
          / {totalPages}
        </span>
      </form>
    );
  }

  // BOTTOM: Responsive Pagination
  return (
    <div className="mt-10 flex w-full flex-col items-center gap-3 border-t border-white/10 pt-6 sm:gap-4 sm:pt-7">

      {/* Pokémon range information */}
      <p className="text-center text-[11px] text-gray-500 sm:text-xs">
        Showing{" "}
        <span className="font-semibold text-gray-300">
          {startItem.toLocaleString()}–
          {endItem.toLocaleString()}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-300">
          {totalCount.toLocaleString()}
        </span>{" "}
        Pokémon
      </p>

      {/* Pagination controls */}
      <div className="flex w-full flex-wrap items-center justify-center gap-1 sm:gap-1.5">

        {/* First Page - Desktop only */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className={`${buttonClass} hidden h-9 w-9 sm:flex`}
        >
          <ChevronsLeft size={17} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`${buttonClass} h-8 w-8 sm:h-9 sm:w-9`}
        >
          <ChevronLeft size={16} className="sm:hidden" />
          <ChevronLeft size={17} className="hidden sm:block" />
        </button>

        {/* Numbered Pages */}
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];

          const showEllipsis =
            previousPage && page - previousPage > 1;

          return (
            <div
              key={page}
              className="flex shrink-0 items-center gap-1 sm:gap-1.5"
            >
              {showEllipsis && (
                <span className="px-0.5 text-xs text-gray-600 sm:px-1 sm:text-sm">
                  ...
                </span>
              )}

              <button
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={
                  currentPage === page ? "page" : undefined
                }
                className={`h-8 min-w-8 rounded-lg border px-2 text-[11px] font-semibold transition sm:h-9 sm:min-w-9 sm:px-3 sm:text-xs ${
                  currentPage === page
                    ? "border-[#F6C945] bg-[#F6C945] text-[#080C17]"
                    : "border-white/10 bg-[#111A2C] text-gray-400 hover:border-[#F6C945]/50 hover:text-[#F6C945]"
                }`}
              >
                {page}
              </button>
            </div>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`${buttonClass} h-8 w-8 sm:h-9 sm:w-9`}
        >
          <ChevronRight size={16} className="sm:hidden" />
          <ChevronRight size={17} className="hidden sm:block" />
        </button>

        {/* Last Page - Desktop only */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          className={`${buttonClass} hidden h-9 w-9 sm:flex`}
        >
          <ChevronsRight size={17} />
        </button>

      </div>
    </div>
  );
}
