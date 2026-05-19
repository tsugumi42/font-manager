<script setup lang="ts">
import { NScrollbar, NDivider, NTag, NButton } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import { useUiStore } from '@/stores/uiStore'
import { LANGUAGE_LABELS, LICENSE_LABELS } from '@/data/mockFonts'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import type { SidebarFilterKey } from '@/types/font'

const fontStore = useFontStore()
const uiStore = useUiStore()

const sourceFilters: { key: SidebarFilterKey; label: string }[] = [
  { key: 'all', label: '全部字体' },
  { key: 'system', label: '系统字体' },
  { key: 'custom', label: '自定义目录' },
  { key: 'favorites', label: '收藏' },
]

function isSourceActive(key: SidebarFilterKey): boolean {
  return fontStore.sidebarSourceFilter === key
}

function onTagLeftClick(tag: string) {
  fontStore.toggleTagFilter(tag, 'left')
}

function onTagRightClick(tag: string, e: MouseEvent) {
  e.preventDefault()
  fontStore.toggleTagFilter(tag, 'right')
}

function onLangLeftClick(lang: string) {
  fontStore.toggleLanguageFilter(lang, 'left')
}

function onLangRightClick(lang: string, e: MouseEvent) {
  e.preventDefault()
  fontStore.toggleLanguageFilter(lang, 'right')
}

function onLicenseLeftClick(license: string) {
  fontStore.toggleLicenseFilter(license, 'left')
}

function onLicenseRightClick(license: string, e: MouseEvent) {
  e.preventDefault()
  fontStore.toggleLicenseFilter(license, 'right')
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: uiStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <span class="sidebar-title">Font Manager</span>
      <ThemeToggle />
    </div>
    <NScrollbar class="sidebar-scroll">
      <!-- 字体来源 -->
      <div class="sidebar-section">
        <div class="section-label">字体来源</div>
        <div
          v-for="item in sourceFilters"
          :key="item.key"
          class="source-item"
          :class="{ active: isSourceActive(item.key) }"
          @click="fontStore.setSidebarSourceFilter(item.key)"
        >
          <span class="source-label">{{ item.label }}</span>
          <NTag size="tiny" :bordered="false">
            {{
              item.key === 'all'
                ? fontStore.fonts.length
                : item.key === 'favorites'
                  ? fontStore.fonts.filter(f => f.favorite).length
                  : item.key === 'system'
                    ? fontStore.fonts.filter(f => f.source === 'system').length
                    : fontStore.fonts.filter(f => f.source === 'custom').length
            }}
          </NTag>
        </div>
      </div>

      <NDivider style="margin: 8px 0" />

      <!-- 标签筛选 -->
      <div class="sidebar-section">
        <div class="section-header">
          <span class="section-label">标签筛选</span>
          <NButton
            v-if="fontStore.tagFilter.positive.length > 0 || fontStore.tagFilter.negative.length > 0"
            size="tiny"
            quaternary
            class="clear-btn"
            @click="fontStore.clearTagFilter()"
          >
            清空
          </NButton>
        </div>
        <div class="tag-grid">
          <div
            v-for="tag in fontStore.allTags"
            :key="tag"
            class="tri-tag"
            :class="[
              fontStore.getTagState(tag) === 'positive' ? 'tri-positive' : '',
              fontStore.getTagState(tag) === 'negative' ? 'tri-negative' : '',
            ]"
            @click.left="onTagLeftClick(tag)"
            @click.right.prevent="onTagRightClick(tag, $event)"
          >
            <span class="tri-tag-name">{{ tag }}</span>
            <span class="tri-tag-count">{{ fontStore.tagCounts[tag] || 0 }}</span>
          </div>
        </div>
      </div>

      <NDivider style="margin: 8px 0" />

      <!-- 语言筛选 -->
      <div class="sidebar-section">
        <div class="section-header">
          <span class="section-label">语言筛选</span>
          <NButton
            v-if="fontStore.languageFilter.positive.length > 0 || fontStore.languageFilter.negative.length > 0"
            size="tiny"
            quaternary
            class="clear-btn"
            @click="fontStore.clearLanguageFilter()"
          >
            清空
          </NButton>
        </div>
        <div class="tag-grid">
          <div
            v-for="lang in fontStore.languageOptions"
            :key="lang"
            class="tri-tag"
            :class="[
              fontStore.getLanguageState(lang) === 'positive' ? 'tri-positive' : '',
              fontStore.getLanguageState(lang) === 'negative' ? 'tri-negative' : '',
            ]"
            @click.left="onLangLeftClick(lang)"
            @click.right.prevent="onLangRightClick(lang, $event)"
          >
            <span class="tri-tag-name">{{ LANGUAGE_LABELS[lang] || lang }}</span>
            <span class="tri-tag-count">{{ fontStore.languageCounts[lang] || 0 }}</span>
          </div>
        </div>
      </div>

      <NDivider style="margin: 8px 0" />

      <!-- 授权状态筛选 -->
      <div class="sidebar-section">
        <div class="section-header">
          <span class="section-label">授权状态</span>
          <NButton
            v-if="fontStore.licenseFilter.positive.length > 0 || fontStore.licenseFilter.negative.length > 0"
            size="tiny"
            quaternary
            class="clear-btn"
            @click="fontStore.clearLicenseFilter()"
          >
            清空
          </NButton>
        </div>
        <div class="tag-grid">
          <div
            v-for="license in fontStore.licenseOptions"
            :key="license"
            class="tri-tag"
            :class="[
              fontStore.getLicenseState(license) === 'positive' ? 'tri-positive' : '',
              fontStore.getLicenseState(license) === 'negative' ? 'tri-negative' : '',
            ]"
            @click.left="onLicenseLeftClick(license)"
            @click.right.prevent="onLicenseRightClick(license, $event)"
          >
            <span class="tri-tag-name">{{ LICENSE_LABELS[license] || license }}</span>
            <span class="tri-tag-count">{{ fontStore.licenseCounts[license] || 0 }}</span>
          </div>
        </div>
      </div>
    </NScrollbar>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--n-border-color);
  background: var(--n-color-embedded);
  user-select: none;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--n-text-color);
  letter-spacing: 0.5px;
}

.sidebar-scroll {
  flex: 1;
}

.sidebar-section {
  padding: 4px 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 4px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--n-text-color-3);
}

.clear-btn {
  font-size: 10px;
  padding: 0 6px;
  height: 20px;
}

/* 字体来源项 */
.source-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--n-text-color-2);
  transition: all 0.15s;
}

.source-item:hover {
  background: var(--n-color-hover);
}

.source-item.active {
  background: var(--n-color-pressed);
  color: var(--n-text-color);
  font-weight: 600;
  border-left: 3px solid var(--n-color-target);
  padding-left: 5px;
}

.source-label {
  flex: 1;
}

/* 三态标签网格 */
.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 2px 0;
}

.tri-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: 10px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;
  border: 1.5px solid #60a5fa;
  color: var(--n-text-color-2);
  background: #fff;
}

.tri-tag:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* 正选 (左键) — 绿色 */
.tri-tag.tri-positive {
  background: #f0fdf4;
  color: #166534;
  border-color: #22c55e;
  font-weight: 500;
}

.tri-tag.tri-positive .tri-tag-count {
  color: #15803d;
}

/* 反选 (右键) — 红色 */
.tri-tag.tri-negative {
  background: #fef2f2;
  color: #991b1b;
  border-color: #ef4444;
  text-decoration: line-through;
}

.tri-tag.tri-negative .tri-tag-count {
  color: #b91c1c;
}

.tri-tag-name {
  white-space: nowrap;
}

.tri-tag-count {
  font-size: 9px;
  opacity: 0.7;
  min-width: 12px;
  text-align: center;
}
</style>
