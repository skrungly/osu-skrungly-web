<script setup lang="ts">
import { getModString, Score, SCORE_GRADES } from "@/api"
import PlayerAvatar from "./PlayerAvatar.vue"
import { timeAgo } from "@/utils.js"
import { computed } from "vue";
import ScoreRankingOverlay from "./ScoreRankingOverlay.vue"

const props = defineProps<{
  score: Score
  rank: number | null
}>()

const playedAt = computed(() => (
  timeAgo.format(new Date(Date.parse(props.score.play_time)))
))
</script>

<template>
  <div class="score">
    <div class="score__avatar">
      <PlayerAvatar :player="score.player"/>
      <ScoreRankingOverlay v-if="rank" :ranking="rank" class="score__rank">#{{ rank }}</ScoreRankingOverlay>
    </div>

    <div class="score-info">
      <div>
        <RouterLink :to="`/players/${score.player.name}`" class="score-info__player">{{ score.player.name }}</RouterLink>
        &nbsp;
        <span class="score-info--secondary">{{ getModString(score.mods) }}</span>
      </div>

      <div class="score-info__stats">
        <span class="score-info__grade" :data-grade="score.grade">{{ SCORE_GRADES[score.grade] }}</span>
        &middot;
        <span class="score-info--secondary">{{ score.score.toLocaleString() }}</span>
        &middot;
        <span class="score-info--secondary">{{ score.acc.toFixed(2).toLocaleString() }}%</span>
        &middot;
        <span class="score-info--secondary" :class="{ 'highlight-text': score.perfect }">
          {{ score.max_combo.toLocaleString() }}x
        </span>
        &middot;
        <span class="score-info--secondary">{{ score.pp.toFixed(0).toLocaleString() }}pp</span>
      </div>

      <span class="score-info--tertiary"> played {{ playedAt }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.score {
  display: inline-flex;

  flex-flow: row;
  align-items: center;

  gap: 1rem;
  white-space: nowrap;
  padding: 0.5rem;
  height: 4rem;

  border-radius: var(--border-radius);
}

.score__avatar {
  position: relative;
  height: 100%;
  aspect-ratio: 1;
}

.score__rank {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius);
}

.score:hover .score__rank {
  opacity: 100%;
}

.score-info {
  display: flex;
  flex-flow: column;
  font-size: 0.9rem;
}

.score-info__stats {
  color: var(--text-colour-tertiary);
}

.score-info__grade[data-grade="SH"],
.score-info__grade[data-grade="XH"] { color: #d0d0d0; }
.score-info__grade[data-grade="X"] { color: #ccb202; }
.score-info__grade[data-grade="S"] { color: #cca035; }
.score-info__grade[data-grade="A"] { color: #5bbf0b; }
.score-info__grade[data-grade="B"] { color: #026af3; }
.score-info__grade[data-grade="C"] { color: #d217e5; }
.score-info__grade[data-grade="D"] { color: #e20012; }

.score-info__player {
  font-size: 1.25rem;
}

.score-info--secondary {
  color: var(--text-colour-secondary);
}

.score-info--secondary.highlight-text {
  opacity: 90%;
}

.score-info--tertiary {
  color: var(--text-colour-tertiary);
}

.score:hover {
  background-color: #ffffff04;
}

@media screen and (max-width: 35em) {
  .score {
    height: 2rem;
    gap: 0.75rem;
    padding: 0.25rem;
  }

  .score-info__player {
    font-size: 1rem;
  }

  .score-info__stats {
    font-size: 0.8rem;
  }

  .score-info--tertiary {
    display: none;
  }
}
</style>
