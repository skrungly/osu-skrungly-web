<script setup lang="ts">
import { toRef } from 'vue';

const props = defineProps<{
  finalPage?: number | null
}>()

const finalPage = toRef(props, "finalPage")

const page = defineModel<number>({ default: 1 })
</script>

<template>
  <div class="page-buttons">
    <button
      @click="() => page = Math.max(1, page - 1)"
      :disabled="page == 1"
    >
      &laquo; prev
    </button>

    <span class="highlight-text">{{ page }}</span>

    <button
      @click="() => page = finalPage ? Math.min(finalPage, page + 1) : page + 1"
      :disabled="page == finalPage"
    >
      next &raquo;
    </button>
  </div>
</template>

<style lang="scss" scoped>
.page-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default;
  user-select: none;
}

.page-buttons button {
  color: var(--text-colour-tertiary);
  cursor: pointer;
}

.page-buttons button:disabled {
  opacity: 50%;
  pointer-events: none;
}

.page-buttons button:hover {
  color: var(--text-colour-secondary);
}
</style>
