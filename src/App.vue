<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RouterLink, RouterView } from 'vue-router'
import { reactive, ref } from "vue"

import { fetchFromAPI, getIdentity, logoutOfAPI } from "@/api"
import LoginModal from '@/components/LoginModal.vue'
import AccountModal from '@/components/AccountModal.vue'

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const currentUser = ref(null)
const loginModalState = reactive({ "modal--hidden": true })
const accountModalState = reactive({ "modal--hidden": true })

async function updateLogin() {
  const identity = await getIdentity()
  if (identity === null) return

  currentUser.value = await fetchFromAPI(`/players/${identity}`)
  loginModalState["modal--hidden"] = true
}

async function logout() {
  logoutOfAPI()
  currentUser.value = null
  accountModalState["modal--hidden"] = true
}

updateLogin()
</script>

<template>
  <div class="page">
    <header>
      <nav>
        <h1 class="highlight-text"><RouterLink to="/">osu!skrungly</RouterLink></h1>
        <div class="nav__links">
          <RouterLink to="/players">
            <FontAwesomeIcon icon="users" />
            <span>players!</span>
          </RouterLink>

          <RouterLink class="nav__link--disabled" to="">
            <FontAwesomeIcon icon="music" />
            <span>beatmaps!</span>
          </RouterLink>

          <button v-if="currentUser"
            @click="() => accountModalState['modal--hidden'] = false"
            class="profile nav__link--split"
          >
            <img :src="`${AVATAR_URL}/${currentUser.id}`" />
            <span>{{ currentUser.name }}</span>
          </button>

          <button v-else
            @click="() => loginModalState['modal--hidden'] = false"
            class="nav__link--split"
          >
            <FontAwesomeIcon icon="right-to-bracket" />
            <span>login!</span>
          </button>
        </div>
      </nav>
    </header>
    <main>
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :currentUser="currentUser"
        />
      </RouterView>
    </main>
    <footer>
      <a href="https://github.com/skrungly/osu-skrungly"><FontAwesomeIcon icon="code" />source</a>
      |
      <img src="https://cronitor.io/badges/1VWGlD/production/oFMDB4n4aHcqPp9uaJWugntGQ5I.svg"></img>
    </footer>

    <!-- TODO: move <div class="modal" into the modal components? -->
    <div @click="() => loginModalState['modal--hidden'] = true" class="modal" :class="loginModalState">
      <LoginModal
        v-on:click.stop
        @login="updateLogin"
      />
    </div>

    <div v-if="currentUser" @click="() => accountModalState['modal--hidden'] = true" class="modal" :class="accountModalState">
      <AccountModal
        v-on:click.stop
        @logout="logout"
        @close="() => accountModalState['modal--hidden'] = true"
        :currentUser="currentUser"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  min-height: var(--header-height);
  font-size: 1.25rem;
  background-color: var(--block-bg-colour);

  a {
    padding: var(--button-padding);
    text-decoration: none;
    color: #ffffff;
  }

  h1 {
    font-size: 2rem;
  }
}

nav {
  width: var(--content-width);
  max-width: calc(100vw - 2 * var(--section-padding));
  min-height: var(--header-height);
  margin: 0 auto;

  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 2rem;
}

.nav__links {
  display: flex;
  flex-flow: row;
  gap: 2rem;

  flex-grow: 1;
  align-items: center;

  a {
    cursor: pointer;
  }

  .nav__link--split {
    margin-left: auto;
  }
}

.nav__link--disabled {
  color: #ffffff40;
  cursor: not-allowed;
}

@media screen and (max-width: 50em) {
  .nav__links {
    justify-content: space-around;
    gap: 1.5rem;

    span {
      display: none;
    }

    .nav__link--split {
      margin-left: 0;
    }
  }
}

@media screen and (max-width: 35em) {
  header {
    padding: var(--section-padding);
  }

  nav {
    flex-flow: column;
    gap: 0;
  }

  .nav__links {
    align-self: stretch;
    justify-content: center;
  }
}

main {
  display: flex;
  flex-direction: column;
  gap: var(--section-margin);
  flex-grow: 1;

  margin: var(--section-margin) auto;
  width: var(--content-width);
  max-width: calc(100vw - 2 * var(--section-margin));
}

footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  color: #ffffff80;

  min-height: var(--header-height);
  background-color: var(--block-bg-colour);
}

.profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;

  img {
    height: 3rem;
    border-radius: var(--border-radius)
  }
}
</style>
