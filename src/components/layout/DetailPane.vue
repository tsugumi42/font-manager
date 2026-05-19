<script setup lang="ts">
import { ref } from 'vue'
import { NTabs, NTabPane, NScrollbar, NEmpty } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import FontPreview from '@/components/font/FontPreview.vue'
import CharacterCheck from '@/components/font/CharacterCheck.vue'
import FontInfoPanel from '@/components/font/FontInfoPanel.vue'
import TagNotePanel from '@/components/font/TagNotePanel.vue'
import CompareBar from '@/components/font/preview/CompareBar.vue'
import CompareDialog from '@/components/font/compare/CompareDialog.vue'
import type { TabKey } from '@/types/font'

const fontStore = useFontStore()
const showCompareDialog = ref(false)

function onTabUpdate(key: string) {
  fontStore.setTab(key as TabKey)
}

function openCompare() {
  if (fontStore.compareFontIds.length < 2) return
  showCompareDialog.value = true
}
</script>

<template>
  <CompareDialog v-model:show="showCompareDialog" />
  <div class="detail-pane">
    <div v-if="!fontStore.selectedFont" class="no-selection">
      <NEmpty description="选择左侧字体以查看详情" />
    </div>
    <template v-else>
      <div class="detail-header">
        <span class="detail-font-name">{{ fontStore.selectedFont?.name }}</span>
        <span class="detail-font-family">{{ fontStore.selectedFont?.family }}</span>
      </div>
      <div class="detail-tabs-area">
        <NTabs
          :value="fontStore.activeTab"
          type="line"
          size="small"
          animated
          class="detail-tabs"
          @update:value="onTabUpdate"
        >
          <NTabPane name="preview" tab="预览" class="tab-pane-full">
            <NScrollbar class="tab-scrollbar">
              <div class="tab-inner">
                <FontPreview />
              </div>
            </NScrollbar>
          </NTabPane>
          <NTabPane name="charcheck" tab="字符检测" class="tab-pane-full">
            <NScrollbar class="tab-scrollbar">
              <div class="tab-inner">
                <CharacterCheck />
              </div>
            </NScrollbar>
          </NTabPane>
          <NTabPane name="info" tab="字体信息" class="tab-pane-full">
            <NScrollbar class="tab-scrollbar">
              <div class="tab-inner">
                <FontInfoPanel />
              </div>
            </NScrollbar>
          </NTabPane>
          <NTabPane name="tagnote" tab="标签备注" class="tab-pane-full">
            <NScrollbar class="tab-scrollbar">
              <div class="tab-inner">
                <TagNotePanel />
              </div>
            </NScrollbar>
          </NTabPane>
        </NTabs>
      </div>
      <CompareBar @open-compare="openCompare" />
    </template>
  </div>
</template>

<style scoped>
.detail-pane {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--n-color);
  min-width: 0;
  overflow: hidden;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.detail-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px 8px;
  flex-shrink: 0;
}

.detail-font-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color);
}

.detail-font-family {
  font-size: 13px;
  color: var(--n-text-color-3);
}

.detail-tabs-area {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.detail-tabs :deep(.n-tabs-nav) {
  flex-shrink: 0;
}

.detail-tabs :deep(.n-tabs-content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.detail-tabs :deep(.n-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.tab-pane-full {
  height: 100%;
}

.tab-scrollbar {
  height: 100%;
}

.tab-inner {
  padding: 16px 20px;
}
</style>
