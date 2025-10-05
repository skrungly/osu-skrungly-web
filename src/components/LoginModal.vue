<script setup>
import { computed, reactive, ref, watch } from "vue"

import { loginToAPI, fetchFromAPI } from "@/api"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const emit = defineEmits(["login"])

const player = ref(null)
const loadAvatar = ref(false)
const hideAvatar = ref(true)

const avatarState = reactive({
  "avatar-preview--hidden": hideAvatar
})

// to be initialised by a call to resetForm()
const username = ref("")
const password = ref("")
const usernameState = reactive({})
const passwordState = reactive({})

function resetForm() {
  username.value = ""
  password.value = ""
  usernameState["error"] = false
  usernameState["confirm"] = false
  passwordState["error"] = false
}

async function checkUsername() {
  try {
    var response = await fetchFromAPI(`/players/${username.value}`)
  } catch (e) {
    hideAvatar.value = true
    return
  }

  // if player didn't change, just show the avatar again
  if (player.value && player.value.id == response.id) {
    hideAvatar.value = false
  }

  // update player and start loading the avatar element
  if (response) {
    player.value = response
    loadAvatar.value = true
  }

  usernameState["error"] = false
  usernameState["confirm"] = true
}

async function attemptLogin() {
  // indicate whether a user has been selected
  if (!loadAvatar.value || hideAvatar.value) {
    usernameState["error"] = true
    return
  }

  const response = await loginToAPI(username.value, password.value)

  if (response.ok) {
    emit("login")
    passwordState["error"] = false
  } else {
    passwordState["error"] = true
  }
}

resetForm()
watch(username, checkUsername)
</script>

<template>
  <section>
    <div class="section__banner">
      <img :src="`${AVATAR_URL}/banners/default`" />
      <div class="avatar-preview" :class="avatarState">
        <img
          v-if="loadAvatar"
          @load="() => (hideAvatar = false)"
          :src="`${AVATAR_URL}/${player ? player.id : 0}`"
        />
      </div>
    </div>

    <form @submit.prevent="attemptLogin">
      <label for="username">username</label>
      <input v-model="username" id="username" type="text" :class="usernameState">

      <label for="password">password</label>
      <input v-model="password" id="password" type="password" :class="passwordState">

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
      top 0s ease 0.5s,
      opacity 0.5s ease;
  }
}
</style>
