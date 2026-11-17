<script setup lang="ts">
import * as api from "@/api"
import { timeAgo } from "@/utils"
import { computed } from "vue"

const props = defineProps<{
  player: api.Player,
  minimal?: boolean,
}>()

function getLastSeen(player: api.Player) {
  return new Date(player.latest_activity * 1000)
}

const activityStyle = computed(() => ({
  'activity--online': props.player.online
}))
</script>

<template>
  <span :title="getLastSeen(player).toLocaleString()" class="activity" :class="activityStyle">
    <span v-if="minimal" class="activity--minimal">●</span>
    <span v-else>
      <span v-if="player.online">
        online!
      </span>
      <span v-else>
        last seen {{ timeAgo.format(getLastSeen(player)) }}
      </span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.activity {
  color: var(--text-colour-tertiary);
  opacity: 80%;
}

.activity--online {
  color: var(--text-colour-confirm);
}

.activity--idle {
  color: var(--text-colour-warning);
}

.activity--minimal {
  user-select: none;
  cursor: default;
}
</style>
