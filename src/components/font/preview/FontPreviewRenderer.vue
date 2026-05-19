<script setup lang="ts">
import { computed } from 'vue'
import { useFontStore } from '@/stores/fontStore'
import type { FontData } from '@/types/font'
import BasicPreviewTemplate from './BasicPreviewTemplate.vue'
import LyricsPreviewTemplate from './LyricsPreviewTemplate.vue'
import GameUiPreviewTemplate from './GameUiPreviewTemplate.vue'
import CoverCardPreviewTemplate from './CoverCardPreviewTemplate.vue'

const props = defineProps<{
  font: FontData
  templateId: string
  themeId: string
  text: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  verticalMode: string
  verticalHeight: number
  lyricsEffect: string
  compact?: boolean
}>()

const componentMap: Record<string, any> = {
  'basic-horizontal-vertical': BasicPreviewTemplate,
  'lyrics-mv': LyricsPreviewTemplate,
  'game-ui': GameUiPreviewTemplate,
  'cover-card': CoverCardPreviewTemplate,
}

const RenderComponent = computed(() => {
  return componentMap[props.templateId] || BasicPreviewTemplate
})

const needsLyricsEffect = computed(() => props.templateId === 'lyrics-mv')
const needsVertical = computed(() =>
  ['basic-horizontal-vertical', 'cover-card'].includes(props.templateId)
)
</script>

<template>
  <div class="preview-renderer" :class="{ compact }">
    <component
      :is="RenderComponent"
      :font="font"
      :theme-id="themeId"
      :text="text"
      :font-size="fontSize"
      :font-weight="fontWeight"
      :line-height="lineHeight"
      :letter-spacing="letterSpacing"
      :vertical-mode="needsVertical ? verticalMode : 'vertical-rl-mixed'"
      :vertical-height="verticalHeight"
      :lyrics-effect="needsLyricsEffect ? (lyricsEffect as any) : 'none'"
      :supports-vertical="templateId === 'cover-card' ? true : (needsVertical && font.supportsVertical)"
      :compact="compact"
    />
  </div>
</template>

<style scoped>
.preview-renderer {
  width: 100%;
}

.preview-renderer.compact {
  max-height: 300px;
  overflow: auto;
}
</style>
