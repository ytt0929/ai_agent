<template>
  <BizRiskSinglePage v-if="store.mode === 'single'" />
  <BizRiskBatchPage v-else />
</template>

<script setup>
import { useBizRiskStore } from '../stores/bizRisk.js'
import BizRiskSinglePage from './BizRiskSinglePage.vue'
import BizRiskBatchPage from './BizRiskBatchPage.vue'

const store = useBizRiskStore()
</script>
