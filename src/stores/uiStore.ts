import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const theme = ref<'light' | 'dark'>('light')
    const sidebarCollapsed = ref(false)

    function toggleTheme() {
        theme.value = theme.value === 'light' ? 'dark' : 'light'
    }

    function toggleSidebar() {
        sidebarCollapsed.value = !sidebarCollapsed.value
    }

    return {
        theme,
        sidebarCollapsed,
        toggleTheme,
        toggleSidebar,
    }
})
