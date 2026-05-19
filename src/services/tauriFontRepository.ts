import { invoke } from '@tauri-apps/api/core'
import { attachRenderFamilies } from '@/services/fontFaceRegistry'
import type { FontData } from '@/types/font'

interface ScannedFont {
    id: string
    name: string
    nameSource: 'metadata' | 'file_name'
    family: string
    style: string
    source: FontData['source']
    path: string
    fileName: string
    format: FontData['format']
    fileSize: string
    isVariable: boolean
    version: string
    vendor: string
    copyright: string
}

export async function scanFontDirectory(path: string): Promise<FontData[]> {
    const scanned = await invoke<ScannedFont[]>('scan_font_directory', { path })

    return attachRenderFamilies(scanned.map((font) => ({
        ...font,
        languages: [],
        tags: [],
        licenseStatus: 'unknown',
        favorite: false,
        supportsVertical: true,
        unicodeCoverage: [],
        missingCharsMock: [],
        note: '',
        website: '',
        sampleText: font.name,
    })))
}
