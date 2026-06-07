import { create } from 'zustand';
import type { DrawingObject, ToolType, LayerType } from '../types';

export type DrawingPhase =
  | { type: 'idle' }
  | { type: 'wall'; x1: number; y1: number }
  | { type: 'room'; points: number[] }
  | { type: 'dimension'; x1: number; y1: number }
  | { type: 'placing-symbol'; symbolCode: string };

interface EditorStore {
  projectId: string | null;
  activeTool: ToolType;
  selectedObjectId: string | null;
  layerVisibility: Record<LayerType, boolean>;
  drawingPhase: DrawingPhase;
  pendingSymbol: string | null;
  objects: DrawingObject[];
  history: DrawingObject[][];
  historyIndex: number;
  showGrid: boolean;
  showSymbolPicker: boolean;
  showExportModal: boolean;
  showTextDialog: boolean;
  showDimensionDialog: boolean;
  pendingDimension: { x1: number; y1: number; x2: number; y2: number } | null;
  pendingTextPos: { x: number; y: number } | null;
  stageScale: number;
  stageX: number;
  stageY: number;

  setProjectId: (id: string | null) => void;
  setActiveTool: (tool: ToolType) => void;
  setSelectedObjectId: (id: string | null) => void;
  setLayerVisibility: (vis: Record<LayerType, boolean>) => void;
  toggleLayer: (layer: LayerType) => void;
  setDrawingPhase: (phase: DrawingPhase) => void;
  setPendingSymbol: (code: string | null) => void;
  setObjects: (objects: DrawingObject[]) => void;
  addObject: (obj: DrawingObject) => void;
  updateObject: (id: string, data: Partial<DrawingObject>) => void;
  deleteObject: (id: string) => void;
  undo: () => void;
  redo: () => void;
  setShowGrid: (v: boolean) => void;
  setShowSymbolPicker: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  setShowTextDialog: (v: boolean) => void;
  setShowDimensionDialog: (v: boolean) => void;
  setPendingDimension: (d: { x1: number; y1: number; x2: number; y2: number } | null) => void;
  setPendingTextPos: (p: { x: number; y: number } | null) => void;
  setStageTransform: (scale: number, x: number, y: number) => void;
  pushHistory: (objects: DrawingObject[]) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorStore>()((set, get) => ({
  projectId: null,
  activeTool: 'select',
  selectedObjectId: null,
  layerVisibility: {} as Record<LayerType, boolean>,
  drawingPhase: { type: 'idle' },
  pendingSymbol: null,
  objects: [],
  history: [[]],
  historyIndex: 0,
  showGrid: true,
  showSymbolPicker: false,
  showExportModal: false,
  showTextDialog: false,
  showDimensionDialog: false,
  pendingDimension: null,
  pendingTextPos: null,
  stageScale: 1,
  stageX: 0,
  stageY: 0,

  setProjectId: (id) => set({ projectId: id }),

  setActiveTool: (tool) => set({
    activeTool: tool,
    drawingPhase: { type: 'idle' },
    selectedObjectId: null,
    showSymbolPicker: tool === 'symbol',
  }),

  setSelectedObjectId: (id) => set({ selectedObjectId: id }),

  setLayerVisibility: (vis) => set({ layerVisibility: vis }),

  toggleLayer: (layer) => set(s => ({
    layerVisibility: { ...s.layerVisibility, [layer]: !s.layerVisibility[layer] },
  })),

  setDrawingPhase: (phase) => set({ drawingPhase: phase }),

  setPendingSymbol: (code) => set({ pendingSymbol: code, showSymbolPicker: false }),

  setObjects: (objects) => {
    const history = get().history;
    const historyIndex = get().historyIndex;
    const newHistory = [...history.slice(0, historyIndex + 1), objects].slice(-MAX_HISTORY);
    set({ objects, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addObject: (obj) => {
    const objects = [...get().objects, obj];
    get().pushHistory(objects);
    set({ objects });
  },

  updateObject: (id, data) => {
    const objects = get().objects.map(o => o.id === id ? { ...o, ...data } as DrawingObject : o);
    get().pushHistory(objects);
    set({ objects });
  },

  deleteObject: (id) => {
    const objects = get().objects.filter(o => o.id !== id);
    get().pushHistory(objects);
    set({ objects, selectedObjectId: null });
  },

  pushHistory: (objects) => {
    const { history, historyIndex } = get();
    const newHistory = [...history.slice(0, historyIndex + 1), objects].slice(-MAX_HISTORY);
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ objects: history[newIndex], historyIndex: newIndex, selectedObjectId: null });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ objects: history[newIndex], historyIndex: newIndex });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  setShowGrid: (v) => set({ showGrid: v }),
  setShowSymbolPicker: (v) => set({ showSymbolPicker: v }),
  setShowExportModal: (v) => set({ showExportModal: v }),
  setShowTextDialog: (v) => set({ showTextDialog: v }),
  setShowDimensionDialog: (v) => set({ showDimensionDialog: v }),
  setPendingDimension: (d) => set({ pendingDimension: d }),
  setPendingTextPos: (p) => set({ pendingTextPos: p }),
  setStageTransform: (scale, x, y) => set({ stageScale: scale, stageX: x, stageY: y }),
}));
