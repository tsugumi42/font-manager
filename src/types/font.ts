export type FontSource = 'system' | 'custom'

export type LicenseStatus = 'commercial' | 'personal_free' | 'unconfirmed' | 'unknown'

export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2' | 'ttc'

export type LanguageCode = 'zh' | 'ja' | 'en' | 'ko' | 'th' | 'vi' | 'ar'

export interface UnicodeRangeCoverage {
  name: string
  label: string
  covered: number
  total: number
}

export interface FontWeightRange {
  min: number
  default: number
  max: number
}

export interface FontData {
  id: string
  name: string
  nameSource?: 'metadata' | 'file_name'
  family: string
  renderFamily?: string
  style: string
  source: FontSource
  path: string
  fileName?: string
  format: FontFormat
  fileSize: string
  languages: LanguageCode[]
  tags: string[]
  licenseStatus: LicenseStatus
  favorite: boolean
  supportsVertical: boolean
  isVariable: boolean
  weightClass?: number
  availableWeights?: number[]
  variableWeightRange?: FontWeightRange | null
  unicodeCoverage: UnicodeRangeCoverage[]
  missingCharsMock: string[]
  note: string
  website: string
  version: string
  vendor: string
  copyright: string
  sampleText: string
}

export type SortKey = 'name' | 'source' | 'license'

export type VerticalMode = 'rl-mixed' | 'rl-upright' | 'lr-mixed'

export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

export interface PreviewSettings {
  text: string
  fontSize: number
  fontWeight: FontWeight
  lineHeight: number
  letterSpacing: number
  verticalMode: VerticalMode
  isVertical: boolean
}

export interface CharCheckResult {
  allSupported: boolean
  missingChars: string[]
  inputText: string
}

export type TabKey = 'preview' | 'charcheck' | 'info' | 'tagnote'

export type SidebarFilterKey = 'all' | 'system' | 'custom' | 'favorites'
