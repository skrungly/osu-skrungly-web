<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { onMounted, ref } from "vue"

import * as api from "@/api"
import MapSummaryCard from "@/components/MapSummaryCard.vue"
import Section from '@/components/Section.vue'

const GLOBAL_STATS_NAMES: { [K in keyof Partial<api.GlobalStats>]: string } = {
  pp: "pp earned",
  plays: "plays uploaded",
  total_hits: "notes hit",
  tscore: "total score",
} as const

const errorMessage = ref<string | null>(null)

const stats = ref<api.GlobalStats | null>(null)
const popularMaps = ref<api.Beatmap[]>([])
const recentScores = ref<api.Score[]>([])

onMounted(async () => {
  errorMessage.value = null;

  const statsResponse = await api.get("/stats");

  if (!statsResponse.ok) {
    errorMessage.value = `failed to fetch global stats [${statsResponse.status}]`;
    return;
  }

  stats.value = await statsResponse.json();

  const popularMapsResponse = await api.get("/maps", {
    sort: "popular",
    limit: 5,
  });

  if (!popularMapsResponse.ok) {
    errorMessage.value = `failed to fetch popular maps [${popularMapsResponse.status}]`;
    return;
  }

  popularMaps.value = await popularMapsResponse.json();

  const recentScoresResponse = await api.get("/scores", {
    sort: "frontpage",
    limit: 5,
  });

  if (!recentScoresResponse.ok) {
    errorMessage.value = `failed to fetch recent scores [${recentScoresResponse.status}]`;
  }

  recentScores.value = await recentScoresResponse.json();
})
</script>

<template>
  <Section v-if="errorMessage">
    <span class="error-text">{{ errorMessage }}</span>
  </Section>

  <Section v-if="stats" class="container">
    <div v-if="stats" v-for="[stat, name] in Object.entries(GLOBAL_STATS_NAMES)" class="stats">
      <span class="stats__value">{{ stats[stat as keyof typeof GLOBAL_STATS_NAMES].toLocaleString() }}</span>
      <span class="stats__name">{{ name }}</span>
    </div>
  </Section>

  <div class="page-split">
    <Section v-if="recentScores">
      <h2><FontAwesomeIcon icon="clock-rotate-left" />recent pb scores</h2>
      <div class="info-list">
        <MapSummaryCard
          v-for="score in recentScores"
          :map="score.beatmap"
          :score="score"
          :show-player="true"
          :rank="null"
        />
      </div>
    </Section>

    <Section v-if="popularMaps">
      <h2><FontAwesomeIcon icon="music" />most popular maps</h2>
      <div class="info-list">
        <MapSummaryCard
          v-for="map in popularMaps"
          :map="map"
          :score="null"
          :show-player="true"
          :rank="null"
        />
      </div>
    </Section>
  </div>
</template>

<style lang="scss" scoped>
.page-split {
  display: flex;
  flex-flow: row;
  gap: var(--section-margin);

  section {
    width: calc(50% - 2.5 * var(--section-margin));
  }
}

.info-list {
  display: flex;
  flex-flow: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media screen and (max-width: 65em) {
  .page-split {
    flex-flow: column;

    section {
      width: inherit;
    }
  }
}
</style>
