import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ALL_TAGS } from '@/data/mockFonts'
import { getPreviewTemplate } from '@/data/previewTemplates'
import { mockFontRepository } from '@/services/fontRepository'
import { loadSavedFontLibrary, saveFontLibrary } from '@/services/fontLibraryStorage'
import { scanFontDirectory as scanTauriFontDirectory } from '@/services/tauriFontRepository'
import type { LyricsEffect } from '@/types/preview'
import type {
    FontData,
    SortKey,
    SidebarFilterKey,
    TabKey,
    CharCheckResult,
} from '@/types/font'

export interface TriFilterState {
    positive: string[]
    negative: string[]
}

export interface ScanSummary {
    total: number
    metadataNameCount: number
    fileNameFallbackCount: number
    previewRiskCount: number
}

const USER_DATA_SAVE_DELAY_MS = 500

function makeTriFilter(): TriFilterState {
    return { positive: [], negative: [] }
}

export const useFontStore = defineStore('font', () => {
    let librarySaveTimer: number | undefined

    const fonts = ref<FontData[]>([])
    const isLoadingFonts = ref(false)
    const fontLoadError = ref<string | null>(null)
    const lastScanSummary = ref<ScanSummary | null>(null)
    const libraryDirectories = ref<string[]>([])
    const lastScannedAt = ref<string | null>(null)
    const libraryLoadedFromStorage = ref(false)

    const selectedFontId = ref<string | null>(null)
    const activeTab = ref<TabKey>('preview')

    const searchQuery = ref('')
    const sortKey = ref<SortKey>('name')

    const sidebarSourceFilter = ref<SidebarFilterKey>('all')
    const showFavoritesOnly = ref(false)

    // ===== 三态过滤系统 =====
    const tagFilter = ref<TriFilterState>(makeTriFilter())
    const languageFilter = ref<TriFilterState>(makeTriFilter())
    const licenseFilter = ref<TriFilterState>(makeTriFilter())

    // ===== 预览模板系统 =====
    const selectedTemplateId = ref('basic-horizontal-vertical')
    const selectedThemeId = ref('warm-paper')
    const userChangedTheme = ref(false)
    const previewText = ref('汉字是世界上最古老的文字之一，经历了甲骨文、金文、篆书、隶书、楷书等演变阶段。')
    const fontSize = ref(16)
    const fontWeight = ref<number>(400)
    const lineHeight = ref(1.8)
    const letterSpacing = ref(0)
    const verticalMode = ref<'vertical-rl-mixed' | 'vertical-rl-upright' | 'vertical-lr-mixed'>('vertical-rl-mixed')
    const verticalHeight = ref(200)
    const lyricsEffect = ref<LyricsEffect>('none')

    // ===== 多字体对比 =====
    const compareFontIds = ref<string[]>([])
    const MAX_COMPARE = 6

    const selectedTemplate = computed(() => getPreviewTemplate(selectedTemplateId.value))

    const compareFonts = computed<FontData[]>(() =>
        compareFontIds.value
            .map((id) => fonts.value.find((f) => f.id === id))
            .filter((f): f is FontData => f !== undefined)
    )

    // ===== 三态过滤 tags 计数 =====
    const tagCounts = computed<Record<string, number>>(() => {
        const counts: Record<string, number> = {}
        for (const tag of ALL_TAGS) {
            counts[tag] = fonts.value.filter((f) => f.tags.includes(tag)).length
        }
        return counts
    })

    const languageCounts = computed<Record<string, number>>(() => {
        const counts: Record<string, number> = {}
        for (const f of fonts.value) {
            for (const lang of f.languages) {
                counts[lang] = (counts[lang] || 0) + 1
            }
        }
        return counts
    })

    const licenseCounts = computed<Record<string, number>>(() => {
        const counts: Record<string, number> = {}
        for (const f of fonts.value) {
            counts[f.licenseStatus] = (counts[f.licenseStatus] || 0) + 1
        }
        return counts
    })

    // ===== 字符检测 =====
    const charCheckInput = ref('')
    const charCheckResult = ref<CharCheckResult | null>(null)

    const selectedFont = computed<FontData | null>(() => {
        if (!selectedFontId.value) return null
        return fonts.value.find((f) => f.id === selectedFontId.value) || null
    })

    const filteredFonts = computed<FontData[]>(() => {
        let result = [...fonts.value]

        // 来源筛选
        if (sidebarSourceFilter.value === 'system') {
            result = result.filter((f) => f.source === 'system')
        } else if (sidebarSourceFilter.value === 'custom') {
            result = result.filter((f) => f.source === 'custom')
        } else if (sidebarSourceFilter.value === 'favorites') {
            result = result.filter((f) => f.favorite)
        }

        if (showFavoritesOnly.value) {
            result = result.filter((f) => f.favorite)
        }

        // 搜索
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.trim().toLowerCase()
            result = result.filter(
                (f) =>
                    f.name.toLowerCase().includes(q) ||
                    f.family.toLowerCase().includes(q)
            )
        }

        // 三态标签过滤
        const tp = tagFilter.value.positive
        const tn = tagFilter.value.negative
        if (tp.length > 0) {
            result = result.filter((f) => tp.some((t) => f.tags.includes(t)))
        }
        if (tn.length > 0) {
            result = result.filter((f) => tn.every((t) => !f.tags.includes(t)))
        }

        // 三态语言过滤
        const lp = languageFilter.value.positive
        const ln = languageFilter.value.negative
        if (lp.length > 0) {
            result = result.filter((f) => lp.some((l) => f.languages.includes(l as typeof f.languages[number])))
        }
        if (ln.length > 0) {
            result = result.filter((f) => ln.every((l) => !f.languages.includes(l as typeof f.languages[number])))
        }

        // 三态授权过滤
        const rp = licenseFilter.value.positive
        const rn = licenseFilter.value.negative
        if (rp.length > 0) {
            result = result.filter((f) => rp.includes(f.licenseStatus))
        }
        if (rn.length > 0) {
            result = result.filter((f) => !rn.includes(f.licenseStatus))
        }

        // 排序
        result.sort((a, b) => {
            switch (sortKey.value) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'source':
                    return a.source.localeCompare(b.source)
                case 'license':
                    return a.licenseStatus.localeCompare(b.licenseStatus)
                default:
                    return 0
            }
        })

        return result
    })

    // ===== 三态过滤操作 =====

    function toggleTriFilter(
        filter: TriFilterState,
        value: string,
        mode: 'left' | 'right'
    ) {
        const pi = filter.positive.indexOf(value)
        const ni = filter.negative.indexOf(value)

        if (mode === 'left') {
            if (pi >= 0) {
                // 正选 → 取消
                filter.positive.splice(pi, 1)
            } else if (ni >= 0) {
                // 反选 → 正选
                filter.negative.splice(ni, 1)
                filter.positive.push(value)
            } else {
                // 未选 → 正选
                filter.positive.push(value)
            }
        } else {
            // right click
            if (ni >= 0) {
                // 反选 → 取消
                filter.negative.splice(ni, 1)
            } else if (pi >= 0) {
                // 正选 → 反选
                filter.positive.splice(pi, 1)
                filter.negative.push(value)
            } else {
                // 未选 → 反选
                filter.negative.push(value)
            }
        }
    }

    function clearTriFilter(filter: TriFilterState) {
        filter.positive = []
        filter.negative = []
    }

    function toggleTagFilter(tag: string, mode: 'left' | 'right') {
        toggleTriFilter(tagFilter.value, tag, mode)
    }

    function toggleLanguageFilter(lang: string, mode: 'left' | 'right') {
        toggleTriFilter(languageFilter.value, lang, mode)
    }

    function toggleLicenseFilter(license: string, mode: 'left' | 'right') {
        toggleTriFilter(licenseFilter.value, license, mode)
    }

    function clearTagFilter() { clearTriFilter(tagFilter.value) }
    function clearLanguageFilter() { clearTriFilter(languageFilter.value) }
    function clearLicenseFilter() { clearTriFilter(licenseFilter.value) }

    function getTagState(tag: string): 'positive' | 'negative' | 'none' {
        if (tagFilter.value.positive.includes(tag)) return 'positive'
        if (tagFilter.value.negative.includes(tag)) return 'negative'
        return 'none'
    }

    function getLanguageState(lang: string): 'positive' | 'negative' | 'none' {
        if (languageFilter.value.positive.includes(lang)) return 'positive'
        if (languageFilter.value.negative.includes(lang)) return 'negative'
        return 'none'
    }

    function getLicenseState(license: string): 'positive' | 'negative' | 'none' {
        if (licenseFilter.value.positive.includes(license)) return 'positive'
        if (licenseFilter.value.negative.includes(license)) return 'negative'
        return 'none'
    }

    function selectFont(id: string) {
        selectedFontId.value = id
        activeTab.value = 'preview'
    }

    async function loadFonts() {
        isLoadingFonts.value = true
        fontLoadError.value = null

        try {
            const savedLibrary = await loadSavedFontLibrary().catch(() => null)
            if (savedLibrary && savedLibrary.fonts.length > 0) {
                fonts.value = savedLibrary.fonts
                libraryDirectories.value = savedLibrary.directories
                lastScannedAt.value = savedLibrary.lastScannedAt
                libraryLoadedFromStorage.value = true
                lastScanSummary.value = makeScanSummary(savedLibrary.fonts)
                selectedFontId.value = savedLibrary.fonts[0].id
                return
            }

            fonts.value = await mockFontRepository.listFonts()
            lastScanSummary.value = null
            libraryDirectories.value = []
            lastScannedAt.value = null
            libraryLoadedFromStorage.value = false
            if (!selectedFontId.value && fonts.value.length > 0) {
                selectedFontId.value = fonts.value[0].id
            }
        } catch (error) {
            fontLoadError.value = error instanceof Error ? error.message : String(error)
        } finally {
            isLoadingFonts.value = false
        }
    }

    async function scanFontDirectory(path: string) {
        isLoadingFonts.value = true
        fontLoadError.value = null

        try {
            const scannedFonts = mergeUserMetadata(await scanTauriFontDirectory(path), fonts.value)
            fonts.value = scannedFonts
            lastScanSummary.value = makeScanSummary(scannedFonts)
            libraryDirectories.value = [path]
            lastScannedAt.value = new Date().toISOString()
            libraryLoadedFromStorage.value = false
            selectedFontId.value = scannedFonts[0]?.id ?? null
            activeTab.value = 'preview'
            compareFontIds.value = []
            searchQuery.value = ''
            sidebarSourceFilter.value = 'all'
            showFavoritesOnly.value = false
            clearTagFilter()
            clearLanguageFilter()
            clearLicenseFilter()
            await saveFontLibrary({
                directories: libraryDirectories.value,
                lastScannedAt: lastScannedAt.value,
                fonts: scannedFonts,
            })
        } catch (error) {
            fontLoadError.value = error instanceof Error ? error.message : String(error)
        } finally {
            isLoadingFonts.value = false
        }
    }

    function makeScanSummary(scannedFonts: FontData[]): ScanSummary {
        return {
            total: scannedFonts.length,
            metadataNameCount: scannedFonts.filter((font) => font.nameSource === 'metadata').length,
            fileNameFallbackCount: scannedFonts.filter((font) => font.nameSource !== 'metadata').length,
            previewRiskCount: scannedFonts.filter((font) => font.format === 'ttc').length,
        }
    }

    function canSaveLibrary(): boolean {
        return libraryDirectories.value.length > 0 && Boolean(lastScannedAt.value)
    }

    async function saveCurrentLibrary(): Promise<void> {
        if (!canSaveLibrary()) return

        await saveFontLibrary({
            directories: libraryDirectories.value,
            lastScannedAt: lastScannedAt.value!,
            fonts: fonts.value,
        })
    }

    function scheduleLibrarySave() {
        if (!canSaveLibrary()) return

        if (typeof window === 'undefined') {
            void saveCurrentLibrary()
            return
        }

        if (librarySaveTimer !== undefined) {
            window.clearTimeout(librarySaveTimer)
        }

        librarySaveTimer = window.setTimeout(() => {
            librarySaveTimer = undefined
            void saveCurrentLibrary().catch((error) => {
                fontLoadError.value = error instanceof Error ? error.message : String(error)
            })
        }, USER_DATA_SAVE_DELAY_MS)
    }

    function mergeUserMetadata(scannedFonts: FontData[], previousFonts: FontData[]): FontData[] {
        const previousById = new Map(previousFonts.map((font) => [font.id, font]))

        return scannedFonts.map((font) => {
            const previous = previousById.get(font.id)
            if (!previous) return font

            return {
                ...font,
                favorite: previous.favorite,
                tags: [...previous.tags],
                licenseStatus: previous.licenseStatus,
                note: previous.note,
                website: previous.website,
            }
        })
    }

    function setTab(tab: TabKey) {
        activeTab.value = tab
    }

    function toggleFavorite(fontId: string) {
        const font = fonts.value.find((f) => f.id === fontId)
        if (font) {
            font.favorite = !font.favorite
            scheduleLibrarySave()
        }
    }

    // ===== 预览模板系统 actions =====

    function setTemplate(templateId: string) {
        selectedTemplateId.value = templateId
        const tmpl = getPreviewTemplate(templateId)
        if (!userChangedTheme.value) {
            selectedThemeId.value = tmpl.defaultThemeId
        }
    }

    function setTheme(themeId: string) {
        selectedThemeId.value = themeId
        userChangedTheme.value = true
    }

    function resetToTemplateDefaults() {
        const tmpl = selectedTemplate.value
        selectedThemeId.value = tmpl.defaultThemeId
        userChangedTheme.value = false
        fontSize.value = 16
        fontWeight.value = 400
        lineHeight.value = 1.8
        letterSpacing.value = 0
        verticalMode.value = 'vertical-rl-mixed'
        verticalHeight.value = 200
        lyricsEffect.value = 'none'
        previewText.value = '汉字是世界上最古老的文字之一，经历了甲骨文、金文、篆书、隶书、楷书等演变阶段。'
    }

    function setPreviewText(text: string) {
        previewText.value = text
    }

    // ===== 多字体对比 actions =====

    function toggleCompareFont(fontId: string) {
        const idx = compareFontIds.value.indexOf(fontId)
        if (idx >= 0) {
            compareFontIds.value.splice(idx, 1)
        } else if (compareFontIds.value.length < MAX_COMPARE) {
            compareFontIds.value.push(fontId)
        }
    }

    function clearCompare() {
        compareFontIds.value = []
    }

    function isInCompare(fontId: string): boolean {
        return compareFontIds.value.includes(fontId)
    }

    function isCompareFull(): boolean {
        return compareFontIds.value.length >= MAX_COMPARE
    }

    // ===== 字符检测 =====

    function runCharCheck(text: string) {
        const font = selectedFont.value
        if (!font || !text.trim()) {
            charCheckResult.value = null
            return
        }

        const inputChars = [...new Set(text.replace(/\s/g, '').split(''))]
        const missing = inputChars.filter((ch) =>
            font.missingCharsMock.includes(ch)
        )
        charCheckResult.value = {
            allSupported: missing.length === 0,
            missingChars: missing,
            inputText: text,
        }
    }

    function pasteFromClipboard() {
        navigator.clipboard.readText().then((text) => {
            charCheckInput.value = text
            runCharCheck(text)
        }).catch(() => {
            // clipboard access denied or empty
        })
    }

    // ===== 标签备注 =====

    function addTag(fontId: string, tag: string) {
        const font = fonts.value.find((f) => f.id === fontId)
        if (font && tag.trim() && !font.tags.includes(tag.trim())) {
            font.tags.push(tag.trim())
            scheduleLibrarySave()
        }
    }

    function removeTag(fontId: string, tag: string) {
        const font = fonts.value.find((f) => f.id === fontId)
        if (font) {
            font.tags = font.tags.filter((t) => t !== tag)
            scheduleLibrarySave()
        }
    }

    function updateFontNote(fontId: string, note: string) {
        const font = fonts.value.find((f) => f.id === fontId)
        if (font) {
            font.note = note
            scheduleLibrarySave()
        }
    }

    function updateFontWebsite(fontId: string, website: string) {
        const font = fonts.value.find((f) => f.id === fontId)
        if (font) {
            font.website = website
            scheduleLibrarySave()
        }
    }

    function updateLicenseStatus(fontId: string, status: string) {
        const font = fonts.value.find((f) => f.id === fontId)
        if (font && status) {
            font.licenseStatus = status as FontData['licenseStatus']
            scheduleLibrarySave()
        }
    }

    // ===== 侧边栏来源筛选 =====

    function setSidebarSourceFilter(filter: SidebarFilterKey) {
        sidebarSourceFilter.value = filter
        showFavoritesOnly.value = filter === 'favorites'
    }

    const allTags = computed(() => ALL_TAGS)

    const languageOptions = computed(() => {
        const langs = new Set<string>()
        fonts.value.forEach((f) => f.languages.forEach((l) => langs.add(l)))
        return Array.from(langs).sort()
    })

    const licenseOptions = ['commercial', 'personal_free', 'unconfirmed', 'unknown'] as const

    return {
        fonts,
        isLoadingFonts,
        fontLoadError,
        lastScanSummary,
        libraryDirectories,
        lastScannedAt,
        libraryLoadedFromStorage,
        selectedFontId,
        activeTab,
        searchQuery,
        sortKey,
        sidebarSourceFilter,
        showFavoritesOnly,
        // 三态过滤
        tagFilter,
        languageFilter,
        licenseFilter,
        tagCounts,
        languageCounts,
        licenseCounts,
        // 预览模板系统
        selectedTemplateId,
        selectedThemeId,
        userChangedTheme,
        previewText,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
        verticalMode,
        verticalHeight,
        lyricsEffect,
        selectedTemplate,
        // 多字体对比
        compareFontIds,
        MAX_COMPARE,
        compareFonts,
        // 字符检测
        charCheckInput,
        charCheckResult,
        // 计算属性
        selectedFont,
        filteredFonts,
        allTags,
        languageOptions,
        licenseOptions,
        // 字体操作
        loadFonts,
        scanFontDirectory,
        selectFont,
        setTab,
        toggleFavorite,
        // 预览模板系统 actions
        setTemplate,
        setTheme,
        resetToTemplateDefaults,
        setPreviewText,
        // 多字体对比 actions
        toggleCompareFont,
        clearCompare,
        isInCompare,
        isCompareFull,
        // 三态过滤 actions
        toggleTagFilter,
        toggleLanguageFilter,
        toggleLicenseFilter,
        clearTagFilter,
        clearLanguageFilter,
        clearLicenseFilter,
        getTagState,
        getLanguageState,
        getLicenseState,
        // 字符检测
        runCharCheck,
        pasteFromClipboard,
        // 标签备注
        addTag,
        removeTag,
        updateFontNote,
        updateFontWebsite,
        updateLicenseStatus,
        // 侧边栏筛选
        setSidebarSourceFilter,
    }
})
