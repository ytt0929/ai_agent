<template>
  <div class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">AI</div>
      <div class="brand-text">
        <div class="brand-title">客户经理 AI Copilot</div>
        <div class="brand-subtitle">AI 客户经营助手</div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <!-- Main Nav -->
    <nav class="sidebar-nav">
      <div
        v-for="item in mainNav"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeNav === item.key }"
        @click="navigate(item)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </div>
    </nav>

    <div class="sidebar-divider"></div>

    <!-- Tools -->
    <div class="sidebar-tools">
      <div class="tools-title">工具</div>
      <div
        v-for="item in tools"
        :key="item.key"
        class="nav-item"
        :class="{ active: activeNav === item.key }"
        @click="navigate(item)"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <!-- Bottom User -->
    <div class="sidebar-user">
      <div class="user-avatar">张</div>
      <div class="user-info">
        <div class="user-name">张经理</div>
        <div class="user-role">客户经理</div>
      </div>
      <el-icon class="user-arrow"><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Monitor, Search, DocumentChecked, Bell,
  Collection, Files, OfficeBuilding, Ticket,
  View, ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeNav = ref('home')

const mainNav = [
  { key: 'home', label: '智能工作台', icon: Monitor, route: '/' },
  { key: 'screen', label: '智能筛查', icon: Search, route: '/screen' },
  { key: 'dueDiligence', label: '尽调任务', icon: DocumentChecked, route: '/due-diligence' },
  { key: 'postLoan', label: '贷后管理', icon: Bell, route: '/post-loan' },
  { key: 'enterprise', label: '企业库', icon: Collection, route: '/' },
  { key: 'reports', label: '报告库', icon: Files, route: '/' },
]

const tools = [
  { key: 'business', label: '工商查询', icon: OfficeBuilding, route: '/' },
  { key: 'tax', label: '税票采集', icon: Ticket, route: '/' },
  { key: 'ocr', label: '资料识别', icon: View, route: '/' },
]

function navigate(item) {
  activeNav.value = item.key
  if (item.route && item.route !== '/') {
    router.push(item.route)
  }
}

// Sync active state with route
import { watch } from 'vue'
watch(() => route.path, (path) => {
  const map = { '/': 'home', '/screen': 'screen', '/due-diligence': 'dueDiligence', '/post-loan': 'postLoan' }
  activeNav.value = map[path] || 'home'
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  background: linear-gradient(180deg, #1a2744 0%, #152238 100%);
  color: #c0c8d4;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  gap: 12px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4080ff 0%, #2b6de6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.brand-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.brand-subtitle {
  font-size: 11px;
  color: #8a96a8;
  margin-top: 2px;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 16px;
}

.sidebar-nav, .sidebar-tools {
  padding: 8px 10px;
}

.tools-title {
  font-size: 11px;
  color: #6b7a8d;
  padding: 8px 6px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13.5px;
  margin-bottom: 2px;
  position: relative;
}

.nav-item:hover {
  background: rgba(64, 128, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(64, 128, 255, 0.2) 0%, rgba(43, 109, 230, 0.15) 100%);
  color: #fff;
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #4080ff;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.sidebar-user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar-user:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4080ff, #2b6de6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-name {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.user-role {
  font-size: 11px;
  color: #8a96a8;
  margin-top: 1px;
}

.user-arrow {
  margin-left: auto;
  color: #6b7a8d;
  font-size: 14px;
}
</style>
