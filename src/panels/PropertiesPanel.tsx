import { useEditorStore } from '../store/editorStore';
import type { Wall, Room, Opening, SymbolObject, Dimension, TextNote } from '../types';
import { SYMBOL_DEFS, PLACEMENT_LABELS } from '../symbolDefs';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="prop-field">
      <label className="prop-label">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="prop-input" />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className="prop-select">
      {props.children}
    </select>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={2} className="prop-textarea" />;
}

export function PropertiesPanel() {
  const { objects, selectedObjectId, updateObject, deleteObject } = useEditorStore();

  const selected = objects.find(o => o.id === selectedObjectId);

  if (!selected) {
    return (
      <div className="panel-section">
        <div className="panel-section-title">תכונות</div>
        <p className="prop-empty">לחץ על אובייקט לעריכה</p>
      </div>
    );
  }

  const upd = (data: Partial<typeof selected>) => updateObject(selected.id, data);

  if (selected.objectType === 'wall') {
    const w = selected as Wall;

    return (
      <div className="panel-section">
        <div className="panel-section-title">קיר</div>

        {/* User-typed real-world measurements — not calculated from pixels */}
        <div className="wall-measurements">
          <div className="wall-meas-item">
            <span className="wall-meas-label">אורך (מהסקיצה)</span>
            <input
              className="wall-meas-input wall-meas-input--full"
              placeholder='לדוג׳ 8 מ&apos; / 350 ס"מ'
              value={w.labelLength ?? ''}
              onChange={e => upd({ labelLength: e.target.value })}
            />
          </div>
          <div className="wall-meas-item">
            <span className="wall-meas-label">עובי (מהסקיצה)</span>
            <input
              className="wall-meas-input wall-meas-input--full"
              placeholder='לדוג׳ 12 ס"מ'
              value={w.labelThickness ?? ''}
              onChange={e => upd({ labelThickness: e.target.value })}
            />
          </div>
        </div>
        <p className="wall-meas-hint">📐 כתוב את המידה שכתובה בסקיצה — הקיר לא זז</p>
        <p className="wall-meas-hint">🖱 לזוז/לשנות צורה: גרור ידיות בקצות הקיר</p>

        <Field label="שכבה">
          <Select value={w.layer} onChange={e => upd({ layer: e.target.value as Wall['layer'] })}>
            <option value="walls-exterior">חיצוני</option>
            <option value="walls-interior">פנימי</option>
            <option value="mamad">ממ"ד</option>
          </Select>
        </Field>
        <Field label="חומר / ציפוי">
          <Input value={w.material ?? ''} placeholder='לדוג׳ גבס לבן'
            onChange={e => upd({ material: e.target.value })} />
        </Field>
        <Field label="הערות">
          <Textarea value={w.notes ?? ''} onChange={e => upd({ notes: e.target.value })} />
        </Field>
        <button className="prop-delete-btn" onClick={() => deleteObject(w.id)}>מחק קיר</button>
      </div>
    );
  }

  if (selected.objectType === 'room') {
    const r = selected as Room;
    return (
      <div className="panel-section">
        <div className="panel-section-title">חדר / אזור</div>
        <Field label="שם">
          <Input value={r.name} onChange={e => upd({ name: e.target.value })} />
        </Field>
        <Field label="סוג">
          <Select value={r.roomType} onChange={e => upd({ roomType: e.target.value })}>
            <option value="bedroom">חדר שינה</option>
            <option value="bathroom">שירותים / מקלחת</option>
            <option value="kitchen">מטבח</option>
            <option value="office">משרד</option>
            <option value="storage">מחסן</option>
            <option value="mamad">ממ"ד</option>
            <option value="custom">אחר</option>
          </Select>
        </Field>
        <Field label='ממ"ד'>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={r.isMamad ?? false}
              onChange={e => upd({ isMamad: e.target.checked, layer: e.target.checked ? 'mamad' : 'rooms' })} />
            מסמן כממ"ד
          </label>
        </Field>
        {r.isMamad && (
          <Field label='עובי קיר ממ"ד (ס"מ)'>
            <Input type="number" value={r.mamadWallThickness ?? 30}
              onChange={e => upd({ mamadWallThickness: Number(e.target.value) })} />
          </Field>
        )}
        <Field label="הערות">
          <Textarea value={r.notes ?? ''} onChange={e => upd({ notes: e.target.value })} />
        </Field>
        <button className="prop-delete-btn" onClick={() => deleteObject(r.id)}>מחק חדר</button>
      </div>
    );
  }

  if (selected.objectType === 'opening') {
    const o = selected as Opening;
    return (
      <div className="panel-section">
        <div className="panel-section-title">פתח</div>
        <Field label="סוג">
          <Select value={o.openingType} onChange={e => upd({ openingType: e.target.value as Opening['openingType'] })}>
            <option value="door">דלת</option>
            <option value="window">חלון</option>
            <option value="mamad-door">דלת ממ"ד</option>
            <option value="mamad-window">חלון ממ"ד</option>
            <option value="special">פתח מיוחד</option>
          </Select>
        </Field>
        <Field label="רוחב (px)">
          <Input type="number" value={o.width} onChange={e => upd({ width: Number(e.target.value) })} />
        </Field>
        {(o.openingType === 'window' || o.openingType === 'mamad-window') && (
          <Field label="גובה חלון (px)">
            <Input type="number" value={o.height ?? 30} min={10} max={200}
              onChange={e => upd({ height: Number(e.target.value) })} />
          </Field>
        )}
        <Field label="סיבוב (מעלות)">
          <Input type="number" value={o.rotation} step={45}
            onChange={e => upd({ rotation: Number(e.target.value) })} />
        </Field>
        {(o.openingType === 'door' || o.openingType === 'mamad-door') && (
          <Field label="כיוון פתיחה">
            <Select value={o.direction} onChange={e => upd({ direction: e.target.value as 'left' | 'right' })}>
              <option value="left">שמאל</option>
              <option value="right">ימין</option>
            </Select>
          </Field>
        )}
        {o.openingType === 'window' && (
          <>
            <Field label="תריס חשמלי">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={o.isElectricShutter ?? false}
                  onChange={e => upd({ isElectricShutter: e.target.checked })} />
                יש תריס חשמלי
              </label>
            </Field>
            {o.isElectricShutter && (
              <Field label="ארגז תריס">
                <Select value={o.shutterBoxType ?? 'external'}
                  onChange={e => upd({ shutterBoxType: e.target.value as 'internal' | 'external' })}>
                  <option value="internal">פנימי</option>
                  <option value="external">חיצוני</option>
                </Select>
              </Field>
            )}
          </>
        )}
        <Field label="הערות">
          <Textarea value={o.notes ?? ''} onChange={e => upd({ notes: e.target.value })} />
        </Field>
        <button className="prop-delete-btn" onClick={() => deleteObject(o.id)}>מחק פתח</button>
      </div>
    );
  }

  if (selected.objectType === 'symbol') {
    const s = selected as SymbolObject;
    const def = SYMBOL_DEFS.find(d => d.code === s.symbolType);
    return (
      <div className="panel-section">
        <div className="panel-section-title">סמל: {def?.name ?? s.symbolType}</div>
        <Field label="סוג סמל">
          <Select value={s.symbolType} onChange={e => upd({ symbolType: e.target.value })}>
            {SYMBOL_DEFS.map(d => (
              <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
            ))}
          </Select>
        </Field>
        <Field label='גובה מהרצפה (ס"מ)'>
          <Input type="number" value={s.heightFromFloor ?? ''} placeholder="לדוג׳ 40"
            onChange={e => upd({ heightFromFloor: e.target.value ? Number(e.target.value) : undefined })} />
        </Field>
        <Field label="מיקום">
          <Select value={s.placement} onChange={e => upd({ placement: e.target.value as SymbolObject['placement'] })}>
            {Object.entries(PLACEMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field label="הערות">
          <Textarea value={s.notes ?? ''} onChange={e => upd({ notes: e.target.value })} />
        </Field>
        <button className="prop-delete-btn" onClick={() => deleteObject(s.id)}>מחק סמל</button>
      </div>
    );
  }

  if (selected.objectType === 'dimension') {
    const d = selected as Dimension;
    return (
      <div className="panel-section">
        <div className="panel-section-title">מידה</div>
        <Field label="תווית">
          <Input value={d.label} placeholder='לדוג׳ 3.60 מ"ר'
            onChange={e => upd({ label: e.target.value })} />
        </Field>
        <Field label="הערות">
          <Textarea value={d.notes ?? ''} onChange={e => upd({ notes: e.target.value })} />
        </Field>
        <button className="prop-delete-btn" onClick={() => deleteObject(d.id)}>מחק מידה</button>
      </div>
    );
  }

  if (selected.objectType === 'text') {
    const t = selected as TextNote;
    return (
      <div className="panel-section">
        <div className="panel-section-title">הערת טקסט</div>
        <Field label="טקסט">
          <Textarea value={t.text} onChange={e => upd({ text: e.target.value })} />
        </Field>
        <Field label="גודל גופן">
          <Input type="number" value={t.fontSize} min={8} max={48}
            onChange={e => upd({ fontSize: Number(e.target.value) })} />
        </Field>
        <Field label="צבע">
          <input type="color" value={t.color ?? '#1f2937'}
            onChange={e => upd({ color: e.target.value })}
            className="prop-color" />
        </Field>
        <button className="prop-delete-btn" onClick={() => deleteObject(t.id)}>מחק הערה</button>
      </div>
    );
  }

  return null;
}
