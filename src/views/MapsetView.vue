<script setup lang="ts">
import * as api from "@/api"
import RadioButtons from "@/components/RadioButtons.vue"
import ScoreList from "@/components/ScoreList.vue"
import Section from "@/components/Section.vue"
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
  <Section v-if="mapset.length && beatmap" :style="headerStyle" class="map-header">
    <div class="map-header__info">
      <span class="map-header__title">{{ beatmap.artist }} - {{ beatmap.title }}</span>
      <span class="map-header__creator">mapped by {{ beatmap.creator }}</span>
    </div>

    <div class="map-header__options">
      <select class="map-header__select" v-model="beatmap">
        <option v-for="map in mapset" :value="map">{{ map.version }}</option>
      </select>
    </div>
  </Section>

  <Section v-if="beatmap" class="score-list">
    <div class="score-list__header">
      <h2><FontAwesomeIcon icon="trophy"/>top plays</h2>
      <RadioButtons
        v-model="globalScores"
        :options="{ global: true, personal: false }"
        default="global"
        :disabled="auth.player ? undefined : ['personal']"
      />
    </div>

    <ScoreList
      v-if="globalScores || !auth.player"
      :map="beatmap"
      :mode="beatmap.mode"
      sort="pp"
      :page-limit="10"
    />

    <ScoreList
      v-else
      :map="beatmap"
      :mode="beatmap.mode"
      sort="pp"
      :status="api.ScoreStatusQuery.Passed"
      :player="auth.player"
      :page-limit="10"
    />
  </Section>
</template>

<style lang="scss" scoped>
.map-header {
  position: relative;
  display: flex;
  flex-flow: column;
  height: 100%;

  background-position: center;
  background-size: cover;
  background-color: hsl(0 0% 35%);
  background-blend-mode: overlay;
}

.map-header__info {
  position: relative;
  display: flex;
  flex-flow: column;
  justify-content: center;
  height: 8rem;
}

.map-header__title {
  font-size: 1.75rem;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.map-header__creator {
  color: var(--text-colour-secondary)
}

.map-header__options {
  position: relative;
}

.score-list__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.score-list__header h2 {
  font-size: 1.25rem;
}

@media screen and (max-width: 50em) {
  .map-header__info {
    height: 5rem;
  }

  .map-header__title {
    font-size: 1.5rem;
  }
}

@media screen and (max-width: 35em) {
  .map-header__select {
    width: 100%;
  }
}
</style>
