<template>
  <div class="wb-business-panel" :key="`${tool || 'empty'}-${data?.status || data?.step || ''}`">
    <component
      :is="artifactComponent"
      :key="`${tool || 'empty'}-${data?.currentStage || data?.step || data?.status || 'default'}`"
      :data="componentData"
      @explore="$emit('explore', $event)"
      @select-template="$emit('select-template', $event)"
      @start-monitor="$emit('start-monitor')"
      @start-due="$emit('start-due')"
      @confirm-tax-send="$emit('confirm-tax-send')"
      @tax-authorized="$emit('tax-authorized')"
      @enter-materials="$emit('enter-materials')"
      @send-material-list="$emit('send-material-list')"
      @mock-material-upload="$emit('mock-material-upload')"
      @enter-evidence="$emit('enter-evidence')"
      @enter-risk="$emit('enter-risk')"
      @view-diagnosis-report="$emit('view-diagnosis-report')"
      @sync-report="$emit('sync-report')"
      @enter-deliverables="$emit('enter-deliverables')"
      @edit-report="$emit('edit-report')"
      @export-report="$emit('export-report')"
      @send-reminder="$emit('send-reminder')"
      @switch-to-upload="$emit('switch-to-upload')"
      @download-qr="$emit('download-qr')"
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
import WorkbenchDeliveryPackageArtifact from './artifacts/WorkbenchDeliveryPackageArtifact.vue'
import ReportEditorArtifact from './artifacts/ReportEditorArtifact.vue'
import MonitorArtifact from './artifacts/MonitorArtifact.vue'
import DueDiligenceArtifact from './artifacts/DueDiligenceArtifact.vue'
import JudicialArtifact from './artifacts/JudicialArtifact.vue'
import EvidenceMergeArtifact from './artifacts/EvidenceMergeArtifact.vue'
import EmptyArtifact from './artifacts/EmptyArtifact.vue'

const props = defineProps({ tool: { type: String, default: null }, data: { type: Object, default: () => ({}) } })
defineEmits([
  'explore', 'select-template',
  'start-monitor', 'start-due',
  'confirm-tax-send', 'tax-authorized', 'enter-materials',
  'send-material-list', 'mock-material-upload', 'enter-evidence',
  'enter-risk', 'view-diagnosis-report', 'sync-report', 'enter-deliverables',
  'edit-report', 'export-report',
  'send-reminder', 'switch-to-upload', 'download-qr',
  'generate-delivery-package',
  'mock-download', 'view-list',
])

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
  deliveryPackage: WorkbenchDeliveryPackageArtifact,
  reportEditor: ReportEditorArtifact,
  monitor: MonitorArtifact,
  dueDiligence: DueDiligenceArtifact,
  judicial: JudicialArtifact,
  evidence: EvidenceMergeArtifact,
}[props.tool] || EmptyArtifact))
</script>

<style scoped>
.wb-business-panel {
  min-height: 100%;
  padding: 0;
}
</style>
