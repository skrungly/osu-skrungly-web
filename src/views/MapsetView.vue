<script setup lang="ts">
import * as api from "@/api"
import RadioButtons from "@/components/RadioButtons.vue"
import ScoreList from "@/components/ScoreList.vue"
import Section from "@/components/Section.vue"
import MapStatsSection from "@/components/MapStatsSection.vue"
import { auth } from "@/store"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

const mapset = ref<api.Beatmap[]>([])
const beatmap = ref<api.Beatmap | null>(null)

const globalScores = ref(true)

const errorMsg = ref<string | null>(null)
const loading = ref(false)

const headerStyle = computed(() => ({
  "background-image": `url("https://assets.ppy.sh/beatmaps/${route.params.id}/covers/cover@2x.jpg")`,
}))

async function fetchMapset() {
  mapset.value = []
  beatmap.value = null
  loading.value = true

  var response = await api.get(`/mapsets/${route.params.id}`)

  if (!response.ok) {
    errorMsg.value = `unable to fetch mapset [${response.status}]`
    loading.value = false
    return
  }

  mapset.value = await response.json()
  beatmap.value = mapset.value[0] ?? null

  loading.value = false
  errorMsg.value = null
}

watch(() => route.params.id, fetchMapset, { immediate: true })
</script>

<template>
  <Section v-if="mapset.length && beatmap" :style="headerStyle" class="map-header" allow-full-width>
    <div class="map-header__info">
      <span class="map-header__title">{{ beatmap.artist }} - {{ beatmap.title }}</span>
      <span class="map-header__creator">mapped by {{ beatmap.creator }}</span>
    </div>

    <div class="map-header__options">
      <select class="map-header__select" v-model="beatmap">
        <option v-for="map in mapset" :value="map">{{ map.version }}</option>
      </select>

      <div class="map-stats map-stats--desktop">
        <MapStatsSection v-if="beatmap" :beatmap="beatmap"/>
      </div>
    </div>
  </Section>

  <Section class="map-stats map-stats--mobile">
    <MapStatsSection v-if="beatmap" :beatmap="beatmap"/>
  </Section>

  <Section v-if="beatmap" class="score-section" allow-full-width>
    <div class="score-section__header">
      <h2><FontAwesomeIcon icon="trophy"/>top plays</h2>
      <RadioButtons
        v-model="globalScores"
        :options="{ global: true, personal: false }"
        default="global"
        :disabled="!auth.player ? ['personal'] : undefined"
      />
    </div>

    <ScoreList
      :map="beatmap"
      :mode="beatmap.mode"
      :sort="globalScores && [api.BeatmapStatus.Ranked, api.BeatmapStatus.Approved].includes(beatmap.status) ? 'pp' : 'score'"
      :status="globalScores ? api.ScoreStatusQuery.Best : api.ScoreStatusQuery.Passed"
      :player="!globalScores && auth.player ? auth.player : undefined"
      :page-limit="10"
    />
  </Section>
</template>

<style lang="scss" scoped>
.map-header {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  gap: 1rem;

  background-position: center;
  background-size: cover;
  background-color: hsl(0 0% 30%);
  background-blend-mode: overlay;
}

.map-header__info {
  display: flex;
  flex-flow: column;
  height: 8rem;

  text-wrap: nowrap;
  overflow: hidden;
  text-shadow: var(--shadow-text);
}

.map-header__title {
  font-size: 1.75rem;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: auto;
}

.map-header__creator {
  color: var(--text-colour-secondary);
  margin-bottom: auto;
}

.map-header__options {
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.map-header__select {
  width: 19.5rem;
}

.map-stats {
  display: none;
}

.map-stats--desktop {
  display: flex;
  flex-flow: column;
  justify-content: end;
  gap: 1rem;
  flex-shrink: 0;
}

.score-section {
  display: flex;
  flex-flow: column;
}

.score-section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.score-section__header h2 {
  font-size: 1.25rem;
}

@media screen and (max-width: 50em) {
  .map-header__info {
    height: 5rem;
  }

  .map-header__title {
    font-size: 1.5rem;
  }

  .map-stats--desktop {
    display: none;
  }

  .map-stats--mobile {
    display: block;
  }
}

@media screen and (max-width: 35em) {
  .map-header__select {
    width: 100%;
  }

  .score-section {
    gap: 0.5rem
  }

  .score-section__header {
    flex-flow: column;
    align-items: center;
  }

  .score-section__header h2 {
    margin: 0.5rem 0;
  }
}
</style>
