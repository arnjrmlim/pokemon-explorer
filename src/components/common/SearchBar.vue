<script setup>
import { Search, X } from "@lucide/vue";

defineProps({
  value: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["change"]);
</script>

<template>
  <div class="relative w-full">
    <Search
      :size="19"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
    />

    <input
      id="pokemon-search"
      name="pokemon-search"
      type="text"
      :value="value"
      placeholder="Search Pokémon..."
      aria-label="Search Pokémon"
      autocomplete="off"
      class="h-12 w-full rounded-xl border border-white/10 bg-[#111A2C] pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#F6C945]/60"
      @input="emit('change', $event.target.value)"
    >

    <button
      v-if="value"
      type="button"
      class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
      aria-label="Clear search"
      @click="emit('change', '')"
    >
      <X :size="17" />
    </button>
  </div>
</template>