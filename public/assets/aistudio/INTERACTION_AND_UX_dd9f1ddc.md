# Interaction & UX · 交互逻辑与信息架构

本文档总结了 `https://byte-sized-algorithms.vercel.app/` 的页面结构、课程组织、步进式交互控制、快捷键、多语言与本地持久化机制（对应源码观察与 [dom-snapshot.html](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/dom-snapshot.html)）。

---

## 1. 页面解剖（Page Anatomy）

整个应用采用「单屏学习工作台」布局，核心区域包括：

1. **顶部导航栏（`.topbar`，64px）**：
   - 左侧：移动端菜单按钮（窄屏出现） + **Brand Logo**（32×32 等距堆叠图标 + `Algo Lab` 字标）。
   - 中左：**主导航模式切换（`.nav`）**，共 5 个入口：`Learn（学习）`（当前已上线）、`Practice（练习）`、`Cheatsheets（速查表）`、`Challenges（挑战）`、`Progress（进度）`（后四项目前点击会弹出 `.toast` 提示「即将推出」）。
   - 右侧工具区（`.topbar__tools`）：
     - **全局搜索触发器（`.search`）**：显示占位文本与平台自适应快捷键徽标（macOS/iOS 显示 `⌘K`，Windows/Linux 显示 `Ctrl K`）。
     - **语言切换菜单（`[data-lang-menu]`）**：显示当前语言徽标（如 `简` / `EN`）。
     - **明暗主题切换按钮（`[data-theme-toggle]`）**：月亮/太阳图标按钮，支持 `document.startViewTransition` 平滑切换。
     - **作者署名徽章（`.author`）**：链接至 `@DilumSanjaya`。

2. **左侧课程树（`.sidebar`）**：
   - 顶部显示标题「课程」与总课节数（`86 课`）。
   - 树形控件（`role="tree"`）：可折叠的章节文件夹（`.tree__chapter`）与课节条目（`.tree__lesson`）。
   - 每个章节右侧展示完成进度计数（如 `0/4`、`0/10`），当前激活课程有浅珊瑚底高亮。
   - 底部（移动端/抽屉态）带有整体学习进度条。

3. **中央主卡片（`.lesson`）**：
   - **课程头（`.lesson__head`）**：大号课程标题、右侧章节编号徽章（如 `01 基础 · 第 1 课，共 4 课`）以及一个精致的小型等距主题缩略图。
   - **等距图解舞台（`.system-view` / `.system-view__stage`）**：占画面视觉中心（45%+ 面积），包含底层的菱形等距网格（`.stage-grid`）和上层的动态 SVG 场景（`svg.scene`）。
   - **步骤时间轴（`.steps`）**：位于舞台正下方，横向展示当前课的所有步骤编号圆点与简短标题；超出宽度时两侧出现 `<` / `>` 滚动按钮，并带有边缘渐变遮罩（`mask-image`）。

4. **右侧信息轨道（`.rail`）**：由课程的 `cards` 数组声明式组合，通常包含 2~3 张卡片：
   - **步骤讲解卡（Explain Card / `.step-card`）**：
     - 顶部元信息：`步骤 X / Y` + 右上角步骤分类标签（`kind` 胶囊，如 `概念`、`扩展`、`操作`、`警示`）。
     - 步骤小标题（`label`）与 1~2 段精炼正文（`body`，支持 `<strong>`、`<em>` 内联强调）。
     - 可选的**内嵌提示框（`note`）**：带灯泡 / 闪电 / 警示图标的浅珊瑚底提示卡（如「注意」「可以这样理解」「复杂度」）。
     - 底部双按钮导航：`← 上一步`（次级按钮）与 **`下一步：<下一步标题> →`**（珊瑚橙主按钮；最后一步时变为进入下一课的提示/动作）。
   - **伪代码卡（Code Panel / `.code-panel`）**：
     - 深色圆角卡片，带行号与缩进 CSS 变量 `--indent`。
     - 语法自动着重伪代码关键字（`if|else|while|for each|for|repeat|until|return|error`）、`← →` 操作符以及 `//` 注释。
     - **步骤联动高亮**：当前步骤配置 `lines: [1, 2]` 时，非目标行自动变暗（`.has-focus`），聚焦行亮起并自动平滑滚动到可视区域内。
   - **实时指标卡（Facts Card / `.facts-card`）**：
     - 以 `key-value` 列表（`<dl>`）展示当前步骤的数据变化（例如 `n = 2/4/8` 时各复杂度的步数、树的节点数/叶子数/高度、或数组/栈的芯片 chips 列表与进度条 meter）。
     - 数值发生变化的行会触发 `.is-changed` 弹性微动画。

---

## 2. 课程体系结构（86 课 / 14 章）

原始课程分为 14 章、共 86 节微课，按需分包懒加载（`basics.js`、`structures.js`、`techniques.js`）：

1. **01. 基础（4 课）**：Big-O Notation, Memory & Pointers, Recursion, Divide & Conquer
2. **02. 数组与字符串（10 课）**：Arrays, Dynamic Arrays, Two Pointers, Sliding Window, Prefix Sums, Maximum Subarray, Merge Intervals, Pattern Matching, KMP Search, 2D Arrays
3. **03. 链表（6 课）**：Singly Linked Lists, Doubly Linked Lists, Fast & Slow Pointers, Reversing a List, Merging Sorted Lists, LRU Cache
4. **04. 栈与队列（7 课）**：Stacks, Balanced Brackets, Queues, Circular Buffer, Deques, Monotonic Stack, Monotonic Queue
5. **05. 哈希（5 课）**：Hash Tables, Collision Handling, Resizing & Rehashing, Sets & Maps, Bloom Filters
6. **06. 树（8 课）**：Binary Trees, Tree Traversals, Lowest Common Ancestor, Binary Search Trees, BST Deletion, Balanced Trees, Tries, Segment Trees
7. **07. 堆（6 课）**：Binary Heaps, Building a Heap, Priority Queues, Top-K Problems, Median of a Stream, Heap Sort
8. **08. 图（13 课）**：Graph Representation, Breadth-First Search, Depth-First Search, Connected Components, Cycle Detection, Topological Sort, Strongly Connected Components, Shortest Paths, Bellman–Ford, Floyd–Warshall, Union-Find, Minimum Spanning Trees, Prim’s Algorithm
9. **09. 排序与搜索（8 课）**：Binary Search, Binary Search on the Answer, Simple Sorts, Merge Sort, Quick Sort, Quickselect, Counting & Radix Sort, Stability & the Sorting Limit
10. **10. 贪心算法（3 课）**：Interval Scheduling, Huffman Coding, When Greedy Fails
11. **11. 回溯（4 课）**：Subsets, Permutations, N-Queens, Solving a Maze
12. **12. 动态规划（8 课）**：Memoization, Tabulation, Grid Paths, Knapsack, Coin Change, Longest Increasing Subsequence, Sequences, Edit Distance
13. **13. 位运算（3 课）**：Bits & Masks, Bit Tricks, Bitsets
14. **14. 难题（1 课）**：P vs NP

> **AI Studio 迁移启发**：这种「10~15 章、每章 3~10 个原子概念、每课 5~8 步」的微课粒度非常稳定，适合迁移到任何复杂系统教学（例如：网络协议、数据库内核、前端框架原理、金融衍生品、人体生理机制、财务会计等）。

---

## 3. 路由、快捷键与核心交互机制

### 3.1 Hash 路由（深度链接）
- URL 格式：`#/<lesson-id>/<step-1-based>`（例如 `#/big-o/3`、`#/binary-trees/2`）。
- 切换步骤时通过 `history.replaceState` 静默更新 Hash（不污染浏览器前进/后退栈）；切换课程时支持 `hashchange` 监听跳转。

### 3.2 全局键盘快捷键
- `ArrowRight` / `ArrowLeft`：当焦点不在 `input / textarea / select` 内时，全局切换下一步 / 上一步。
- `Cmd+K`（macOS）/ `Ctrl+K`（其他平台）：打开/关闭全局搜索模态框（`.finder`）。
- 搜索弹窗内：`ArrowDown` / `ArrowUp` 移动高亮行，`Enter` 打开对应课程/步骤，`Escape` 或点击遮罩关闭。
- 语言菜单内：支持 `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` / `Home` / `End` 键盘漫游，`Escape` 关闭。

### 3.3 本地状态持久化（`localStorage`）
站点完全无需后端即可保存学习状态，使用以下 Key：
- `algolab:theme`：`'light' | 'dark'`，并在 `<head>` 内联一段极短的同步脚本（见 [index.html](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/index.html)）在首屏绘制前写入 `document.documentElement.dataset.theme`，彻底杜绝闪烁（FOUC）。
- `algolab:done`：已完成的课节 ID 集合（到达每课最后一步时自动标记完成并刷新侧边栏计数 `0/4 → 1/4`）。
- `algolab:recent`：最近访问过的课程与步骤，用于在搜索框空状态时展示「最近学习」快捷入口。
- `algolab:lang` / `algolab:language`：语言偏好设置。

### 3.4 多语言框架（21 种语言，含 RTL 支持）
内置包含 `en`, `zh-Hans`, `zh-Hant`, `ja`, `ko`, `ar` (`dir: 'rtl'`), `he` (`dir: 'rtl'`) 等 21 种语言定义。翻译通过 `v(key, params)` 递归遍历课程对象中的指定字段集（`label`, `title`, `kind`, `body`, `text`, `note`, `notes`, `detail`, `value`, `say`, `says`, `answer`, `values`, `marks`, `chips`），同时跳过内部坐标/样式状态字段（`at`, `over`, `start`, `icon`, `tone`, `meter`, `active`, `step`）。
