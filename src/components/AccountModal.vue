<script setup>
import { reactive, ref, toRef } from "vue";

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as api from "@/api";

const props = defineProps(["currentUser"])
const currentUser = toRef(props, "currentUser")

const emit = defineEmits(["logout", "close"])

const password = ref("")
const passwordState = reactive({
  error: false,
  confirm: false
})

const confirmPassword = ref("")
const confirmState = reactive({
  error: false,
  confirm: false
})

async function changePassword() {
  if (password.value != confirmPassword.value) {
    confirmState.error = true
    return
  }

  confirmState.error = false

  const response = await api.put(
    `/players/${currentUser.value.id}`, {
      "password": password.value
    }
  );

  if (response.ok) {
    passwordState.confirm = true
    passwordState.error = false
    confirmState.confirm = true
  } else {
    passwordState.error = true
    passwordState.confirm = false
  }
}
</script>

<template>
  <section>
    <h2><FontAwesomeIcon icon="user-gear" />account settings</h2>
    <form @submit.prevent="changePassword">
      <label for="change-password">change password</label>
      <input v-model="password" id="change-password" type="password" :class="passwordState">

      <label for="confirm-password">confirm password</label>
      <input v-model="confirmPassword" id="confirm-password" type="password" :class="confirmState">
    </form>

    <div class="account-buttons">
      <button @click="changePassword" class="confirm">save</button>
      <button @click="() => emit('logout')" class="error">logout</button>
    </div>
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

.account-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
</style>
