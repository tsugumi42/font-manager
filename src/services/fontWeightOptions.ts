import type { FontData } from '@/types/font'
import type { SelectOption } from 'naive-ui'

const STANDARD_WEIGHTS = [
    { label: 'Thin', value: 100 },
    { label: 'ExtraLight', value: 200 },
    { label: 'Light', value: 300 },
    { label: 'Regular', value: 400 },
    { label: 'Medium', value: 500 },
    { label: 'SemiBold', value: 600 },
    { label: 'Bold', value: 700 },
    { label: 'ExtraBold', value: 800 },
    { label: 'Black', value: 900 },
]

export function fontWeightOptions(font: FontData | null | undefined): SelectOption[] {
    if (!font) return STANDARD_WEIGHTS.map(formatStandardWeightOption)

    const weights = font.availableWeights && font.availableWeights.length > 0
        ? font.availableWeights
        : [font.weightClass || 400]

    return weights
        .slice()
        .sort((a, b) => a - b)
        .map((weight) => formatWeightOption(weight, font))
}

export function closestFontWeight(font: FontData | null | undefined, weight: number): number {
    const options = fontWeightOptions(font)
        .map((option) => option.value)
        .filter((value): value is number => typeof value === 'number')
    return options.reduce((closest, current) => (
        Math.abs(current - weight) < Math.abs(closest - weight) ? current : closest
    ), options[0] || 400)
}

export function fontWeightSummary(font: FontData | null | undefined): string {
    if (!font) return ''

    if (font.variableWeightRange) {
        const range = font.variableWeightRange
        return `可变字重 ${range.min}-${range.max}，默认 ${range.default}`
    }

    return `实际字重 ${font.weightClass || 400}`
}

function formatStandardWeightOption(option: { label: string; value: number }): SelectOption {
    return {
        label: `${option.label} (${option.value})`,
        value: option.value,
    }
}

function formatWeightOption(weight: number, font: FontData): SelectOption {
    const standard = STANDARD_WEIGHTS.find((option) => option.value === weight)
    const label = standard ? standard.label : 'Custom'
    const suffix = font.variableWeightRange?.default === weight || font.weightClass === weight
        ? ' · 默认'
        : ''

    return {
        label: `${label} (${weight})${suffix}`,
        value: weight,
    }
}
