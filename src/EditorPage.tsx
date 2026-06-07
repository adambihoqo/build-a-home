import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from './store/editorStore';
import { useProjectStore } from './store/projectStore';
import { CanvasStage } from './canvas/CanvasStage';
import { Toolbar } from './panels/Toolbar';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { LayersPanel } from './panels/LayersPanel';
import { MaterialPanel } from './panels/MaterialPanel';
import { SymbolPicker } from './modals/SymbolPicker';
import { TextDialog } from './modals/TextDialog';
import { DimensionDialog } from './modals/DimensionDialog';
import { ExportModal } from './modals/ExportModal';
import { DEFAULT_LAYER_VISIBILITY } from './types';

interface Props {
  projectId: string;
  onBack: () => void;
}

type RightTab = 'properties' | 'layers' | 'materials';

export function EditorPage({ projectId, onBack }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [rightTab, setRightTab] = useState<RightTab>('properties');
  const [bgOpacityLocal, setBgOpacityLocal] = useState(0.4);

  const { projects, updateProject, saveBackground } = useProjectStore();
  const project = projects.find(p => p.id === projectId);

  const {
    setProjectId, setObjects, setLayerVisibility,
    setActiveTool, setDrawingPhase,
    showSymbolPicker, showExportModal, showTextDialog, showDimensionDialog,
  } = useEditorStore();

  // Initialize editor with project data
  useEffect(() => {
    if (!project) return;
    setProjectId(projectId);
    setObjects(project.objects);
    setLayerVisibility(project.layerVisibility ?? DEFAULT_LAYER_VISIBILITY);
    setBgOpacityLocal(project.backgroundOpacity ?? 0.4);
    setActiveTool('select');
    setDrawingPhase({ type: 'idle' });
  }, [projectId]);

  // Measure canvas container
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ w: width, h: height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      saveBackground(projectId, dataUrl, bgOpacityLocal);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearBg = () => {
    saveBackground(projectId, undefined, bgOpacityLocal);
  };

  const handleOpacity = (v: number) => {
    setBgOpacityLocal(v);
    saveBackground(projectId, project?.backgroundImage, v);
  };

  const handleGeneralNotes = (notes: string) => {
    updateProject(projectId, { generalNotes: notes });
  };

  return (
    <div className="editor-layout">
      {/* Top bar */}
      <div className="editor-topbar">
        <button className="topbar-back" onClick={onBack}>← חזור</button>
        <div className="topbar-project-info">
          <span className="topbar-client">{project?.clientName}</span>
          <span className="topbar-name">{project?.projectName}</span>
        </div>
        <div className="topbar-actions">
          {/* Scale setting */}
          <div className="topbar-scale" title="סקאלה: כמה פיקסלים = 1 מטר. ברירת מחדל: 100px = 1מ' (1px = 1ס&quot;מ)">
            <span className="topbar-scale-label">סקאלה:</span>
            <select
              className="topbar-scale-select"
              value={project?.scale ?? 100}
              onChange={e => updateProject(projectId, { scale: Number(e.target.value) })}
            >
              <option value={50}>50px = 1מ' (1px=2ס"מ)</option>
              <option value={100}>100px = 1מ' (1px=1ס"מ)</option>
              <option value={200}>200px = 1מ' (1px=0.5ס"מ)</option>
              <option value={50 / 0.5}>1px = 0.5ס"מ</option>
            </select>
          </div>

          {/* Background image upload */}
          <label className="topbar-btn" title="העלה תמונת רקע (סקיצה ידנית)">
            <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            🖼 רקע
          </label>
          {project?.backgroundImage && (
            <>
              <input
                type="range" min={0.1} max={1} step={0.05}
                value={bgOpacityLocal}
                onChange={e => handleOpacity(Number(e.target.value))}
                title="שקיפות רקע"
                className="topbar-slider"
              />
              <button className="topbar-btn" onClick={handleClearBg}>✕ הסר רקע</button>
            </>
          )}
          <button className="topbar-btn topbar-btn--primary"
            onClick={() => useEditorStore.getState().setShowExportModal(true)}>
            ⬇ ייצא
          </button>
        </div>
      </div>

      <div className="editor-body">
        {/* Left toolbar */}
        <Toolbar />

        {/* Canvas */}
        <div ref={containerRef} className="canvas-container">
          <CanvasStage width={dimensions.w} height={dimensions.h} />
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="right-panel-tabs">
            <button
              className={`tab-btn ${rightTab === 'properties' ? 'tab-btn--active' : ''}`}
              onClick={() => setRightTab('properties')}
            >תכונות</button>
            <button
              className={`tab-btn ${rightTab === 'layers' ? 'tab-btn--active' : ''}`}
              onClick={() => setRightTab('layers')}
            >שכבות</button>
            <button
              className={`tab-btn ${rightTab === 'materials' ? 'tab-btn--active' : ''}`}
              onClick={() => setRightTab('materials')}
            >חומרים</button>
          </div>

          <div className="right-panel-body">
            {rightTab === 'properties' && (
              <>
                <PropertiesPanel />
                {/* General notes */}
                <div className="panel-section">
                  <div className="panel-section-title">הערות כלליות לפרויקט</div>
                  <textarea
                    className="prop-textarea"
                    rows={4}
                    value={project?.generalNotes ?? ''}
                    onChange={e => handleGeneralNotes(e.target.value)}
                    placeholder="הערות כלליות..."
                  />
                </div>
              </>
            )}
            {rightTab === 'layers' && <LayersPanel />}
            {rightTab === 'materials' && <MaterialPanel />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSymbolPicker && <SymbolPicker />}
      {showTextDialog && <TextDialog />}
      {showDimensionDialog && <DimensionDialog />}
      {showExportModal && <ExportModal />}
    </div>
  );
}
