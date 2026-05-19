<script setup lang="ts">
import { computed } from 'vue'
import { NTag, NButton, NTooltip } from 'naive-ui'
import type { FontData } from '@/types/font'
import { LANGUAGE_LABELS, LICENSE_LABELS } from '@/data/mockFonts'
import { useFontStore } from '@/stores/fontStore'

const props = defineProps<{
  font: FontData
  selected: boolean
}>()

const fontStore = useFontStore()

const licenseColors: Record<string, string> = {
  commercial: 'success',
  personal_free: 'warning',
  unconfirmed: 'default',
  unknown: 'default',
}

const inCompare = computed(() => fontStore.isInCompare(props.font.id))
const compareFull = computed(() => fontStore.isCompareFull())

function onToggleFav(e: MouseEvent) {
  e.stopPropagation()
  fontStore.toggleFavorite(props.font.id)
}

function onToggleCompare(e: MouseEvent) {
  e.stopPropagation()
  fontStore.toggleCompareFont(props.font.id)
}
</script>

<template>
  <div class="font-list-item" :class="{ selected }" :title="font.path">
    <div class="item-main">
      <div class="item-header">
        <span class="font-name">{{ font.name }}</span>
        <span class="font-style">{{ font.style }}</span>
      </div>
      <div class="font-sample">
        {{ font.sampleText }}
      </div>
      <div class="item-meta">
        <NTag size="tiny" :bordered="false" :type="font.source === 'system' ? 'info' : 'default'">
          {{ font.source === 'system' ? '系统' : '自定义' }}
        </NTag>
        <NTag
          v-for="lang in font.languages"
          :key="lang"
          size="tiny"
          :bordered="false"
          type="success"
        >
          {{ LANGUAGE_LABELS[lang] || lang }}
        </NTag>
      </div>
      <div class="item-tags" v-if="font.tags.length > 0">
        <NTag
          v-for="tag in font.tags"
          :key="tag"
          size="tiny"
          :bordered="false"
          type="info"
        >
          {{ tag }}
        </NTag>
      </div>
    </div>
    <div class="item-right">
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            size="tiny"
            :type="font.favorite ? 'warning' : 'default'"
            quaternary
            @click="onToggleFav"
          >
            {{ font.favorite ? '★' : '☆' }}
          </NButton>
        </template>
        {{ font.favorite ? '取消收藏' : '收藏' }}
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            size="tiny"
            :type="inCompare ? 'primary' : 'default'"
            quaternary
            :disabled="!inCompare && compareFull"
            @click="onToggleCompare"
          >
            {{ inCompare ? '⊟' : '⊞' }}
          </NButton>
        </template>
        {{ inCompare ? '移出对比' : compareFull ? '对比已满 (最多6个)' : '加入对比' }}
      </NTooltip>
      <NTag
        size="tiny"
        :bordered="false"
        :type="licenseColors[font.licenseStatus] as any"
      >
        {{ LICENSE_LABELS[font.licenseStatus] }}
      </NTag>
    </div>
  </div>
</template>

<style scoped>
.font-list-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 88px;
  box-sizing: border-box;
  padding: 10px 8px;
  margin: 0 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--n-border-color);
}

.font-list-item:last-child {
  border-bottom: none;
}

.font-list-item:hover {
  background: var(--n-color-hover);
}

.font-list-item.selected {
  background: var(--n-color-pressed);
}

.item-main {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.item-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.font-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-text-color);
}

.font-style {
  font-size: 11px;
  color: var(--n-text-color-3);
}

.font-sample {
  font-size: 14px;
  color: var(--n-text-color-2);
  margin: 3px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.item-meta,
.item-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
  max-height: 20px;
  overflow: hidden;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
