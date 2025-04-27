<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="page">
    <header>
      <nav>
        <RouterLink to="/"><img src="@/assets/logo.svg"></RouterLink>
        <div class="nav__links">
          <RouterLink to="/players">
            <FontAwesomeIcon icon="users" />
            <span>players!</span>
          </RouterLink>
          <RouterLink class="nav__link--disabled" to="">
            <FontAwesomeIcon icon="music" />
            <span>beatmaps!</span>
          </RouterLink>
          <RouterLink class="nav__link--split nav__link--disabled" to="">
            <FontAwesomeIcon icon="right-to-bracket" />
            <span>login!</span>
          </RouterLink>
        </div>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
    <footer>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  min-height: 5rem;
  font-size: 1.25rem;
  background-color: #00000020;

  a {
    padding: 0.5rem;
    text-decoration: none;
    color: #ffffff;
  }

  img {
    margin-top: 0.25rem;
  }
}

nav {
  width: 85rem;
  max-width: calc(100vw - 2rem);
  min-height: 5rem;
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
    padding: 0.75rem;
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
  gap: 1rem;
  flex-grow: 1;

  margin: 1rem auto;
  width: 85rem;
  max-width: calc(100vw - 2rem);
}

footer {
  min-height: 5rem;
  background-color: #00000020;
}
</style>
