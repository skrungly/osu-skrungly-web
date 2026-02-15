<script setup>
import { timeAgo } from "../utils"

const props = defineProps(["map", "score", "rank", "showPlayer"])

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const MOD_FLAGS = {
  // NOMOD: 0,
  "NF": 1 << 0,
  "EZ": 1 << 1,
  "TS": 1 << 2,
  "HD": 1 << 3,
  "HR": 1 << 4,
  "SD": 1 << 5,
  "DT": 1 << 6,
  // RELAX: 1 << 7,
  "HT": 1 << 8,
  "NC": 1 << 9,
  "FL": 1 << 10,
  // AUTO: 1 << 11,
  "SO": 1 << 12,
  "AP": 1 << 13,
  "PF": 1 << 14,
  "4K": 1 << 15,
  "5K": 1 << 16,
  "6K": 1 << 17,
  "7K": 1 << 18,
  "8K": 1 << 19,
  "FI": 1 << 20,
  // RANDOM: 1 << 21,
  // CINEMA: 1 << 22,
  // TARGET: 1 << 23,
  "9K": 1 << 24,
  // KEYCOOP: 1 << 25,
  "1K": 1 << 26,
  "3K": 1 << 27,
  "2K": 1 << 28,
  "V2": 1 << 29,
  "MR": 1 << 30
}

const DIFFICULTY_HUES = [
  [0.1, 215],
  [1.2, 201],
  [2.0, 166],
  [2.5, 105],
  [3.3, 80],
  [4.2, 40],
  [4.9, -11],
  [5.8, -53],
  [6.7, -79],
  [7.7, -109],
]

function getPlayTime(score) {
  return new Date(Date.parse(score.play_time));
}

function mapDifficultyStyle(diffValue) {
  var firstColour = "hsl(0, 0%, 0%)";
  var secondColour = firstColour;

  // keep note of the previous values for colour interpolation
  var prevThreshold = 0;
  var prevHue = 215;
  for (const [threshold, diffHue] of DIFFICULTY_HUES) {
    if (diffValue < threshold) {
      const darkness = diffValue ** 2 / 2;

      const interval = (diffValue - prevThreshold) / (threshold - prevThreshold);
      const hue = prevHue + interval * (diffHue - prevHue);

      firstColour = `hsl(${hue}, 100%, ${35 - darkness}%)`;
      secondColour = `hsl(${hue}, 100%, ${50 - darkness}%)`;
      break
    }

    prevThreshold = threshold;
    prevHue = diffHue;
  }

  return {
    "background-image": `linear-gradient(30deg, ${firstColour} 0%, ${secondColour} 100%)`
  }
}

function getModString(mods_value) {
  const mods = []

  for (const [mod, flag] of Object.entries(MOD_FLAGS)) {
    if (mods_value & flag) {
      mods.push(mod)
    }
  }

  if (mods.length == 0) {
    return ""
  }

  return "+" + mods.join("")
}
</script>

<template>
  <div class="map">
    <a v-if="showPlayer" :href="`/u/${score.player.name}`" class="player-avatar">
      <img :title="score.player.name" :src="`${AVATAR_URL}/${score.player.id}`">
    </a>

    <div class="map__thumbnail">
      <img :src="`https://b.ppy.sh/thumb/${map.set_id}l.jpg`" />

      <div v-if="rank" class="score__rank">#{{ rank }}</div>

      <div v-if="score" class="map__thumbnail-text score__grade" :data-grade="score.grade">
        <span>{{ score.acc.toFixed(2) }}%</span>
      </div>

      <div v-else class="map__thumbnail-text" :style="mapDifficultyStyle(map.diff)">
        <span>{{ map.diff.toFixed(2) }}&starf;</span>
      </div>
    </div>

    <div class="map__info">
      <div class="map__info-line">
        <a class="map__title map__info--truncate" :href="`https://osu.ppy.sh/beatmapsets/${map.set_id}`">{{ map.title }}</a>
        <span class="map__info--secondary map__info--truncate">by {{ map.artist }}</span>
      </div>

      <div class="map__info-line">
        <span class="map__diff-name">
          [<span class="map__info--truncate">{{ map.version }}</span>]
        </span>
        <span v-if="score" class="map__info--secondary">{{ getModString(score.mods) }}</span>
      </div>

      <div v-if="score" :title="getPlayTime(score).toLocaleString()" class="map__info--secondary map__info--truncate">
        played {{ timeAgo.format(getPlayTime(score)) }}
      </div>

      <div v-else class="map__info--secondary map__info--truncate">
        <!-- standard and catch map info (happens to be the same) -->
        <span v-if="map.mode == 0 || map.mode == 2">
          CS{{ map.cs }} AR{{ map.ar }} OD{{ map.od }} HP{{ map.hp }}
        </span>

        <!-- taiko map info -->
        <span v-else="map.mode == 1">
          OD{{ map.od }} HP{{ map.hp }}
        </span>

        <!-- mania map info -->
        <span v-else="map.mode == 3">
          {{ map.cs }}K OD{{ map.od }} HP{{ map.hp }}
        </span>

        @ {{ map.bpm.toFixed(0) }}bpm
      </div>
    </div>

    <div class="map__extra-info">
      <div v-if="score">
        {{ score.pp.toFixed(0).toLocaleString() }}pp
        <div v-if="rank" class="map__info--secondary">
          weighted {{ (score.pp * 0.95 ** (rank - 1)).toFixed(0) }}pp
        </div>
      </div>

      <div v-else-if="map.popularity">
        {{ map.popularity }} players
        <div class="map__info--secondary">
          with {{ map.passes }} scores
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
  height: 4rem;
}

.player-avatar {
  height: 100%;
  max-width: 4rem;

  img {
    max-height: 100%;
    border-radius: var(--border-radius);
  }
}

.map__thumbnail {
  position: relative;
  flex-shrink: 0;
  display: block;
  height: 100%;

  img {
    height: 75%;
    vertical-align: bottom;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  .score__rank {
    position: absolute;
    top: 0;
    width: 100%;
    height: 75%;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: #00000080;
    border-radius: var(--border-radius) var(--border-radius) 0 0;

    font-size: 1.25rem;
    font-weight: bold;
    text-shadow: 0 0 4px #000000;

    opacity: 0;
  }

  .map__thumbnail-text {
    display: flex;
    justify-content: center;
    align-items: center;

    height: calc(25% - 1px);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    border-top: 1px solid #000000;
    font-size: 0.75rem;
    text-shadow: 0 0 4px #000000;
  }

  .map__thumbnail-text[data-grade="SH"], .map__thumbnail-text[data-grade="XH"] {
    background-image: linear-gradient(30deg, #494949e0 0%, #afafafe0 100%);
  }

  .map__thumbnail-text[data-grade="X"] {
    background-image: linear-gradient(30deg, #ccb202e0 0%, #cc7b12e0 100%);
  }

  .map__thumbnail-text[data-grade="S"] {
    background-image: linear-gradient(30deg, #cc2a19e0 0%, #cc9635e0 100%);
  }

  .map__thumbnail-text[data-grade="A"] {
    background-image: linear-gradient(30deg, #186600e0 0%, #5bbf0be0 100%);
  }

  .map__thumbnail-text[data-grade="B"] {
    background-image: linear-gradient(30deg, #103fb1e0 0%, #026af3e0 100%);
  }

  .map__thumbnail-text[data-grade="C"] {
    background-image: linear-gradient(30deg, #8316cbe0 0%, #d217e5e0 100%);
  }

  .map__thumbnail-text[data-grade="D"] {
    background-image: linear-gradient(30deg, #89000be0 0%, #e20012e0 100%);
  }
}

.map:hover .score__rank {
  opacity: 100%;
  transition: opacity 0.25s;
}

.map__info {
  flex-grow: 1;
  overflow: hidden;

  .map__info-line {
    overflow: hidden;
    display: flex;
    gap: 0.25rem;
    align-items: last baseline;
    min-width: 0;
  }

  .map__info--truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex-shrink: 2;
    min-width: 0;
  }

  .map__title {
    font-size: 1.25rem;
    flex-shrink: 1;
  }

  .map__diff-name {
    min-width: 0;
    display: flex;
  }
}

.map__info--secondary {
  font-size: 0.9rem;
  opacity: 60%;
}

.map__extra-info {
  text-align: right;
  align-self: center;
  font-size: 1.25rem;
}

.player-info {
  max-width: 4rem;
}

@media screen and (max-width: 35em) {
  .map__extra-info .map__info--secondary {
    display: none;
  }
}
</style>
