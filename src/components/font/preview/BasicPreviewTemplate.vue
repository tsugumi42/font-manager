<script setup lang="ts">
import { computed } from 'vue'
import { getPreviewTheme } from '@/data/previewThemes'
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

const fontStyle = {
  fontFamily: `"${props.font.family}", "Microsoft YaHei", sans-serif`,
  fontWeight: props.fontWeight,
  color: theme.value.foreground,
}

const horizontalStyle = computed(() => ({
  ...fontStyle,
  fontSize: `${props.fontSize}px`,
  lineHeight: props.lineHeight,
  letterSpacing: `${props.letterSpacing}px`,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
  padding: props.compact ? '8px' : '16px',
}))

const verticalModeCss = computed<Record<string, string>>(() => {
  const vm = props.verticalMode
  if (vm === 'vertical-rl-upright') return { writingMode: 'vertical-rl', textOrientation: 'upright' }
  if (vm === 'vertical-lr-mixed') return { writingMode: 'vertical-lr', textOrientation: 'mixed' }
  return { writingMode: 'vertical-rl', textOrientation: 'mixed' }
})

const verticalStyle = computed(() => {
  const h = props.compact ? Math.min(props.verticalHeight, 180) : props.verticalHeight
  return {
    ...fontStyle,
    fontSize: `${props.fontSize}px`,
    lineHeight: Math.max(props.lineHeight, 1.6),
    letterSpacing: `${props.letterSpacing}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all' as const,
    padding: props.compact ? '8px' : '16px',
    minHeight: `${h}px`,
    maxHeight: `${h}px`,
    overflow: 'auto' as const,
    ...(verticalModeCss.value as Record<string, string>),
  }
})

const verticalLabel = computed(() => {
  const vm = props.verticalMode
  if (vm === 'vertical-rl-upright') return 'vertical-rl + upright'
  if (vm === 'vertical-lr-mixed') return 'vertical-lr + mixed'
  return 'vertical-rl + mixed'
})
</script>

<template>
  <div class="basic-preview" :class="{ compact: compact }" :style="bgStyle">
    <div class="basic-section">
      <div class="section-title" :style="{ color: theme.mutedForeground }">横排预览</div>
      <div class="preview-block" :style="{ borderColor: theme.border, color: theme.foreground }">
        <div :style="horizontalStyle">{{ text }}</div>
      </div>
    </div>
    <div class="basic-section">
      <div class="section-title" :style="{ color: theme.mutedForeground }">
        竖排预览 · {{ verticalLabel }}
      </div>
      <div class="preview-block" :style="{ borderColor: theme.border, color: theme.foreground }">
        <div :style="verticalStyle">{{ text }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  min-height: 300px;
}

.basic-preview.compact {
  gap: 8px;
  padding: 8px;
  min-height: auto;
}

.basic-section {
  flex: 1;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.preview-block {
  border: 1px solid;
  border-radius: 6px;
  overflow: hidden;
}
</style>
