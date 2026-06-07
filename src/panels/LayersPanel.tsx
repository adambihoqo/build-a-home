import { useEditorStore } from '../store/editorStore';
import type { LayerType } from '../types';
import { LAYER_LABELS } from '../types';

const LAYER_COLORS: Record<LayerType, string> = {
  'walls-exterior': '#1f2937',
  'walls-interior': '#4b5563',
  'mamad': '#1e40af',
  'rooms': '#3b82f6',
  'openings': '#b45309',
  'electrical': '#dc2626',
  'water': '#2563eb',
  'lighting': '#d97706',
  'furniture': '#0369a1',
  'roof': '#065f46',
  'dimensions': '#6366f1',
  'notes': '#f97316',
};

export function LayersPanel() {
  const { layerVisibility, toggleLayer } = useEditorStore();

  const layers = Object.entries(LAYER_LABELS) as [LayerType, string][];

  return (
    <div className="panel-section">
      <div className="panel-section-title">שכבות</div>
      <div className="layers-list">
        {layers.map(([layer, label]) => {
          const visible = layerVisibility[layer] !== false;
          return (
            <label key={layer} className="layer-row">
              <span
                className="layer-dot"
                style={{ background: LAYER_COLORS[layer] }}
              />
              <span className="layer-name">{label}</span>
              <input
                type="checkbox"
                checked={visible}
                onChange={() => toggleLayer(layer)}
                className="layer-check"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
