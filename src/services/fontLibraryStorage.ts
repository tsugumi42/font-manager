import { invoke } from '@tauri-apps/api/core'
import { attachRenderFamilies } from '@/services/fontFaceRegistry'
import type { FontData } from '@/types/font'

const LIBRARY_SCHEMA_VERSION = 2

export interface SavedFontLibrary {
    schemaVersion: number
    directories: string[]
    lastScannedAt: string
    fonts: FontData[]
}

export type FontLibrarySnapshot = Omit<SavedFontLibrary, 'schemaVersion'>

export async function loadSavedFontLibrary(): Promise<SavedFontLibrary | null> {
    const library = await invoke<SavedFontLibrary | null>('load_font_library')
    if (!library) return null
    if (library.schemaVersion !== LIBRARY_SCHEMA_VERSION) return null

    return {
        ...library,
        fonts: attachRenderFamilies(library.fonts),
    }
}

export async function saveFontLibrary(library: FontLibrarySnapshot): Promise<void> {
    await invoke('save_font_library', {
        library: {
            ...library,
            schemaVersion: LIBRARY_SCHEMA_VERSION,
            fonts: library.fonts.map((font) => ({
                ...font,
                renderFamily: undefined,
            })),
        },
    })
}
