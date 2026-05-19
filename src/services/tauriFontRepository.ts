import { invoke } from '@tauri-apps/api/core'
import type { FontData } from '@/types/font'

interface ScannedFont {
    id: string
    name: string
    family: string
    style: string
    source: FontData['source']
    path: string
    format: FontData['format']
    fileSize: string
}

export async function scanFontDirectory(path: string): Promise<FontData[]> {
    const scanned = await invoke<ScannedFont[]>('scan_font_directory', { path })

    return scanned.map((font) => ({
        ...font,
        languages: [],
        tags: [],
        licenseStatus: 'unknown',
        favorite: false,
        supportsVertical: true,
        isVariable: false,
        unicodeCoverage: [],
        missingCharsMock: [],
        note: '',
        website: '',
        version: '',
        vendor: '',
        copyright: '',
        sampleText: font.name,
    }))
}
