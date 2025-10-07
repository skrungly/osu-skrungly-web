<script setup>
import { reactive, ref, watch } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import * as api from '../api'
import RadioButton from '@/components/RadioButton.vue'

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL
const GAME_MODES = ["osu!", "taiko", "catch", "mania", "relax"]
const SORT_MODES = ["pp", "plays"]

// the current user identity is passed to all router views,
// even though it's not used in some (like in this case).
defineProps(["currentUser"])

const chosenMode = ref(0)
const chosenSort = ref("pp")

const players = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchPlayers() {
  loading.value = true
  error.value = null

  const params = {
    "mode": chosenMode.value,
    "sort": chosenSort.value,
    "limit": 100,
  }

  var response = await api.get("/players", params)

  if (!response.ok) {
    error.value = response.statusText;
  }

  var playerList = await response.json()

  loading.value = false
  if (playerList) players.value = playerList
}

const loadingStyle = reactive({ "loading": loading })

watch([chosenMode, chosenSort], fetchPlayers, { immediate: true })
</script>

<template>
  <div v-if="error" class="message message--error">
    oops :( an error occurred while fetching player list. <span class="error-text">[{{ error }}]</span>
  </div>
  <section>
    <div class="player-page__title">
      <h2><FontAwesomeIcon icon="users" />players!</h2>
      <div>
        <RadioButton
          v-for="(mode, index) of GAME_MODES"
          :state="chosenMode"
          :option="index"
          :content="mode"
          @click="() => chosenMode = index"
        />
      </div>
    </div>
    <div class="player-list" :class="loadingStyle">
      <div class="player-info">
        <!-- this is just the table header of sorts -->
        <div class="player-info__rank"></div>
        <div class="player-info__avatar"></div>
        <div class="player-info__name"></div>
        <RadioButton
          v-for="sort of SORT_MODES"
          :state="chosenSort"
          :option="sort"
          :content="sort"
          @click="() => chosenSort = sort"
        />
      </div>
      <div class="player-info" v-if="players" v-for="(player, index) of players">
        <div class="player-info__rank">#{{ index + 1 }}</div>
        <div class="player-info__avatar">
          <img :src="`${AVATAR_URL}/${player.id}`" />
        </div>
        <div class="player-info__name">
          <RouterLink :to="'/u/' + player.name">{{ player.name }}</RouterLink>
        </div>
        <div class="player-info__stat">{{ player.pp.toLocaleString() }}pp</div>
        <div class="player-info__stat">{{ player.plays.toLocaleString() }}</div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.player-page__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.player-list {
  display: flex;
  flex-flow: column;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 0.5rem;
  padding: 0.5rem;

  a {
    color: #ffffff;
    text-decoration: none;
  }

  .player-info__stat, button {
    min-width: 5rem;
    text-align: center;
  }

  .player-info__rank {
    min-width: 2rem;
    text-align: center;
  }

  .player-info__name {
    min-width: 0rem;
    flex-grow: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-info__avatar {
    max-width: 4rem;

    img {
      width: 100%;
      display: block;
      border-radius: var(--border-radius);
    }
  }
}

@media screen and (max-width: 35em) {
  .player-page__title {
    flex-direction: column;
    gap: 1rem;
  }

  .player-info {
    padding: 0.25rem;

    .player-info__stat:last-of-type, button:last-of-type {
      display: none;
    }

    .player-info__stat, button {
      min-width: 4rem;
    }

    .player-info__avatar {
      max-width: 2rem;
    }
  }
}

.player-info:hover {
  background-color: #ffffff04;
  transition: 0.25s;
}

.player-info:first-of-type:hover {
  background-color: inherit;
}
</style>
