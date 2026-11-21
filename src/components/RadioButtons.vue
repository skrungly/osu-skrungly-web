<script setup lang="ts" generic="T">
import { ref, toRef } from 'vue'

const props = defineProps<{
  options: Record<string, T>
  disabled?: string[]
  default?: string
}>()

const disabled = toRef(props, "disabled")

const model = defineModel<T | undefined>()
const chosenOption = ref(props.default)

function select(name: string) {
  if (disabled.value?.includes(name)) {
    return
  }

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
      :class="{ 'radio-group__button--disabled': disabled?.includes(name) }"
    >
      <input type="radio"/>
      <label :class="{ 'highlight-text': model == value }">
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
  user-select: none;
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

.radio-group__button--disabled, .radio-group__button--disabled label {
  cursor: not-allowed;
  opacity: 50%;
}

.radio-group__button--disabled:hover {
  color: var(--text-colour-tertiary);
}
</style>
