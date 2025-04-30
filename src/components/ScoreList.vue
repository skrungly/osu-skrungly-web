<script setup>
import { computed, reactive, ref, toRef, watch } from "vue"

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

import { fetchFromAPI } from "@/api"
import Score from "@/components/Score.vue"

const props = defineProps(["player", "mode", "sort"])
const player = toRef(props, "player")
const mode = toRef(props, "mode")

const LOAD_PER_CHUNK = 10

const scores = reactive([])
const page = ref(0)
const loadMore = ref(true)

async function refreshScores() {
  scores.length = 0
  page.value = 0
  loadMore.value = true
  await fetchScores()
}

async function fetchScores() {
  if (!loadMore.value || player.value === null) return

  const params = {
    sort: props.sort,
    mode: mode.value,
    limit: LOAD_PER_CHUNK,
    page: page.value,
  }

  const response = await fetchFromAPI(`/players/${player.value}/scores`, params)

  if (response.length < LOAD_PER_CHUNK) {
    loadMore.value = false
  } else {
    page.value += 1
  }

  scores.push(...response)
}

const buttonStyle = computed(() => ({
  "load-button--hidden": !loadMore.value
}))

watch([player, mode], refreshScores, { immediate: true })
</script>

<template>
  <h2 v-if="props.sort == 'pp'"><FontAwesomeIcon icon="trophy" />top plays</h2>
  <h2 v-if="props.sort == 'recent'"><FontAwesomeIcon icon="clock-rotate-left" />recent plays</h2>
  <div class="score-list">
    <Score
      v-if="scores.length"
      v-for="(score, index) in scores"
      :score="score"
      :rank="props.sort == 'pp' ? index + 1 : null"
    />
    <button @click="fetchScores" class="load-button" :class="buttonStyle">
      <FontAwesomeIcon icon="caret-down" /> load more <FontAwesomeIcon icon="caret-down" />
    </button>
  </div>
</template>

<style lang="scss">
.score-list {
  display: flex;
  flex-flow: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.load-button {
  padding: 1em;
  border-radius: var(--border-radius);
  margin: auto;
}

.load-button--hidden {
  display: none;
}


</style>
