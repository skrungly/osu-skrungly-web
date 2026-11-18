<script setup lang="ts">
const props = defineProps<{
  ranking: number
}>()
</script>

<template>
  <div class="ranking-overlay">#{{ ranking }}</div>
</template>

<style lang="scss" scoped>
.ranking-overlay {
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #00000080;

  font-size: 1.25rem;
  font-weight: bold;
  text-shadow: var(--shadow-text);

  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}

.ranking-overlay:hover {
  opacity: 1;
}
</style>
