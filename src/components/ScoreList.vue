<script setup lang="ts">
import * as api from "@/api"
import { ref, toRef, watch } from "vue"
import ScoreSummaryCard from "./ScoreSummaryCard.vue"
import PaginationButtons from "./PaginationButtons.vue"

const RANKED_SORTS: api.ScoreSortOption[] = ["pp", "score", "combo"]

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
const loading = ref(false)

const chosenPage = ref<number>(1)
const fetchedPage = ref<number | null>(null)
const finalPage = ref<number | null>(null)

function scoreRank(index: number): number | null {
  if (RANKED_SORTS.includes(sort.value) && fetchedPage.value) {
    return (fetchedPage.value - 1) * props.pageLimit + index
  } else {
    return null
  }
}

async function fetchScores(reset: boolean = false) {
  let page = reset ? 1 : chosenPage.value
  fetchedPage.value = page

  loading.value = true

  const params: api.ScoreQuery = {
    player: player.value?.id,
    beatmap: map.value?.id,
    mode: mode.value,
    sort: sort.value,
    page: page - 1,
    limit: props.pageLimit,
    status: props.status ?? (
      sort.value == "pp"
      ? api.ScoreStatusQuery.Best
      : api.ScoreStatusQuery.Passed
    ),
  }

  const response = await api.get("/scores", params)

  if (fetchedPage.value !== page) {
    return
  }

  if (!response.ok) {
    errorMessage.value = `failed to fetch scores [${response.status}]`
    return
  }

  let fetchedScores = await response.json() as api.Score[]

  if (reset) {
    finalPage.value = null
  }

  if (fetchedScores.length == 0) {
    finalPage.value = Math.max(1, page - 1)
    page = finalPage.value

  } else if (fetchedScores.length < props.pageLimit) {
    finalPage.value = page
  }

  chosenPage.value = page

  if (fetchedScores.length || reset) {
    scores.value = fetchedScores
  }

  errorMessage.value = null
  loading.value = false
}

watch(chosenPage, () => fetchScores(false))
watch([player, map, mode], () => fetchScores(true), { immediate: true })
</script>

<template>
  <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>

  <div class="score-page">
    <!-- TODO: use skeleton layout to set height, rather than styling it like this -->
    <div class="score-list" :class="{ 'loading': loading }">
      <ScoreSummaryCard
        v-for="index in pageLimit"
        :score="scores[index - 1]"
        :rank="scoreRank(index) ?? undefined"
      />
    </div>

    <PaginationButtons v-model="chosenPage" :final-page="finalPage"/>
  </div>
</template>

<style lang="scss" scoped>
.score-page {
  display: flex;
  flex-flow: column;
  gap: 0.5rem;
  overflow: auto;
  min-width: 100%;
}

.score-list {
  display: inline-flex;
  flex-flow: column;
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
