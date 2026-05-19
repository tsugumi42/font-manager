<script setup lang="ts">
import { onMounted } from 'vue'
import { useFontStore } from '@/stores/fontStore'
import Sidebar from './Sidebar.vue'
import FontListPane from './FontListPane.vue'
import DetailPane from './DetailPane.vue'

const fontStore = useFontStore()

onMounted(() => {
  void fontStore.loadFonts()
})
</script>

<template>
  <div class="app-shell">
    <Sidebar />
    <FontListPane />
    <DetailPane />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--n-color-body);
}
</style>
