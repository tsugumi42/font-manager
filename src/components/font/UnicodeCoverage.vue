<script setup lang="ts">
import { computed } from 'vue'
import { NProgress, NText } from 'naive-ui'
import type { UnicodeRangeCoverage } from '@/types/font'

const props = defineProps<{
  coverage: UnicodeRangeCoverage[]
}>()

function percent(item: UnicodeRangeCoverage): number {
  return item.total > 0 ? Math.round((item.covered / item.total) * 100) : 0
}

function status(item: UnicodeRangeCoverage): 'success' | 'warning' | 'error' {
  const p = percent(item)
  if (p >= 90) return 'success'
  if (p >= 50) return 'warning'
  return 'error'
}
</script>

<template>
  <div class="unicode-coverage">
    <div
      v-for="item in coverage"
      :key="item.name"
      class="coverage-row"
    >
      <div class="coverage-label">
        <NText depth="2">{{ item.label }}</NText>
        <NText depth="3" class="coverage-count">{{ item.covered }} / {{ item.total }}</NText>
      </div>
      <NProgress
        :percentage="percent(item)"
        :status="status(item)"
        :height="16"
        :border-radius="3"
        :show-indicator="true"
        indicator-placement="inside"
      />
    </div>
  </div>
</template>

<style scoped>
.unicode-coverage {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coverage-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.coverage-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.coverage-count {
  font-size: 11px;
}
</style>
