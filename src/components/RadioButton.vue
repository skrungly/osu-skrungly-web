<script setup>
import { computed, toRef } from "vue"

const props = defineProps(["state", "option", "content"])
const state = toRef(props, "state")

const buttonStyle = computed(() => ({
  "radio-button--chosen": state.value == props.option
}))
</script>

<template>
  <button :class="buttonStyle">
    {{ content }}
  </button>
</template>

<style scoped>
button {
  color: #ffffff40;
  padding: 0.5rem;
}

button:hover {
  color: #ffffff60;
  transition: 0.25s;
}

button.radio-button--chosen {
  color: #ffffff;
}
</style>
