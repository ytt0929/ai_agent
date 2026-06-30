import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import WorkbenchPage from './pages/WorkbenchPage.vue'
import ScreeningInitialPage from './pages/ScreeningInitialPage.vue'
import ScreeningRunningPage from './pages/ScreeningRunningPage.vue'
import ScreeningResultsPage from './pages/ScreeningResultsPage.vue'
import DueDiligenceHomePage from './pages/DueDiligenceHomePage.vue'
import DueDiligenceTaskPage from './pages/DueDiligenceTaskPage.vue'
import BizRiskPage from './pages/BizRiskPage.vue'
import EnterpriseMonitorPage from './pages/EnterpriseMonitorPage.vue'
import EnterpriseDiagnosisListPage from './pages/EnterpriseDiagnosisListPage.vue'
import EnterpriseDiagnosisPage from './pages/EnterpriseDiagnosisPage.vue'
import EnterpriseDiagnosisEvidencePage from './pages/EnterpriseDiagnosisEvidencePage.vue'
import EnterpriseExplorationWorkspacePage from './pages/EnterpriseExplorationWorkspacePage.vue'
import SmartReportPage from './pages/SmartReportPage.vue'
import DocRecognitionPage from './pages/DocRecognitionPage.vue'
import TaxRpaPage from './pages/TaxRpaPage.vue'
import './styles/tokens.css'

const routes = [
  { path: '/', redirect: '/workbench' },
  { path: '/workbench', name: 'workbench', component: WorkbenchPage },
  { path: '/screening', name: 'screening', component: ScreeningInitialPage },
  { path: '/screening/running', name: 'screeningRunning', component: ScreeningRunningPage },
  { path: '/screening/results', name: 'screeningResults', component: ScreeningResultsPage },
  { path: '/due-diligence', name: 'dueDiligence', component: DueDiligenceHomePage },
  { path: '/due-diligence/:taskId', name: 'dueDiligenceTask', component: DueDiligenceTaskPage },
  { path: '/biz-risk', name: 'bizRisk', component: BizRiskPage },
  { path: '/enterprise-monitor', name: 'enterpriseMonitor', component: EnterpriseMonitorPage },
  { path: '/enterprise-diagnosis', name: 'enterpriseDiagnosisList', component: EnterpriseDiagnosisListPage },
  { path: '/enterprise-diagnosis/workspace/:creditCode', name: 'enterpriseExplorationWorkspace', component: EnterpriseExplorationWorkspacePage },
  { path: '/enterprise-diagnosis/report/:creditCode', name: 'enterpriseDiagnosisReport', component: EnterpriseDiagnosisPage },
  { path: '/enterprise-diagnosis/evidence/:creditCode/:indicatorId', name: 'enterpriseDiagnosisEvidence', component: EnterpriseDiagnosisEvidencePage },
  { path: '/smart-report', name: 'smartReport', component: SmartReportPage },
  { path: '/doc-recognition', name: 'docRecognition', component: DocRecognitionPage },
  { path: '/tax-rpa', name: 'taxRpa', component: TaxRpaPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.mount('#app')
