<script setup>
import { computed, toRef } from "vue"

const props = defineProps(["state", "option", "content"])
const state = toRef(props, "state")

const buttonStyle = computed(() => ({
  "radio-button--chosen": state.value == props.option,
  "highlight-text": state.value == props.option,
}))
</script>

<template>
  <button class="radio-button" :class="buttonStyle">
    {{ content }}
  </button>
</template>

<style scoped>
.radio-button {
  opacity: 50%;
  border: none;
  padding: 0.5rem;
}

.radio-button:hover {
  opacity: 70%;
}

.radio-button--chosen, .radio-button--chosen:hover {
  opacity: 100%;
}
</style>
