<script setup lang="ts">
import { computed } from 'vue'
import { NTag, NButton, NSpace } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import PreviewControls from './preview/PreviewControls.vue'
import FontPreviewRenderer from './preview/FontPreviewRenderer.vue'

const fontStore = useFontStore()
const font = computed(() => fontStore.selectedFont)
</script>

<template>
  <div class="font-preview-v2" v-if="font">
    <!-- 对比栏 -->
    <div v-if="fontStore.compareFontIds.length > 0" class="compare-bar-inline">
      <div class="compare-info">
        <span class="compare-label">对比预览</span>
        <span class="compare-count">{{ fontStore.compareFontIds.length }} / {{ fontStore.MAX_COMPARE }}</span>
      </div>
      <NSpace :size="4" wrap class="compare-tags">
        <NTag
          v-for="fid in fontStore.compareFontIds"
          :key="fid"
          size="tiny"
          :type="fid === font.id ? 'success' : 'info'"
          :bordered="false"
          closable
          @close="fontStore.toggleCompareFont(fid)"
        >
          {{ fontStore.fonts.find(f => f.id === fid)?.name || fid }}
        </NTag>
      </NSpace>
      <NButton size="tiny" quaternary @click="fontStore.clearCompare()">清空</NButton>
    </div>

    <!-- 预览区 (在控件上方) -->
    <div class="preview-canvas-wrap">
      <FontPreviewRenderer
        :font="font"
        :template-id="fontStore.selectedTemplateId"
        :theme-id="fontStore.selectedThemeId"
        :text="fontStore.previewText"
        :font-size="fontStore.fontSize"
        :font-weight="fontStore.fontWeight"
        :line-height="fontStore.lineHeight"
        :letter-spacing="fontStore.letterSpacing"
        :vertical-mode="fontStore.verticalMode"
        :vertical-height="fontStore.verticalHeight"
        :lyrics-effect="fontStore.lyricsEffect"
      />
    </div>

    <!-- 控制面板 (在预览区下方) -->
    <PreviewControls />
  </div>
  <div v-else class="no-font">请选择一个字体</div>
</template>

<style scoped>
.font-preview-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-canvas-wrap {
  flex: 1;
  min-height: 260px;
}

.compare-bar-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--n-color-embedded);
  border: 1px solid var(--n-border-color);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.compare-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}

.compare-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--n-text-color);
}

.compare-count {
  font-size: 11px;
  color: var(--n-text-color-3);
}

.compare-tags {
  flex: 1;
  min-width: 0;
}

.no-font {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--n-text-color-3);
  font-size: 14px;
}
</style>
