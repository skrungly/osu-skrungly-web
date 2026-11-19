<script setup lang="ts">
import { GameMode } from "@/api"
import RadioButtons from "./RadioButtons.vue"

const props = defineProps<{
  modes?: GameMode[]
}>()

const MODE_NAMES = ["osu", "taiko", "catch", "mania", "relax"]

function radioOptions(modes?: GameMode[]) {
  if (modes === undefined) {
    modes = Object.keys(MODE_NAMES).map(s => parseInt(s))
  }

  let options: Record<string, GameMode> = {}

  modes.forEach(m => m in MODE_NAMES ? options[MODE_NAMES[m]] = m : undefined)

  return options
}

const model = defineModel<GameMode>()
</script>

<template>
  <RadioButtons v-model="model" :options="radioOptions(modes)"/>
</template>
