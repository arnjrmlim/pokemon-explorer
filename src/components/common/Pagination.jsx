
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

    for (
      let page = Math.max(2, currentPage - 2);
      page <= Math.min(totalPages - 1, currentPage + 2);
      page++
    ) {
      pages.add(page);
    }

    return [...pages].sort((a, b) => a - b);
  }

  const visiblePages = getVisiblePages();

  // Shared button styling
  const buttonClass =
    "flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-[#111A2C] text-gray-300 transition hover:border-[#F6C945]/50 hover:text-[#F6C945] disabled:cursor-not-allowed disabled:opacity-30";

  // TOP: Compact Jump to Page
  if (variant === "top") {
    return (
      <form
        onSubmit={handleJump}
        className="flex items-center justify-center gap-2"
      >
        <label
          htmlFor="top-page-jump"
          className="whitespace-nowrap text-xs font-medium text-gray-500"
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
          className="h-9 w-16 rounded-lg border border-white/10 bg-[#111A2C] px-2 text-center text-sm font-semibold text-white outline-none transition focus:border-[#F6C945]/60"
        />

        <button
          type="submit"
          className="flex h-9 items-center gap-1 rounded-lg bg-[#F6C945] px-3 text-xs font-bold text-[#080C17] transition hover:bg-yellow-300"
        >
          Go
          <ArrowRight size={14} />
        </button>

        <span className="hidden whitespace-nowrap text-xs text-gray-600 sm:inline">
          / {totalPages}
        </span>
      </form>
    );
  }

  // BOTTOM: Full Pagination
  return (
    <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-7">

      {/* Pokémon range information */}
      <p className="text-xs text-gray-500">
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
      <div className="flex flex-wrap items-center justify-center gap-1.5">

        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className={`${buttonClass} h-9 w-9`}
        >
          <ChevronsLeft size={17} />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`${buttonClass} h-9 w-9`}
        >
          <ChevronLeft size={17} />
        </button>

        {/* Numbered Pages */}
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];

          const showEllipsis =
            previousPage && page - previousPage > 1;

          return (
            <div
              key={page}
              className="flex items-center gap-1.5"
            >
              {showEllipsis && (
                <span className="px-1 text-sm text-gray-600">
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
                className={`h-9 min-w-9 rounded-lg border px-3 text-xs font-semibold transition ${
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
          className={`${buttonClass} h-9 w-9`}
        >
          <ChevronRight size={17} />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          className={`${buttonClass} h-9 w-9`}
        >
          <ChevronsRight size={17} />
        </button>

      </div>
    </div>
  );
}
