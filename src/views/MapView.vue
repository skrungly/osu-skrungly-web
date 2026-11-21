<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import * as api from "@/api"

const route = useRoute()
const router = useRouter()

async function redirectToMapset() {
  const response = await api.get(`/maps/${route.params.id}`)

  if (!response.ok) {
    return
  }

  const mapInfo: api.Beatmap = await response.json()

  router.replace(`/mapsets/${mapInfo.set_id}#${route.params.id}`)
}

redirectToMapset()
</script>

<template></template>
