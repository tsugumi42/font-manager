# Font Manager Prototype

基于 Tauri v2 + Vue 3 + TypeScript + Naive UI 的本地字体管理桌面应用 GUI 原型。

## 项目定位

面向创作者的本地字体管理、预览、标注与缺字检测工具。

## 技术栈

- **桌面框架**: Tauri v2
- **前端框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **UI 组件库**: Naive UI
- **状态管理**: Pinia
- **构建工具**: Vite

## 当前阶段

第一阶段 GUI 原型，使用 mock 数据。暂未实现真实字体扫描、解析、数据库等后端功能。

## 功能概览

- 三栏布局：侧边栏筛选 + 字体列表 + 字体详情
- 字体筛选：来源、收藏、标签、语言、授权状态
- 字体搜索与排序
- 字体预览：横排/竖排、字号/字重/行距/字间距调节、预设文本
- 字符检测（Mock 逻辑）
- 字体信息展示（含 Unicode 覆盖进度条）
- 标签管理与备注编辑
- 浅色/深色主题切换

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/) >= 1.70
- npm

### 安装依赖

```bash
cd font-manager-prototype
npm install
```

### 开发模式运行（仅前端）

```bash
npm run dev
```

浏览器打开 http://localhost:1420

### 开发模式运行（带 Tauri 桌面窗口）

```bash
npm run tauri dev
```

### 构建生产版本

```bash
npm run tauri build
```

## 当前限制

- 当前数据来自 mock 数据，尚未接入真实字体扫描。
- `user-data/` 是本地运行数据，不提交到仓库。
- `node_modules/`、`dist/`、`src-tauri/target/` 是依赖或构建产物，不提交到仓库。

## 项目结构

```
font-manager-prototype/
├── public/
│   └── vite.svg
├── src/
│   ├── main.ts                    # 应用入口
│   ├── App.vue                    # 根组件（主题配置）
│   ├── vite-env.d.ts              # 类型声明
│   ├── types/
│   │   └── font.ts                # 字体类型定义
│   ├── data/
│   │   └── mockFonts.ts           # Mock 字体数据
│   ├── stores/
│   │   ├── fontStore.ts           # 字体状态管理
│   │   └── uiStore.ts             # UI 状态管理（主题等）
│   └── components/
│       ├── layout/
│       │   ├── AppShell.vue       # 主布局容器
│       │   ├── Sidebar.vue        # 左侧边栏
│       │   ├── FontListPane.vue   # 字体列表区
│       │   └── DetailPane.vue     # 详情区（Tab 容器）
│       ├── font/
│       │   ├── FontListItem.vue   # 字体列表项
│       │   ├── FontPreview.vue    # 字体预览（横排/竖排）
│       │   ├── CharacterCheck.vue # 字符检测
│       │   ├── FontInfoPanel.vue  # 字体信息
│       │   ├── TagNotePanel.vue   # 标签备注
│       │   └── UnicodeCoverage.vue# Unicode 覆盖进度条
│       └── common/
│           └── ThemeToggle.vue    # 主题切换按钮
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   └── src/
│       ├── main.rs
│       └── lib.rs
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 后续扩展

以下功能已预留 TODO 标记，方便后续接入 Rust 后端：

- 真实字体扫描：通过 Tauri invoke 调用 Rust 命令扫描系统字体目录
- 字体文件解析：解析 ttf/otf/woff 文件的元数据信息
- 数据库持久化：字体信息、标签、备注等存储到本地数据库
- 系统字体安装/卸载：通过 Tauri 调用系统 API 管理字体
- Unicode 覆盖真实检测：解析字体 cmap 表获取真实字符覆盖范围

关键组件中的注释标记了未来如何接入 Tauri invoke 调用 Rust 命令。
