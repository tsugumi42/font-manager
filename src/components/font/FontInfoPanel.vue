<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard, NTag, NDivider, NText, NSpace, useMessage } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import { LICENSE_LABELS } from '@/data/mockFonts'
import { fontWeightSummary } from '@/services/fontWeightOptions'
import UnicodeCoverage from './UnicodeCoverage.vue'

const fontStore = useFontStore()
const message = useMessage()
const font = computed(() => fontStore.selectedFont)

const infoRows = computed(() => {
  if (!font.value) return []
  const f = font.value
  return [
    { label: '显示名称', value: f.name },
    { label: '字体族名', value: f.family },
    { label: '子样式', value: f.style },
    { label: '原始文件名', value: f.fileName || '' },
    { label: '文件路径', value: f.path },
    { label: '文件格式', value: f.format.toUpperCase() },
    { label: '文件大小', value: f.fileSize },
    { label: '字重能力', value: fontWeightSummary(f) },
    { label: '字体版本', value: f.version },
    { label: '厂商', value: f.vendor },
    { label: '版权信息', value: f.copyright },
  ].filter((row) => row.value)
})

async function copyPath() {
  if (!font.value?.path) return

  try {
    await navigator.clipboard.writeText(font.value.path)
    message.success('已复制文件路径')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '复制文件路径失败')
  }
}
</script>

<template>
  <div class="font-info-panel" v-if="font">
    <!-- 基本信息 -->
    <NCard size="small" :bordered="true" class="info-card">
      <template #header>
        <div class="card-header">
          <NText strong>基础信息</NText>
          <NButton size="tiny" quaternary type="primary" @click="copyPath">
            复制路径
          </NButton>
        </div>
      </template>
      <div class="info-table">
        <div v-for="row in infoRows" :key="row.label" class="info-row">
          <span class="info-label">{{ row.label }}</span>
          <span class="info-value" :title="row.value">{{ row.value }}</span>
        </div>
      </div>

      <NDivider style="margin: 12px 0" />

      <!-- 特性标记 -->
      <NSpace :size="8">
        <NTag size="small" :type="font.isVariable ? 'success' : 'default'" :bordered="false">
          {{ font.isVariable ? '可变字体' : '非可变字体' }}
        </NTag>
        <NTag size="small" :type="font.supportsVertical ? 'success' : 'default'" :bordered="false">
          {{ font.supportsVertical ? '支持竖排' : '不支持竖排' }}
        </NTag>
        <NTag
          size="small"
          :type="font.licenseStatus === 'commercial' ? 'success' : font.licenseStatus === 'personal_free' ? 'warning' : 'default'"
          :bordered="false"
        >
          授权：{{ LICENSE_LABELS[font.licenseStatus] }}
        </NTag>
      </NSpace>
    </NCard>

    <!-- Unicode 覆盖 -->
    <NCard size="small" :bordered="true" class="coverage-card">
      <template #header>
        <NText strong>Unicode 覆盖概览</NText>
      </template>
      <UnicodeCoverage :coverage="font.unicodeCoverage" />
    </NCard>
  </div>
  <div v-else class="no-font">请选择一个字体</div>
</template>

<style scoped>
.font-info-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card,
.coverage-card {
  flex-shrink: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid var(--n-border-color);
  font-size: 13px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 90px;
  flex-shrink: 0;
  color: var(--n-text-color-3);
  font-size: 12px;
}

.info-value {
  flex: 1;
  color: var(--n-text-color);
  word-break: break-all;
  font-size: 13px;
}

.no-font {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--n-text-color-3);
}
</style>
