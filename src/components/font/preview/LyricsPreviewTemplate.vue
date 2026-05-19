<script setup lang="ts">
import { computed } from 'vue'
import { getPreviewTheme } from '@/data/previewThemes'
import { fontFamilyCss } from '@/services/fontFaceRegistry'
import type { FontData } from '@/types/font'
import type { LyricsEffect } from '@/types/preview'

const props = defineProps<{
  font: FontData
  themeId: string
  text: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  lyricsEffect: LyricsEffect
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

const textShadowEffect = computed(() => {
  const pf = props.lyricsEffect
  const fg = theme.value.foreground
  if (pf === 'shadow') {
    return `0 2px 8px ${fg}33, 0 4px 16px ${fg}1a`
  }
  if (pf === 'outline') {
    return `-1px -1px 0 ${fg}, 1px -1px 0 ${fg}, -1px 1px 0 ${fg}, 1px 1px 0 ${fg}`
  }
  return 'none'
})

const lyrics = [
  {
    time: '00:37',
    label: 'Verse 1',
    main: '夜の帳が降りる頃',
    sub: '当夜幕降临之时',
  },
  {
    time: '00:45',
    label: '',
    main: '静寂に包まれた街',
    sub: '寂静笼罩的街道',
  },
  {
    time: '00:53',
    label: 'Pre-Chorus',
    main: '遠くで響く鐘の音',
    sub: '远处回响的钟声',
  },
  {
    time: '01:01',
    label: '',
    main: '君の声を探している',
    sub: '我在寻找你的声音',
  },
  {
    time: '01:09',
    label: 'Chorus',
    main: '星の彼方へ届くように',
    sub: '愿能抵达星辰的彼方',
  },
  {
    time: '01:17',
    label: '',
    main: 'この想いを歌に乗せて',
    sub: '将这份思念寄托于歌中',
  },
]

const compactLyrics = lyrics.slice(0, 3)

const showingLyrics = computed(() => props.compact ? compactLyrics : lyrics)

const mainStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: props.fontWeight,
  color: theme.value.foreground,
  fontSize: `${props.fontSize}px`,
  lineHeight: props.lineHeight,
  letterSpacing: `${props.letterSpacing}px`,
  textShadow: textShadowEffect.value,
}))

const subStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 300,
  color: theme.value.mutedForeground,
  fontSize: `${Math.max(props.fontSize * 0.55, 13)}px`,
  lineHeight: 1.5,
  letterSpacing: `${props.letterSpacing}px`,
}))

const timeStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 400,
  color: theme.value.accent,
  fontSize: `${Math.max(props.fontSize * 0.45, 11)}px`,
}))
</script>

<template>
  <div class="lyrics-preview" :class="{ compact: compact }" :style="bgStyle">
    <div class="lyrics-stage">
      <div v-for="(line, idx) in showingLyrics" :key="idx" class="lyrics-row">
        <div class="lyrics-meta">
          <span class="lyrics-time" :style="timeStyle">{{ line.time }}</span>
          <span v-if="line.label" class="lyrics-label" :style="{ fontSize: `${Math.max(fontSize * 0.4, 11)}px`, color: theme.accent, opacity: 0.8 }">
            {{ line.label }}
          </span>
        </div>
        <div class="lyrics-main" :style="mainStyle">{{ line.main }}</div>
        <div v-if="line.sub" class="lyrics-sub" :style="subStyle">{{ line.sub }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyrics-preview {
  padding: 20px 24px;
  border-radius: 8px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lyrics-preview.compact {
  padding: 8px 14px;
  min-height: auto;
}

.lyrics-stage {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lyrics-preview.compact .lyrics-stage {
  gap: 10px;
}

.lyrics-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.lyrics-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 2px;
}

.lyrics-time {
  font-variant-numeric: tabular-nums;
}

.lyrics-label {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.lyrics-main {
  text-align: center;
  width: 100%;
}

.lyrics-sub {
  text-align: center;
  max-width: 80%;
}
</style>
