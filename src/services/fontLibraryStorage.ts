import { invoke } from '@tauri-apps/api/core'
import { attachRenderFamilies } from '@/services/fontFaceRegistry'
import type { FontData } from '@/types/font'

export interface SavedFontLibrary {
    directories: string[]
    lastScannedAt: string
    fonts: FontData[]
}

export async function loadSavedFontLibrary(): Promise<SavedFontLibrary | null> {
    const library = await invoke<SavedFontLibrary | null>('load_font_library')
    if (!library) return null

    return {
        ...library,
        fonts: attachRenderFamilies(library.fonts),
    }
}

export async function saveFontLibrary(library: SavedFontLibrary): Promise<void> {
    await invoke('save_font_library', {
        library: {
            ...library,
            fonts: library.fonts.map((font) => ({
                ...font,
                renderFamily: undefined,
            })),
        },
    })
}
