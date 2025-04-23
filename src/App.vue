<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <nav>
      <a href="/"><img src="@/assets/logo.svg"></a>
      <div class="nav__links">
        <a href>
          <font-awesome-icon icon="users" />
          <span>players</span>
        </a>
        <a class="nav__link--disabled" href>
          <font-awesome-icon icon="music" />
          <span>beatmaps</span>
        </a>
        <a class="nav__link--split nav__link--disabled" href>
          <font-awesome-icon icon="right-to-bracket" />
          <span>login</span>
        </a>
      </div>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
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
  max-width: 90%;
  min-height: 5rem;
  margin: 0 auto;

  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 2rem;

  svg {
    margin: 0 0.5rem;
  }
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
  width: 85rem;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;

  height: 10em;

  border-radius: 0.5rem 0.5rem 0 0;
}
</style>
