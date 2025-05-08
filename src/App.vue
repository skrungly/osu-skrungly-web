<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RouterLink, RouterView } from 'vue-router'
import { reactive, ref } from "vue"

import LoginModal from '@/components/LoginModal.vue'

const hideLogin = ref(true)
const modalStyle = reactive({
  "modal--hidden": hideLogin
})
</script>

<template>
  <div class="page">
    <header>
      <nav>
        <h1 class="main-title"><RouterLink to="/">osu!skrungly</RouterLink></h1>
        <div class="nav__links">
          <RouterLink to="/players">
            <FontAwesomeIcon icon="users" />
            <span>players!</span>
          </RouterLink>
          <RouterLink class="nav__link--disabled" to="">
            <FontAwesomeIcon icon="music" />
            <span>beatmaps!</span>
          </RouterLink>
          <a @click="() => hideLogin = false" class="nav__link--split">
            <FontAwesomeIcon icon="right-to-bracket" />
            <span>login!</span>
          </a>
        </div>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
    <footer>
      <a href="https://github.com/skrungly/osu-skrungly"><FontAwesomeIcon icon="code" />source</a>
      |
      <img src="https://cronitor.io/badges/1VWGlD/production/oFMDB4n4aHcqPp9uaJWugntGQ5I.svg"></img>
    </footer>
    <div @click="() => hideLogin = true" class="modal" :class="modalStyle">
      <LoginModal v-on:click.stop />
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
    background-color: #ffffff00;
    background-image: linear-gradient(30deg, #ffff00 -20%, #ff00ff 135%);
    background-size: 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -moz-background-clip: text;
    -webkit-text-fill-color: transparent;
    -moz-text-fill-color: transparent;
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

    a span {
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
    gap: 1.5rem;
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
</style>
