import { convertFileSrc } from '@tauri-apps/api/core'
import type { FontData } from '@/types/font'

const STYLE_ELEMENT_ID = 'font-manager-dynamic-font-faces'
const CACHE_WARM_BATCH_SIZE = 4
const CACHE_WARM_DELAY_MS = 80

const registeredFontFaceRules = new Map<string, string>()
const preloadedFontFaces = new Set<string>()
let cacheWarmTimer: number | undefined
let cacheWarmRunId = 0

export function attachRenderFamilies(fonts: FontData[]): FontData[] {
    clearRegisteredFontFaces()
    return fonts.map((font) => ({
        ...font,
        renderFamily: makeRenderFamily(font),
    }))
}

export function fontFamilyCss(font: FontData): string {
    registerFontFace(font)
    return `"${escapeCssString(font.renderFamily || font.family)}", "Microsoft YaHei", sans-serif`
}

export function preloadFontFaces(fonts: FontData[]) {
    if (typeof document === 'undefined') return
    if (!document.fonts) return

    for (const font of fonts) {
        registerFontFace(font)

        const family = font.renderFamily || font.family
        if (preloadedFontFaces.has(family)) continue

        preloadedFontFaces.add(family)
        void document.fonts
            .load(`14px "${escapeCssString(family)}"`)
            .catch(() => undefined)
    }
}

export function warmFontFaceCache(fonts: FontData[]) {
    if (typeof window === 'undefined') return

    cancelFontFaceCacheWarmup()

    const runId = cacheWarmRunId
    const queue = fonts.filter((font) => font.source === 'custom' && font.path)
    let cursor = 0

    function runBatch() {
        if (runId !== cacheWarmRunId) return

        const batch: FontData[] = []
        while (cursor < queue.length && batch.length < CACHE_WARM_BATCH_SIZE) {
            const font = queue[cursor]
            cursor += 1

            const family = font.renderFamily || font.family
            if (!preloadedFontFaces.has(family)) {
                batch.push(font)
            }
        }

        if (batch.length > 0) {
            preloadFontFaces(batch)
        }

        if (cursor < queue.length) {
            cacheWarmTimer = window.setTimeout(runBatch, CACHE_WARM_DELAY_MS)
        } else {
            cacheWarmTimer = undefined
        }
    }

    cacheWarmTimer = window.setTimeout(runBatch, CACHE_WARM_DELAY_MS)
}

function registerFontFace(font: FontData) {
    if (typeof document === 'undefined') return
    if (font.source !== 'custom' || !font.path || !font.renderFamily) return
    if (registeredFontFaceRules.has(font.renderFamily)) return

    const sourceUrl = convertFileSrc(font.path)
    const format = cssFontFormat(font.format)
    const formatPart = format ? ` format("${format}")` : ''
    const rule = `@font-face {
  font-family: "${escapeCssString(font.renderFamily)}";
  src: url("${escapeCssUrl(sourceUrl)}")${formatPart};
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}`

    registeredFontFaceRules.set(font.renderFamily, rule)
    renderRegisteredFontFaces()
}

function clearRegisteredFontFaces() {
    cancelFontFaceCacheWarmup()
    registeredFontFaceRules.clear()
    preloadedFontFaces.clear()
    if (typeof document === 'undefined') return
    const existing = document.getElementById(STYLE_ELEMENT_ID)
    if (existing instanceof HTMLStyleElement) {
        existing.textContent = ''
    }
}

function cancelFontFaceCacheWarmup() {
    cacheWarmRunId += 1
    if (cacheWarmTimer !== undefined && typeof window !== 'undefined') {
        window.clearTimeout(cacheWarmTimer)
        cacheWarmTimer = undefined
    }
}

function renderRegisteredFontFaces() {
    getOrCreateStyleElement().textContent = [...registeredFontFaceRules.values()].join('\n\n')
}

function getOrCreateStyleElement(): HTMLStyleElement {
    const existing = document.getElementById(STYLE_ELEMENT_ID)
    if (existing instanceof HTMLStyleElement) return existing

    const style = document.createElement('style')
    style.id = STYLE_ELEMENT_ID
    document.head.appendChild(style)
    return style
}

function makeRenderFamily(font: FontData): string {
    if (font.source !== 'custom' || !font.path) return font.family
    return `FontManager_${hashString(font.path)}`
}

function hashString(value: string): string {
    let hash = 5381
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) + hash) ^ value.charCodeAt(i)
    }
    return (hash >>> 0).toString(36)
}

function cssFontFormat(format: FontData['format']): string {
    switch (format) {
        case 'ttf':
            return 'truetype'
        case 'otf':
            return 'opentype'
        case 'woff':
            return 'woff'
        case 'woff2':
            return 'woff2'
        case 'ttc':
            return ''
        default:
            return ''
    }
}

function escapeCssString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function escapeCssUrl(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
