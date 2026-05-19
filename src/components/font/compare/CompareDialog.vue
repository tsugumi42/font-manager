<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NModal,
  NCard,
  NScrollbar,
  NButton,
  NTag,
  NEmpty,
  NAlert,
  NInput,
  NSlider,
  NSelect,
  NText,
  NSpace,
} from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import { LANGUAGE_LABELS, LICENSE_LABELS, PRESET_TEXTS } from '@/data/mockFonts'
import { previewTemplates } from '@/data/previewTemplates'
import { previewThemes } from '@/data/previewThemes'
import FontPreviewRenderer from '@/components/font/preview/FontPreviewRenderer.vue'
import { fontFamilyCss } from '@/services/fontFaceRegistry'
import { fontWeightOptions, fontWeightSummary } from '@/services/fontWeightOptions'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const fontStore = useFontStore()

const dialogShow = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
})

const gridCols = ref(2)

const validCompareFonts = computed(() => {
  return fontStore.compareFonts.filter((f) => f !== undefined)
})

const hasEnoughFonts = computed(() => validCompareFonts.value.length >= 2)
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

const licenseColors: Record<string, string> = {
  commercial: 'success',
  personal_free: 'warning',
  unconfirmed: 'default',
  unknown: 'default',
}

function onTemplateChange(val: string) {
  fontStore.setTemplate(val)
}

function onThemeChange(val: string) {
  fontStore.setTheme(val)
}

function setPresetText(key: string) {
  fontStore.setPreviewText(PRESET_TEXTS[key] || '')
}

function removeFromCompare(fontId: string) {
  fontStore.toggleCompareFont(fontId)
  if (fontStore.compareFontIds.length < 2) {
    dialogShow.value = false
  }
}

function handleClose() {
  dialogShow.value = false
}
</script>

<template>
  <NModal
    v-model:show="dialogShow"
    preset="card"
    title="字体对比"
    style="width: 95vw; max-width: 1400px; height: 90vh"
    :segmented="{ content: 'soft', footer: 'soft' }"
    :bordered="false"
    size="huge"
  >
    <template #header-extra>
      <NSpace :size="6">
        <NButton size="tiny" quaternary @click="fontStore.clearCompare(); handleClose()">清空并关闭</NButton>
      </NSpace>
    </template>

    <div class="compare-dialog-body">
      <!-- 不足 2 个字体提示 -->
      <NAlert v-if="!hasEnoughFonts" type="warning" title="至少需要选择 2 个字体" class="min-alert">
        当前仅选择了 {{ validCompareFonts.length }} 个字体，请从左侧字体列表中添加更多字体（最多 6 个）。
      </NAlert>

      <template v-else>
        <!-- 控制区 -->
        <div class="compare-controls">
          <NSpace :size="8" wrap>
            <!-- 模板 & 主题 -->
            <NSelect
              size="tiny"
              :value="fontStore.selectedTemplateId"
              :options="templateOptions"
              style="width: 130px"
              @update:value="onTemplateChange"
            />
            <NSelect
              size="tiny"
              :value="fontStore.selectedThemeId"
              :options="themeOptions"
              style="width: 110px"
              @update:value="onThemeChange"
            />

            <span class="ctrl-sep">|</span>

            <!-- 预设文本 -->
            <NButton size="tiny" quaternary @click="setPresetText('chinese')">中文</NButton>
            <NButton size="tiny" quaternary @click="setPresetText('japanese')">日文</NButton>
            <NButton size="tiny" quaternary @click="setPresetText('english')">英文</NButton>
            <NButton size="tiny" quaternary @click="setPresetText('mixed')">混排</NButton>

            <span class="ctrl-sep">|</span>

            <!-- 字号 -->
            <span class="ctrl-label-inline">字号</span>
            <NSlider
              :value="fontStore.fontSize"
              :min="12" :max="72" :step="1"
              style="width: 80px"
              @update:value="fontStore.fontSize = $event"
            />
            <span class="ctrl-val">{{ fontStore.fontSize }}px</span>

            <!-- 字重 -->
            <span v-if="weightSummary" class="ctrl-val">{{ weightSummary }}</span>
            <NSelect
              size="tiny"
              :value="fontStore.fontWeight"
              :options="weightOptions"
              style="width: 130px"
              @update:value="fontStore.setFontWeight"
            />

            <!-- 行距 -->
            <span class="ctrl-label-inline">行距</span>
            <NSlider
              :value="fontStore.lineHeight"
              :min="1" :max="3" :step="0.1"
              style="width: 60px"
              @update:value="fontStore.lineHeight = $event"
            />
            <span class="ctrl-val">{{ fontStore.lineHeight }}</span>

            <!-- 字间距 -->
            <span class="ctrl-label-inline">字距</span>
            <NSlider
              :value="fontStore.letterSpacing"
              :min="-5" :max="20" :step="0.5"
              style="width: 60px"
              @update:value="fontStore.letterSpacing = $event"
            />
            <span class="ctrl-val">{{ fontStore.letterSpacing }}</span>

            <!-- 竖排模式 -->
            <template v-if="fontStore.selectedTemplate.supportsVertical">
              <span class="ctrl-sep">|</span>
              <NSelect
                size="tiny"
                :value="fontStore.verticalMode"
                :options="verticalOptions"
                style="width: 140px"
                @update:value="fontStore.verticalMode = $event"
              />
              <span class="ctrl-label-inline">竖排高</span>
              <NSlider
                :value="fontStore.verticalHeight"
                :min="150" :max="500" :step="10"
                style="width: 60px"
                @update:value="fontStore.verticalHeight = $event"
              />
              <span class="ctrl-val">{{ fontStore.verticalHeight }}</span>
            </template>

            <!-- 歌词效果 -->
            <template v-if="fontStore.selectedTemplateId === 'lyrics-mv'">
              <span class="ctrl-sep">|</span>
              <NSelect
                size="tiny"
                :value="fontStore.lyricsEffect"
                :options="lyricsEffectOptions"
                style="width: 110px"
                @update:value="fontStore.lyricsEffect = $event"
              />
            </template>

            <span class="ctrl-sep">|</span>

            <!-- 列数切换 -->
            <NButton size="tiny" :type="gridCols === 2 ? 'primary' : 'default'" @click="gridCols = 2">2列</NButton>
            <NButton size="tiny" :type="gridCols === 3 ? 'primary' : 'default'" @click="gridCols = 3">3列</NButton>
          </NSpace>
        </div>

        <!-- 预览文本 -->
        <div class="compare-text-row">
          <NInput
            size="tiny"
            type="text"
            :value="fontStore.previewText"
            placeholder="输入预览文本..."
            @update:value="fontStore.setPreviewText"
          />
        </div>

        <!-- 对比卡片网格 -->
        <NScrollbar class="compare-grid-scroll">
          <div class="compare-grid" :class="`cols-${gridCols}`">
            <NCard
              v-for="f in validCompareFonts"
              :key="f.id"
              size="small"
              :bordered="true"
              class="compare-card"
            >
              <!-- 字体信息头 -->
              <div class="card-header">
                <div class="card-header-left">
                  <span class="card-font-name" :style="{ fontFamily: fontFamilyCss(f) }">{{ f.name }}</span>
                  <span class="card-font-family">{{ f.family }}</span>
                </div>
                <div class="card-header-right">
                  <NButton size="tiny" quaternary type="error" @click="removeFromCompare(f.id)">✕</NButton>
                </div>
              </div>

              <!-- 字体元信息 -->
              <div class="card-meta">
                <NTag size="tiny" :bordered="false" :type="f.source === 'system' ? 'info' : 'default'">
                  {{ f.source === 'system' ? '系统' : '自定义' }}
                </NTag>
                <NTag v-for="lang in f.languages.slice(0, 3)" :key="lang" size="tiny" :bordered="false" type="success">
                  {{ LANGUAGE_LABELS[lang] || lang }}
                </NTag>
                <NTag size="tiny" :bordered="false" :type="licenseColors[f.licenseStatus] as any">
                  {{ LICENSE_LABELS[f.licenseStatus] }}
                </NTag>
                <NTag v-if="f.tags.length > 0" size="tiny" :bordered="false" type="info">
                  {{ f.tags[0] }}
                </NTag>
              </div>

              <!-- 预览区 -->
              <div class="card-preview">
                <FontPreviewRenderer
                  :font="f"
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
                  compact
                />
              </div>
            </NCard>

            <!-- 空位占位 -->
            <div
              v-for="n in (gridCols - validCompareFonts.length % gridCols) % gridCols"
              :key="'empty-' + n"
              class="compare-card compare-card-empty"
            >
              <NEmpty description=" " size="small" />
            </div>
          </div>
        </NScrollbar>
      </template>
    </div>
  </NModal>
</template>

<style scoped>
.compare-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(90vh - 100px);
  overflow: hidden;
}

.min-alert {
  flex-shrink: 0;
}

.compare-controls {
  flex-shrink: 0;
  padding: 4px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.ctrl-sep {
  color: var(--n-text-color-3);
  font-size: 10px;
  user-select: none;
}

.ctrl-label-inline {
  font-size: 10px;
  color: var(--n-text-color-3);
  user-select: none;
}

.ctrl-val {
  font-size: 10px;
  color: var(--n-text-color-2);
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}

.compare-text-row {
  flex-shrink: 0;
}

.compare-grid-scroll {
  flex: 1;
  min-height: 0;
}

.compare-grid {
  display: grid;
  gap: 10px;
  padding: 2px;
}

.compare-grid.cols-2 {
  grid-template-columns: 1fr 1fr;
}

.compare-grid.cols-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.compare-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compare-card-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  opacity: 0.3;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.card-header-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.card-font-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-text-color);
}

.card-font-family {
  font-size: 11px;
  color: var(--n-text-color-3);
}

.card-header-right {
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-preview {
  flex: 1;
  min-height: 200px;
  overflow: hidden;
  border-radius: 6px;
}
</style>
