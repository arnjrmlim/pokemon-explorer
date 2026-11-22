<script setup>

defineOptions({ name: "EvolutionTreeNode" });

defineProps({
  node: { type: Object, required: true },
  pokemonByName: { type: Object, required: true },
  selectedId: { type: Number, default: null },
});

const emit = defineEmits(["select"]);

function formatName(name) {
  return name.replace(/-/g, " ");
}

function formatId(id) {
  return String(id).padStart(3, "0");
}

function handleImageError(event, fallback) {
  const image = event.currentTarget;

  if (fallback && image.src !== fallback) {
    image.src = fallback;
  } else {
    image.style.visibility = "hidden";
  }
}
</script>

<template>
  <div
    v-if="pokemonByName[node.species.name]"
    class="flex shrink-0 items-center gap-2 sm:gap-3"
    style="pointer-events: none"
  >
    <button
      type="button"
      :aria-pressed="selectedId === pokemonByName[node.species.name].id"
      :aria-label="`Select ${formatName(node.species.name)}`"
      class="group relative flex w-[120px] shrink-0 flex-col items-center rounded-2xl border p-3 text-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-[#F6C945] hover:bg-[#172238] hover:shadow-[0_0_30px_rgba(246,201,69,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6C945] active:scale-95 active:duration-150 sm:w-[150px]"
      :class="
        selectedId === pokemonByName[node.species.name].id
          ? 'border-[#F6C945] bg-[#F6C945]/10 shadow-[0_0_20px_rgba(246,201,69,0.12)]'
          : 'border-[#263149] bg-[#111A2C]'
      "
      style="pointer-events: auto"
      @click="emit('select', pokemonByName[node.species.name])"
    >
      <div class="relative flex aspect-square w-full items-center justify-center overflow-hidden">
        <div class="absolute h-[75%] w-[75%] rounded-full bg-white/[0.035] transition-opacity duration-300 group-hover:opacity-75" />

        <img
          v-if="pokemonByName[node.species.name].image"
          :src="pokemonByName[node.species.name].image"
          :alt="formatName(node.species.name)"
          loading="lazy"
          class="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          @error="handleImageError($event, pokemonByName[node.species.name].fallbackImage)"
        >
      </div>

      <span class="mt-2 text-[10px] font-bold tracking-wider text-gray-500 transition-colors group-hover:text-gray-400">
        #{{ formatId(pokemonByName[node.species.name].id) }}
      </span>

      <span class="mt-1 w-full truncate text-xs font-bold capitalize text-white transition-transform group-hover:scale-105 sm:text-sm">
        {{ formatName(node.species.name) }}
      </span>

      <span
        v-if="selectedId === pokemonByName[node.species.name].id"
        class="mt-2 rounded-full bg-[#F6C945] px-2 py-1 text-[9px] font-bold uppercase text-[#080C17]"
      >
        Selected
      </span>
    </button>

    <template v-if="(node.evolves_to ?? []).some(child => pokemonByName[child.species.name])">
      <span
        aria-hidden="true"
        class="shrink-0 select-none text-xl text-[#F6C945]"
        style="pointer-events: none"
      >
        →
      </span>

      <div
        class="flex shrink-0 flex-col gap-2 sm:gap-3"
        style="pointer-events: none"
      >
        <EvolutionTreeNode
          v-for="child in node.evolves_to.filter(child => pokemonByName[child.species.name])"
          :key="child.species.name"
          :node="child"
          :pokemon-by-name="pokemonByName"
          :selected-id="selectedId"
          @select="emit('select', $event)"
        />
      </div>
    </template>
  </div>
</template>