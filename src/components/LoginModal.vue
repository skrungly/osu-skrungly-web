<script setup>
import { ref, watch } from "vue"

import * as api from "@/api"
import { inputStateFactory } from "@/utils"
import { auth } from "@/store"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const username = inputStateFactory("")
const password = inputStateFactory("")

const chosenPlayer = ref(null)
const hideAvatar = ref(true)

function resetForm() {
  username.reset()
  password.reset()

  chosenPlayer.value = null
  hideAvatar.value = true
}

async function checkUsername() {
  password.clearStyle()
  username.clearStyle()

  if (!username.value) {
    hideAvatar.value = true
    return
  }

  var response = await api.get(`/players/${username.value}`)

  if (response.status == 404) {
    hideAvatar.value = true
    return

  // anything else is unexpected behaviour
  } else if (!response.ok) {
    username.showError(`failed to fetch player info [${response.status}]`)
    return
  }

  const currentPlayer = await response.json()

  // if player didn't change, just show the avatar again
  if (chosenPlayer.value && chosenPlayer.value.id == currentPlayer.id) {
    hideAvatar.value = false
  }

  // update player and start loading the avatar element
  chosenPlayer.value = currentPlayer
  username.confirm()
}

async function attemptLogin() {
  // indicate whether a user has been selected
  if (hideAvatar.value) {
    username.showError(username.value ? "username not registered" : "username is required")
    return
  }

  try {
    var response = await auth.login(username.value, password.value)
  } catch (e) {
    password.showError(e.message)
    return
  }

  if (auth.player) {
    resetForm()

  } else if (response.status == 401) {
    password.showError(password.value ? "incorrect password" : "password is required")

  } else {
    password.showError(`failed to attempt login [${response.status}]`)
  }
}

watch(() => username.value, checkUsername)
</script>

<template>
  <section>
    <div class="section__banner">
      <!-- lay user banner on top of the default one -->
      <img class="banner-image" :src="`${AVATAR_URL}/banners/default.jpg`" />
      <img
        v-if="chosenPlayer"
        :src="`${AVATAR_URL}/banners/${chosenPlayer.id}`"
        class="banner-image banner-preview"
        :class="{'banner-preview--hidden': hideAvatar}"
      />

      <div class="avatar-preview" :class="{'avatar-preview--hidden': hideAvatar}">
        <img
          v-if="chosenPlayer"
          @load="() => hideAvatar = false"
          :src="`${AVATAR_URL}/${chosenPlayer.id}`"
        />
      </div>
    </div>

    <form @submit.prevent="attemptLogin">
      <label for="username">username</label>
      <input v-model="username.value" id="username" type="text" :class="username.style">
      <span class="error-text" :class="{'error-text--hidden': !username.style.error}">{{ username.errorMessage }}</span>

      <label for="password">password</label>
      <input v-model="password.value" id="password" type="password" :class="password.style">
      <span class="error-text" :class="{'error-text--hidden': !password.style.error}">{{ password.errorMessage }}</span>

      <button class="highlight-button" type="submit">login</button>
    </form>
  </section>
</template>

<style lang="scss" scoped>
section {
  width: 18rem;
  box-shadow: 0 2px 16px #00000020;
}

.section__banner {
  position: relative;
  margin-bottom: 2rem;

  .avatar-preview {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    top: 1rem;
    opacity: 100%;
    transition:
      top 0.5s ease,
      opacity 0.5s ease;

    width: 4rem;
    height: 4rem;
    border-radius: var(--border-radius);
    z-index: 1;

    img {
      border-radius: var(--border-radius);
      box-shadow: 0 2px 16px #00000080;
      width: 100%;
    }
  }

  .avatar-preview--hidden {
    opacity: 0%;
    top: 1.5rem;
    transition:
      top 0s ease 0.6s,
      opacity 0.5s ease 0.1s;
  }

  .banner-preview {
    transition: opacity 0.5s ease;
  }

  .banner-preview--hidden {
    opacity: 0%;
  }
}
</style>
