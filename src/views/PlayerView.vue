<script setup>
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { fetchFromAPI } from "../api"
import RadioButtons from "@/components/RadioButtons.vue"

const GAME_MODES = ["osu!", "taiko", "catch", "mania", "relax"]

const routeParams = useRoute().params
const apiParams = { scope: "all" }

// we may be given a username or numeric id, and the
// bancho.py api offers options for either one:
if (/^\d+$/.test(routeParams.id)) {
  apiParams.id = routeParams.id
} else {
  apiParams.name = routeParams.id
}

const playerInfoResponse = ref(null)
const playerModes = reactive({})
const currentMode = ref("osu!")

const userpageContentHidden = ref(true)
const userpageContentStyle = reactive({
  "userpage-content--hidden": userpageContentHidden
})

onMounted(async () => {
  playerInfoResponse.value = await fetchFromAPI("get_player_info", apiParams)
  for (const stats of Object.values(playerInfoResponse.value.player.stats)) {
    const modeName = GAME_MODES[stats.mode]
    if (stats.pp && modeName) playerModes[modeName] = stats
  }
})
</script>

<template>
  <section v-if="playerInfoResponse">
    <div class="section__banner">
      <img src="https://kingsley.skrungly.com/static/gallery/IMG_0778.JPG" />
    </div>
    <div class="userpage-header">
      <div class="userpage-identity">
        <img :src="'https://a.skrungly.dev/' + playerInfoResponse.player.info.id" />
        <span class="userpage-identity__name">{{ playerInfoResponse.player.info.name }}</span>
      </div>
      <div
        class="userpage-content"
        :class="userpageContentStyle"
        @click="() => userpageContentHidden = !userpageContentHidden"
      >
        {{ playerInfoResponse.player.info.userpage_content }}
      </div>
      <div class="mode-buttons">
        <RadioButtons :options="Object.keys(playerModes)" @choose="(m) => currentMode = GAME_MODES[m]"/>
      </div>
    </div>
  </section>
  <section v-if="playerInfoResponse">
    <h1>{{ currentMode }} stats</h1>
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
  height: 5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 0.75rem;
  gap: 1rem;

  img {
    height: 8rem;
    margin-top: -3rem;
    border-radius: 0.5rem;
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
  right: 0;
  top: 1.25rem;
}

@media screen and (max-width: 40em) {
  .userpage-header {
    padding-bottom: 3rem;
  }

  .userpage-identity {
    flex-direction: column;
    height: auto;

    img {
      height: calc(100vw / 5);
    }
  }

  .userpage-content {
    text-align: center;
  }

  .mode-buttons {
    top: auto;
    bottom: -1rem;
    left: 0;
    right: 0;

    margin-inline: auto;
    width: fit-content;
  }
}
</style>
