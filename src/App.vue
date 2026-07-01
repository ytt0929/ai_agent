<template>
  <div class="app-root">
    <AppSidebar />
    <div class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './components/AppSidebar.vue'
</script>

<style scoped>
.app-root {
  display: flex;
  height: 100vh;
  min-height: 0;
  background: var(--bg-page);
}
.app-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100vh;
  overflow: hidden;
}
</style>
