<template>
  <div class="wb-sidebar" :class="{ collapsed }">
    <!-- 收起/展开按钮 -->
    <div class="wb-sidebar-toggle" @click="$emit('toggle')">
      <el-icon><component :is="collapsed ? ArrowRight : ArrowLeft" /></el-icon>
    </div>

    <!-- 内容区 -->
    <div v-if="!collapsed" class="wb-sidebar-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

defineProps({
  collapsed: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<style scoped>
.wb-sidebar {
  width: 420px;
  min-width: 420px;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all .25s ease;
  overflow: hidden;
}

.wb-sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-left: none;
}

.wb-sidebar-toggle {
  position: absolute;
  top: 16px;
  left: -16px;
  width: 28px;
  height: 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  font-size: 12px;
  color: #64748b;
  transition: all .15s;
}

.wb-sidebar-toggle:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.wb-sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}
</style>
