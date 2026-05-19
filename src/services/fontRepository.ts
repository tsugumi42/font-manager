import { mockFonts } from '@/data/mockFonts'
import type { FontData } from '@/types/font'

export interface FontRepository {
    listFonts(): Promise<FontData[]>
}

export const mockFontRepository: FontRepository = {
    async listFonts() {
        return mockFonts.map((font) => ({
            ...font,
            languages: [...font.languages],
            tags: [...font.tags],
            unicodeCoverage: font.unicodeCoverage.map((range) => ({ ...range })),
            missingCharsMock: [...font.missingCharsMock],
        }))
    },
}
