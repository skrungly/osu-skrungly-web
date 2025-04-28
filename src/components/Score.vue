<script setup>
const props = defineProps(["score", "rank"])

</script>

<template>
  <div class="score">
    <div class="score__thumbnail">
      <img :src="'https://b.ppy.sh/thumb/' + props.score.beatmap.set_id + 'l.jpg'" />
      <span class="score__rank" v-if="props.rank">#{{ props.rank }}</span>
    </div>
    <div class="score__map-info">
      <span class="score__title">{{ props.score.beatmap.title }}</span>
      <span class="score__subtitle">by {{ props.score.beatmap.artist }}</span>
      <span class="score__subtitle">played {{ new Date(Date.parse(props.score.play_time)).toLocaleDateString() }}</span>
    </div>
    <div class="score__stat">{{ props.score.grade }}</div>
    <div class="score__stat">{{ props.score.acc.toFixed(2) }}%</div>
    <div class="score__stat score__pp">{{ props.score.pp.toFixed(0).toLocaleString() }}pp</div>
  </div>
</template>

<style lang="scss">
.score {
  display: flex;
  gap: 0.5rem;
}

.score:hover .score__rank {
  opacity: 100%;
}

.score__thumbnail {
  position: relative;

  img {
    height: 4rem;
    width: calc(4rem * 4 / 3);
    vertical-align: bottom;
    border-radius: var(--border-radius);
  }

  .score__rank {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    text-align: center;
    font-size: 1.5rem;
    text-shadow: 0 0 0.5rem #000000;
    cursor: default;

    opacity: 0;
    background-color: #00000080;
    transition: opacity 0.25s;
    border-radius: var(--border-radius);
  }
}

.score__map-info {
  flex-basis: 0;
  min-width: 0;
  flex-grow: 1;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .score__title {
    display: block;
    font-size: 1.25rem;
  }

  .score__subtitle {
    display: block;
    font-size: 0.9rem;
    opacity: 40%;
  }
}

.score__stat {
  min-width: 5rem;
  text-align: center;
  align-self: center;
}

.score__pp {
  font-size: 1.25rem;
}
</style>
