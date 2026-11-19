<script setup lang="ts">
import * as api from "@/api"
import { ref, toRef, watch } from "vue"
import MapSummaryCard from "./MapSummaryCard.vue"
import ScoreSummaryCard from "./ScoreSummaryCard.vue"

const props = defineProps<{
  player?: api.Player
  map?: api.Beatmap
  mode: api.GameMode
  sort: api.ScoreSortOption
  status?: api.ScoreStatusQuery | api.ScoreStatus
  pageLimit: number
}>()

const player = toRef(props, "player")
const map = toRef(props, "map")
const mode = toRef(props, "mode")
const sort = toRef(props, "sort")

const scores = ref<api.Score[]>([])

const errorMessage = ref<string | null>(null)
const page = ref(0)
const finalPageReached = ref(false)
const loading = ref(false)

async function resetScores() {
  page.value = 0
  loading.value = false
  finalPageReached.value = false

  await fetchScores(true)
}

async function fetchScores(reset: boolean = false) {
  loading.value = true

  const params: api.ScoreQuery = {
    player: player.value?.id,
    beatmap: map.value?.id,
    mode: mode.value,
    sort: sort.value,
    page: page.value,
    limit: props.pageLimit,
    status: props.status ?? (
      sort.value == "pp"
      ? api.ScoreStatusQuery.Best
      : api.ScoreStatusQuery.Passed
    ),
  }

  const response = await api.get("/scores", params)

  if (!response.ok) {
    errorMessage.value = `failed to fetch scores [${response.status}]`
    return
  }

  const scoreResponse: api.Score[] = await response.json()

  if (scoreResponse.length < props.pageLimit) {
    finalPageReached.value = true
  } else {
    page.value += 1
  }

  errorMessage.value = null

  if (reset) scores.value = []
  scores.value.push(...scoreResponse)

  loading.value = false
}

watch([player, map, mode], () => resetScores(), { immediate: true })
</script>

<template>
  <div v-if="scores.length" class="score-list" :class="{ 'loading': loading }">
    <MapSummaryCard
      v-if="!map"
      v-for="(score, index) in scores"
      :map="score.beatmap"
      :score="score"
      :rank="props.sort == 'pp' ? index + 1 : null"
      :show-player="false"
    />

    <ScoreSummaryCard
      v-else
      v-for="(score, index) in scores"
      :score="score"
      :rank="props.sort == 'pp' ? index + 1 : null"
    />
  </div>

  <span v-else-if="errorMessage" class="error-text">{{ errorMessage }}</span>
</template>

<style lang="scss" scoped>
.score-list {
  display: inline-flex;
  flex-flow: column;
  position: relative;
  overflow: auto;
  min-width: 100%;
}

.show-more-button {
  padding: 0.25rem;
  margin: auto;
}

.error-text {
  text-align: center;
}
</style>
