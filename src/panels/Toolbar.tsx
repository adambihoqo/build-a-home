import { useEditorStore } from '../store/editorStore';
import type { ToolType } from '../types';

interface ToolBtn {
  tool?: ToolType;
  label: string;
  icon: string;
  action?: () => void;
  active?: boolean;
  divider?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

export function Toolbar() {
  const {
    activeTool, setActiveTool,
    canUndo, canRedo, undo, redo,
    showGrid, setShowGrid,
    setShowExportModal, setShowSymbolPicker,
    selectedObjectId, deleteObject,
    drawingPhase, setDrawingPhase,
    setPendingSymbol,
  } = useEditorStore();

  const tools: ToolBtn[] = [
    { tool: 'select', label: 'בחירה (V)', icon: '↖', },
    { divider: true, label: '', icon: '' },
    { tool: 'wall-exterior', label: 'קיר חיצוני', icon: '▬', },
    { tool: 'wall-interior', label: 'קיר פנימי', icon: '╌', },
    { tool: 'wall-mamad', label: 'קיר ממ"ד', icon: '█', },
    { tool: 'room', label: 'חדר / אזור', icon: '⬡', },
    { divider: true, label: '', icon: '' },
    { tool: 'door', label: 'דלת', icon: '🚪', },
    { tool: 'window', label: 'חלון', icon: '▢', },
    {
      tool: 'symbol', label: 'סמל (חשמל/מים/תאורה)', icon: '⚡',
      action: () => {
        setActiveTool('symbol');
        setShowSymbolPicker(true);
      },
    },
    { divider: true, label: '', icon: '' },
    { tool: 'dimension', label: 'מידה', icon: '↔', },
    { tool: 'text', label: 'הערת טקסט', icon: 'T', },
    { divider: true, label: '', icon: '' },
    {
      label: canUndo() ? 'בטל (Ctrl+Z)' : 'אין מה לבטל',
      icon: '↩',
      action: undo,
      disabled: !canUndo(),
    },
    {
      label: canRedo() ? 'שחזר (Ctrl+Y)' : 'אין מה לשחזר',
      icon: '↪',
      action: redo,
      disabled: !canRedo(),
    },
    { divider: true, label: '', icon: '' },
    {
      label: showGrid ? 'הסתר גריד' : 'הצג גריד',
      icon: '⊞',
      action: () => setShowGrid(!showGrid),
      active: showGrid,
    },
    { divider: true, label: '', icon: '' },
    {
      label: 'ייצא PDF / PNG',
      icon: '⬇',
      action: () => setShowExportModal(true),
    },
    {
      label: selectedObjectId ? 'מחק נבחר (Del)' : 'בחר אובייקט למחיקה',
      icon: '🗑',
      action: () => { if (selectedObjectId) deleteObject(selectedObjectId); },
      danger: true,
      disabled: !selectedObjectId,
    },
  ];

  const isActive = (t?: ToolType) => t && activeTool === t;

  return (
    <div className="toolbar">
      <div className="toolbar-title">כלים</div>
      {tools.map((btn, i) => {
        if (btn.divider) return <div key={i} className="toolbar-divider" />;
        return (
          <button
            key={i}
            title={btn.label}
            disabled={btn.disabled}
            className={[
              'toolbar-btn',
              isActive(btn.tool) ? 'toolbar-btn--active' : '',
              btn.danger ? 'toolbar-btn--danger' : '',
              btn.disabled ? 'toolbar-btn--disabled' : '',
            ].join(' ')}
            onClick={() => {
              if (btn.action) {
                btn.action();
              } else if (btn.tool) {
                setActiveTool(btn.tool);
                setDrawingPhase({ type: 'idle' });
                setPendingSymbol(null);
              }
            }}
          >
            <span className="toolbar-icon">{btn.icon}</span>
            <span className="toolbar-label">{btn.label}</span>
          </button>
        );
      })}

      {/* Drawing hint */}
      {drawingPhase.type === 'wall' && (
        <div className="toolbar-hint">
          לחץ לנקודה הבאה<br />
          לחיצה כפולה / Esc לסיום
        </div>
      )}
      {drawingPhase.type === 'room' && (
        <div className="toolbar-hint">
          לחץ להוספת נקודה<br />
          לחיצה כפולה לסגירה
        </div>
      )}
      {drawingPhase.type === 'dimension' && (
        <div className="toolbar-hint">
          לחץ לנקודה הסופית
        </div>
      )}
      {activeTool === 'symbol' && !useEditorStore.getState().pendingSymbol && (
        <div className="toolbar-hint">
          בחר סמל מהחלונית
        </div>
      )}
      {activeTool === 'symbol' && useEditorStore.getState().pendingSymbol && (
        <div className="toolbar-hint">
          לחץ על הקנבס<br />להצבת הסמל
        </div>
      )}
    </div>
  );
}
