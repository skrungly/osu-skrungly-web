<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import * as api from "@/api";
import { inputStateFactory } from '@/utils';
import { auth } from "@/store";

const password = inputStateFactory("");
const repeatPassword = inputStateFactory("");

async function changePassword() {
  if (password.value != repeatPassword.value) {
    repeatPassword.showError("passwords don't match");
    password.clearStyle();
    return;
  }

  repeatPassword.clearStyle();
  password.clearStyle();

  var response = await api.put(
    `/players/${auth.player.id}`, { "password": password.value }
  );

  if (response.ok) {
    password.reset()
    repeatPassword.reset()
    password.confirm()
    repeatPassword.confirm()

  // provide reasons if the password was rejected
  } else if (response.status == 422) {
    let reasons = (await response.json()).password;
    password.showError(reasons.join("\r\n"));

  } else if (response.status == 401) {
    auth.expired = true;
    auth.logout();

  // anything else is unexpected behaviour
  } else {
    password.showError(`failed to change password [${response.status}]`);
  }
}
</script>

<template>
  <section>
    <h2><FontAwesomeIcon icon="user-gear" />account settings</h2>
    <form @submit.prevent="changePassword">
      <label for="change-password">change password</label>
      <input v-model="password.value" id="change-password" type="password" :class="password.style">
      <span class="error-text" :class="{'error-text--hidden': !password.style.error}">{{ password.errorMessage }}</span>

      <label for="repeat-password">repeat password</label>
      <input v-model="repeatPassword.value" id="repeat-password" type="password" :class="repeatPassword.style">
      <span class="error-text" :class="{'error-text--hidden': !repeatPassword.style.error}">{{ repeatPassword.errorMessage }}</span>
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
