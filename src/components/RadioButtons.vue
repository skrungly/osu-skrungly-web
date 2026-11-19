<script setup lang="ts" generic="T">
import { ref } from 'vue'

const props = defineProps<{
  options: Record<string, T>
  default?: string
}>()

const model = defineModel<T | undefined>()
const chosenOption = ref(props.default)

function select(name: string) {
  chosenOption.value = name
  model.value = props.options[chosenOption.value]
}
</script>

<template>
  <div class="radio-group">
    <div
      v-for="(value, name) in options"
      @click="() => select(name)"
      class="radio-group__button"
    >
      <input :id="name" type="radio"/>
      <label :for="name" :class="{ 'highlight-text': model == value }">
        {{ name }}
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.radio-group {
  display: flex;
  flex-flow: row;
}

.radio-group__button {
  color: var(--text-colour-tertiary);
  border: none;
  padding: 0.5rem;
}

.radio-group__button, .radio-group__button label {
  cursor: pointer;
}

.radio-group__button:hover {
  color: var(--text-colour-secondary);
}

.radio-group__button input {
  position: absolute;
  opacity: 0;
  width: 0;
}
</style>
