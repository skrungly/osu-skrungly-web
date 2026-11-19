<script setup lang="ts">
import { Beatmap, beatmapDuration } from "@/api"
import { toRef } from "vue"
import Section from "./Section.vue"

const props = defineProps<{
  beatmap: Beatmap
}>()

const beatmap = toRef(props, "beatmap")
</script>

<template>
  <Section class="stats-section">
    <div class="stat">
      <span class="stat__value">{{ beatmap.diff.toFixed(2) }}&starf;</span>
      <span class="stat__name">star rating</span>
    </div>
    <div class="stat">
      <span class="stat__value">{{ beatmap.plays.toLocaleString() }}</span>
      <span class="stat__name">plays</span>
    </div>
    <div class="stat">
      <span v-if="beatmap.passes" class="stat__value">{{ (100 * beatmap.passes / beatmap.plays).toFixed(0) }}%</span>
      <span v-else class="stat__empty">--</span>
      <span class="stat__name">pass rate</span>
    </div>
    <div class="stat">
      <span class="stat__value">{{ beatmapDuration(beatmap.total_length) }}</span>
      <span class="stat__name">duration</span>
    </div>
  </Section>
</template>

<style lang="scss" scoped>
.stats-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  gap: 0.5rem;
}

.stat {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  color: var(--text-colour-secondary);
  min-width: 4rem;
}

.stat .stat__empty {
  color: var(--text-colour-secondary);
}

.stat .stat__value {
  color: var(--text-colour-primary);
}

.stat .stat__name {
  font-size: 0.7rem;
}
</style>
