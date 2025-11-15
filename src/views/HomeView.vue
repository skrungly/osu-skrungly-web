<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { onMounted, ref } from "vue"

import * as api from "@/api"
import MapInfo from "@/components/MapInfo.vue"

const GLOBAL_STATS = {
  pp: "pp",
  plays: "plays",
  total_hits: "notes hit",
  tscore: "total score",
}

const errorMessage = ref(null)

const stats = ref(null)
const popularMaps = ref([])
const recentScores = ref([])

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
  <section v-if="errorMessage">
    <span class="error-text">{{ errorMessage }}</span>
  </section>

  <section v-if="stats" class="container">
    <div v-if="stats" v-for="[stat, name] in Object.entries(GLOBAL_STATS)" class="stats">
      <span class="stats__name">global {{ name }}</span>
      <span class="stats__value">{{ stats[stat].toLocaleString() }}</span>
    </div>
  </section>

  <div class="page-split">
    <section v-if="recentScores">
      <h2><FontAwesomeIcon icon="clock-rotate-left" />recent pb scores</h2>
      <div class="info-list">
        <MapInfo
          v-for="score in recentScores"
          :map="score.beatmap"
          :score="score"
          :show-player="true"
        />
      </div>
    </section>

    <section v-if="popularMaps">
      <h2><FontAwesomeIcon icon="music" />most popular maps</h2>
      <div class="info-list">
        <MapInfo
          v-for="map in popularMaps"
          :map="map"
        />
      </div>
    </section>
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
