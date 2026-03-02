<script setup>
import { useRoute } from "vue-router"

import TaskMonitor from "@/components/TaskMonitor.vue"

const route = useRoute()
</script>

<template>
  <div class="modal">
    <TaskMonitor :task="route.params.task"/>
  </div>
</template>
