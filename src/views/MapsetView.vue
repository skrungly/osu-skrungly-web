<script setup lang="ts">
import * as api from "@/api"
import ScoreList from "@/components/ScoreList.vue"
import Section from "@/components/Section.vue"
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

const mapset = ref<api.Beatmap[]>([])
const beatmap = ref<api.Beatmap | null>(null)

const errorMsg = ref<string | null>(null)
const loading = ref(false)

const beatmapBannerSrc = computed(() => (
  `https://assets.ppy.sh/beatmaps/${route.params.id}/covers/cover@2x.jpg`
))

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
  <Section v-if="mapset.length && beatmap">
    <div class="map-header">
      <img class="map-header__background" :src="beatmapBannerSrc"/>
      <div class="map-header__background map-header__overlay"></div>

      <div class="map-header__info">
        <span class="map-header__title">{{ beatmap.artist }} - {{ beatmap.title }}</span>
        <span class="map-header__creator">mapped by {{ beatmap.creator }}</span>
      </div>

      <div class="map-header__options">
        <select class="map-header__select" v-model="beatmap">
          <option v-for="map in mapset" :value="map">{{ map.version }}</option>
        </select>
      </div>
    </div>
  </Section>

  <Section v-if="beatmap">
    <ScoreList
      :map="beatmap"
      :mode="beatmap.mode"
      sort="pp"
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
}

.map-header__background {
  position: absolute;
  margin: calc(-1 * var(--section-padding) - 1px);

  width: calc(100% + 2 * var(--section-padding));
  height: calc(100% + 2 * var(--section-padding));
  object-fit: cover;

  border-radius: var(--border-radius);
}

.map-header__overlay {
  background-color: #000;
  opacity: 60%;
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
