<script setup>
import AppHeader from "./AppHeader.vue";

defineProps({
  activePage: {
    type: String,
    required: true,
  },
  onNavigate: {
    type: Function,
    required: true,
  },
  canCompare: {
    type: Boolean,
    default: false,
  },
  favoritesCount: {
    type: Number,
    default: 0,
  },
  search: {
    type: String,
    default: "",
  },
  onSearchChange: {
    type: Function,
    default: null,
  },
});
</script>

<template>
  <div class="min-h-screen bg-[#080C17]">
    <AppHeader
      :active-page="activePage"
      :on-navigate="onNavigate"
      :favorites-count="favoritesCount"
    />

    <slot />
  </div>
</template>