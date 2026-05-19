<script setup lang="ts">
import { open } from '@tauri-apps/plugin-dialog'
import { NAlert, NButton, NInput, NSelect, NScrollbar, NEmpty, useMessage } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import FontListItem from '@/components/font/FontListItem.vue'
import type { SortKey } from '@/types/font'

const fontStore = useFontStore()
const message = useMessage()

const sortOptions = [
  { label: '按名称', value: 'name' as SortKey },
  { label: '按来源', value: 'source' as SortKey },
  { label: '按授权', value: 'license' as SortKey },
]

function scanSummaryText() {
  const summary = fontStore.lastScanSummary
  if (!summary) return ''

  const riskText = summary.previewRiskCount > 0
    ? `，${summary.previewRiskCount} 个 TTC 可能无法稳定预览`
    : ''
  return `扫描 ${summary.total} 个文件：${summary.metadataNameCount} 个读取内部名称，${summary.fileNameFallbackCount} 个使用文件名兜底${riskText}`
}

async function scanDirectory() {
  let selected: string | string[] | null
  try {
    selected = await open({
      directory: true,
      multiple: false,
      title: '选择字体目录',
    })
  } catch (error) {
    message.error(error instanceof Error ? error.message : String(error))
    return
  }

  if (typeof selected !== 'string') return

  await fontStore.scanFontDirectory(selected)
  if (fontStore.fontLoadError) {
    message.error(fontStore.fontLoadError)
  } else {
    message.success(scanSummaryText())
  }
}
</script>

<template>
  <div class="font-list-pane">
    <div class="list-toolbar">
      <NInput
        v-model:value="fontStore.searchQuery"
        placeholder="搜索字体名称..."
        clearable
        size="small"
        class="search-input"
      />
      <NSelect
        v-model:value="fontStore.sortKey"
        :options="sortOptions"
        size="small"
        class="sort-select"
      />
      <NButton
        size="small"
        type="primary"
        ghost
        :loading="fontStore.isLoadingFonts"
        @click="scanDirectory"
      >
        扫描目录
      </NButton>
    </div>
    <NAlert
      v-if="fontStore.fontLoadError"
      type="error"
      :show-icon="false"
      class="load-error"
    >
      {{ fontStore.fontLoadError }}
    </NAlert>
    <NAlert
      v-else-if="fontStore.lastScanSummary"
      type="info"
      :show-icon="false"
      class="scan-summary"
    >
      {{ scanSummaryText() }}
    </NAlert>
    <NScrollbar class="list-scroll">
      <div v-if="fontStore.filteredFonts.length > 0" class="font-list">
        <FontListItem
          v-for="font in fontStore.filteredFonts"
          :key="font.id"
          :font="font"
          :selected="fontStore.selectedFontId === font.id"
          @click="fontStore.selectFont(font.id)"
        />
      </div>
      <div v-else class="empty-wrap">
        <NEmpty description="没有匹配的字体" />
      </div>
    </NScrollbar>
  </div>
</template>

<style scoped>
.font-list-pane {
  width: 360px;
  min-width: 360px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--n-border-color);
  background: var(--n-color);
}

.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--n-border-color);
  flex-shrink: 0;
}

.search-input {
  flex: 1 1 150px;
}

.sort-select {
  width: 112px;
  flex-shrink: 0;
}

.load-error,
.scan-summary {
  margin: 8px 12px 0;
  flex-shrink: 0;
}

.list-scroll {
  flex: 1;
}

.font-list {
  padding: 4px;
}

.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
