# Scene Engine & Lesson Schema · 等距渲染引擎与课程数据结构

本文档解析 `https://byte-sized-algorithms.vercel.app/` 的核心灵魂——**纯 SVG 等距图解动画引擎**与**声明式课程/步骤数据模型**（完整样例见 [sample-lessons.json](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/sample-lessons.json)），帮助 AI Studio 复刻同等水准的交互式图解，并将其迁移到全新主题。

---

## 1. 为什么这套图解显得“高级”？

核心秘密在于它**没有使用笨重的 WebGL/Three.js**，而是用一套**轻量、锐利、响应式、矢量可控的 2.5D 等距投影 SVG 引擎**（`scene-*.js`）：
1. **等距投影角为 25°**（接近经典 2:1 像素等距，但垂直感更稳重）：
   - `cos(25°) ≈ 0.9063`，`sin(25°) ≈ 0.4226`
   - 3D 坐标 `(x, y, z)` 投影到 2D SVG 画布坐标 `(px, py)` 的公式：
     ```js
     px = origin[0] + (x - y) * Math.cos(25 * Math.PI / 180)
     py = origin[1] + (x + y) * Math.sin(25 * Math.PI / 180) - z
     ```
2. **三面着色法则（模拟纸模型与版画质感）**：
   - **顶面（Top）**：最亮（`--iso-top`），高光承接面。
   - **左前立面（Left）**：次亮暖灰（`--iso-left`），常用于承载倾斜文字或数字（使用 `onFace.left` 矩阵变换贴合透视角度）。
   - **右前立面（Right）**：暖珊瑚粉（`--iso-blush`）底色 + **斜线阴影纹理填充（`url(#sc-hatch-wide)` / `url(#sc-hatch-dense)`）**，这是整个网站最具辨识度的插画特征！
   - **墨线描边（`.s-ink`）**：1.6px 圆角连接线描边（`stroke-linejoin: round`），让所有几何体像精密的手绘工程图。
3. **底层透视网格（`.stage-grid`）**：
   - 使用 `<pattern id="sc-floor">` 绘制与等距投影完全对齐的菱形网格，且与主舞台共享同一个动态 `viewBox`。

---

## 2. 场景引擎的核心机制

### 2.1 Actor 状态驱动与自动 Diff
每个场景由一个 `stage` 实例管理多个命名 **Actor**（例如平台、方块、箭头、标签、移动光标 `runner`、粒子脉冲 `bead`）：
- 每个 Actor 拥有固定 `depth`（用于 SVG DOM 排序实现正确的遮挡关系，如地面 `0` → 方块 `10~500` → 指针箭头 `600` → 光标 `800` → 悬浮标注牌 `900+`）。
- 切换步骤时，只需调用 `scene.show(step.state)`，计算每个 Actor 的目标属性 `{ x, y, z, g, o, s, cls, text, ... }`，引擎会自动：
  - **新出现的 Actor**：从上方 `enter: { z: +110~140 }` 落体掉入（`ease: "drop"` + 落地微弹 `land` squash 挤压效果）。
  - **已存在的 Actor**：平滑插值移动到新位置（`ease: "inOut"`），样式类平滑过渡（`transition: fill .4s`）。
  - **消失的 Actor**：向上飘起并淡出（`z: z + 50~74, o: 0, ease: "in"`）。
  - **多段队列动画**：支持传数组作为 keyframes，实现「旧方块弹走 → 新方块从天而降」或「光标沿边巡游并触发目标方块挤压（`squash`）」。

### 2.2 动态镜头自动取景（Auto-Framing ViewBox）
当场景规模在步骤间发生变化（如 `Big-O` 课从 `n=2` 变成 `n=8`，或二叉树从 3 个节点扩展到 15 个节点）时，引擎会预先计算所有可见 Actor 的 2D 包围盒（区分实心物体 `solid` 与标注 `all`），加上留白边距（`side: 34, above: 70, below: 38`），使用缓动函数平滑缩放并居中 SVG `viewBox`——用户永远不需要手动拖拽或缩放画布，且在窄屏下会自动保持文字标签的可读字号。

### 2.3 常用图元家族（Primitives）
原站通过组合以下可复用场景模板覆盖了 86 节课：
- **平台与堆积块（`prism` / `plate` / `slab`）**：圆角底座托盘 + 上方阵列的单元小方块（用于 Big-O 复杂度、网格、DP 表）。
- **连续单元格条带（`strip`）**：带索引/地址标注的底槽 + 可升降/高亮的数值方块（用于内存、数组、双指针、滑动窗口、哈希表、位运算）。
- **垂直栈与队列通道（`stack-scene` / `queue-scene`）**：`INPUT` 输入托盘 → 垂直栈/水平管道 → `OUTPUT` 输出托盘，配合抛物线飞行动画（`arc`）。
- **树与图（`tree-scene` / `graph-scene`）**：等距节点方块 + 动态生长的连线/有向箭头（`ptr`）+ 巡游圆点光标（`runner`）+ 层级标尺（`levels`）。
- **浮动标注牌（`tag`）**：自动测量文本宽度并动态伸缩矩形框（`canvas.measureText`），带圆点引导线指向目标物体（默认深色胶囊，重点提示使用 `tag--coral` 珊瑚橙胶囊）。

---

## 3. 课程与步骤数据 Schema

每节课是一个标准对象，结构极简且高度结构化（详见 [sample-lessons.json](file:///Users/zhuleiye02/.gemini/antigravity/scratch/byte-sized-algorithms-ref/assets/sample-lessons.json)）：

```jsonc
{
  "id": "lesson-slug",           // 唯一路由 ID，如 "big-o"
  "title": "Lesson Title",       // 课程标题
  "createScene": "fn(container)",// 创建并返回 { show(state, opts), destroy() }
  "cards": [                     // 右侧 Rail 面板卡片列表
    { "type": "explain" },       // 1. 必选：步骤讲解卡
    { "type": "code", "source": "..." }, // 2. 可选：多行代码/公式/流程卡
    { "type": "facts", "title": "Steps taken" } // 3. 可选：实时指标卡
  ],
  "steps": [
    {
      "label": "简短步骤标题",     // 同时显示在底部时间轴与讲解卡大标题
      "kind": "Concept",         // 右上角步骤类型徽章（Concept/Grow/Operation/Idea/Watch out/Result）
      "body": [                  // 1~2 段短文，支持 <strong> 和 <em>
        "第一段解释核心直觉...",
        "第二段点出关键观察..."
      ],
      "note": {                  // 可选：内嵌提示卡
        "title": "Notice",
        "icon": "bolt",          // 可选：默认灯泡 / "bolt" / "alert"
        "text": "一句话规律或避坑提醒。"
      },
      "state": {                 // 传给 scene.show(state) 的纯数据快照！
        // 例如：{ "n": 8, "focus": "one" } 或 { "stack": ["b10", "b20"], "op": "push" }
      },
      "lines": [1, 2],           // 可选：高亮代码卡片中的对应行号（1-based）
      "facts": {                 // 可选：更新右侧指标卡
        "rows": [
          { "label": "O(1)", "detail": "constant", "value": 1, "active": true },
          { "label": "Window", "chips": [{ "text": "A", "tone": "best" }], "meter": 0.5 }
        ],
        "note": "指标补充说明"
      }
    }
  ]
}
```

---

## 4. 如何迁移到新主题？（Topic Adaptation Guide）

如果你要在 AI Studio 中参考这套设计做**非算法类**的全新主题（例如：**HTTP 与网络协议、Git 版本控制原理、财务三张表、咖啡萃取科学、音乐和弦乐理、Transformer 原理**），建议按以下方式映射：

| 原站概念 | 新主题映射思路 |
| :--- | :--- |
| **左侧 14 章微课树** | 拆分为 4~8 个模块，每个模块 3~6 个核心概念（无需硬凑 86 课，做精 12~24 课即可）。 |
| **中间等距舞台（SVG）** | 保留 `25°` 等距投影 + 暖纸底色 + 右侧面珊瑚斜线排线阴影 + 自动 `viewBox` 居中缩放。将「数组格子/栈/树/平台」替换为新主题的视觉隐喻：<br>• **网络/后端**：客户端/网关/数据库等距主机块 + 请求数据包（方块/圆点）沿路径飞跃。<br>• **Git**：Commit 节点方块 + 分支指针悬浮 Tag + 合并连线。<br>• **Transformer/AI**：Token 条带 + Q/K/V 矩阵块 + 注意力连线权重。<br>• **金融/会计**：现金流托盘 + 资产/负债堆叠柱状块。 |
| **伪代码卡（Code Panel）** | 改为**核心公式 / 配置片段 / 命令行 / 协议报文 / 状态机规则**，依然保留行号与步骤联动高亮（`lines: [...]`）。 |
| **指标卡（Facts Card）** | 改为当前步骤的**实时状态读数**（如延迟 ms、成本金额、状态计数、进度条 `meter`）。 |
| **单步文案原则** | 严格控制每步 `body` 为 **2~3 句话**，先讲直觉再下定义，把高阶细节或误区放进 `note` 卡片中。 |
