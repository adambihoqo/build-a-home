import { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useEditorStore } from '../store/editorStore';
import { MATERIAL_PRESETS, AREA_PRESETS, COMPONENT_PRESETS } from '../materialDefs';
import type { MaterialSpec, Extra } from '../types';

function makeId() { return Math.random().toString(36).slice(2, 11); }

export function MaterialPanel() {
  const { projectId } = useEditorStore();
  const { projects, saveMaterialSpecs, saveExtras } = useProjectStore();
  const project = projects.find(p => p.id === projectId);
  const specs: MaterialSpec[] = project?.materialSpecs ?? [];
  const extras: Extra[] = project?.extras ?? [];

  const [activeTab, setActiveTab] = useState<'materials' | 'extras'>('materials');

  const updateSpecs = (newSpecs: MaterialSpec[]) => {
    if (projectId) saveMaterialSpecs(projectId, newSpecs);
  };

  const updateExtras = (newExtras: Extra[]) => {
    if (projectId) saveExtras(projectId, newExtras);
  };

  const addSpec = () => {
    updateSpecs([...specs, { id: makeId(), area: '', component: '', material: '', notes: '' }]);
  };

  const updateSpec = (id: string, data: Partial<MaterialSpec>) => {
    updateSpecs(specs.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSpec = (id: string) => {
    updateSpecs(specs.filter(s => s.id !== id));
  };

  const addExtra = () => {
    updateExtras([...extras, { id: makeId(), description: '', notes: '' }]);
  };

  const updateExtra = (id: string, data: Partial<Extra>) => {
    updateExtras(extras.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const deleteExtra = (id: string) => {
    updateExtras(extras.filter(e => e.id !== id));
  };

  return (
    <div className="panel-section">
      <div className="flex gap-1 mb-2">
        <button
          className={`tab-btn ${activeTab === 'materials' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          מפרט חומרים
        </button>
        <button
          className={`tab-btn ${activeTab === 'extras' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('extras')}
        >
          תוספות
        </button>
      </div>

      {activeTab === 'materials' && (
        <>
          <div className="material-list">
            {specs.map(spec => (
              <div key={spec.id} className="material-row">
                <div className="material-row-fields">
                  <DatalistInput
                    label="אזור"
                    value={spec.area}
                    options={AREA_PRESETS}
                    onChange={v => updateSpec(spec.id, { area: v })}
                  />
                  <DatalistInput
                    label="רכיב"
                    value={spec.component}
                    options={COMPONENT_PRESETS}
                    onChange={v => updateSpec(spec.id, { component: v })}
                  />
                  <DatalistInput
                    label="חומר / סוג"
                    value={spec.material}
                    options={MATERIAL_PRESETS}
                    onChange={v => updateSpec(spec.id, { material: v })}
                  />
                  <input
                    className="prop-input text-xs"
                    placeholder="עובי / נתון טכני"
                    value={spec.thickness ?? ''}
                    onChange={e => updateSpec(spec.id, { thickness: e.target.value })}
                  />
                  <input
                    className="prop-input text-xs"
                    placeholder="שכבה נוספת"
                    value={spec.extraLayer ?? ''}
                    onChange={e => updateSpec(spec.id, { extraLayer: e.target.value })}
                  />
                  <input
                    className="prop-input text-xs"
                    placeholder="הערות"
                    value={spec.notes ?? ''}
                    onChange={e => updateSpec(spec.id, { notes: e.target.value })}
                  />
                </div>
                <button className="material-delete-btn" onClick={() => deleteSpec(spec.id)}>×</button>
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={addSpec}>+ הוסף שורה</button>
        </>
      )}

      {activeTab === 'extras' && (
        <>
          <div className="material-list">
            {extras.map(extra => (
              <div key={extra.id} className="material-row">
                <div className="material-row-fields">
                  <input
                    className="prop-input text-xs"
                    placeholder="תיאור תוספת"
                    value={extra.description}
                    onChange={e => updateExtra(extra.id, { description: e.target.value })}
                  />
                  <input
                    className="prop-input text-xs"
                    placeholder="הערות"
                    value={extra.notes ?? ''}
                    onChange={e => updateExtra(extra.id, { notes: e.target.value })}
                  />
                </div>
                <button className="material-delete-btn" onClick={() => deleteExtra(extra.id)}>×</button>
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={addExtra}>+ הוסף תוספת</button>
        </>
      )}
    </div>
  );
}

function DatalistInput({ label, value, options, onChange }: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void;
}) {
  const listId = `dl-${label}`;
  return (
    <>
      <input
        list={listId}
        className="prop-input text-xs"
        placeholder={label}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    </>
  );
}
