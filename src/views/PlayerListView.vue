<script setup lang="ts">
import { ref, watch } from 'vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import * as api from '../api'
import PlayerActivityIndicator from '@/components/PlayerActivityIndicator.vue'
import PlayerAvatar from '@/components/PlayerAvatar.vue'
import Section from '@/components/Section.vue'
import GameModeRadioButtons from '@/components/GameModeRadioButtons.vue'

// chosenMode updates with user input. currentMode is what
// is currently displayed, i.e. until new mode data is fetched
const chosenMode = ref(api.GameMode.Osu)
const currentMode = ref(chosenMode.value)

const chosenSort = ref("pp")

const players = ref<api.Player[] | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function fetchPlayers() {
  loading.value = true

  const params = {
    "mode": chosenMode.value.toString(),
    "sort": chosenSort.value,
    "limit": 100,
  }

  var response = await api.get("/players", params)

  if (!response.ok) {
    errorMessage.value = `failed to fetch players [${response.status}]`;
    return
  }

  var playerList = await response.json()

  currentMode.value = chosenMode.value
  loading.value = false
  errorMessage.value = null
  if (playerList) players.value = playerList
}

watch([chosenMode, chosenSort], fetchPlayers, { immediate: true })
</script>

<template>
  <Section>
    <div class="player-page__title">
      <h2><FontAwesomeIcon icon="users" />players!</h2>
      <GameModeRadioButtons v-model="chosenMode"/>
    </div>

    <div class="player-list" :class="{'loading': loading}">
      <div class="player-info">
        <div class="player-info__rank"></div>
        <div class="player-info__avatar"></div>
        <div class="player-info__text"></div>

        <!-- not the prettiest but these buttons need revamping anyways -->
        <button @click="chosenSort = 'pp'" :class="{ 'highlight-text': chosenSort == 'pp' }">pp</button>
        <button @click="chosenSort = 'plays'" :class="{ 'highlight-text': chosenSort == 'plays' }">plays</button>
      </div>

      <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>

      <div class="player-info" v-if="players" v-for="(player, index) of players">
        <div class="player-info__rank">#{{ index + 1 }}</div>
        <PlayerAvatar :player="player" class="player-info__avatar"/>
        <div class="player-info__text">
          <div class="player-info__name">
            <RouterLink :to="`/players/${player.name}`">{{ player.name }}</RouterLink>
            <PlayerActivityIndicator :player="player" minimal/>
          </div>

          <span>
            <PlayerActivityIndicator class="player-info__secondary" :player="player"/>
          </span>
        </div>
        <div class="player-info__stat">{{ player.stats[currentMode].pp.toLocaleString() }}pp</div>
        <div class="player-info__stat">{{ player.stats[currentMode].plays.toLocaleString() }}</div>
      </div>
    </div>
  </Section>
</template>

<style lang="scss" scoped>
.player-page__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.player-list {
  display: flex;
  flex-flow: column;
  overflow: auto;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: var(--border-radius);
  padding: 0.5rem;

  a {
    color: #ffffff;
    text-decoration: none;
  }

  .player-info__stat, button {
    min-width: 5rem;
    text-align: center;
  }

  button {
    color: var(--text-colour-tertiary);
  }

  button:hover {
    color: var(--text-colour-secondary);
  }

  .player-info__rank {
    min-width: 2rem;
    text-align: center;
  }

  .player-info__text {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    min-width: 10rem;
    text-align: left;
    white-space: nowrap;
    gap: 0.25rem;
  }

  .player-info__name {
    display: flex;
    flex-flow: row;
    gap: 0.35rem;
  }

  .player-info__name a {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-info__secondary {
    color: var(--text-colour-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-info__avatar {
    width: 4rem;
    min-width: 4rem;
  }
}

@media screen and (max-width: 35em) {
  .player-page__title {
    flex-direction: column;
    gap: 1rem;
  }

  .player-info {
    padding: 0.25rem;

    .player-info__secondary {
      display: none;
    }

    .player-info__stat, button {
      max-width: 4rem;
    }

    .player-info__avatar {
      width: 2rem;
      min-width: 2rem;
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

.error-text {
  text-align: center;
  width: 100%;
}
</style>
