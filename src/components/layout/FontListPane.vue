<script setup lang="ts">
import { NInput, NSelect, NScrollbar, NEmpty } from 'naive-ui'
import { useFontStore } from '@/stores/fontStore'
import FontListItem from '@/components/font/FontListItem.vue'
import type { SortKey } from '@/types/font'

const fontStore = useFontStore()

const sortOptions = [
  { label: '按名称', value: 'name' as SortKey },
  { label: '按来源', value: 'source' as SortKey },
  { label: '按授权', value: 'license' as SortKey },
]
</script>

<template>
  <div class="font-list-pane">
    <div class="list-toolbar">
      <NInput
        v-model:value="fontStore.searchQuery"
        placeholder="搜索字体名称..."
        clearable
        size="small"
        class="search-input"
      />
      <NSelect
        v-model:value="fontStore.sortKey"
        :options="sortOptions"
        size="small"
        class="sort-select"
      />
    </div>
    <NScrollbar class="list-scroll">
      <div v-if="fontStore.filteredFonts.length > 0" class="font-list">
        <FontListItem
          v-for="font in fontStore.filteredFonts"
          :key="font.id"
          :font="font"
          :selected="fontStore.selectedFontId === font.id"
          @click="fontStore.selectFont(font.id)"
        />
      </div>
      <div v-else class="empty-wrap">
        <NEmpty description="没有匹配的字体" />
      </div>
    </NScrollbar>
  </div>
</template>

<style scoped>
.font-list-pane {
  width: 360px;
  min-width: 360px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--n-border-color);
  background: var(--n-color);
}

.list-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--n-border-color);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
}

.sort-select {
  width: 130px;
  flex-shrink: 0;
}

.list-scroll {
  flex: 1;
}

.font-list {
  padding: 4px;
}

.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
