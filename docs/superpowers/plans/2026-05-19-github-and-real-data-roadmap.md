# GitHub And Real Data Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the project for GitHub publication, then evolve the mock-only font manager into a real local font scanner and manager.

**Architecture:** Keep the current Vue/Tauri GUI intact while introducing a thin data access boundary between Pinia stores and the source of font data. Implement real functionality in small vertical slices: repository hygiene first, then frontend service boundary, then Tauri font scanning, then persistence and richer metadata.

**Tech Stack:** Vue 3, TypeScript, Pinia, Naive UI, Vite, Tauri v2, Rust, npm, GitHub.

---

## File Structure

- `.gitignore`: exclude dependencies, build output, generated schemas, logs, local user data, editor files, and test artifacts.
- `README.md`: update repository setup, development commands, current limitations, and roadmap.
- `docs/superpowers/plans/2026-05-19-github-and-real-data-roadmap.md`: this implementation plan.
- `src/services/fontRepository.ts`: frontend repository interface and mock-backed implementation.
- `src/services/tauriFontRepository.ts`: later Tauri-backed implementation using `invoke`.
- `src/stores/fontStore.ts`: consume repository functions instead of importing mock data directly.
- `src-tauri/src/lib.rs`: register Rust commands for scanning fonts and loading metadata.
- `src-tauri/src/font_scan.rs`: scan configured font directories and return serializable font records.
- `src-tauri/src/font_model.rs`: Rust-side data transfer types matching the frontend domain model.
- `src-tauri/Cargo.toml`: add Rust crates only when required by the implemented slice.

---

### Task 1: Repository Hygiene

**Files:**
- Create: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Verify ignored files before first commit**

Run:

```bash
git status --short --ignored
```

Expected:

```text
?? .gitignore
?? README.md
?? docs/
?? index.html
?? package-lock.json
?? package.json
?? public/
?? src-tauri/
?? src/
?? tsconfig.json
?? tsconfig.node.json
?? vite.config.ts
!! dist/
!! node_modules/
!! src-tauri/target/
!! user-data/
```

- [ ] **Step 2: Update README with GitHub-ready setup**

Modify `README.md` so the quick start matches this repository:

````markdown
### 安装依赖

```bash
npm install
```

### 开发模式运行（仅前端）

```bash
npm run dev
```

### 开发模式运行（带 Tauri 桌面窗口）

```bash
npm run tauri dev
```

### 构建生产版本

```bash
npm run tauri build
```
```

Also add a short note:

```markdown
## 当前限制

- 当前数据来自 mock 数据，尚未接入真实字体扫描。
- `user-data/` 是本地运行数据，不提交到仓库。
- `src-tauri/target/`、`dist/`、`node_modules/` 是生成目录，不提交到仓库。
```
````

- [ ] **Step 3: Verify frontend build**

Run:

```bash
npm run build
```

Expected:

```text
vue-tsc --noEmit && vite build
✓ built
```

- [ ] **Step 4: Commit repository hygiene**

Run:

```bash
git add .gitignore README.md docs/superpowers/plans/2026-05-19-github-and-real-data-roadmap.md
git commit -m "chore: prepare repository for github"
```

Expected: a commit containing ignore rules, README cleanup, and this plan.

---

### Task 2: Add A Frontend Font Repository Boundary

**Files:**
- Create: `src/services/fontRepository.ts`
- Modify: `src/stores/fontStore.ts`

- [ ] **Step 1: Create the repository module**

Create `src/services/fontRepository.ts`:

```ts
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
```

- [ ] **Step 2: Update store initialization**

In `src/stores/fontStore.ts`, replace:

```ts
import { mockFonts, ALL_TAGS } from '@/data/mockFonts'
```

with:

```ts
import { ALL_TAGS } from '@/data/mockFonts'
import { mockFontRepository } from '@/services/fontRepository'
```

Replace:

```ts
const fonts = ref<FontData[]>([...mockFonts])
```

with:

```ts
const fonts = ref<FontData[]>([])
const isLoadingFonts = ref(false)
const fontLoadError = ref<string | null>(null)
```

Add this action inside the store:

```ts
async function loadFonts() {
  isLoadingFonts.value = true
  fontLoadError.value = null

  try {
    fonts.value = await mockFontRepository.listFonts()
    if (!selectedFontId.value && fonts.value.length > 0) {
      selectedFontId.value = fonts.value[0].id
    }
  } catch (error) {
    fontLoadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    isLoadingFonts.value = false
  }
}
```

Return `isLoadingFonts`, `fontLoadError`, and `loadFonts` from the store.

- [ ] **Step 3: Load fonts from the app shell**

In `src/components/layout/AppShell.vue`, import `onMounted` and `useFontStore`, then load the fonts once:

```ts
import { onMounted } from 'vue'
import { useFontStore } from '@/stores/fontStore'

const fontStore = useFontStore()

onMounted(() => {
  void fontStore.loadFonts()
})
```

- [ ] **Step 4: Verify behavior**

Run:

```bash
npm run build
```

Expected:

```text
vue-tsc --noEmit && vite build
✓ built
```

- [ ] **Step 5: Commit repository boundary**

Run:

```bash
git add src/services/fontRepository.ts src/stores/fontStore.ts src/components/layout/AppShell.vue
git commit -m "refactor: add font repository boundary"
```

---

### Task 3: Add Minimal Tauri Font Scan Command

**Files:**
- Create: `src-tauri/src/font_model.rs`
- Create: `src-tauri/src/font_scan.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/Cargo.toml`

- [ ] **Step 1: Add Rust DTOs**

Create `src-tauri/src/font_model.rs`:

```rust
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScannedFont {
    pub id: String,
    pub name: String,
    pub family: String,
    pub style: String,
    pub source: String,
    pub path: String,
    pub format: String,
    pub file_size: String,
}
```

- [ ] **Step 2: Add directory scanning**

Create `src-tauri/src/font_scan.rs`:

```rust
use std::fs;
use std::path::{Path, PathBuf};

use crate::font_model::ScannedFont;

const FONT_EXTENSIONS: &[&str] = &["ttf", "otf", "ttc", "woff", "woff2"];

#[tauri::command]
pub fn scan_font_directory(path: String) -> Result<Vec<ScannedFont>, String> {
    let root = PathBuf::from(path);
    if !root.exists() {
        return Err(format!("Directory does not exist: {}", root.display()));
    }
    if !root.is_dir() {
        return Err(format!("Path is not a directory: {}", root.display()));
    }

    let mut fonts = Vec::new();
    scan_dir(&root, &mut fonts)?;
    fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(fonts)
}

fn scan_dir(dir: &Path, fonts: &mut Vec<ScannedFont>) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|error| format!("Failed to read {}: {}", dir.display(), error))?;

    for entry in entries {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();

        if path.is_dir() {
            scan_dir(&path, fonts)?;
            continue;
        }

        let Some(extension) = path.extension().and_then(|value| value.to_str()) else {
            continue;
        };
        let extension = extension.to_lowercase();
        if !FONT_EXTENSIONS.contains(&extension.as_str()) {
            continue;
        }

        let metadata = fs::metadata(&path).map_err(|error| format!("Failed to read {}: {}", path.display(), error))?;
        let stem = path.file_stem().and_then(|value| value.to_str()).unwrap_or("Unknown Font").to_string();

        fonts.push(ScannedFont {
            id: path.to_string_lossy().to_string(),
            name: stem.clone(),
            family: stem,
            style: "Regular".to_string(),
            source: "custom".to_string(),
            path: path.to_string_lossy().to_string(),
            format: extension,
            file_size: format_file_size(metadata.len()),
        });
    }

    Ok(())
}

fn format_file_size(bytes: u64) -> String {
    const KB: f64 = 1024.0;
    const MB: f64 = KB * 1024.0;

    let size = bytes as f64;
    if size >= MB {
        format!("{:.1} MB", size / MB)
    } else {
        format!("{:.1} KB", size / KB)
    }
}
```

- [ ] **Step 3: Register the command**

Modify `src-tauri/src/lib.rs`:

```rust
mod font_model;
mod font_scan;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![font_scan::scan_font_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 4: Verify Rust build**

Run:

```bash
cd src-tauri
cargo check
```

Expected:

```text
Finished `dev` profile
```

- [ ] **Step 5: Commit scan command**

Run:

```bash
git add src-tauri/src/font_model.rs src-tauri/src/font_scan.rs src-tauri/src/lib.rs src-tauri/Cargo.toml
git commit -m "feat: add font directory scan command"
```

---

### Task 4: Add Tauri-Backed Frontend Mapping

**Files:**
- Create: `src/services/tauriFontRepository.ts`
- Modify: `src/services/fontRepository.ts`
- Modify: `src/stores/fontStore.ts`

- [ ] **Step 1: Add Tauri repository**

Create `src/services/tauriFontRepository.ts`:

```ts
import { invoke } from '@tauri-apps/api/core'
import type { FontData } from '@/types/font'

interface ScannedFont {
  id: string
  name: string
  family: string
  style: string
  source: 'system' | 'custom'
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
    supportsVertical: false,
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
```

- [ ] **Step 2: Expose repository variants**

Modify `src/services/fontRepository.ts`:

```ts
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
```

- [ ] **Step 3: Keep mock as the default source**

Keep `fontStore.ts` using `mockFontRepository` until the UI has an explicit directory picker. This avoids a half-connected boot flow.

- [ ] **Step 4: Verify TypeScript**

Run:

```bash
npm run build
```

Expected:

```text
vue-tsc --noEmit && vite build
✓ built
```

- [ ] **Step 5: Commit Tauri mapping**

Run:

```bash
git add src/services/tauriFontRepository.ts src/services/fontRepository.ts src/stores/fontStore.ts
git commit -m "feat: map scanned fonts to frontend model"
```

---

### Task 5: Publish To GitHub

**Files:**
- No code files required.

- [ ] **Step 1: Confirm local status**

Run:

```bash
git status --short
```

Expected:

```text
```

- [ ] **Step 2: Add the remote**

Run this after creating an empty GitHub repository:

```bash
git remote add origin https://github.com/<owner>/<repo>.git
```

Expected:

```text
```

- [ ] **Step 3: Push the main branch**

Run:

```bash
git branch -M main
git push -u origin main
```

Expected: GitHub receives the initial project history.

---

## Self-Review

- Spec coverage: repository hygiene, GitHub preparation, local ignore rules, planning, and first real-data slices are covered.
- Placeholder scan: no task uses vague implementation-only placeholders; each implementation task names concrete files and code.
- Type consistency: frontend `FontData` mapping uses the existing fields in `src/types/font.ts`; Rust scan DTO uses camelCase serialization to match TypeScript.
