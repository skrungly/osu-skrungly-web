<script setup>
import { ref } from "vue";

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as api from "@/api";
import { auth } from "@/store";

const password = ref("");
const repeatPassword = ref("");

const passwordStyle = ref({});
const repeatStyle = ref({});

async function changePassword() {
  if (password.value != repeatPassword.value) {
    passwordStyle.value = {};
    repeatStyle.value = { error: true };
    return;
  }

  repeatStyle.value = {}

  const response = await api.put(
    `/players/${auth.player.id}`, {
      "password": password.value
    }
  );

  if (response.ok) {
    passwordStyle.value = { confirm: true };
    repeatStyle.value = { confirm: true };
  } else {
    passwordStyle.value = { error: true };
  }
}
</script>

<template>
  <section>
    <h2><FontAwesomeIcon icon="user-gear" />account settings</h2>
    <form @submit.prevent="changePassword">
      <label for="change-password">change password</label>
      <input v-model="password" id="change-password" type="password" :class="passwordStyle">

      <label for="repeat-password">repeat password</label>
      <input v-model="repeatPassword" id="repeat-password" type="password" :class="repeatStyle">
    </form>

    <div class="account-buttons">
      <button @click="auth.logout()" class="error">logout</button>
      <button @click="changePassword" class="confirm">save</button>
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
