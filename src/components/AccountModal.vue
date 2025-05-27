<script setup>
import { reactive, ref, toRef } from "vue"

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { putUserEdits } from "@/api"

const emit = defineEmits(["logout"])

const password = ref("")
const passwordState = reactive({
  "error": false,
  "confirm": false
})

async function changePassword() {
  const response = await putUserEdits({ "password": password.value })

  if (response.ok) {
    passwordState["confirm"] = true
    passwordState["error"] = false
  } else {
    passwordState["error"] = true
    passwordState["confirm"] = false
  }
}
</script>

<template>
  <section>
    <h2><FontAwesomeIcon icon="user-gear" />account settings</h2>
    <form @submit.prevent="changePassword">
      <label for="change-password">change password</label>
      <input v-model="password" id="change-password" type="password" :class="passwordState">
      <button class="highlight-button" type="submit">save</button>
    </form>
    <button @click="() => emit('logout')" class="error">logout</button>
  </section>
</template>

<style lang="scss" scoped>
section {
  width: 18rem;
  box-shadow: 0 2px 16px #00000020;
  text-align: center;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
