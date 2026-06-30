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
    <GlobalInputBar />
  </div>
</template>

<script setup>
import AppSidebar from './components/AppSidebar.vue'
import GlobalInputBar from './components/GlobalInputBar.vue'
</script>

<style scoped>
.app-root {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}
.app-main {
  flex: 1;
  min-width: 0;
}
</style>
