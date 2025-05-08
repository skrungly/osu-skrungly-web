<script setup>
import { reactive, ref, watch } from "vue"

import { fetchFromAPI } from "@/api"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const username = ref("")
const password = ref("")

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
}

const avatarStyle = reactive({
  "avatar-preview--hidden": hideAvatar
})

watch(username, checkUsername)
</script>

<template>
  <section>
    <div class="section__banner">
      <img src="@/assets/default-banner.jpg" />
      <div class="avatar-preview" :class="avatarStyle">
        <img
          v-if="loadAvatar"
          @load="() => (hideAvatar = false)"
          :src="`${AVATAR_URL}/${player ? player.id : 0}`"
        />
      </div>
    </div>
    <label for="username">username</label>
    <br/>
    <input v-model="username" id="username">
    <br/>
    <br/>

    <label for="password">password</label>
    <br/>
    <input v-model="password" id="password" type="password">
    <br/>
    <button>
      login
    </button>
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
</style>
