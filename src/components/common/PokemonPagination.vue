<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
} from "@lucide/vue";

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  variant: { type: String, default: "bottom" },
  limit: { type: Number, default: 20 },
  totalCount: { type: Number, default: 0 },
});

const emit = defineEmits(["page-change"]);

const pageInput = ref(String(props.currentPage));
const isMobile = ref(false);

let mediaQuery = null;

function handleResize() {
  if (mediaQuery) {
    isMobile.value = mediaQuery.matches;
  }
}

// Detect mobile viewport and respond to resizing
onMounted(() => {
  mediaQuery = window.matchMedia("(max-width: 639px)");

  handleResize();
  mediaQuery.addEventListener("change", handleResize);
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener("change", handleResize);
});

// Synchronize input when the current page changes
watch(
  () => props.currentPage,
  (currentPage) => {
    pageInput.value = String(currentPage);
  }
);

// Calculate Pokémon range
const startItem = () =>
  (props.currentPage - 1) * props.limit + 1;

const endItem = () =>
  Math.min(props.currentPage * props.limit, props.totalCount);

// Handle direct page navigation
function handleJump() {
  const requestedPage = Number(pageInput.value);

  if (
    !Number.isInteger(requestedPage) ||
    requestedPage < 1 ||
    requestedPage > props.totalPages
  ) {
    pageInput.value = String(props.currentPage);
    return;
  }

  emit("page-change", requestedPage);
}

// Generate visible page numbers
function getVisiblePages() {
  const pages = new Set();

  pages.add(1);
  pages.add(props.totalPages);

  const range = isMobile.value ? 1 : 2;

  for (
    let page = Math.max(2, props.currentPage - range);
    page <= Math.min(props.totalPages - 1, props.currentPage + range);
    page++
  ) {
    pages.add(page);
  }

  return [...pages].sort((a, b) => a - b);
}

const buttonClass =
  "flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#111A2C] text-gray-300 transition hover:border-[#F6C945]/50 hover:text-[#F6C945] disabled:cursor-not-allowed disabled:opacity-30";
</script>

<template>
  <template v-if="totalPages > 1">
    <!-- TOP: Compact Jump to Page -->
    <form
      v-if="variant === 'top'"
      class="flex items-center justify-center gap-1.5 sm:gap-2"
      @submit.prevent="handleJump"
    >
      <label
        for="top-page-jump"
        class="whitespace-nowrap text-[11px] font-medium text-gray-500 sm:text-xs"
      >
        Jump to:
      </label>

      <input
        id="top-page-jump"
        v-model="pageInput"
        name="top-page-jump"
        type="number"
        min="1"
        :max="totalPages"
        :aria-label="`Page number, maximum ${totalPages}`"
        class="h-8 w-12 rounded-lg border border-white/10 bg-[#111A2C] px-1 text-center text-xs font-semibold text-white outline-none transition focus:border-[#F6C945]/60 sm:h-9 sm:w-16 sm:px-2 sm:text-sm"
      >

      <button
        type="submit"
        class="flex h-8 items-center gap-1 rounded-lg bg-[#F6C945] px-2.5 text-[11px] font-bold text-[#080C17] transition hover:bg-yellow-300 sm:h-9 sm:px-3 sm:text-xs"
      >
        Go
        <ArrowRight :size="13" />
      </button>

      <span
        class="hidden whitespace-nowrap text-xs text-gray-600 sm:inline"
      >
        / {{ totalPages }}
      </span>
    </form>

    <!-- BOTTOM: Responsive Pagination -->
    <div
      v-else
      class="mt-10 flex w-full flex-col items-center gap-3 border-t border-white/10 pt-6 sm:gap-4 sm:pt-7"
    >
      <!-- Pokémon range information -->
      <p class="text-center text-[11px] text-gray-500 sm:text-xs">
        Showing
        <span class="font-semibold text-gray-300">
          {{ startItem().toLocaleString() }}–{{ endItem().toLocaleString() }}
        </span>
        of
        <span class="font-semibold text-gray-300">
          {{ totalCount.toLocaleString() }}
        </span>
        Pokémon
      </p>

      <!-- Pagination controls -->
      <div
        class="flex w-full flex-wrap items-center justify-center gap-1 sm:gap-1.5"
      >
        <!-- First Page - Desktop only -->
        <button
          type="button"
          :class="`${buttonClass} hidden h-9 w-9 sm:flex`"
          :disabled="currentPage === 1"
          aria-label="First page"
          @click="emit('page-change', 1)"
        >
          <ChevronsLeft :size="17" />
        </button>

        <!-- Previous Page -->
        <button
          type="button"
          :class="`${buttonClass} h-8 w-8 sm:h-9 sm:w-9`"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="emit('page-change', currentPage - 1)"
        >
          <ChevronLeft
            :size="16"
            class="sm:hidden"
          />
          <ChevronLeft
            :size="17"
            class="hidden sm:block"
          />
        </button>

        <!-- Numbered Pages -->
        <template
          v-for="(page, index) in getVisiblePages()"
          :key="page"
        >
          <div class="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <span
              v-if="
                index > 0 &&
                  page - getVisiblePages()[index - 1] > 1
              "
              class="px-0.5 text-xs text-gray-600 sm:px-1 sm:text-sm"
            >
              ...
            </span>

            <button
              type="button"
              :aria-label="`Page ${page}`"
              :aria-current="currentPage === page ? 'page' : undefined"
              :class="`h-8 min-w-8 rounded-lg border px-2 text-[11px] font-semibold transition sm:h-9 sm:min-w-9 sm:px-3 sm:text-xs ${
                currentPage === page
                  ? 'border-[#F6C945] bg-[#F6C945] text-[#080C17]'
                  : 'border-white/10 bg-[#111A2C] text-gray-400 hover:border-[#F6C945]/50 hover:text-[#F6C945]'
              }`"
              @click="emit('page-change', page)"
            >
              {{ page }}
            </button>
          </div>
        </template>

        <!-- Next Page -->
        <button
          type="button"
          :class="`${buttonClass} h-8 w-8 sm:h-9 sm:w-9`"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="emit('page-change', currentPage + 1)"
        >
          <ChevronRight
            :size="16"
            class="sm:hidden"
          />
          <ChevronRight
            :size="17"
            class="hidden sm:block"
          />
        </button>

        <!-- Last Page - Desktop only -->
        <button
          type="button"
          :class="`${buttonClass} hidden h-9 w-9 sm:flex`"
          :disabled="currentPage === totalPages"
          aria-label="Last page"
          @click="emit('page-change', totalPages)"
        >
          <ChevronsRight :size="17" />
        </button>
      </div>
    </div>
  </template>
</template>