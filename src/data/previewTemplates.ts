import type { PreviewTemplate } from '@/types/preview'

export const previewTemplates: PreviewTemplate[] = [
    {
        id: 'basic-horizontal-vertical',
        name: '横竖排对照',
        description: '同时显示横排与竖排预览，适合测试 CJK 字体竖排表现',
        category: 'basic',
        defaultThemeId: 'warm-paper',
        supportsVertical: true,
        supportsCompare: true,
    },
    {
        id: 'lyrics-mv',
        name: '歌词 MV',
        description: '模拟 MV 歌词字幕排版，支持主歌/副歌/翻译/章节标注',
        category: 'lyrics',
        defaultThemeId: 'dark-mv',
        supportsVertical: false,
        supportsCompare: true,
    },
    {
        id: 'game-ui',
        name: '游戏 UI',
        description: '模拟游戏界面元素：角色名、等级、技能描述、数值、按钮',
        category: 'ui',
        defaultThemeId: 'clean-ui',
        supportsVertical: false,
        supportsCompare: true,
    },
    {
        id: 'cover-card',
        name: '封面标题卡片',
        description: 'PV 封面/海报标题卡，包含大标题、副标题、装饰、竖排标题区',
        category: 'cover',
        defaultThemeId: 'midnight-blue',
        supportsVertical: true,
        supportsCompare: true,
    },
]

export const templateMap = Object.fromEntries(previewTemplates.map((t) => [t.id, t]))

export function getPreviewTemplate(id: string): PreviewTemplate {
    return templateMap[id] || previewTemplates[0]
}
