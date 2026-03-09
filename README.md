# ComicLens

ComicLens 是一个漫画智能翻译 Web 应用。用户上传漫画页面后，可以在工作区中框选文字区域，执行 OCR、翻译、译文编辑和导出。

当前版本先实现应用骨架和首页界面，用于承接后续的真实上传、画布交互和 AI 服务接入。

## 项目需求

基于 [`ComicLens_PRD_v1.0.docx`](/Users/lipeizhang/Downloads/code/vibe/comic/ComicLens_PRD_v1.0.docx)，当前阶段聚焦 MVP 主流程：

- 上传漫画图片或文件夹
- 浏览页面缩略图并切换页面
- 在画布中框选文字区域
- 执行 OCR 识别和翻译
- 编辑译文及基础排版
- 预览译图并导出结果

## 技术栈

- React 18
- TypeScript
- Vite 5

当前版本先不引入复杂状态管理和画布依赖，优先把应用结构、页面布局和开发基础设施搭起来。后续建议再接入：

- Zustand
- Konva.js
- Tailwind CSS 或设计系统组件库
- OCR / 翻译 API 适配层

## 环境要求

- Node.js 18+
- npm 10+

当前本地检测结果：

- Node.js: `v18.19.1`
- npm: `10.2.4`

## 安装依赖

在项目根目录执行：

```bash
npm install
```

安装完成后会生成 `node_modules/` 和 `package-lock.json`。

## 启动开发环境

```bash
npm run dev
```

默认会启动 Vite 开发服务器。终端会输出本地访问地址，通常为：

```bash
http://localhost:5173
```

## 生产构建

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

## 预览构建结果

```bash
npm run preview
```

## 目录说明

```text
.
├── ComicLens_PRD_v1.0.docx
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    └── styles.css
```

关键文件说明：

- [`package.json`](/Users/lipeizhang/Downloads/code/vibe/comic/package.json): 项目依赖和脚本
- [`vite.config.ts`](/Users/lipeizhang/Downloads/code/vibe/comic/vite.config.ts): Vite 配置
- [`src/App.tsx`](/Users/lipeizhang/Downloads/code/vibe/comic/src/App.tsx): 首页界面结构
- [`src/styles.css`](/Users/lipeizhang/Downloads/code/vibe/comic/src/styles.css): 全局样式与布局

## 已实现界面说明

当前首页是基于 PRD 的三栏式工作区原型，主要用于验证信息架构和操作区划分。

### 顶部工具栏

- 展示产品名称和页面标题
- 提供原图、译图、对比三种视图按钮
- 预留导出项目入口

### 首屏概览区

- 用一句话说明当前版本目标
- 展示与 PRD 对应的关键指标
- 明确当前页面是 MVP 工作台骨架

### 左侧栏

- 项目页面列表
- 上传入口占位区
- 缩略图卡片列表
- 工具快捷键说明

这一栏后续会接入真实图片上传、排序和页码导航。

### 中间工作区

- 画布预览容器
- 页面状态栏
- 三个示例选框状态

这一栏后续会接入：

- Konva 画布
- 缩放和平移
- 矩形选框绘制
- 多页切换
- 真实译文叠加渲染

### 右侧属性栏

- OCR 原文展示
- AI 译文展示
- 字体、字号、行距、对齐占位字段
- 文本框处理队列

这一栏后续会变成真正的属性编辑面板，负责编辑选中区域内容。

## 当前依赖说明

运行时依赖：

- `react`
- `react-dom`

开发依赖：

- `vite`
- `typescript`
- `@vitejs/plugin-react`
- `@types/react`
- `@types/react-dom`

## 下一步开发建议

1. 安装依赖并启动本地开发环境
2. 接入真实文件上传
3. 引入画布引擎实现矩形框交互
4. 设计页面、区域、项目的数据结构
5. 封装 OCR 与翻译服务接口
6. 完成导出链路

