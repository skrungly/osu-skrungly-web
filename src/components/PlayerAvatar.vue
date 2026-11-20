<script setup lang="ts">
import * as api from "@/api"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL

const props = defineProps<{ player?: api.Player }>()
</script>

<template>
  <div class="avatar">
    <RouterLink v-if="player" :to="`/players/${player.name}`">
      <img :title="player.name" :src="`${AVATAR_URL}/${player.id}`"/>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
img {
  width: 100%;
  display: block;
  border-radius: var(--border-radius);
}
</style>
