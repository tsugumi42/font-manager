import type { PreviewTheme } from '@/types/preview'

export const previewThemes: PreviewTheme[] = [
    {
        id: 'pure-white',
        name: '纯白纸面',
        description: '白底深字，基础观察用',
        background: '#FFFFFF',
        foreground: '#1a1a1a',
        mutedForeground: '#888888',
        accent: '#3b82f6',
        border: '#e5e5e5',
        surface: '#f8f8f8',
    },
    {
        id: 'warm-paper',
        name: '暖纸色',
        description: '米色底深棕黑字，适合中日文/封面/手书感',
        background: '#f5f0e8',
        foreground: '#2c2416',
        mutedForeground: '#8b7e6a',
        accent: '#b85c3a',
        border: '#e0d5c0',
        surface: '#faf6ee',
    },
    {
        id: 'dark-mv',
        name: '黑底MV',
        description: '黑底浅字，紫/蓝强调，歌词PV风格',
        background: '#0d0d0d',
        foreground: '#e8e8e8',
        mutedForeground: '#6a6a7a',
        accent: '#a78bfa',
        border: '#2a2a36',
        surface: '#1a1a24',
    },
    {
        id: 'midnight-blue',
        name: '深蓝夜色',
        description: '深蓝黑底浅字，PV标题风格',
        background: '#0a1628',
        foreground: '#d0dce8',
        mutedForeground: '#5a7a9a',
        accent: '#60a5fa',
        border: '#1a2a48',
        surface: '#0f1f38',
    },
    {
        id: 'clean-ui',
        name: '清爽UI',
        description: '浅灰白底深字蓝强调，适合游戏UI/小字号',
        background: '#f4f5f7',
        foreground: '#1e293b',
        mutedForeground: '#94a3b8',
        accent: '#3b82f6',
        border: '#e2e8f0',
        surface: '#ffffff',
    },
    {
        id: 'cute-pink',
        name: '粉色可爱',
        description: '浅粉底深字粉强调，适合二游/角色卡片',
        background: '#fdf2f8',
        foreground: '#3d1a2e',
        mutedForeground: '#c080a0',
        accent: '#ec4899',
        border: '#f9d4e8',
        surface: '#fef6fb',
    },
    {
        id: 'checkerboard',
        name: '透明棋盘格',
        description: 'CSS 棋盘格模拟透明背景',
        background: 'checkerboard',
        foreground: '#1a1a1a',
        mutedForeground: '#888888',
        accent: '#6366f1',
        border: '#cccccc',
        surface: '#f0f0f0',
    },
]

export const themeMap = Object.fromEntries(previewThemes.map((t) => [t.id, t]))

export function getPreviewTheme(id: string): PreviewTheme {
    return themeMap[id] || previewThemes[0]
}
