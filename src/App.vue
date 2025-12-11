<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RouterLink, RouterView } from 'vue-router'
import { ref, watch } from "vue"

import { auth } from "@/store"
import LoginModal from '@/components/LoginModal.vue'

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL;

const showLoginModal = ref(false);

auth.update();
watch(() => auth.player, () => showLoginModal.value = false);
</script>

<template>
  <div class="page">
    <header>
      <nav>
        <h1 class="highlight-text"><RouterLink to="/">osu!skrungly</RouterLink></h1>

        <div class="nav__links">
          <RouterLink to="/" active-class="nav__link--active" exact>
            <FontAwesomeIcon icon="chart-simple" />
            <span>stats!</span>
          </RouterLink>

          <RouterLink to="/players" active-class="nav__link--active">
            <FontAwesomeIcon icon="users" />
            <span>players!</span>
          </RouterLink>

          <RouterLink to="" class="nav__link--disabled" title="coming soon!">
            <FontAwesomeIcon icon="music" />
            <span>beatmaps!</span>
          </RouterLink>

          <RouterLink v-if="auth.player" :to="`/u/${auth.player.name}`" class="profile nav__link--split nav__link--active" >
            <img :src="`${AVATAR_URL}/${auth.player.id}`" />
            <span>{{ auth.player.name }}</span>
          </RouterLink>

          <button v-else @click="() => showLoginModal = true" class="nav__link--split">
            <FontAwesomeIcon icon="right-to-bracket" />
            <span>login!</span>
          </button>
        </div>
      </nav>
    </header>
    <main>
      <RouterView v-slot="{ Component }">
        <component :is="Component"/>
      </RouterView>
    </main>
    <footer>
      <a href="https://github.com/skrungly/osu-skrungly"><FontAwesomeIcon icon="code" />source</a>
      |
      <img src="https://cronitor.io/badges/1VWGlD/production/oFMDB4n4aHcqPp9uaJWugntGQ5I.svg"></img>
    </footer>

    <!-- TODO: move <div class="modal"> into the modal components? -->
    <div @click="() => showLoginModal = false" class="modal" :class="{'modal--hidden': !showLoginModal}">
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
    opacity: 45%;
  }

  .nav__link--split {
    margin-left: auto;
  }

  .nav__link--active, a:hover {
    opacity: 100%;
    transition: 0.1s;
  }

  .nav__link--disabled, a.nav__link--disabled:hover {
    opacity: 10%;
    cursor: not-allowed;
  }
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
