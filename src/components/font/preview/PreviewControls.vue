<script setup lang="ts">
import { computed } from 'vue'
import {
  NInput,
  NSlider,
  NSelect,
  NButton,
  NText,
  NSpace,
  NCard,
} from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import { previewTemplates } from '@/data/previewTemplates'
import { previewThemes } from '@/data/previewThemes'
import { PRESET_TEXTS } from '@/data/mockFonts'
import { fontWeightOptions, fontWeightSummary } from '@/services/fontWeightOptions'

const fontStore = useFontStore()

const showVerticalControls = computed(() => fontStore.selectedTemplate.supportsVertical)
const weightOptions = computed(() => fontWeightOptions(fontStore.selectedFont))
const weightSummary = computed(() => fontWeightSummary(fontStore.selectedFont))

const templateOptions = previewTemplates.map((t) => ({
  label: t.name,
  value: t.id,
}))

const themeOptions = previewThemes.map((t) => ({
  label: t.name,
  value: t.id,
}))

const verticalOptions = [
  { label: '从右向左 · 混合朝向', value: 'vertical-rl-mixed' },
  { label: '从右向左 · 直立朝向', value: 'vertical-rl-upright' },
  { label: '从左向右 · 混合朝向', value: 'vertical-lr-mixed' },
]

const lyricsEffectOptions = [
  { label: '无效果', value: 'none' },
  { label: '阴影 shadow', value: 'shadow' },
  { label: '描边 outline', value: 'outline' },
]

function setPresetText(key: string) {
  fontStore.setPreviewText(PRESET_TEXTS[key] || '')
}

function onTemplateChange(val: string) {
  fontStore.setTemplate(val)
}

function onThemeChange(val: string) {
  fontStore.setTheme(val)
}
</script>

<template>
  <NCard size="small" :bordered="true" class="controls-card">
    <NSpace vertical :size="10">
      <!-- 模板选择 -->
      <div class="control-row">
        <div class="control-half">
          <NText depth="3" class="ctrl-label">预览模板</NText>
          <NSelect
            size="small"
            :value="fontStore.selectedTemplateId"
            :options="templateOptions"
            @update:value="onTemplateChange"
          />
        </div>
        <div class="control-half">
          <NText depth="3" class="ctrl-label">颜色主题</NText>
          <NSelect
            size="small"
            :value="fontStore.selectedThemeId"
            :options="themeOptions"
            @update:value="onThemeChange"
          />
        </div>
      </div>

      <!-- 预览文本 -->
      <div>
        <NText depth="3" class="ctrl-label">预览文本</NText>
        <NInput
          type="textarea"
          :value="fontStore.previewText"
          :autosize="{ minRows: 2, maxRows: 3 }"
          placeholder="输入预览文本..."
          size="small"
          @update:value="fontStore.setPreviewText"
        />
      </div>

      <!-- 预设文本 -->
      <div>
        <NSpace :size="4" wrap>
          <NButton size="tiny" quaternary @click="setPresetText('chinese')">中文</NButton>
          <NButton size="tiny" quaternary @click="setPresetText('japanese')">日文</NButton>
          <NButton size="tiny" quaternary @click="setPresetText('english')">英文</NButton>
          <NButton size="tiny" quaternary @click="setPresetText('mixed')">混排</NButton>
          <NButton size="tiny" quaternary @click="setPresetText('punctuation')">标点</NButton>
        </NSpace>
      </div>

      <!-- 字号 -->
      <div>
        <NText depth="3" class="ctrl-label">字号: {{ fontStore.fontSize }}px</NText>
        <NSlider
          :value="fontStore.fontSize"
          :min="12"
          :max="120"
          :step="1"
          @update:value="fontStore.fontSize = $event"
        />
      </div>

      <!-- 字重 -->
      <div>
        <NText depth="3" class="ctrl-label">字重<span v-if="weightSummary">：{{ weightSummary }}</span></NText>
        <NSelect
          size="small"
          :value="fontStore.fontWeight"
          :options="weightOptions"
          @update:value="fontStore.setFontWeight"
        />
      </div>

      <!-- 行距 -->
      <div>
        <NText depth="3" class="ctrl-label">行距: {{ fontStore.lineHeight }}</NText>
        <NSlider
          :value="fontStore.lineHeight"
          :min="1"
          :max="3"
          :step="0.1"
          @update:value="fontStore.lineHeight = $event"
        />
      </div>

      <!-- 字间距 -->
      <div>
        <NText depth="3" class="ctrl-label">字间距: {{ fontStore.letterSpacing }}px</NText>
        <NSlider
          :value="fontStore.letterSpacing"
          :min="-5"
          :max="20"
          :step="0.5"
          @update:value="fontStore.letterSpacing = $event"
        />
      </div>

      <!-- 竖排模式 (仅 supportsVertical 模板) -->
      <div v-if="showVerticalControls">
        <NText depth="3" class="ctrl-label">竖排模式</NText>
        <NSelect
          size="small"
          :value="fontStore.verticalMode"
          :options="verticalOptions"
          @update:value="fontStore.verticalMode = $event"
        />
      </div>

      <!-- 竖排高度 (仅 supportsVertical 模板) -->
      <div v-if="showVerticalControls">
        <NText depth="3" class="ctrl-label">竖排高度: {{ fontStore.verticalHeight }}px</NText>
        <NSlider
          :value="fontStore.verticalHeight"
          :min="200"
          :max="800"
          :step="10"
          @update:value="fontStore.verticalHeight = $event"
        />
      </div>

      <!-- 歌词效果 (仅 lyrics-mv) -->
      <div v-if="fontStore.selectedTemplateId === 'lyrics-mv'">
        <NText depth="3" class="ctrl-label">歌词效果</NText>
        <NSelect
          size="small"
          :value="fontStore.lyricsEffect"
          :options="lyricsEffectOptions"
          @update:value="fontStore.lyricsEffect = $event"
        />
      </div>

      <!-- 恢复默认 -->
      <div>
        <NButton size="small" quaternary type="primary" @click="fontStore.resetToTemplateDefaults()">
          恢复模板默认设置
        </NButton>
      </div>
    </NSpace>
  </NCard>
</template>

<style scoped>
.controls-card {
  flex-shrink: 0;
}

.control-row {
  display: flex;
  gap: 10px;
}

.control-half {
  flex: 1;
  min-width: 0;
}

.ctrl-label {
  display: block;
  margin-bottom: 3px;
  font-size: 11px;
}
</style>
