<script setup>
const props = defineProps(["score", "rank"])

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

function getModString() {
  const mods = []

  for (const [mod, flag] of Object.entries(MOD_FLAGS)) {
    if (props.score.mods & flag) {
      mods.push(mod)
    }
  }

  if (mods.length == 0) {
    return ""
  }

  return "+" + mods.join("")
}

const modString = getModString()
</script>

<template>
  <div class="score">
    <div class="score__thumbnail">
      <img :src="`https://b.ppy.sh/thumb/${score.beatmap.set_id}l.jpg`" />
      <div v-if="rank" class="score__rank">#{{ rank }}</div>
      <div class="score__result" :data-grade="score.grade">
        <span>{{ score.acc.toFixed(2) }}%</span>
      </div>
    </div>
    <div class="score__info">
      <div class="score__info-line">
        <a class="score__title score__info--truncate" :href="`https://osu.ppy.sh/beatmapsets/${score.beatmap.set_id}`">{{ score.beatmap.title }}</a>
        <span class="score__info--secondary score__info--truncate">by {{ score.beatmap.artist }}</span>
      </div>
      <div class="score__info-line">
        <span class="score__diff">
          [<span class="score__info--truncate">{{ score.beatmap.version }}</span>]
        </span>
        <span class="score__mods score__info--secondary">{{ modString }}</span>
      </div>
      <div class="score__info--secondary score__info--truncate">
        played {{ new Date(Date.parse(score.play_time)).toLocaleDateString() }}
      </div>
    </div>
    <div class="score__pp">
      {{ score.pp.toFixed(0).toLocaleString() }}pp
      <div v-if="rank" class="score__info--secondary">
        weighted {{ (score.pp * 0.95 ** (rank - 1)).toFixed(0) }}pp
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.score {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.score__thumbnail {
  position: relative;
  flex-shrink: 0;
  display: block;
  width: 4rem;
  height: 4rem;

  img {
    width: 100%;
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

  .score__result {
    display: flex;
    justify-content: center;

    height: calc(1rem - 1px);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    border-top: 1px solid #000000;

    span {
      margin-top: -1px;
      text-shadow: 0 0 4px #000000;
      font-size: 0.75rem;
    }
  }

  .score__result[data-grade="SH"], .score__result[data-grade="XH"] {
    background-image: linear-gradient(30deg, #494949e0 0%, #afafafe0 100%);
  }

  .score__result[data-grade="X"] {
    background-image: linear-gradient(30deg, #ccb202e0 0%, #cc7b12 100%);
  }

  .score__result[data-grade="S"] {
    background-image: linear-gradient(30deg, #cc2a19e0 0%, #cc9635e0 100%);
  }

  .score__result[data-grade="A"] {
    background-image: linear-gradient(30deg, #186600e0 0%, #5bbf0be0 100%);
  }

  .score__result[data-grade="B"] {
    background-image: linear-gradient(30deg, #103fb1e0 0%, #026af3e0 100%);
  }

  .score__result[data-grade="C"] {
    background-image: linear-gradient(30deg, #8316cbe0 0%, #d217e5e0 100%);
  }

  .score__result[data-grade="D"] {
    background-image: linear-gradient(30deg, #89000be0 0%, #e20012e0 100%);
  }
}

.score:hover .score__rank {
  opacity: 100%;
  transition: opacity 0.25s;
}

.score__info {
  flex-grow: 1;
  overflow: hidden;

  .score__info-line {
    overflow: hidden;
    display: flex;
    gap: 0.25rem;
    align-items: last baseline;
    min-width: 0;
  }

  .score__info--truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex-shrink: 2;
    min-width: 0;
  }

  .score__title {
    font-size: 1.25rem;
    flex-shrink: 1;
  }

  .score__diff {
    min-width: 0;
    display: flex;
  }
}

.score__info--secondary {
  font-size: 0.9rem;
  opacity: 60%;
}

.score__pp {
  text-align: right;
  align-self: center;
}

@media screen and (max-width: 35em) {
  .score__pp .score__info--secondary {
    display: none;
  }
}

</style>
