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
.radio-button--chosen {
  color: #ffffff;
}
</style>
