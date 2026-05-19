<script setup lang="ts">
import { NTag, NButton, NSpace } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'

const fontStore = useFontStore()

const emit = defineEmits<{
  (e: 'openCompare'): void
}>()
</script>

<template>
  <div v-if="fontStore.compareFontIds.length > 0" class="compare-bar">
    <div class="compare-left">
      <span class="compare-label">对比字体</span>
      <span class="compare-count">{{ fontStore.compareFontIds.length }} / {{ fontStore.MAX_COMPARE }}</span>
      <NSpace :size="4" class="compare-fonts">
        <NTag
          v-for="fid in fontStore.compareFontIds"
          :key="fid"
          size="tiny"
          type="info"
          :bordered="false"
          closable
          @close="fontStore.toggleCompareFont(fid)"
        >
          {{ fontStore.fonts.find(f => f.id === fid)?.name || fid }}
        </NTag>
      </NSpace>
    </div>
    <div class="compare-right">
      <NButton size="tiny" quaternary @click="fontStore.clearCompare()">清空</NButton>
      <NButton size="tiny" type="primary" @click="emit('openCompare')">打开对比</NButton>
    </div>
  </div>
</template>

<style scoped>
.compare-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid var(--n-border-color);
  background: var(--n-color-embedded);
  flex-shrink: 0;
  min-height: 40px;
}

.compare-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.compare-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--n-text-color);
  flex-shrink: 0;
}

.compare-count {
  font-size: 11px;
  color: var(--n-text-color-3);
  flex-shrink: 0;
}

.compare-fonts {
  flex: 1;
  overflow: hidden;
}

.compare-right {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
</style>
