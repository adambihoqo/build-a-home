import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { SYMBOL_DEFS, SYMBOL_CATEGORY_LABELS } from '../symbolDefs';

export function SymbolPicker() {
  const { showSymbolPicker, setShowSymbolPicker, setPendingSymbol, setActiveTool } = useEditorStore();
  const [filter, setFilter] = useState<string>('all');

  if (!showSymbolPicker) return null;

  const categories = ['all', 'electrical', 'water', 'lighting', 'shutters'];
  const filtered = filter === 'all' ? SYMBOL_DEFS : SYMBOL_DEFS.filter(s => s.category === filter);

  const select = (code: string) => {
    setPendingSymbol(code);
    setActiveTool('symbol');
    setShowSymbolPicker(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowSymbolPicker(false)}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">ספריית סמלים</h2>
          <button className="modal-close" onClick={() => setShowSymbolPicker(false)}>×</button>
        </div>

        <div className="symbol-filter-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab-btn ${filter === cat ? 'tab-btn--active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'הכל' : SYMBOL_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="symbol-grid">
          {filtered.map(sym => (
            <button
              key={sym.code}
              className="symbol-item"
              onClick={() => select(sym.code)}
              title={sym.name}
            >
              <div className="symbol-circle" style={{ borderColor: sym.color, color: sym.color }}>
                <span style={{ fontSize: sym.code.length > 3 ? 8 : 11, fontWeight: 'bold' }}>
                  {sym.code}
                </span>
              </div>
              <span className="symbol-name">{sym.name}</span>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <p className="text-xs text-gray-500">לחץ על סמל ואז לחץ על הקנבס לצבה</p>
        </div>
      </div>
    </div>
  );
}
