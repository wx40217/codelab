# Design System · 设计系统规范

本文档提炼自 `https://byte-sized-algorithms.vercel.app/`（Algo Lab）的线上样式与设计变量（完整 CSS 见 [design-tokens.css](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/design-tokens.css)）。整体视觉风格为**暖调纸质实验室（Warm Paper Lab）**：浅色模式像温润的米色草稿纸配珊瑚橙高光与斜线排线阴影；深色模式为低眩光炭黑基底，同时保留高辨识度的实体等距方块对比。

---

## 1. 色彩系统（Light / Dark Tokens）

### 1.1 页面与表面层级

| CSS 变量 | Light 模式 | Dark 模式 | 语义与用途 |
| :--- | :--- | :--- | :--- |
| `--page` | `#f7f4ee` | `#0b0c0e` | 最底层页面背景（暖米白 / 深炭黑） |
| `--paper` | `#f7f4ee` | `#141518` | 主卡片表面、侧边栏或面板背景 |
| `--paper-raised` | `#f9f7f2` | `#1a1b1f` | 抬升组件、按钮、弹窗面板背景 |
| `--paper-sunk` | `#e9e3da` | `#24262b` | 下沉槽位、次级标签背景 |
| `--paper-sunk-strong` | `#e1dbd2` | `#2e3036` | 强调型下沉胶囊、按键 `<kbd>` 背景 |
| `--stage` | `var(--paper-raised)` | `#0f1012` | 中心等距图解舞台背景 |
| `--grid-line` | `#d2cabd` | `#212327` | 等距舞台底部菱形网格线颜色 |

### 1.2 边框与分隔线

| CSS 变量 | Light 模式 | Dark 模式 | 用途 |
| :--- | :--- | :--- | :--- |
| `--line` | `#dfdbd2` | `#26282d` | 顶栏、面板与列表默认分割线 |
| `--line-soft` | `#e7e3db` | `#1f2125` | 极细弱分隔线 |
| `--line-strong` | `#cfc9bf` | `#383b42` | 按钮边框、弹窗边框、时间轴轨道线 |

### 1.3 文字层级（Ink）

| CSS 变量 | Light 模式 | Dark 模式 | 用途 |
| :--- | :--- | :--- | :--- |
| `--ink` | `#2a2b2f` | `#f2f0eb` | 主标题、正文强对比文字 |
| `--ink-2` | `#434247` | `#c8c5bf` | 正文次级说明、辅助描述 |
| `--ink-3` | `#77746f` | `#908d87` | 元信息、课节计数、占位符 |
| `--ink-4` | `#a5a19a` | `#66645f` | 最弱辅助文字、禁用态/hover 边界 |

### 1.4 主题强调色（Coral）

| CSS 变量 | Light 模式 | Dark 模式 | 用途 |
| :--- | :--- | :--- | :--- |
| `--coral` | `#e2705a` | `#e8694e` | 主激活态、主按钮、当前步骤圆点 |
| `--coral-deep` | `#d6624b` | `#f07a5f` | 主按钮 Hover、Coral 标签底色 |
| `--coral-300` | `#f3bcae` | `#94402e` | 图元 `is-active` 顶面高亮 |
| `--coral-200` | `#f7cec0` | `#6e2f21` | 品牌名 `<mark>` 高亮底色 |
| `--coral-100` | `#fae0d6` | `#4c2219` | Note 提示卡背景等淡珊瑚色块 |
| `--coral-50` | `#fcece5` | `#271612` | 极浅提示背景、当前课程激活背景 |
| `--coral-ink` | `#7c2717` | `#f6ab98` | 珊瑚色浅底上的高对比文字 |
| `--on-coral` | `#fff` | `#fff` | 珊瑚色实体按钮上的文字颜色 |

### 1.5 代码块（Pseudocode）与语法高亮

| CSS 变量 | Light 模式 | Dark 模式 | 用途 |
| :--- | :--- | :--- | :--- |
| `--code-bg` | `#2d2e32` | `#101114` | 代码面板固定深色背景 |
| `--code-fg` | `#e9e6e0` | `#e9e6e0` | 代码主文本 |
| `--code-dim` | `#a3a7b8` | `#9da1b0` | 注释与非聚焦行弱化文本 |
| `--code-gutter` | `#7c7e87` | `#6c6e77` | 行号颜色 |
| `--code-kw` | `#f08a6d` | `#f08a6d` | 伪代码关键字高亮（`tok-kw`） |
| `--code-str` | `#e6c477` | `#e6c477` | 字符串高亮（Light 变量定义） |
| `--code-type` | `#93cfc6` | `#93cfc6` | 类型高亮（Light 变量定义） |

### 1.6 等距 SVG 舞台专属变量（`.scene`）

为保证深色模式下等距立体方块依然保持纸面实体感与可读性，`.scene` 单独定义了一组隔离 Token：

- **Light**：`--iso-top: #faf8f3`、`--iso-left: #f2eee7`、`--iso-blush: #fbe2d8`（右侧面暖粉底叠加斜线阴影）、`--obj-ink: var(--ink)`、`--tag-fill: var(--ink)`、`--tag-text: var(--paper)`、`--cast: #4f3d2a`（`--cast-strength: .24`）。
- **Dark**：`--iso-top: #e6e3dc`、`--iso-left: #d6d2ca`、`--iso-blush: #eac8bb`、`--obj-ink: #282a2f`（保持亮面方块的深色描边清晰）、`--floor-ink: #dcd9d2`、`--case: #0f1012`、`--tag-fill: #1c1d21`（带 `#868990` 描边）、`--cast: #000`（`--cast-strength: .45`）。

---

## 2. 纸质纹理与光影质感（Paper Grain & Shadows）

### 2.1 全局纸张噪点叠加（`body:after`）
整个界面通过固定定位的伪元素覆盖一层极细微的 SVG `feTurbulence` 噪点纹理，使纯色背景呈现纸张触感而不影响交互（`pointer-events: none`）：
- `mix-blend-mode: var(--grain-blend)`（Light 为 `multiply`，Dark 为 `soft-light`）
- `opacity: var(--grain)`（Light 为 `.55`，Dark 为 `.22`）
- 内联 SVG 滤镜参数：`type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'`

### 2.2 圆角与立体阴影
- **圆角**：`--r-card: 14px`（主卡片、面板、弹窗）、`--r-ctl: 8px`（按钮、输入框）、`--r-chip: 7px`（标签、芯片、提示胶囊）
- **内嵌高光 + 暖色投影（Light）**：
  - `--shadow-card`: `0 1px 0 #ffffffbf inset, 0 1px 2px #4a3a280a, 0 6px 14px -8px #4a3a281f`
  - `--shadow-ctl`: `0 1px 0 #fffc inset, 0 1px 2px #4a3a280d`
  - `--shadow-coral`: `0 1px 0 #ffffff38 inset, 0 1px 2px #a03c2847, 0 4px 10px -4px #d45f4873`
  - `--shadow-pop`: `0 1px 0 #ffffffbf inset, 0 2px 4px #4a3a280f, 0 30px 60px -22px #4a3a2873`
- **暗黑模式投影（Dark）**：改用极低透明度的白色顶部 1px 内高光（`#ffffff09` / `#ffffff0d`）与深黑投影，避免脏灰感。

### 2.3 遮罩与悬停态
- `--hover`: Light `#2b2c300d` / Dark `#ffffff0f`
- `--veil`: Light `#e9e3da9e` / Dark `#060708a8`（配合 `backdrop-filter: blur(5px)` 用于 `.finder` 搜索弹窗与移动端抽屉遮罩）

---

## 3. 排版系统（Typography）

- **正文字体栈（`--font-sans`）**：`"Inter Variable", "Inter", var(--script-fonts, ui-sans-serif), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- **等宽字体栈（`--font-mono`）**：`"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, var(--script-fonts, monospace), monospace`
- **OpenType 特性**：`font-feature-settings: "cv11", "ss03", "calt"`，配合 `-webkit-font-smoothing: antialiased`
- **多语言字体回退**：针对 `:lang(zh-Hans)` 自动注入 `--script-fonts: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC"`，且对 `:lang(zh), :lang(ja), :lang(ko), :lang(hi), :lang(ar)` 设置 `letter-spacing: normal !important` 避免西文负字距挤坏东亚文字。
- **典型字号层级**：
  - 课程主标题（`.lesson__head h1`）：桌面端 `38px`、`font-weight: 800`、`letter-spacing: -.03em`；移动端（`<= 899.98px`）缩至 `30px`。
  - 品牌字标（`.brand__name`）：`19px`、`letter-spacing: -.035em`。
  - 基准正文（`body`）：`15px`、`line-height: 1.4`。

---

## 4. 布局网格与响应式断点

### 4.1 桌面端三栏工作区（`> 1259.98px`）
外层 `.app` 为 `grid-template-rows: auto minmax(0, 1fr)`（全屏 `height: 100vh; min-height: 860px; min-width: 1260px`），顶栏 `.topbar` 高度固定 `64px`。
中间 `.workspace` 采用三栏 Grid：
```css
grid-template-columns: clamp(262px, 14.2vw, 276px) minmax(0, 1fr) clamp(400px, 23.5vw, 440px);
gap: 14px;
padding: 12px 12px 10px 10px;
```
1. **左侧 `.sidebar`**：章节树状目录（`262px ~ 276px`）。
2. **中间 `.lesson`（主卡片）**：从上到下包含 `.lesson__head`（标题 + 章节徽章与微型等距图标）、`.system-view`（自适应撑满剩余高度的等距图解舞台 `flex: 1; min-height: 380px`）、`.steps`（底部横向步骤时间轴）。
3. **右侧 `.rail`（信息轨道，`400px ~ 440px`）**：独立纵向滚动，依次容纳讲解卡片（Step Card）、伪代码卡片（`code-panel`）、实时数据事实卡片（`facts-card`）。

### 4.2 关键响应式断点
- **`@media (width <= 1259.98px)`（窄桌面 / 平板横屏）**：
  - 变为两栏布局：`grid-template-columns: minmax(0, 1fr) clamp(340px, 37vw, 430px)`。
  - `.sidebar` 收起为左侧滑出抽屉（`width: min(330px, 88vw)`），顶栏显示汉堡菜单按钮 `.topbar__menu`。
  - 顶栏 `.nav__item:not(.is-active)` 隐藏文字，仅保留图标（`42px` 方按钮）。
- **`@media (width <= 899.98px)`（移动端单栏）**：
  - `.lesson` 与 `.rail` 使用 `display: contents`，通过 CSS `order` 重新编排阅读流：
    1. `order: 1`：`.lesson__head`（课程标题）
    2. `order: 2`：`.system-view`（图解舞台 **`position: sticky; top: 8px; height: clamp(260px, 48dvh, 540px)`**，滚动讲解文字时图解固定吸顶！）
    3. `order: 3`：`.rail > .step-card`（当前步骤讲解 + 上/下一步按钮）
    4. `order: 4`：`.steps`（步骤时间轴）
    5. `order: 5`：`.rail > *` 其余卡片（伪代码、实时指标卡）
- **无障碍动效降级**：所有关键动画与过渡均配备 `@media (prefers-reduced-motion: reduce)` 降级策略。
