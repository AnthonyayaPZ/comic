import { ChangeEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { initialPages } from './mockData';
import type { ComicPage, ComicRegion, RegionStatus, ViewMode } from './types';
import { createId } from './utils';

const statusMeta: Record<
  RegionStatus,
  { label: string; border: string; fill: string }
> = {
  empty: { label: '未处理', border: '#2E86AB', fill: 'rgba(46, 134, 171, 0.12)' },
  recognized: { label: '已识别', border: '#E67E22', fill: 'rgba(230, 126, 34, 0.12)' },
  translated: { label: '已翻译', border: '#27AE60', fill: 'rgba(39, 174, 96, 0.12)' },
  reviewed: { label: '已校对', border: '#F39C12', fill: 'rgba(243, 156, 18, 0.14)' },
  embedded: { label: '已嵌入', border: '#95A5A6', fill: 'rgba(149, 165, 166, 0.08)' },
  error: { label: '错误', border: '#E74C3C', fill: 'rgba(231, 76, 60, 0.12)' },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const naturalSort = (files: File[]) =>
  [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

const createPageFromFile = (file: File): Promise<ComicPage> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();
      image.onload = () =>
        resolve({
          id: createId(),
          name: file.name,
          src: String(reader.result),
          width: image.width || 820,
          height: image.height || 1160,
          regions: [],
        });
      image.onerror = () => reject(new Error(`Failed to load image ${file.name}`));
      image.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error(`Failed to read image ${file.name}`));
    reader.readAsDataURL(file);
  });

const buildFakeOcr = (pageName: string, regionId: string) =>
  `OCR-${pageName.replace(/\.[^.]+$/, '')}-${regionId.slice(0, 4)}`;

const fakeTranslate = (text: string, targetLanguage: string) => {
  if (!text.trim()) {
    return '';
  }

  const dictionary: Record<string, string> = {
    '今日は追いつくぞ!': '今天一定追上你！',
    'Wait, what?': '等一下，什么情况？',
    '行こう。': '走吧。',
    '真的吗？': 'Are you serious?',
  };

  const translated = dictionary[text] ?? `${targetLanguage.toUpperCase()} · ${text}`;
  return translated;
};

export default function App() {
  const [pages, setPages] = useState<ComicPage[]>(initialPages);
  const [currentPageId, setCurrentPageId] = useState(initialPages[0]?.id ?? '');
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(
    initialPages[0]?.regions[0]?.id ?? null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('translated');
  const [zoom, setZoom] = useState(0.62);
  const [targetLanguage, setTargetLanguage] = useState('zh-CN');
  const [engine, setEngine] = useState('DeepL');
  const [projectName, setProjectName] = useState('Demo Project');
  const [notice, setNotice] = useState('已加载示例项目，可直接体验框选、识别、翻译与导出。');
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [draftRect, setDraftRect] = useState<ComicRegion | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panAnchor, setPanAnchor] = useState<{ x: number; y: number } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const directoryInputRef = useRef<HTMLInputElement | null>(null);

  const currentPage = useMemo(
    () => pages.find((page) => page.id === currentPageId) ?? pages[0] ?? null,
    [currentPageId, pages],
  );

  const selectedRegion = currentPage?.regions.find((region) => region.id === selectedRegionId) ?? null;

  useEffect(() => {
    if (!currentPage) {
      setSelectedRegionId(null);
      return;
    }

    if (!currentPage.regions.some((region) => region.id === selectedRegionId)) {
      setSelectedRegionId(currentPage.regions[0]?.id ?? null);
    }
  }, [currentPage, selectedRegionId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentPageId((prev) => {
          const index = pages.findIndex((page) => page.id === prev);
          return index > 0 ? pages[index - 1].id : prev;
        });
      }

      if (event.key === 'ArrowRight') {
        setCurrentPageId((prev) => {
          const index = pages.findIndex((page) => page.id === prev);
          return index >= 0 && index < pages.length - 1 ? pages[index + 1].id : prev;
        });
      }

      if ((event.ctrlKey || event.metaKey) && event.key === '=') {
        event.preventDefault();
        setZoom((value) => clamp(value + 0.1, 0.25, 2));
      }

      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        setZoom((value) => clamp(value - 0.1, 0.25, 2));
      }

      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault();
        setZoom(0.62);
        setPan({ x: 0, y: 0 });
      }

      if (event.key.toLowerCase() === 'f') {
        setViewMode((mode) => (mode === 'compare' ? 'translated' : 'compare'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages]);

  const updateCurrentPage = (updater: (page: ComicPage) => ComicPage) => {
    setPages((items) =>
      items.map((page) => (page.id === currentPageId ? updater(page) : page)),
    );
  };

  const updateSelectedRegion = (updater: (region: ComicRegion) => ComicRegion) => {
    if (!selectedRegionId) {
      return;
    }

    updateCurrentPage((page) => ({
      ...page,
      regions: page.regions.map((region) =>
        region.id === selectedRegionId ? updater(region) : region,
      ),
    }));
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );

    if (!files.length) {
      return;
    }

    setIsBusy(true);
    try {
      const uploadedPages = await Promise.all(naturalSort(files).map(createPageFromFile));
      setPages(uploadedPages);
      setCurrentPageId(uploadedPages[0]?.id ?? '');
      setSelectedRegionId(null);
      setProjectName(`Imported ${uploadedPages.length} pages`);
      setNotice(`已导入 ${uploadedPages.length} 张图片，并按文件名自然排序。`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsBusy(false);
      event.target.value = '';
    }
  };

  const getPointerPosition = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds || !currentPage) {
      return null;
    }

    const rawX = (event.clientX - bounds.left - pan.x) / zoom;
    const rawY = (event.clientY - bounds.top - pan.y) / zoom;

    return {
      x: clamp(rawX, 0, currentPage.width),
      y: clamp(rawY, 0, currentPage.height),
    };
  };

  const handleStagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!currentPage) {
      return;
    }

    if (event.button === 1 || event.altKey) {
      setIsPanning(true);
      setPanAnchor({ x: event.clientX - pan.x, y: event.clientY - pan.y });
      return;
    }

    if ((event.target as HTMLElement).dataset.regionId) {
      return;
    }

    const position = getPointerPosition(event);
    if (!position) {
      return;
    }

    setSelectedRegionId(null);
    setDragStart(position);
    setDraftRect({
      id: createId(),
      x: position.x,
      y: position.y,
      width: 0,
      height: 0,
      status: 'empty',
      sourceText: '',
      translatedText: '',
      fontSize: 24,
      lineHeight: 1.35,
      letterSpacing: 0,
      color: '#111827',
    });
  };

  const handleStagePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isPanning && panAnchor) {
      setPan({
        x: event.clientX - panAnchor.x,
        y: event.clientY - panAnchor.y,
      });
      return;
    }

    if (!dragStart || !currentPage) {
      return;
    }

    const position = getPointerPosition(event);
    if (!position) {
      return;
    }

    const x = Math.min(position.x, dragStart.x);
    const y = Math.min(position.y, dragStart.y);
    const width = Math.abs(position.x - dragStart.x);
    const height = Math.abs(position.y - dragStart.y);

    setDraftRect((region) =>
      region
        ? {
            ...region,
            x,
            y,
            width,
            height,
          }
        : null,
    );
  };

  const handleStagePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanAnchor(null);
      return;
    }

    if (!draftRect || draftRect.width < 16 || draftRect.height < 16 || !currentPage) {
      setDragStart(null);
      setDraftRect(null);
      return;
    }

    updateCurrentPage((page) => ({
      ...page,
      regions: [...page.regions, draftRect],
    }));
    setSelectedRegionId(draftRect.id);
    setNotice(`已在 ${currentPage.name} 新建选区框。`);
    setDragStart(null);
    setDraftRect(null);
  };

  const handleRunOcr = async (scope: 'selected' | 'page') => {
    if (!currentPage) {
      return;
    }

    setIsBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    updateCurrentPage((page) => ({
      ...page,
      regions: page.regions.map((region) => {
        if (scope === 'selected' && region.id !== selectedRegionId) {
          return region;
        }

        const sourceText = region.sourceText || buildFakeOcr(page.name, region.id);
        return {
          ...region,
          sourceText,
          status: region.status === 'reviewed' ? 'reviewed' : 'recognized',
        };
      }),
    }));
    setNotice(scope === 'selected' ? '已完成当前选区 OCR。' : '已完成当前页全部 OCR。');
    setIsBusy(false);
  };

  const handleTranslate = async (scope: 'selected' | 'page') => {
    if (!currentPage) {
      return;
    }

    setIsBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    updateCurrentPage((page) => ({
      ...page,
      regions: page.regions.map((region) => {
        if (scope === 'selected' && region.id !== selectedRegionId) {
          return region;
        }

        const translatedText = fakeTranslate(region.sourceText, targetLanguage);
        if (!translatedText) {
          return { ...region, status: 'error' };
        }

        return {
          ...region,
          translatedText,
          status: region.status === 'reviewed' ? 'reviewed' : 'translated',
        };
      }),
    }));
    setNotice(`已通过 ${engine} 完成${scope === 'selected' ? '选区' : '当前页'}翻译。`);
    setIsBusy(false);
  };

  const handleExportCurrentPage = async () => {
    if (!currentPage) {
      return;
    }

    const image = new Image();
    image.src = currentPage.src;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = currentPage.width;
    canvas.height = currentPage.height;
    const context = canvas.getContext('2d');

    if (!context) {
      setNotice('导出失败，无法创建画布上下文。');
      return;
    }

    context.drawImage(image, 0, 0, currentPage.width, currentPage.height);

    currentPage.regions.forEach((region) => {
      if (!region.translatedText) {
        return;
      }

      context.fillStyle = 'rgba(255,255,255,0.94)';
      context.fillRect(region.x, region.y, region.width, region.height);
      context.strokeStyle = 'rgba(15, 23, 42, 0.08)';
      context.strokeRect(region.x, region.y, region.width, region.height);
      context.fillStyle = region.color;
      context.textBaseline = 'top';
      context.font = `${region.fontSize}px Arial`;

      const words = region.translatedText.split('');
      const lineHeightPx = region.fontSize * region.lineHeight;
      let currentLine = '';
      let currentY = region.y + 12;

      words.forEach((char, index) => {
        const tentative = currentLine + char;
        const width = context.measureText(tentative).width;
        const isLast = index === words.length - 1;

        if (width > region.width - 24 && currentLine) {
          context.fillText(currentLine, region.x + 12, currentY);
          currentLine = char;
          currentY += lineHeightPx;
        } else {
          currentLine = tentative;
        }

        if (isLast) {
          context.fillText(currentLine, region.x + 12, currentY);
        }
      });
    });

    const anchor = document.createElement('a');
    anchor.href = canvas.toDataURL('image/png');
    anchor.download = currentPage.name.replace(/\.[^.]+$/, '') + '-translated.png';
    anchor.click();
    setNotice(`已导出 ${currentPage.name} 的译图 PNG。`);
  };

  const completionStats = useMemo(() => {
    const totalRegions = pages.reduce((sum, page) => sum + page.regions.length, 0);
    const translatedRegions = pages.reduce(
      (sum, page) =>
        sum +
        page.regions.filter((region) => ['translated', 'reviewed', 'embedded'].includes(region.status))
          .length,
      0,
    );

    return { totalPages: pages.length, totalRegions, translatedRegions };
  }, [pages]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ComicLens</p>
          <h1>{projectName}</h1>
        </div>
        <div className="toolbar-group">
          <button className="ghost-button" onClick={() => fileInputRef.current?.click()}>
            上传图片
          </button>
          <button className="ghost-button" onClick={() => directoryInputRef.current?.click()}>
            上传文件夹
          </button>
          <button className="ghost-button" onClick={() => handleRunOcr('page')} disabled={isBusy}>
            一键 OCR
          </button>
          <button className="ghost-button" onClick={() => handleTranslate('page')} disabled={isBusy}>
            一键翻译
          </button>
          <button className="primary-button" onClick={handleExportCurrentPage}>
            导出当前页
          </button>
          <input
            ref={fileInputRef}
            hidden
            multiple
            accept="image/png,image/jpeg,image/webp"
            type="file"
            onChange={onUpload}
          />
          <input
            ref={directoryInputRef}
            hidden
            multiple
            accept="image/png,image/jpeg,image/webp"
            type="file"
            onChange={onUpload}
            {...({ webkitdirectory: 'true' } as unknown as Record<string, string>)}
          />
        </div>
      </header>

      <section className="status-strip">
        <span>{notice}</span>
        <span>
          页面 {completionStats.totalPages} / 选区 {completionStats.totalRegions} / 已翻译{' '}
          {completionStats.translatedRegions}
        </span>
      </section>

      <main className="workspace">
        <aside className="panel left-panel">
          <div className="panel-header">
            <h2>页面管理</h2>
            <span>{pages.length} 页</span>
          </div>
          <div className="thumbnail-list">
            {pages.map((page, index) => (
              <button
                key={page.id}
                className={`thumbnail-card ${page.id === currentPageId ? 'active' : ''}`}
                onClick={() => setCurrentPageId(page.id)}
              >
                <img alt={page.name} src={page.src} />
                <div>
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  <p>{page.name}</p>
                  <span>{page.regions.length} 个文本框</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="canvas-panel">
          <div className="canvas-toolbar">
            <div className="segmented">
              {(['original', 'translated', 'compare'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  className={viewMode === mode ? 'active' : ''}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === 'original' ? '原图' : mode === 'translated' ? '译图' : '对比'}
                </button>
              ))}
            </div>
            <div className="toolbar-group">
              <button className="ghost-button" onClick={() => setZoom((value) => clamp(value - 0.1, 0.25, 2))}>
                -
              </button>
              <span className="zoom-label">{Math.round(zoom * 100)}%</span>
              <button className="ghost-button" onClick={() => setZoom((value) => clamp(value + 0.1, 0.25, 2))}>
                +
              </button>
              <button className="ghost-button" onClick={() => {
                setZoom(0.62);
                setPan({ x: 0, y: 0 });
              }}>
                适应屏幕
              </button>
            </div>
          </div>

          {currentPage ? (
            <div
              className="canvas-stage"
              ref={stageRef}
              onPointerDown={handleStagePointerDown}
              onPointerMove={handleStagePointerMove}
              onPointerUp={handleStagePointerUp}
              onPointerLeave={handleStagePointerUp}
            >
              <div
                className={`canvas-content mode-${viewMode}`}
                style={{
                  width: currentPage.width,
                  height: currentPage.height,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              >
                <img alt={currentPage.name} className="page-image" src={currentPage.src} />
                {currentPage.regions.map((region) => {
                  const meta = statusMeta[region.status];
                  return (
                    <button
                      key={region.id}
                      data-region-id={region.id}
                      className={`region-box ${selectedRegionId === region.id ? 'selected' : ''}`}
                      style={{
                        left: region.x,
                        top: region.y,
                        width: region.width,
                        height: region.height,
                        borderColor: meta.border,
                        backgroundColor: meta.fill,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedRegionId(region.id);
                      }}
                    >
                      <span className="region-id">{region.id.slice(0, 4)}</span>
                      {viewMode !== 'original' && region.translatedText ? (
                        <span
                          className="overlay-text"
                          style={{
                            fontSize: region.fontSize,
                            lineHeight: String(region.lineHeight),
                            letterSpacing: region.letterSpacing,
                            color: region.color,
                          }}
                        >
                          {region.translatedText}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                {draftRect ? (
                  <div
                    className="region-box drafting"
                    style={{
                      left: draftRect.x,
                      top: draftRect.y,
                      width: draftRect.width,
                      height: draftRect.height,
                    }}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <div className="empty-state">上传图片后开始编辑。</div>
          )}
        </section>

        <aside className="panel right-panel">
          <div className="panel-header">
            <h2>属性面板</h2>
            <span>{selectedRegion ? statusMeta[selectedRegion.status].label : '未选中'}</span>
          </div>

          <div className="field-grid">
            <label>
              <span>翻译引擎</span>
              <select value={engine} onChange={(event) => setEngine(event.target.value)}>
                <option>DeepL</option>
                <option>Google Translate</option>
                <option>OpenAI GPT</option>
              </select>
            </label>
            <label>
              <span>目标语言</span>
              <select value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </label>
          </div>

          <div className="action-grid">
            <button className="ghost-button" onClick={() => handleRunOcr('selected')} disabled={!selectedRegion || isBusy}>
              OCR 当前框
            </button>
            <button className="ghost-button" onClick={() => handleTranslate('selected')} disabled={!selectedRegion || isBusy}>
              翻译当前框
            </button>
            <button
              className="ghost-button"
              onClick={() =>
                updateSelectedRegion((region) => ({
                  ...region,
                  status: 'reviewed',
                }))
              }
              disabled={!selectedRegion}
            >
              标记已校对
            </button>
            <button
              className="ghost-button"
              onClick={() =>
                updateSelectedRegion((region) => ({
                  ...region,
                  status: 'embedded',
                }))
              }
              disabled={!selectedRegion}
            >
              标记已嵌入
            </button>
          </div>

          {selectedRegion ? (
            <>
              <label className="stacked-field">
                <span>原文 OCR</span>
                <textarea
                  value={selectedRegion.sourceText}
                  onChange={(event) =>
                    updateSelectedRegion((region) => ({
                      ...region,
                      sourceText: event.target.value,
                      status: event.target.value ? 'recognized' : 'empty',
                    }))
                  }
                />
              </label>

              <label className="stacked-field">
                <span>译文</span>
                <textarea
                  value={selectedRegion.translatedText}
                  onChange={(event) =>
                    updateSelectedRegion((region) => ({
                      ...region,
                      translatedText: event.target.value,
                      status: event.target.value ? 'reviewed' : 'recognized',
                    }))
                  }
                />
              </label>

              <div className="field-grid">
                <label>
                  <span>字号</span>
                  <input
                    type="number"
                    min={12}
                    max={72}
                    value={selectedRegion.fontSize}
                    onChange={(event) =>
                      updateSelectedRegion((region) => ({
                        ...region,
                        fontSize: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>行距</span>
                  <input
                    type="number"
                    min={1}
                    max={2.2}
                    step={0.05}
                    value={selectedRegion.lineHeight}
                    onChange={(event) =>
                      updateSelectedRegion((region) => ({
                        ...region,
                        lineHeight: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>字间距</span>
                  <input
                    type="number"
                    min={-1}
                    max={8}
                    step={0.5}
                    value={selectedRegion.letterSpacing}
                    onChange={(event) =>
                      updateSelectedRegion((region) => ({
                        ...region,
                        letterSpacing: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>文字颜色</span>
                  <input
                    type="color"
                    value={selectedRegion.color}
                    onChange={(event) =>
                      updateSelectedRegion((region) => ({
                        ...region,
                        color: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <button
                className="danger-button"
                onClick={() => {
                  updateCurrentPage((page) => ({
                    ...page,
                    regions: page.regions.filter((region) => region.id !== selectedRegion.id),
                  }));
                  setSelectedRegionId(null);
                  setNotice('已删除当前选区。');
                }}
              >
                删除当前框
              </button>
            </>
          ) : (
            <div className="empty-form">
              在画布中拖拽创建矩形选区，或点击已有文本框后编辑属性。
            </div>
          )}

          {currentPage ? (
            <section className="region-list">
              <div className="panel-header compact">
                <h3>框列表</h3>
                <span>{currentPage.regions.length}</span>
              </div>
              {currentPage.regions.map((region, index) => (
                <button
                  key={region.id}
                  className={`region-list-item ${region.id === selectedRegionId ? 'active' : ''}`}
                  onClick={() => setSelectedRegionId(region.id)}
                >
                  <strong>#{index + 1}</strong>
                  <span>{statusMeta[region.status].label}</span>
                  <p>{region.translatedText || region.sourceText || '空文本框'}</p>
                </button>
              ))}
            </section>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
