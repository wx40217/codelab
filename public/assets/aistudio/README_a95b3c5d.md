# Algo Lab (`byte-sized-algorithms.vercel.app`) AI Studio 参考包

本目录专为无法直接联网访问网页的 **Google AI Studio** 准备，完整收录了 [Algo Lab](https://byte-sized-algorithms.vercel.app/) 的视觉规范、页面结构、交互机制、2.5D 等距 SVG 图解引擎原理、真实采样数据结构与多端截图。

---

## 目录文件清单

| 文件 / 路径 | 用途说明 | 是否建议上传至 AI Studio |
| :--- | :--- | :--- |
| [AI_STUDIO_PROMPT.md](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/AI_STUDIO_PROMPT.md) | **直接复制使用**的中文提示词模板（含分步建议） | 无需上传，复制粘贴到输入框即可 |
| [DESIGN_SYSTEM.md](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/DESIGN_SYSTEM.md) | Light/Dark 色板、纸质噪点、阴影、字体与三栏响应式断点 | **必传** |
| [INTERACTION_AND_UX.md](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/INTERACTION_AND_UX.md) | 页面布局解剖、86 课课程结构、快捷键、状态持久化与多语言 | **必传** |
| [SCENE_ENGINE_AND_SCHEMA.md](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/SCENE_ENGINE_AND_SCHEMA.md) | 25° 等距 SVG 投影原理、动画 diff、课程 Schema 与主题迁移指南 | **必传** |
| [assets/design-tokens.css](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/design-tokens.css) | 从线上提取并格式化的完整 CSS（已剔除巨型 base64 字体数据） | **必传**（体积仅 ~56KB，适合直接作设计系统参考） |
| [assets/sample-lessons.json](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/sample-lessons.json) | 3 节完整代表性课程数据（`big-o`、`stacks`、`binary-trees`） | **必传**（作为数据结构与文案风格的 Few-Shot 示例） |
| [assets/dom-snapshot.html](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/dom-snapshot.html) | 主学习页渲染后的真实语义化 DOM 结构（已精简大段 SVG path） | 可选（用于让 AI 精确对齐 HTML 结构与 ARIA 语义） |
| [assets/index.html](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/index.html) | 原始入口 HTML（含防闪屏主题初始化脚本） | 可选 |
| [screenshots/01-desktop-light-home.png](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/screenshots/01-desktop-light-home.png) | 桌面端浅色模式初始页（大 O 表示法 第 1 步） | **必传** |
| [screenshots/02-desktop-light-step.png](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/screenshots/02-desktop-light-step.png) | 桌面端浅色模式步进后状态（第 3 步：图解缩放 + 指标与时间轴联动） | **必传** |
| [screenshots/03-desktop-light-nav.png](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/screenshots/03-desktop-light-nav.png) | 桌面端全局搜索/快速跳转模态框（`Cmd/Ctrl+K` 磨砂遮罩弹窗） | **必传** |
| [screenshots/04-desktop-dark.png](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/screenshots/04-desktop-dark.png) | 桌面端深色模式（二叉树图解，展示暗色背景下的等距块对比） | **必传** |
| [screenshots/05-mobile-light.png](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/screenshots/05-mobile-light.png) | 移动端（390×844）响应式布局（舞台吸顶 + 底部操作流） | **必传** |

---

## 投喂给 AI Studio 的操作步骤

1. 打开 Google AI Studio（建议使用 **Build / App** 模式或长上下文对话，选择 Gemini Pro / 2.5 Pro 等强推理与代码能力模型）。
2. 将以下文件直接拖入附件区（总计仅约 150KB 文本 + 5 张截图，远低于上下文上限）：
   - `DESIGN_SYSTEM.md`、`INTERACTION_AND_UX.md`、`SCENE_ENGINE_AND_SCHEMA.md`
   - `assets/design-tokens.css`、`assets/sample-lessons.json`
   - `screenshots/` 下的全部 5 张 PNG 截图
3. 打开 [AI_STUDIO_PROMPT.md](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/AI_STUDIO_PROMPT.md)，复制其中的 Prompt，把 `[在这里填写你的新主题]` 替换为你想做的内容方向后发送。
