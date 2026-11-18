<script setup lang="ts">
import { ref, watch } from "vue"
import { useRoute } from "vue-router"

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as api from "@/api";
import { auth } from "@/store";
import AccountModal from "@/components/AccountModal.vue"
import RadioButton from "@/components/RadioButton.vue"
import PlayerScoreList from "@/components/PlayerScoreList.vue"
import { inputStateFactory } from "@/utils";
import PlayerActivityIndicator from "@/components/PlayerActivityIndicator.vue";
import Section from "@/components/Section.vue";

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL
const GAME_MODES = ["osu!", "taiko", "catch", "mania", "relax"]
const SHOW_STATS = {
  pp: "pp earned",
  plays: "plays uploaded",
  total_hits: "notes hit",
  rscore: "ranked score",
} as const

const route = useRoute()
const pageError = ref<string | null>(null)
const showAccountModal = ref(false)

const playerInfo = ref<api.Player | null>(null)
const playerModes = ref<api.GameMode[]>([])
const currentMode = ref<api.GameMode>(0)

const canEdit = ref(false)
const currentlyEditing = ref(false)

const unsavedChanges = ref(false)
const savePromptStyle = ref<{
  error?: boolean
  warning?: boolean
  loading?: boolean
}>({})

const inputName = inputStateFactory("")
const inputUserpage = inputStateFactory("")

type ValidFileInputEvent = Event & {
  target: HTMLInputElement & {
    files: FileList
  }
}

interface Banner {
  path: string | null
  file: File | null
}

const banner = ref<Banner>({
  path: null,
  file: null,
})

function resetInfoEdits() {
  showAccountModal.value = false
  if (playerInfo.value === null) return

  canEdit.value = auth.player !== null && auth.player.id == playerInfo.value.id

  inputName.reset()
  inputUserpage.reset()

  inputName.value = playerInfo.value.name
  inputUserpage.value = playerInfo.value.userpage_content

  // TODO: find a better solution to avoiding cache on banner changes
  banner.value.path = `${AVATAR_URL}/banners/${playerInfo.value.id}.jpg?${new Date().getTime()}`
  banner.value.file = null

  unsavedChanges.value = false
  savePromptStyle.value = { warning: true }
}

async function fetchPlayerInfo() {
  pageError.value = null
  playerModes.value = []
  canEdit.value = false
  unsavedChanges.value = false

  var response = await api.get(`/players/${route.params.id}`)

  if (!response.ok) {
    pageError.value = `unable to fetch player '${route.params.id}' [${response.status}]`
    return
  }

  const player = await response.json() as api.Player

  var bestPerformance = 0
  for (const stats of Object.values(player.stats)) {
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

function checkForEdits() {
  if (!playerInfo.value) {
    return {}
  }

  const edits: Partial<api.Player> = {}
  unsavedChanges.value = false

  if (inputName.value != playerInfo.value.name) {
    edits.name = inputName.value ?? undefined
  }

  if (inputUserpage.value != playerInfo.value.userpage_content) {
    edits.userpage_content = inputUserpage.value ?? undefined
  }

  unsavedChanges.value = Object.keys(edits).length > 0 || banner.value.file !== null
  return edits
}

async function uploadEdits() {
  if (!auth.player || !playerInfo.value) {
    return
  }

  const edits = checkForEdits()

  inputName.clearStyle()
  inputUserpage.clearStyle()
  savePromptStyle.value = {
    warning: true,
    loading: true,
  }

  if (unsavedChanges.value) {
    var infoResponse = await api.put(`/players/${auth.player.id}`, edits)

    if (infoResponse.status == 401) {
      auth.expired = true
      auth.logout()
      return

    } else if (infoResponse.status == 422) {
      const reasons = await infoResponse.json()
      if (reasons.name) inputName.showError(reasons.name.join("\r\n"))
      if (reasons.userpage_content) inputUserpage.showError(reasons.userpage_content.join("\r\n"))
      savePromptStyle.value = { error: true }
      return

    // anything else is unexpected behaviour!
    } else if (!infoResponse.ok) {
      pageError.value = `failed to update user info [${infoResponse.status}]`
      savePromptStyle.value = { error: true }
      return
    }

    // in case we can't refresh the page due to a banner upload issue,
    // the current player info should be updated to reflect changes
    if (edits.name) {
      playerInfo.value.name = edits.name
      inputName.confirm()
    }

    if (edits.userpage_content) {
      playerInfo.value.userpage_content = edits.userpage_content
      inputUserpage.confirm()
    }
  }

  if (banner.value.file) {
    var bannerResponse = await api.uploadFile(`/players/${auth.player.id}/banner`, banner.value.file)

    if (bannerResponse.status == 401) {
      auth.expired = true
      auth.logout()
      return

    } else if (bannerResponse.status == 413) {
      pageError.value = "file upload too large (max 50MB)"
      savePromptStyle.value = { error: true }
      return

    } else if (!bannerResponse.ok) {
      pageError.value = `failed to update banner image [${bannerResponse.status}]`
      savePromptStyle.value = { error: true }
      return
    }
  }

  const routePath = route.path.substring(0, route.path.lastIndexOf("/"))
  window.location.replace(`${routePath}/${inputName.value}`)
}

function inputEventHasFile(event: Event): event is ValidFileInputEvent {
  if (!event.target) {
    return false
  }

  let target = event.target as HTMLInputElement

  if (target.hasOwnProperty("files") && target.files !== null) {
    return true
  }

  return false
}

function onBannerChange(event: Event) {
  if (!inputEventHasFile(event)) {
    return
  }

  const file = event.target.files[0]

  if (!file || !file.type.match("image.*")) {
    return false
  }

  const reader = new FileReader()
  reader.onload = function (e) {
    if (!e.target) {
      pageError.value = "failed to read banner file"
      return
    }

    banner.value.path = e.target.result as string
    banner.value.file = event.target.files[0]
    unsavedChanges.value = true
  }

  reader.readAsDataURL(file)
}

watch(() => route.params.id, fetchPlayerInfo, { immediate: true })
watch(inputName, checkForEdits)
watch(inputUserpage, checkForEdits)
watch(() => auth.player, resetInfoEdits)
</script>

<template>
  <Section class="container" v-if="pageError">
    <span class="error-text">{{ pageError }}</span>
  </Section>

  <Section v-if="playerInfo" :banner-src="banner.path ?? undefined">
    <template #banner>
      <div v-if="currentlyEditing" class="banner-input" :class="{'banner-input--hidden': banner.file}">
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

      <div class="banner-buttons">
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
    </template>

    <div class="userpage-header">
      <div class="userpage-identity">
        <img :src="`${AVATAR_URL}/${playerInfo.id}`" />
        <input v-if="currentlyEditing" type="text" :class="inputName.style" maxlength="15" v-model="inputName.value" />
        <span v-else class="userpage-name">
          {{ playerInfo.name }}
          <PlayerActivityIndicator :player="playerInfo" minimal/>
        </span>
        <span class="error-text" :class="{'error-text--hidden': !inputName.style.error}">{{ inputName.errorMessage }}</span>
      </div>

      <textarea v-if="currentlyEditing"
        class="userpage-content"
        :class="inputUserpage.style"
        type="text"
        maxlength="2048"
        v-model="inputUserpage.value"
      ></textarea>
      <span v-else-if="auth.player" class="userpage-content">{{ playerInfo.userpage_content }}</span>
      <span class="error-text" :class="{'error-text--hidden': !inputUserpage.style.error}">{{ inputUserpage.errorMessage }}</span>

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
  </Section>

  <Section v-if="playerInfo" class="container">
    <div v-for="[stat, name] in Object.entries(SHOW_STATS)" class="stats">
      <span class="stats__value">{{ playerInfo.stats[currentMode][stat as keyof typeof SHOW_STATS].toLocaleString() }}</span>
      <span class="stats__name">{{ name }}</span>
    </div>
  </Section>

  <Section v-if="playerInfo">
    <PlayerScoreList :player="playerInfo" :mode="currentMode" sort="pp" />
  </Section>

  <Section v-if="playerInfo">
    <PlayerScoreList :player="playerInfo" :mode="currentMode" sort="recent" />
  </Section>

  <div v-if="currentlyEditing" class="edit-controls" :class="{'edit-controls--hidden': !unsavedChanges}">
    <Section :class="savePromptStyle">
      <p v-if="savePromptStyle.loading">uploading changes...</p>
      <p v-else-if="savePromptStyle.warning">your profile has unsaved changes!</p>
      <p v-else>failed to save changes!</p>
      <div class="container">
        <button @click="uploadEdits"><FontAwesomeIcon icon="floppy-disk" /> save!</button>
        <button @click="resetInfoEdits"><FontAwesomeIcon icon="rotate-left" /> restore!</button>
      </div>
    </Section>
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
.banner-buttons {
  display: flex;
  flex-flow: row;
  align-items: start;
  justify-content: space-between;
  height: 100%;

  button {
    min-width: 10rem;
    background-color: var(--block-bg-colour);
    transition: opacity 0.5s;
    z-index: 0;
  }

  .settings-button {
    padding-right: 1.5rem;
  }

  .edit-button {
    padding-left: 1.5rem;
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
  opacity: 40%;
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
  opacity: 60%
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
    box-shadow: var(--shadow-medium), var(--shadow-small);
  }

  .userpage-name, input {
    display: flex;
    flex-flow: row;
    gap: 0.5rem;

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
  width: 18rem;
  opacity: 100%;
  visibility: visible;

  transition:
    opacity 0.5s ease,
    visibility 0s,
    bottom 0.5s ease;

  display: flex;
  justify-content: center;
  align-self: center;

  text-align: center;

  section {
    flex-grow: 1;
    box-shadow: var(--shadow-large), var(--shadow-medium);
  }
}

.edit-controls--hidden {
  visibility: hidden;
  opacity: 0%;
  bottom: -4rem;

  transition:
    opacity 0.5s ease,
    visibility 0s ease 0.5s,
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
      justify-content: center;
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
  .banner-buttons {
    align-items: center;

    button {
      min-width: 0rem;
      top: 0.75rem;
    }

    .settings-button {
      left: 0.75rem;
      padding: 0.5rem 0.25rem;
    }

    .edit-button {
      right: 0.75rem;
      padding: 0.5rem 0.25rem;
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
