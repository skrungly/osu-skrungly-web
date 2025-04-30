<script setup>
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { fetchFromAPI } from "@/api"
import RadioButton from "@/components/RadioButton.vue"
import ScoreList from "@/components/ScoreList.vue"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL
const GAME_MODES = ["osu!", "taiko", "catch", "mania", "relax"]
const SHOW_STATS = {
  pp: "pp",
  plays: "plays",
  total_hits: "notes hit",
  rscore: "ranked score",
}

const player = useRoute().params.id
const playerInfo = ref(null)
const playerModes = []
const currentMode = ref(0)
const error = ref(null)

const userpageContentHidden = ref(true)
const userpageContentStyle = reactive({
  "userpage-content--hidden": userpageContentHidden
})

onMounted(async () => {
  error.value = null

  try {
    var response = await fetchFromAPI(`/players/${player}`)
  } catch (e) {
    error.value = e
  }

  for (const stats of response.stats) {
    if (stats.mode < GAME_MODES.length && stats.pp) {
      playerModes.push(stats.mode)
    }
  }

  playerInfo.value = response
})
</script>

<template>
  <div v-if="error" class="message message--error">
    oops :( an error occurred while fetching player info. <span class="error-text">[{{ error }}]</span>
  </div>
  <section v-if="playerInfo">
    <div class="section__banner">
      <img src="@/assets/default-banner.jpg" />
    </div>
    <div class="userpage-header">
      <div class="userpage-identity">
        <img :src="`${AVATAR_URL}/${playerInfo.id}`" />
        <span class="userpage-identity__name">{{ playerInfo.name }}</span>
      </div>
      <div
        class="userpage-content"
        :class="userpageContentStyle"
        @click="() => userpageContentHidden = !userpageContentHidden"
      >
        {{ playerInfo.userpage_content }}
      </div>
      <div class="mode-buttons">
        <RadioButton
          v-for="mode in playerModes"
          :state="currentMode"
          :option="mode"
          :content="GAME_MODES[mode]"
          @click="() => currentMode = mode"
        />
      </div>
    </div>
  </section>
  <section v-if="playerInfo" class="container">
    <div v-for="[stat, name] in Object.entries(SHOW_STATS)" class="stats">
      <span class="stats__name">{{ name }}</span>
      <span class="stats__value">{{ playerInfo.stats[currentMode][stat].toLocaleString() }}</span>
    </div>
  </section>
  <section v-if="playerInfo">
    <ScoreList :player="playerInfo.id" :mode="currentMode" sort="pp" />
  </section>
  <section v-if="playerInfo">
    <ScoreList :player="playerInfo.id" :mode="currentMode" sort="recent" />
  </section>
</template>

<style lang="scss" scoped>
.userpage-header {
  position: relative;
  display: flex;
  flex-flow: column;
  gap: 1rem;
}

.userpage-identity {
  height: var(--header-height);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  img {
    max-height: 8rem;
    margin-top: -3rem;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 16px #00000080;
  }

  .userpage-identity__name {
    font-size: 1.5rem;
    flex-grow: 1;
  }
}

.userpage-content--hidden {
  position: relative;
  max-height: 5rem;
  overflow: hidden;

  background-color: #ffffff00;
  background-image: linear-gradient(180deg, #ffffff, #ffffff 3rem, #ffffff00 4.5rem);
  background-size: 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}

.mode-buttons {
  position: absolute;
  right: 0.75rem;
  top: 1.5rem;
}

@media screen and (max-width: 35em) {
  .userpage-header {
    padding-bottom: 3rem;
  }

  .userpage-identity {
    flex-direction: column;
    height: auto;

    img {
      --adjusted-height: calc(100vw / 5);

      height: var(--adjusted-height);
      margin-top: calc(var(--adjusted-height) * -3 / 8);
    }
  }

  .userpage-content {
    text-align: center;
  }

  .mode-buttons {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;

    margin-inline: auto;
    width: fit-content;
  }
}
</style>
