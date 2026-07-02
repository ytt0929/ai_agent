<template>
  <div class="wb-business-panel" :key="`${tool || 'empty'}-${data?.status || data?.step || ''}`">
    <component
      :is="artifactComponent"
      :key="`${tool || 'empty'}-${data?.currentStage || data?.step || data?.status || 'default'}`"
      :data="componentData"
      @explore="$emit('explore', $event)"
      @select-template="$emit('select-template', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ScreeningArtifact from './artifacts/ScreeningArtifact.vue'
import EnterpriseExploreArtifact from './artifacts/EnterpriseExploreArtifact.vue'
import BusinessVerifyArtifact from './artifacts/BusinessVerifyArtifact.vue'
import TaxCollectionArtifact from './artifacts/TaxCollectionArtifact.vue'
import MaterialsArtifact from './artifacts/MaterialsArtifact.vue'
import RiskDiagnosisArtifact from './artifacts/RiskDiagnosisArtifact.vue'
import DeliverablesArtifact from './artifacts/DeliverablesArtifact.vue'
import ReportEditorArtifact from './artifacts/ReportEditorArtifact.vue'
import MonitorArtifact from './artifacts/MonitorArtifact.vue'
import DueDiligenceArtifact from './artifacts/DueDiligenceArtifact.vue'
import EmptyArtifact from './artifacts/EmptyArtifact.vue'

const props = defineProps({ tool: { type: String, default: null }, data: { type: Object, default: () => ({}) } })
defineEmits(['explore', 'select-template'])

// Ensure data is never null/undefined
const componentData = computed(() => props.data || {})

const artifactComponent = computed(() => ({
  screening: ScreeningArtifact,
  exploration: EnterpriseExploreArtifact,
  business: BusinessVerifyArtifact,
  tax: TaxCollectionArtifact,
  materials: MaterialsArtifact,
  riskDiagnosis: RiskDiagnosisArtifact,
  deliverables: DeliverablesArtifact,
  reportEditor: ReportEditorArtifact,
  monitor: MonitorArtifact,
  dueDiligence: DueDiligenceArtifact,
}[props.tool] || EmptyArtifact))
</script>

<style scoped>
.wb-business-panel {
  min-height: 100%;
  padding: 0;
}
</style>
