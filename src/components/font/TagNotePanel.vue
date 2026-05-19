<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NCard,
  NTag,
  NInput,
  NButton,
  NSelect,
  NSwitch,
  NText,
  NDivider,
  NSpace,
} from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import { LICENSE_LABELS } from '@/data/mockFonts'

const fontStore = useFontStore()
const font = computed(() => fontStore.selectedFont)

const newTagValue = ref('')

const licenseOptions = [
  { label: '可商用', value: 'commercial' },
  { label: '个人免费', value: 'personal_free' },
  { label: '待确认', value: 'unconfirmed' },
  { label: '未知', value: 'unknown' },
]

function handleAddTag() {
  if (!newTagValue.value.trim() || !font.value) return
  fontStore.addTag(font.value.id, newTagValue.value.trim())
  newTagValue.value = ''
}

function handleRemoveTag(tag: string) {
  if (!font.value) return
  fontStore.removeTag(font.value.id, tag)
}
</script>

<template>
  <div class="tag-note-panel" v-if="font">
    <!-- 标签 -->
    <NCard size="small" :bordered="true" class="section-card">
      <template #header>
        <NText strong>标签</NText>
      </template>
      <div class="tag-list">
        <NTag
          v-for="tag in font.tags"
          :key="tag"
          size="medium"
          type="info"
          :bordered="false"
          closable
          @close="handleRemoveTag(tag)"
        >
          {{ tag }}
        </NTag>
        <span v-if="font.tags.length === 0" class="empty-hint">暂无标签</span>
      </div>
      <div class="add-tag-row">
        <NInput
          v-model:value="newTagValue"
          size="small"
          placeholder="输入新标签..."
          @keyup.enter="handleAddTag"
        />
        <NButton size="small" type="primary" @click="handleAddTag" :disabled="!newTagValue.trim()">
          添加
        </NButton>
      </div>
    </NCard>

    <!-- 收藏 & 授权 -->
    <NCard size="small" :bordered="true" class="section-card">
      <template #header>
        <NText strong>收藏与授权</NText>
      </template>
      <NSpace vertical :size="12">
        <div class="switch-row">
          <NText depth="2">收藏</NText>
          <NSwitch
            :value="font.favorite"
            @update:value="fontStore.toggleFavorite(font.id)"
          />
        </div>
        <div>
          <NText depth="3" class="control-label">授权状态</NText>
          <NSelect
            size="small"
            :value="font.licenseStatus"
            :options="licenseOptions"
            @update:value="(v: string) => fontStore.updateLicenseStatus(fontStore.selectedFontId!, v)"
          />
        </div>
      </NSpace>
    </NCard>

    <!-- 官网 & 备注 -->
    <NCard size="small" :bordered="true" class="section-card">
      <template #header>
        <NText strong>链接与备注</NText>
      </template>
      <NSpace vertical :size="12">
        <div>
          <NText depth="3" class="control-label">官网 / 下载地址</NText>
          <NInput
            size="small"
            :value="font.website"
            placeholder="输入官网或下载链接..."
            @update:value="(v: string) => fontStore.updateFontWebsite(fontStore.selectedFontId!, v)"
          />
        </div>
        <div>
          <NText depth="3" class="control-label">备注</NText>
          <NInput
            type="textarea"
            :value="font.note"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="添加备注信息..."
            @update:value="(v: string) => fontStore.updateFontNote(fontStore.selectedFontId!, v)"
          />
        </div>
      </NSpace>
    </NCard>
  </div>
  <div v-else class="no-font">请选择一个字体</div>
</template>

<style scoped>
.tag-note-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-card {
  flex-shrink: 0;
}

.tag-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.empty-hint {
  color: var(--n-text-color-3);
  font-size: 12px;
}

.add-tag-row {
  display: flex;
  gap: 8px;
}

.add-tag-row .n-input {
  flex: 1;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
}

.no-font {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--n-text-color-3);
}
</style>
