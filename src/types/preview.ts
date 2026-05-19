export interface PreviewTheme {
  id: string
  name: string
  description?: string
  background: string
  foreground: string
  mutedForeground: string
  accent: string
  border: string
  surface?: string
}

export type PreviewTemplateCategory = 'basic' | 'lyrics' | 'ui' | 'cover' | 'custom'

export interface PreviewTemplate {
  id: string
  name: string
  description: string
  category: PreviewTemplateCategory
  defaultThemeId: string
  supportsVertical: boolean
  supportsCompare: boolean
}

export type LyricsEffect = 'none' | 'shadow' | 'outline'
