<script setup lang="ts">
import { toRef } from 'vue'

const props = defineProps<{
  bannerSrc?: string
  fallbackSrc?: string
  allowFullWidth?: boolean
}>()

const bannerSrc = toRef(props, "bannerSrc")
</script>

<template>
  <section class="card section" :class="{ 'section--full-width': allowFullWidth }">
    <div v-if="bannerSrc || fallbackSrc" class="banner">
      <img v-if="fallbackSrc" :src="fallbackSrc" class="banner__image"/>

      <Transition name="banner">
        <img v-if="bannerSrc" key="bannerSrc" :src="bannerSrc" class="banner__image"/>
      </Transition>

      <div class="banner__content">
        <slot name="banner"></slot>
      </div>
    </div>

    <slot></slot>
  </section>
</template>

<style lang="scss" scoped>
.section {
  padding: calc(var(--section-padding) - var(--section-border-width));
  overflow: scroll;
  margin: 0 var(--section-margin);
}

.banner {
  position: relative;
  margin: calc(-1 * var(--section-padding) - 1px);
  margin-bottom: 0;

  width: calc(100% + 2 * var(--section-padding));
  aspect-ratio: var(--section-banner-aspect);

  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.banner__image {
  position: absolute;
  top: 0;
  left: 0;

  border-radius: var(--border-radius) var(--border-radius) 0 0;
  width: 100%;
  aspect-ratio: var(--section-banner-aspect);

  object-fit: cover;
  overflow: hidden;
}

.banner__content {
  padding: var(--section-padding);
  height: calc(100% - 2 * var(--section-padding));
}

// define fade in/out transitions for overlay banner
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.5s ease;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
}

@media screen and (max-width: 35em) {
  .section--full-width {
    margin: 0;
    border-radius: 0;
  }
}
</style>
