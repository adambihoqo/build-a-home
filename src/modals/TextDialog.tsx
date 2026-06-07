import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { TextNote } from '../types';

function makeId() { return Math.random().toString(36).slice(2, 11); }

export function TextDialog() {
  const { showTextDialog, setShowTextDialog, pendingTextPos, setPendingTextPos, addObject } = useEditorStore();
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [color, setColor] = useState('#1f2937');

  if (!showTextDialog) return null;

  const confirm = () => {
    if (!text.trim() || !pendingTextPos) return;
    const note: TextNote = {
      id: makeId(), objectType: 'text', layer: 'notes',
      x: pendingTextPos.x, y: pendingTextPos.y,
      text: text.trim(), fontSize, color,
    };
    addObject(note);
    setText('');
    setShowTextDialog(false);
    setPendingTextPos(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowTextDialog(false)}>
      <div className="modal-box modal-box--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">הוסף הערת טקסט</h2>
          <button className="modal-close" onClick={() => setShowTextDialog(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="prop-field">
            <label className="prop-label">טקסט</label>
            <textarea
              className="prop-textarea"
              rows={3}
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="הקלד הערה..."
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) confirm(); }}
            />
          </div>
          <div className="flex gap-3">
            <div className="prop-field flex-1">
              <label className="prop-label">גודל גופן</label>
              <input type="number" className="prop-input" value={fontSize} min={8} max={48}
                onChange={e => setFontSize(Number(e.target.value))} />
            </div>
            <div className="prop-field">
              <label className="prop-label">צבע</label>
              <input type="color" className="prop-color" value={color}
                onChange={e => setColor(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setShowTextDialog(false)}>ביטול</button>
          <button className="btn-primary" onClick={confirm} disabled={!text.trim()}>הוסף</button>
        </div>
      </div>
    </div>
  );
}
