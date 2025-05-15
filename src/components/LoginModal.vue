<script setup>
import { computed, reactive, ref, watch } from "vue"

import { loginToAPI, fetchFromAPI } from "@/api"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const emit = defineEmits(["login"])

const username = ref("")
const password = ref("")

const usernameError = ref(false)
const passwordError = ref(false)

const player = ref(null)
const loadAvatar = ref(false)
const hideAvatar = ref(true)

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

  usernameError.value = false
}

async function attemptLogin() {
  // indicate whether a user has been selected
  if (!loadAvatar.value || hideAvatar.value) {
    usernameError.value = true
    return
  }

  const response = await loginToAPI(username.value, password.value)

  if (response.success) {
    emit("login")
  } else {
    passwordError.value = true
  }
}

const avatarState = reactive({
  "avatar-preview--hidden": hideAvatar
})

const usernameState = computed(() => ({
  "error": usernameError.value,
  "confirm": !hideAvatar.value,
}))

const passwordState = reactive({
  "error": passwordError
})

watch(username, checkUsername)
</script>

<template>
  <section>
    <div class="section__banner">
      <img src="@/assets/default-banner.jpg" />
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

      <button class="highlight-text" type="submit">login</button>
    </form>
  </section>
</template>

<style lang="scss" scoped>
section {
  width: 18rem;
  margin-left: var(--section-margin);
  margin-right: var(--section-margin);
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

form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: center;
  gap: 0.5rem;

  input[type="text"], input[type="password"] {
    margin-bottom: 0.5rem;
  }

  button {
    align-self: center;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
