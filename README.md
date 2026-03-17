# ComicLens

ComicLens 是一个基于 PRD 构建的漫画智能翻译平台 MVP，聚焦 `P0` 能力：批量上传漫画页、矩形选区框绘制、OCR/翻译触发、译文排版预览和当前页导出。

## 功能范围

- 批量上传图片或文件夹，按文件名自然排序生成项目页面
- 三栏式工作台：左侧缩略图列表、中间画布工作区、右侧属性编辑器
- 在画布上拖拽创建矩形选区框，并维护不同处理状态
- 模拟 OCR 与 AI 翻译流程，可手动编辑原文、译文及样式参数
- 支持 `原图 / 译图 / 对比` 三种视图模式和基础缩放
- 导出当前页译图为 PNG

## 项目结构

```text
.
├── ComicLens_PRD_v1.0.docx   # 原始产品需求文档
├── index.html                # Vite 入口 HTML
├── package.json              # 依赖与脚本
├── tsconfig.json             # TypeScript 工程入口
├── tsconfig.app.json         # 前端编译配置
├── tsconfig.node.json        # Vite 配置编译参数
├── vite.config.ts            # Vite 配置
└── src
    ├── App.tsx               # 主应用，包含工作台交互与状态
    ├── main.tsx              # React 挂载入口
    ├── mockData.ts           # 示例漫画页与初始选区数据
    ├── styles.css            # 页面整体样式
    └── types.ts              # 领域类型定义
```

## 启动说明

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认会启动本地 Vite 开发服务器，终端会输出访问地址。

### 3. 生产构建

```bash
npm run build
```

### 4. 本地预览构建结果

```bash
npm run preview
```

## 实现说明

- 当前版本为纯前端 MVP，`OCR`、翻译与导出逻辑均为本地演示实现。
- 尚未接入 PRD 中提到的真实 OCR API、DeepL/OpenAI 服务、IndexedDB 自动保存、多边形选区与 PDF/ZIP 导出。
- 代码结构已经为后续拆分组件、接入 Zustand 或 Konva 预留了清晰边界。
