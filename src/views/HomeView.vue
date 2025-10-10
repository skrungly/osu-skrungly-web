<script setup>
import { onMounted, ref } from "vue"

import * as api from "@/api"

const AVATAR_URL = import.meta.env.VITE_AVATAR_URL
const GLOBAL_STATS = {
  pp: "pp",
  plays: "plays",
  total_hits: "notes hit",
  tscore: "total score",
}

const errorMessage = ref(null)
const stats = ref(null)

onMounted(async () => {
  errorMessage.value = null;

  var response = await api.get("/stats");

  if (!response.ok) {
    errorMessage.value = `failed to fetch global stats [${response.status}]`;
    return;
  }

  stats.value = await response.json();
})
</script>

<template>
  <section v-if="stats || errorMessage" class="container">
    <span v-if="errorMessage" class="error-text">{{ errorMessage }}</span>

    <div v-if="stats" v-for="[stat, name] in Object.entries(GLOBAL_STATS)" class="stats">
      <span class="stats__name">global {{ name }}</span>
      <span class="stats__value">{{ stats[stat].toLocaleString() }}</span>
    </div>
  </section>
  <section>
    <h2>welcome!</h2>
    <p>
      <img class="dev-avatar" :src="`${AVATAR_URL}/3`" />
      hey :D this is the brand new website for our private skrungly osu! server.
      you can look around to see a number of planned features that haven't been
      implemented yet, but i've decided to release this site for early feedback
      and testing now that it has <i>almost</i> enough functionality to replace
      the old one. changing your user details will be introduced alongside a
      login system, but if you want anything changed in the meantime then just
      let me know! ­-&nbsp;kingsley
    </p>
  </section>
</template>

<style scoped>
.dev-avatar {
  margin: 0 1rem 1rem 0;
  float: left;
  width: 4rem;
  border-radius: var(--border-radius);
}
</style>
