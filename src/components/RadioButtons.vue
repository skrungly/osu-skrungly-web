<script setup>
import { reactive, ref, watch } from 'vue';

defineProps(["options"])
const emit = defineEmits(["choose"])

const choice = ref(0)

const buttonStyle = (i) => (reactive({
  "radio-button--chosen": choice.value == i
}))

watch(choice, () => (emit("choose", choice.value)))
</script>

<template>
  <button v-for="(option, index) in options" @click="choice = index" :class="buttonStyle(index)">
    {{ option }}
  </button>
</template>

<style scoped>
button {
  color: #ffffff40;
  padding: 0.5rem 1rem;
}

button:hover {
  color: #ffffff60;
  transition: 0.25s;
}

button.radio-button--chosen {
  color: #ffffff;
}
</style>
