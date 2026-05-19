<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()
</script>

<template>
  <NButton
    size="tiny"
    quaternary
    @click="uiStore.toggleTheme()"
    :title="uiStore.theme === 'light' ? '切换深色主题' : '切换浅色主题'"
  >
    {{ uiStore.theme === 'light' ? '🌙' : '☀️' }}
  </NButton>
</template>
