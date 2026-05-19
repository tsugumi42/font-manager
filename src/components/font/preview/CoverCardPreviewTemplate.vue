<script setup lang="ts">
import { computed } from 'vue'
import { getPreviewTheme } from '@/data/previewThemes'
import { fontFamilyCss } from '@/services/fontFaceRegistry'
import type { FontData } from '@/types/font'

const props = defineProps<{
  font: FontData
  themeId: string
  text: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  verticalMode: string
  verticalHeight: number
  supportsVertical: boolean
  compact?: boolean
}>()

const theme = computed(() => getPreviewTheme(props.themeId))

const bgStyle = computed(() => {
  const t = theme.value
  if (t.background === 'checkerboard') {
    return {
      backgroundColor: '#eeeeee',
      backgroundImage: `linear-gradient(45deg, #ddd 25%, transparent 25%),
        linear-gradient(-45deg, #ddd 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ddd 75%),
        linear-gradient(-45deg, transparent 75%, #ddd 75%)`,
      backgroundSize: '16px 16px',
      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
    }
  }
  return { backgroundColor: t.background }
})

const fontFamily = computed(() => fontFamilyCss(props.font))

const titleStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 700 as number,
  color: theme.value.foreground,
  fontSize: `${Math.min(props.fontSize * 1.5, 56)}px`,
  lineHeight: 1.2,
  letterSpacing: `${props.letterSpacing + 2}px`,
}))

const subTitleStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 300 as number,
  color: theme.value.accent,
  fontSize: `${Math.max(props.fontSize * 0.5, 14)}px`,
  letterSpacing: '4px',
  textTransform: 'uppercase' as const,
}))

const metaStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 400 as number,
  color: theme.value.mutedForeground,
  fontSize: `${Math.max(props.fontSize * 0.4, 11)}px`,
  letterSpacing: '2px',
}))

const bodyStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: props.fontWeight,
  color: theme.value.foreground,
  fontSize: `${props.fontSize}px`,
  lineHeight: props.lineHeight,
  letterSpacing: `${props.letterSpacing}px`,
}))

const verticalModeCss = computed(() => {
  const vm = props.verticalMode
  if (vm === 'vertical-rl-upright') return { writingMode: 'vertical-rl', textOrientation: 'upright' }
  if (vm === 'vertical-lr-mixed') return { writingMode: 'vertical-lr', textOrientation: 'mixed' }
  return { writingMode: 'vertical-rl', textOrientation: 'mixed' }
})

const verticalTitleStyle = computed(() => {
  const h = props.compact ? 100 : props.verticalHeight * 0.7
  return {
    fontFamily: fontFamily.value,
    fontWeight: 700,
    color: theme.value.accent,
    fontSize: `${Math.min(props.fontSize * 1.2, 40)}px`,
    lineHeight: 1.6,
    letterSpacing: `${props.letterSpacing + 4}px`,
    minHeight: `${h}px`,
    ...(verticalModeCss.value as Record<string, string>),
  }
})

const cornerStyle = computed(() => ({
  borderColor: theme.value.accent,
  opacity: 0.4,
}))
</script>

<template>
  <div class="cover-preview" :class="{ compact: compact }" :style="bgStyle">
    <!-- 装饰角标 (仅非 compact 时显示) -->
    <template v-if="!compact">
      <div class="cover-corner cover-corner-tl" :style="cornerStyle"></div>
      <div class="cover-corner cover-corner-tr" :style="cornerStyle"></div>
      <div class="cover-corner cover-corner-bl" :style="cornerStyle"></div>
      <div class="cover-corner cover-corner-br" :style="cornerStyle"></div>
    </template>

    <div class="cover-content">
      <!-- 左上部：项目编号 -->
      <div class="cover-meta-top">
        <span :style="metaStyle">PROJECT A-01</span>
        <span :style="{ ...metaStyle, marginLeft: '16px' }">2026.05</span>
      </div>

      <!-- 主体区域 -->
      <div class="cover-main">
        <div class="cover-left">
          <!-- 英文装饰小字 -->
          <div :style="subTitleStyle">Memory of Stars</div>

          <!-- 大标题 -->
          <div class="cover-title-wrap">
            <div :style="titleStyle">星の記憶</div>
            <div class="cover-line" :style="{ backgroundColor: theme.accent }"></div>
          </div>

          <!-- 小段正文 -->
          <div class="cover-body" :style="bodyStyle">
            {{ text.slice(0, 40) }}
          </div>
        </div>

        <!-- 右侧竖排标题区 -->
        <div v-if="supportsVertical" class="cover-right">
          <div :style="verticalTitleStyle">
            星の記憶
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="cover-footer">
        <span :style="metaStyle">「你听见了吗，那阵风。」</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cover-preview {
  position: relative;
  padding: 24px;
  border-radius: 10px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cover-preview.compact {
  padding: 10px 14px;
  min-height: auto;
}

.cover-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-style: solid;
}

.cover-corner-tl {
  top: 12px;
  left: 12px;
  border-width: 2px 0 0 2px;
}

.cover-corner-tr {
  top: 12px;
  right: 12px;
  border-width: 2px 2px 0 0;
}

.cover-corner-bl {
  bottom: 12px;
  left: 12px;
  border-width: 0 0 2px 2px;
}

.cover-corner-br {
  bottom: 12px;
  right: 12px;
  border-width: 0 2px 2px 0;
}

.cover-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.cover-meta-top {
  display: flex;
  margin-bottom: 12px;
}

.cover-main {
  flex: 1;
  display: flex;
  gap: 24px;
  align-items: center;
}

.cover-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-line {
  width: 60px;
  height: 2px;
  opacity: 0.6;
}

.cover-body {
  max-width: 360px;
  margin-top: 4px;
  opacity: 0.85;
}

.cover-right {
  flex-shrink: 0;
  min-width: 80px;
  padding: 8px 0;
  border-left: 1px solid;
  border-color: inherit;
  opacity: 0.5;
}

.cover-footer {
  margin-top: 16px;
  opacity: 0.6;
}
</style>
