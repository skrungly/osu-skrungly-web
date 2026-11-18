<script setup lang="ts">
import { ref, toRef, watch } from "vue"

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

import * as api from "@/api"
import MapSummaryCard from "@/components/MapSummaryCard.vue"

const props = defineProps<{
  player: api.Player,
  mode: api.GameMode,
  sort: api.ScoreSortOption,
}>()

const player = toRef(props, "player")
const mode = toRef(props, "mode")

const errorMessage = ref<string | null>(null)

const LOAD_PER_CHUNK = 10

const scores = ref<api.Score[]>([])
const page = ref(0)
const loadMore = ref(true)
const loading = ref(false)

async function fetchScores(refresh=false) {
  if (refresh) {
    page.value = 0
    loadMore.value = true
    loading.value = true;
  }

  if (!loadMore.value || player.value === null) return

  const params: api.ScoreQuery = {
    player: player.value.id,
    sort: props.sort,
    mode: mode.value,
    limit: LOAD_PER_CHUNK,
    page: page.value,
  }

  if (props.sort == "pp") params.status = api.ScoreStatus.Best

  const response = await api.get("/scores", params)

  if (!response.ok) {
    errorMessage.value = `failed to fetch scores [${response.status}]`
    return
  }

  const scoreData = (await response.json()) as api.Score[]

  if (scoreData.length < LOAD_PER_CHUNK) {
    loadMore.value = false
  } else {
    page.value += 1
  }

  if (refresh) scores.value.length = 0

  errorMessage.value = null
  scores.value.push(...scoreData)
  loading.value = false
}

watch([player, mode], () => fetchScores(true), { immediate: true })
</script>

<template>
  <h2 v-if="props.sort == 'pp'"><FontAwesomeIcon icon="trophy" />top plays</h2>
  <h2 v-if="props.sort == 'recent'"><FontAwesomeIcon icon="clock-rotate-left" />recent plays</h2>
  <div class="score-list" :class="{'loading': loading}">
    <MapSummaryCard
      v-if="scores.length"
      v-for="(score, index) in scores"
      :map="score.beatmap"
      :score="score"
      :rank="props.sort == 'pp' ? index + 1 : null"
      :show-player="false"
    />

    <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>

    <button v-else-if="loadMore" @click="() => fetchScores(false)" class="show-more-button">
      <FontAwesomeIcon icon="caret-down" /> show more <FontAwesomeIcon icon="caret-down" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.score-list {
  display: flex;
  flex-flow: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.show-more-button {
  padding: 0.25rem;
  margin: auto;
}

.error-text {
  text-align: center;
}

</style>
