<script setup>
import { reactive, ref, toRef, watch } from "vue"
import { useRoute } from "vue-router"

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { fetchFromAPI, getIdentity, putUserEdits } from "@/api"
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

const props = defineProps(["currentUser"])
const currentUser = toRef(props, "currentUser")

const route = useRoute()
const error = ref(null)

const playerInfo = ref(null)
const playerModes = ref([])
const currentMode = ref(0)

const canEdit = ref(false)
const editControlsHidden = ref(true)
const inputtedInfo = reactive({
  "name": null,
  "userpage_content": null,
})

const userpageContentHidden = ref(true)
const userpageContentStyle = reactive({
  "userpage-content--hidden": userpageContentHidden
})

const editControlsStyle = reactive({
  "edit-controls--hidden": editControlsHidden
})

function resetInfoEdits() {
  if (playerInfo.value === null) return

  canEdit.value = currentUser.value !== null && currentUser.value.id == playerInfo.value.id
  inputtedInfo.name = playerInfo.value.name
  inputtedInfo.userpage_content = playerInfo.value.userpage_content
}

async function fetchPlayerInfo() {
  error.value = null
  playerModes.value = []
  canEdit.value = false
  editControlsHidden.value = true

  try {
    var response = await fetchFromAPI(`/players/${route.params.id}`)
  } catch (e) {
    error.value = e
    return
  }

  var bestPerformance = 0
  for (const stats of response.stats) {
    if (stats.mode < GAME_MODES.length && stats.pp) {
      if (stats.pp > bestPerformance) {
        bestPerformance = stats.pp
        currentMode.value = stats.mode
      }
      playerModes.value.push(stats.mode)
    }
  }

  playerInfo.value = response
  resetInfoEdits()
}

async function checkForEdits() {
  const editedInfo = {}
  let edited = false

  for (const property in inputtedInfo) {
    if (playerInfo.value[property] != inputtedInfo[property]) {
      edited = true
      editControlsHidden.value = false
      editedInfo[property] = inputtedInfo[property]
    }
  }

  if (!edited) {
    editControlsHidden.value = true
  }

  return editedInfo
}

async function uploadEdits() {
  const edits = await checkForEdits()
  await putUserEdits(edits)

  const routePath = route.path.substring(0, route.path.lastIndexOf("/"))
  window.location.replace(`${routePath}/${inputtedInfo.name}`)
}

watch(() => route.params.id, fetchPlayerInfo, { immediate: true })
watch(inputtedInfo, checkForEdits)
watch(currentUser, resetInfoEdits)
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
        <input v-if="canEdit" type="text" maxlength="15" v-model="inputtedInfo.name" />
        <span v-else>{{ playerInfo.name }}</span>
      </div>

      <textarea v-if="canEdit"
        class="userpage-content"
        type="text"
        maxlength="2048"
        v-model="inputtedInfo.userpage_content"
      ></textarea>
      <span v-else
        class="userpage-content"
        :class="userpageContentStyle"
        @click="() => userpageContentHidden = !userpageContentHidden"
      >{{ playerInfo.userpage_content }}</span>

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

  <div class="edit-controls" :class="editControlsStyle">
    <section class="warning">
      <p>your profile has unsaved changes!</p>
      <div class="container">
        <button @click="uploadEdits"><FontAwesomeIcon icon="floppy-disk" /> save!</button>
        <button @click="resetInfoEdits"><FontAwesomeIcon icon="rotate-left" /> restore!</button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.userpage-header {
  position: relative;
  display: flex;
  flex-flow: column;
  gap: 1rem;

  input, textarea {
    resize: vertical;
  }
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

  span, input {
    font-size: 1.5rem;
    max-width: 20rem;
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

.edit-controls {
  position: sticky;
  bottom: var(--section-margin);
  opacity: 100%;

  transition:
    opacity 0.5s ease,
    bottom 0.5s ease;

  display: flex;
  justify-content: center;

  text-align: center;

  section {
    width: 18rem;
    box-shadow: 0 0.125rem 1rem #00000020;
  }
}

.edit-controls--hidden {
  opacity: 0%;
  bottom: -4rem;

  transition:
    opacity 0.5s ease,
    bottom 0s ease 0.5s;
}

@media screen and (max-width: 50em) {
  .section__banner button span {
    display: none;
  }

  .userpage-header {
    padding-bottom: 3rem;
    text-align: center;

    input, span, textarea {
      text-align: center;
    }
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
