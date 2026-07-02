<template>
  <div class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <span class="brand-logo-text">AI</span>
      </div>
      <div class="brand-info">
        <div class="brand-title">客户经理 AI Copilot</div>
        <div class="brand-subtitle">懂金融，更懂客户经理</div>
      </div>
    </div>

    <!-- Main Nav -->
    <nav class="sidebar-nav">
      <!-- 工作台 -->
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        @click="go(item)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </nav>

    <!-- Divider + 核心 -->
    <div class="sidebar-divider"></div>
    <div class="sidebar-group">
      <div class="group-title">核心</div>
      <div
        v-for="item in coreItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        @click="go(item)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- Divider + 工具 -->
    <div class="sidebar-divider"></div>
    <div class="sidebar-group">
      <div class="group-title">工具</div>
      <div
        v-for="item in toolItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeKey === item.key }"
        @click="go(item)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- User Card -->
    <div class="sidebar-user-card">
      <div class="user-avatar">张</div>
      <div class="user-info">
        <div class="user-name">张经理</div>
        <div class="user-role">客户经理</div>
        <div class="user-dept">浙江分行 · 公司金融部</div>
      </div>
      <el-icon class="user-arrow"><ArrowDown /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkbenchAssistantStore } from '../stores/workbenchAssistant.js'
import {
  House, DocumentChecked, Cpu, Monitor,
  Document, Filter, Tickets, Picture,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeKey = ref('workbench')

const navItems = [
  { key: 'workbench', label: '工作台', icon: House, route: '/workbench' },
]

const coreItems = [
  { key: 'screening', label: '智能筛客', icon: Filter, route: '/screening' },
  { key: 'enterprise-diagnosis', label: '企业探查', icon: Cpu, route: '/enterprise-diagnosis' },
  { key: 'due-diligence', label: '智能尽调', icon: DocumentChecked, route: '/due-diligence' },
  { key: 'enterprise-monitor', label: '企业监测', icon: Monitor, route: '/enterprise-monitor' },
]

const toolItems = [
  { key: 'smart-report', label: '智能报告', icon: Document, route: '/smart-report' },
  { key: 'tax-rpa', label: '税票采集', icon: Tickets, route: '/tax-rpa' },
  { key: 'doc-recognition', label: '资料识别', icon: Picture, route: '/doc-recognition' },
]

function go(item) {
  if (item.key === 'workbench') {
    useWorkbenchAssistantStore().reset()
  }
  activeKey.value = item.key
  router.push(item.route)
}

watch(() => route.path, (path) => {
  if (path === '/workbench' || path === '/') activeKey.value = 'workbench'
  else if (path.startsWith('/due-diligence')) activeKey.value = 'due-diligence'
  else if (path.startsWith('/enterprise-diagnosis')) activeKey.value = 'enterprise-diagnosis'
  else if (path.startsWith('/enterprise-monitor')) activeKey.value = 'enterprise-monitor'
  else if (path.startsWith('/smart-report')) activeKey.value = 'smart-report'
  else if (path.startsWith('/screening')) activeKey.value = 'screening'
  else if (path.startsWith('/tax-rpa')) activeKey.value = 'tax-rpa'
  else if (path.startsWith('/doc-recognition')) activeKey.value = 'doc-recognition'
  else activeKey.value = 'workbench'
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--surface-card);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  padding: var(--space-xl) var(--space-md);
  overflow-y: auto;
}

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-bottom: var(--space-2xl);
  margin-bottom: var(--space-sm);
}

.brand-logo {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo-text {
  color: #fff;
  font-size: var(--font-size-lg);
  font-weight: 800;
  letter-spacing: 0.5px;
}

.brand-title {
  font-size: var(--font-size-body-lg);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
}

.brand-subtitle {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* Nav Items */
.sidebar-nav, .sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-nav {
  flex: 0 0 auto;
}

.group-title {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--space-md);
  margin-bottom: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text-secondary);
}

.nav-item:hover {
  background: var(--color-primary-bg);
  color: var(--color-primary-hover);
}

.nav-item.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.nav-item.active .nav-icon {
  color: var(--color-primary);
}

.nav-item.active .nav-label {
  color: var(--color-primary);
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: color 0.15s ease;
}

.nav-label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-normal);
  transition: all 0.15s ease;
}

/* Divider + Tools */
.sidebar-divider {
  height: 1px;
  background: var(--border-divider);
  margin: var(--space-lg) 0 var(--space-md);
}

/* User Card */
.sidebar-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-md);
  margin-top: auto;
  cursor: pointer;
  transition: background 0.15s;
}

.sidebar-user-card:hover {
  background: var(--surface-page);
}

.user-avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
  margin-top: 1px;
}

.user-dept {
  font-size: var(--font-size-caption);
  color: var(--text-tertiary);
  margin-top: 1px;
}

.user-arrow {
  color: var(--text-tertiary);
  font-size: 14px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.sidebar-user-card:hover .user-arrow {
  transform: rotate(180deg);
}
</style>
