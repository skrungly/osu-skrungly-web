<script setup>
import { ref, toRef, watch } from "vue"

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

import { fetchFromAPI } from "@/api"
import Score from "@/components/Score.vue"

const props = defineProps(["player", "mode", "scope"])
const player = toRef(props, "player")
const mode = toRef(props, "mode")
const scores = ref([])

async function fetchScores() {
  if (player.value === null) return;

  const params = {
    id: player.value,
    scope: props.scope,
    mode: mode.value,
    limit: 100,
  }

  const response = await fetchFromAPI("get_player_scores", params)
  scores.value = response.scores
}

watch([player, mode], fetchScores, { immediate: true })
</script>

<template>
  <h2 v-if="props.scope == 'best'"><FontAwesomeIcon icon="trophy" />top plays</h2>
  <h2 v-if="props.scope == 'recent'"><FontAwesomeIcon icon="clock-rotate-left" />recent plays</h2>
  <div class="score-list">
    <Score
      v-if="scores.length"
      v-for="(score, index) in scores"
      :score="score"
      :rank="props.scope == 'best' ? index + 1 : null"
    />
  </div>
</template>

<style lang="scss">
.score-list {
  display: flex;
  flex-flow: column;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
