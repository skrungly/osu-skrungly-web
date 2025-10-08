<script setup>
import { reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as api from "@/api";
import { auth } from "@/store";
import AccountModal from "@/components/AccountModal.vue"
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

const route = useRoute()
const error = ref(null)

const playerInfo = ref(null)
const playerModes = ref([])
const currentMode = ref(0)

const canEdit = ref(false)
const currentlyEditing = ref(false)
const unsavedChanges = ref(false)
const unsavedBanner = ref(false)

const showAccountModal = ref(false)

const inputtedInfo = reactive({
  "name": null,
  "userpage_content": null,
})

const bannerPath = ref(null)
const bannerFile = ref(null)

function resetInfoEdits() {
  showAccountModal.value = false
  if (playerInfo.value === null) return

  canEdit.value = auth.player !== null && auth.player.id == playerInfo.value.id
  inputtedInfo.name = playerInfo.value.name
  inputtedInfo.userpage_content = playerInfo.value.userpage_content

  // TODO: find a better solution to avoiding cache on banner changes
  bannerPath.value = `${AVATAR_URL}/banners/${playerInfo.value.id}.jpg?${new Date().getTime()}`

  unsavedChanges.value = false
  unsavedBanner.value = false
}

async function fetchPlayerInfo() {
  error.value = null
  playerModes.value = []
  canEdit.value = false
  unsavedChanges.value = false

  var response = await api.get(`/players/${route.params.id}`)

  if (!response.ok) {
    error.value = response.statusText
    return
  }

  const player = await response.json()

  var bestPerformance = 0
  for (const stats of player.stats) {
    if (stats.mode < GAME_MODES.length && stats.pp) {
      if (stats.pp > bestPerformance) {
        bestPerformance = stats.pp
        currentMode.value = stats.mode
      }
      playerModes.value.push(stats.mode)
    }
  }

  playerInfo.value = player
  resetInfoEdits()
}

async function checkForEdits() {
  const editedInfo = {}
  unsavedChanges.value = false

  for (const property in inputtedInfo) {
    if (playerInfo.value[property] != inputtedInfo[property]) {
      unsavedChanges.value = true
      editedInfo[property] = inputtedInfo[property]
    }
  }

  return editedInfo
}

async function uploadEdits() {
  const edits = await checkForEdits()

  if (unsavedChanges.value) {
    await api.put(`/players/${auth.player.id}`, edits);
  }

  if (unsavedBanner.value) {
    await api.uploadFile(
      `/players/${auth.player.id}/banner`,
      bannerFile.value
    );
  }

  const routePath = route.path.substring(0, route.path.lastIndexOf("/"))
  window.location.replace(`${routePath}/${inputtedInfo.name}`)
}

async function onBannerChange(event) {
  const file = event.target.files[0]

  if (!file || !file.type.match("image.*")) {
    return false
  }

  const reader = new FileReader()
  reader.onload = function (e) {
    bannerPath.value = e.target.result
    bannerFile.value = event.target.files[0]
    unsavedChanges.value = true
    unsavedBanner.value = true
  }

  reader.readAsDataURL(file)
}

async function logout() {
  await api.logout()
  auth.player = null
  window.location.reload()
}

watch(() => route.params.id, fetchPlayerInfo, { immediate: true })
watch(inputtedInfo, checkForEdits)
watch(() => auth.player, resetInfoEdits)
</script>

<template>
  <div v-if="error" class="message message--error">
    oops :( an error occurred while fetching player info. <span class="error-text">[{{ error }}]</span>
  </div>

  <section v-if="playerInfo">
    <div class="section__banner">
      <img class="banner-image" :src="bannerPath" />

      <div v-if="currentlyEditing" class="banner-input" :class="{'banner-input--hidden': unsavedBanner}">
        <div class="banner-input__prompt">
          <span>
            <FontAwesomeIcon icon="file-arrow-up" /> choose a banner image!
          </span>
          <span class="banner-input__hint">
            an image resolution of 1360x230 is recommended.
          </span>
        </div>
        <input v-if="canEdit" type="file" @change="onBannerChange" accept="image/*">
      </div>

      <button
        v-if="canEdit"
        class="settings-button"
        @click="() => showAccountModal = true"
      >
        <FontAwesomeIcon icon="user-gear" />
        <span class="button-text">settings</span>
      </button>

      <button
        v-if="canEdit"
        class="edit-button"
        :disabled="unsavedChanges"
        @click="() => currentlyEditing = !currentlyEditing"
      >
        <span v-if="currentlyEditing">
          <span class="button-text">cancel</span>
          <FontAwesomeIcon icon="circle-xmark" />
        </span>
        <span v-else>
          <span class="button-text">edit profile</span>
          <FontAwesomeIcon icon="pen-to-square" />
        </span>
      </button>
    </div>

    <div class="userpage-header">
      <div class="userpage-identity">
        <img :src="`${AVATAR_URL}/${playerInfo.id}`" />
        <input v-if="currentlyEditing" type="text" maxlength="15" v-model="inputtedInfo.name" />
        <span v-else>{{ playerInfo.name }}</span>
      </div>

      <textarea v-if="currentlyEditing"
        class="userpage-content"
        type="text"
        maxlength="2048"
        v-model="inputtedInfo.userpage_content"
      ></textarea>
      <span v-else class="userpage-content">{{ playerInfo.userpage_content }}</span>

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

  <div class="edit-controls" :class="{'edit-controls--hidden': !unsavedChanges}">
    <section class="warning">
      <p>your profile has unsaved changes!</p>
      <div class="container">
        <button @click="uploadEdits"><FontAwesomeIcon icon="floppy-disk" /> save!</button>
        <button @click="resetInfoEdits"><FontAwesomeIcon icon="rotate-left" /> restore!</button>
      </div>
    </section>
  </div>

  <div
    @click="() => showAccountModal = false"
    class="modal"
    :class="{'modal--hidden': !showAccountModal}"
  >
    <AccountModal v-on:click.stop @close="() => showAccountModal = false" />
  </div>
</template>

<style lang="scss" scoped>
.section__banner {
  button {
    position: absolute;
    top: 1rem;
    background-color: var(--block-bg-colour);
    transition: opacity 0.5s;
  }

  .settings-button {
    left: 1rem;
  }

  .edit-button {
    right: 1rem;
  }

  .edit-button:disabled {
    opacity: 75%;
    cursor: not-allowed;
  }
}

.banner-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  aspect-ratio: var(--section-banner-aspect);
  padding: 0;

  background-color: #000000;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  opacity: 20%;
  transition: opacity 0.5s;

  input {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .banner-input__prompt {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    height: 100%;

    font-size: 1.5rem;
  }

  .banner-input__hint {
    font-size: 0.75rem;
  }
}

.banner-input--hidden {
  opacity: 0;
}

.banner-input:hover {
  opacity: 40%
}

.userpage-header {
  position: relative;
  display: flex;
  flex-flow: column;
  gap: 1rem;

  input, textarea {
    resize: vertical;
    padding: 0.1rem;
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
    width: 20rem;
    max-width: calc(100% - 0.25rem);
  }
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
  .banner-input {
    justify-content: start;
    gap: 0;

    .banner-input__prompt {
      // this fits the prompt text neatly above the user avatar
      height: 57%;
      gap: 0;
      font-size: 1.25rem;
    }
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

@media screen and (max-width: 35em) {
  .section__banner {
    button {
      top: 0.75rem;
      padding: 0.5rem 0.25rem;
    }

    .settings-button {
      left: 0.75rem;
    }

    .edit-button {
      right: 0.75rem;
    }

    .button-text {
      display: none;
    }
  }

  .banner-input__hint {
    display: none;
  }
}
</style>
