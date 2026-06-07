import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { Dimension } from '../types';

function makeId() { return Math.random().toString(36).slice(2, 11); }

export function DimensionDialog() {
  const { showDimensionDialog, setShowDimensionDialog, pendingDimension, setPendingDimension, addObject } = useEditorStore();
  const [label, setLabel] = useState('');

  if (!showDimensionDialog || !pendingDimension) return null;

  const confirm = () => {
    const dim: Dimension = {
      id: makeId(), objectType: 'dimension', layer: 'dimensions',
      x1: pendingDimension.x1, y1: pendingDimension.y1,
      x2: pendingDimension.x2, y2: pendingDimension.y2,
      label: label || '—',
      notes: '',
    };
    addObject(dim);
    setLabel('');
    setShowDimensionDialog(false);
    setPendingDimension(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowDimensionDialog(false)}>
      <div className="modal-box modal-box--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">תווית מידה</h2>
          <button className="modal-close" onClick={() => setShowDimensionDialog(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="prop-field">
            <label className="prop-label">מידה / תווית</label>
            <input
              className="prop-input"
              autoFocus
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder='לדוג׳ 3.60 מ" | 360 ס"מ'
              onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setShowDimensionDialog(false)}>ביטול</button>
          <button className="btn-primary" onClick={confirm}>הוסף</button>
        </div>
      </div>
    </div>
  );
}
