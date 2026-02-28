<script setup>
import { computed, toRef } from "vue"

const props = defineProps(["state", "option", "content"])
const state = toRef(props, "state")

const buttonStyle = computed(() => ({
  "highlight-text": state.value == props.option,
}))
</script>

<template>
  <button class="radio-button" :class="buttonStyle">
    {{ content }}
  </button>
</template>

<style lang="scss" scoped>
.radio-button {
  color: var(--text-colour-tertiary);
  border: none;
  padding: 0.5rem;
}

.radio-button:hover {
  color: var(--text-colour-secondary);
}
</style>
