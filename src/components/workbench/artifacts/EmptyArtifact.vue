<template>
  <el-card shadow="never" class="artifact-card">
    <el-empty description="等待业务流程推进" :image-size="80" />
  </el-card>
</template>

<style scoped>
.artifact-card :deep(.el-card__header) { padding: 12px 16px; }
.artifact-card__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
</style>
