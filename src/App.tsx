type PageItem = {
  id: string;
  name: string;
  status: "draft" | "ocr" | "translated" | "reviewed";
};

type ToolItem = {
  name: string;
  shortcut: string;
};

type RegionItem = {
  id: string;
  title: string;
  source: string;
  translated: string;
  status: "已识别" | "已翻译" | "已校对";
};

const pages: PageItem[] = [
  { id: "p1", name: "Page 001", status: "reviewed" },
  { id: "p2", name: "Page 002", status: "translated" },
  { id: "p3", name: "Page 003", status: "ocr" },
  { id: "p4", name: "Cover", status: "draft" },
];

const tools: ToolItem[] = [
  { name: "矩形框", shortcut: "R" },
  { name: "选择", shortcut: "V" },
  { name: "平移", shortcut: "Space" },
  { name: "对比视图", shortcut: "Tab" },
  { name: "导出", shortcut: "E" },
];

const regions: RegionItem[] = [
  {
    id: "1",
    title: "文本框 #01",
    source: "今日は早く帰ろう。",
    translated: "今天早点回去吧。",
    status: "已校对",
  },
  {
    id: "2",
    title: "文本框 #02",
    source: "本当にそう思う？",
    translated: "你真这么觉得？",
    status: "已翻译",
  },
  {
    id: "3",
    title: "文本框 #03",
    source: "……",
    translated: "",
    status: "已识别",
  },
];

const statusLabel: Record<PageItem["status"], string> = {
  draft: "未处理",
  ocr: "已识别",
  translated: "已翻译",
  reviewed: "已校对",
};

function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ComicLens</p>
          <h1>漫画智能翻译工作区</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button">原图</button>
          <button className="ghost-button">译图</button>
          <button className="ghost-button">对比</button>
          <button className="primary-button">导出项目</button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="hero-kicker">MVP 界面骨架</p>
          <h2>围绕上传、框选、OCR、翻译、嵌字、导出构建首版流程</h2>
          <p className="hero-copy">
            当前页面展示了产品首版的三栏式工作台：左侧管理页面，中间处理画布，右侧编辑 OCR
            与译文属性。界面先用静态数据验证结构，后续再接入真实文件、画布引擎和 AI 服务。
          </p>
        </div>

        <div className="hero-metrics">
          <article>
            <strong>500</strong>
            <span>单次最多图片数</span>
          </article>
          <article>
            <strong>30MB</strong>
            <span>单张文件大小上限</span>
          </article>
          <article>
            <strong>3 栏</strong>
            <span>主工作区结构</span>
          </article>
        </div>
      </section>

      <main className="workspace">
        <aside className="sidebar left-panel">
          <section className="panel">
            <div className="panel-header">
              <h3>项目页面</h3>
              <button className="ghost-button small">上传</button>
            </div>
            <div className="upload-dropzone">
              <p>拖拽文件夹或图片到这里</p>
              <span>支持 JPG / PNG / WEBP</span>
            </div>
            <ul className="page-list">
              {pages.map((page) => (
                <li key={page.id} className="page-item">
                  <div className="thumb" />
                  <div>
                    <strong>{page.name}</strong>
                    <span>{statusLabel[page.status]}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>工具栏</h3>
            </div>
            <ul className="tool-list">
              {tools.map((tool) => (
                <li key={tool.name}>
                  <span>{tool.name}</span>
                  <kbd>{tool.shortcut}</kbd>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="canvas-panel">
          <div className="panel canvas-surface">
            <div className="canvas-toolbar">
              <span>缩放 100%</span>
              <span>当前页 2 / 24</span>
              <span>状态: 已翻译</span>
            </div>

            <div className="canvas-stage">
              <div className="comic-page">
                <div className="selection-box first">
                  <span>#01 已校对</span>
                </div>
                <div className="selection-box second">
                  <span>#02 已翻译</span>
                </div>
                <div className="selection-box third">
                  <span>#03 已识别</span>
                </div>
              </div>
            </div>

            <div className="canvas-footer">
              <p>后续将在这里接入 Konva 画布、缩放平移、矩形框绘制与多页切换。</p>
            </div>
          </div>
        </section>

        <aside className="sidebar right-panel">
          <section className="panel">
            <div className="panel-header">
              <h3>文本框详情</h3>
              <span className="status-pill">已翻译</span>
            </div>

            <div className="field-group">
              <label>OCR 原文</label>
              <textarea value="本当にそう思う？" readOnly />
            </div>

            <div className="field-group">
              <label>AI 译文</label>
              <textarea value="你真这么觉得？" readOnly />
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>字体</label>
                <input value="Source Han Sans" readOnly />
              </div>
              <div className="field-group">
                <label>字号</label>
                <input value="22px" readOnly />
              </div>
              <div className="field-group">
                <label>行距</label>
                <input value="1.35" readOnly />
              </div>
              <div className="field-group">
                <label>对齐</label>
                <input value="居中" readOnly />
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>区域队列</h3>
            </div>
            <ul className="region-list">
              {regions.map((region) => (
                <li key={region.id}>
                  <strong>{region.title}</strong>
                  <span>{region.status}</span>
                  <p>{region.source}</p>
                  <p>{region.translated || "等待翻译"}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
