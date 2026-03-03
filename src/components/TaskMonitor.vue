<script setup>
import { onMounted, onUnmounted, ref } from "vue"
import * as api from "@/api"

const props = defineProps(["task"])

const UPDATE_INTERVAL_MS = 500
let intervalId = null

const taskState = ref({})
const taskStyle = ref({})

async function updateTaskState() {
  const response = await api.get(`/tasks/${props.task}`)

  if (!response.ok) {
    taskState.value.status = `unknown error while fetching task status [${response.status}]`
    taskStyle.value = { error: true }
    clearInterval(intervalId)
    return
  }

  taskState.value = await response.json()

  if (taskState.value.state == "SUCCESS") {
    taskStyle.value = { confirm: true }
    taskState.value.status += "!"
    document.getElementById("download").click()
    clearInterval(intervalId)

  } else if (taskState.value.state == "FAILURE") {
    taskStyle.value = { error: true }
    clearInterval(intervalId)

  } else {
    taskState.value.status += "..."
  }
}

function startInterval() {
  updateTaskState()
  intervalId = setInterval(updateTaskState, UPDATE_INTERVAL_MS)
}

onMounted(startInterval)
onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <section class="task" :class="taskStyle">
    <label for="progress">{{ taskState.status }}</label>
    <progress
      v-if="!taskStyle.error"
      id="progress"
      :max="taskState ? taskState.total : 1"
      :value="taskState ? taskState.current : 0"
    />

    <span class="task__info">your download will start automatically</span>
  </section>

  <a id="download" v-if="taskState.result" :href="taskState.result">
    <button class="highlight-button">download</button>
  </a>
</template>

<style lang="scss" scoped>
.task {
  display: flex;
  flex-flow: column;
  align-items: center;
  width: 25rem;
}

.task__info {
  color: var(--text-colour-tertiary);
  font-size: 0.75rem;
}

progress {
  margin: 0.5rem;
  width: 100%;
}

</style>
