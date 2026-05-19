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

const uiElements = [
  { type: 'title' as const, text: '小鸟游星野', sub: 'Lv.87', right: 'HP: 12840' },
  { type: 'tags' as const, texts: ['前卫', '爆发', '神秘'] },
  { type: 'cost' as const, text: 'COST: 4', detail: 'EX技能冷却中 00:32' },
  {
    type: 'skill' as const,
    name: '星塵炸裂',
    desc: '对前方扇形范围内的敌人造成 320% 攻击力伤害，并使其防御力降低 15%，持续 20 秒。若目标处于眩晕状态，则额外附加燃烧效果。',
  },
  { type: 'buttons' as const, texts: ['开始任务', '编成', '资料'] },
  {
    type: 'info' as const,
    text: '「私は星野。昔のことならあまり覚えてないけど…今はあなたと一緒に戦うよ。」',
  },
]

const titleStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 700 as number,
  color: theme.value.foreground,
  fontSize: `${Math.min(props.fontSize * 1.1, 48)}px`,
}))

const normalStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: props.fontWeight,
  color: theme.value.foreground,
  fontSize: `${props.fontSize}px`,
  lineHeight: props.lineHeight,
  letterSpacing: `${props.letterSpacing}px`,
}))

const smallStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 400 as number,
  color: theme.value.mutedForeground,
  fontSize: `${Math.max(props.fontSize * 0.7, 12)}px`,
  lineHeight: 1.5,
}))

const tinyStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: 400 as number,
  color: theme.value.mutedForeground,
  fontSize: `${Math.max(props.fontSize * 0.55, 10)}px`,
}))
</script>

<template>
  <div class="game-ui-preview" :class="{ compact: compact }" :style="bgStyle">
    <div class="game-card" :style="{ borderColor: theme.border, backgroundColor: theme.surface || theme.background }">
      <!-- 角色标题行 -->
      <div class="ui-row ui-row-title">
        <div class="ui-name-area">
          <span :style="titleStyle">小鸟游星野</span>
          <span class="ui-level" :style="{ ...tinyStyle, color: theme.accent, borderColor: theme.accent }">Lv.87</span>
        </div>
        <div class="ui-hp" :style="{ ...smallStyle, color: theme.accent }">
          <span class="hp-bar"></span>
          12840
        </div>
      </div>

      <!-- 状态标签 -->
      <div class="ui-row ui-row-tags">
        <span v-for="tg in ['前卫', '爆发', '神秘']" :key="tg" class="ui-tag" :style="{ backgroundColor: theme.accent + '20', color: theme.accent, fontSize: `${Math.max(fontSize * 0.55, 10)}px` }">{{ tg }}</span>
      </div>

      <!-- COST & 冷却 -->
      <div class="ui-row ui-row-cost">
        <span :style="{ ...normalStyle, color: theme.accent, fontWeight: 600 }">COST: 4</span>
        <span :style="tinyStyle">EX技能冷却中 00:32</span>
      </div>

      <!-- 技能描述 -->
      <div class="ui-row ui-row-skill" :style="{ borderColor: theme.border }">
        <div :style="{ ...smallStyle, color: theme.accent, fontWeight: 600, marginBottom: '4px' }">星塵炸裂</div>
        <div :style="{ ...smallStyle, color: theme.foreground }">
          对前方扇形范围内的敌人造成 320% 攻击力伤害，并使其防御力降低 15%，持续 20 秒。若目标处于眩晕状态，则额外附加燃烧效果。
        </div>
      </div>

      <!-- 按钮 -->
      <div class="ui-row ui-row-buttons">
        <span class="ui-btn ui-btn-primary" :style="{ backgroundColor: theme.accent, color: theme.surface || '#fff', fontSize: `${Math.max(fontSize * 0.6, 12)}px`, fontFamily }">开始任务</span>
        <span class="ui-btn" :style="{ borderColor: theme.border, color: theme.foreground, fontSize: `${Math.max(fontSize * 0.6, 12)}px`, fontFamily }">编成</span>
        <span class="ui-btn" :style="{ borderColor: theme.border, color: theme.mutedForeground, fontSize: `${Math.max(fontSize * 0.6, 12)}px`, fontFamily }">资料</span>
      </div>

      <!-- 角色台词 -->
      <div class="ui-row ui-row-quote" :style="{ borderColor: theme.border }">
        <div :style="{ ...smallStyle, color: theme.mutedForeground, fontStyle: 'italic' }">
          「私は星野。昔のことならあまり覚えてないけど…今はあなたと一緒に戦うよ。」
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-ui-preview {
  padding: 16px;
  border-radius: 8px;
  min-height: 380px;
  display: flex;
  align-items: flex-start;
}

.game-ui-preview.compact {
  padding: 6px;
  min-height: auto;
}

.game-card {
  width: 100%;
  max-width: 480px;
  border: 1px solid;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-ui-preview.compact .game-card {
  padding: 10px 14px;
  gap: 8px;
}

.ui-row {
  display: flex;
  align-items: center;
}

.ui-row-title {
  justify-content: space-between;
}

.ui-name-area {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.ui-level {
  border: 1px solid;
  border-radius: 4px;
  padding: 0 6px;
}

.ui-hp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}

.ui-row-tags {
  gap: 6px;
}

.ui-tag {
  border-radius: 3px;
  padding: 2px 8px;
  font-weight: 500;
}

.ui-row-cost {
  justify-content: space-between;
}

.ui-row-skill {
  flex-direction: column;
  align-items: flex-start;
  border-top: 1px solid;
  padding-top: 10px;
}

.ui-row-buttons {
  gap: 8px;
}

.ui-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid;
  cursor: default;
  font-weight: 500;
}

.ui-btn-primary {
  border: none;
  font-weight: 600;
}

.ui-row-quote {
  border-top: 1px solid;
  padding-top: 8px;
}
</style>
