<script setup>
import { computed, toRef } from "vue"

const props = defineProps(["state", "option", "content"])
const state = toRef(props, "state")

const buttonStyle = computed(() => ({
  "radio-button--chosen": state.value == props.option
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
  background: none;
  border: none;
  padding: 0.5rem;
}

.radio-button--chosen {
  opacity: 100%;
}
</style>
