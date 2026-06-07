import { useState } from 'react';
import { useProjectStore } from './store/projectStore';
import { useEditorStore } from './store/editorStore';
import { TEMPLATE_DEFS } from './templateDefs';
import { DEFAULT_LAYER_VISIBILITY } from './types';

interface Props {
  onOpenProject: (id: string) => void;
}

export function HomePage({ onOpenProject }: Props) {
  const { projects, createProject, createFromTemplate, deleteProject, duplicateProject } = useProjectStore();
  const [showNew, setShowNew] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const create = () => {
    if (!clientName.trim()) return;
    const name = projectName.trim() || 'סקיצה חדשה';
    let id: string;
    if (selectedTemplate !== null) {
      id = createFromTemplate(clientName.trim(), name, TEMPLATE_DEFS[selectedTemplate].project);
    } else {
      id = createProject(clientName.trim(), name);
    }
    setShowNew(false);
    setClientName('');
    setProjectName('');
    setSelectedTemplate(null);
    // Load project into editor
    const proj = useProjectStore.getState().getProject(id);
    if (proj) {
      useEditorStore.getState().setProjectId(id);
      useEditorStore.getState().setObjects(proj.objects);
      useEditorStore.getState().setLayerVisibility(proj.layerVisibility ?? DEFAULT_LAYER_VISIBILITY);
    }
    onOpenProject(id);
  };

  const openProject = (id: string) => {
    const proj = useProjectStore.getState().getProject(id);
    if (!proj) return;
    useEditorStore.getState().setProjectId(id);
    useEditorStore.getState().setObjects(proj.objects);
    useEditorStore.getState().setLayerVisibility(proj.layerVisibility ?? DEFAULT_LAYER_VISIBILITY);
    onOpenProject(id);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`מחק את הפרויקט "${name}"?`)) deleteProject(id);
  };

  const doDuplicate = (id: string) => {
    duplicateProject(id);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h1 className="home-title">BuildSketch</h1>
          <p className="home-subtitle">סקיצת בנייה קלה מקצועית</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          + פרויקט חדש
        </button>
      </header>

      {projects.length === 0 && (
        <div className="home-empty">
          <div className="home-empty-icon">🏗️</div>
          <p>אין פרויקטים עדיין.</p>
          <button className="btn-primary" onClick={() => setShowNew(true)}>צור פרויקט ראשון</button>
        </div>
      )}

      <div className="project-grid">
        {projects.map(p => (
          <div key={p.id} className="project-card">
            <div className="project-card-body" onClick={() => openProject(p.id)}>
              <div className="project-card-icon">🏠</div>
              <div>
                <div className="project-card-client">{p.clientName}</div>
                <div className="project-card-name">{p.projectName}</div>
                <div className="project-card-date">{p.date}</div>
                <div className="project-card-count">{p.objects.length} אובייקטים</div>
              </div>
            </div>
            <div className="project-card-actions">
              <button className="card-btn" onClick={() => openProject(p.id)}>פתח</button>
              <button className="card-btn" onClick={() => doDuplicate(p.id)}>שכפל</button>
              <button className="card-btn card-btn--danger" onClick={() => confirmDelete(p.id, p.projectName)}>מחק</button>
            </div>
          </div>
        ))}
      </div>

      {/* New project modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-box modal-box--md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">פרויקט חדש</h2>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="prop-field">
                <label className="prop-label">שם לקוח *</label>
                <input
                  className="prop-input"
                  autoFocus
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  onKeyDown={e => e.key === 'Enter' && create()}
                />
              </div>
              <div className="prop-field">
                <label className="prop-label">שם פרויקט</label>
                <input
                  className="prop-input"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="בנייה קלה — משרד"
                />
              </div>

              <div className="prop-field">
                <label className="prop-label">תבנית (אופציונלי)</label>
                <div className="template-grid">
                  <button
                    className={`template-item ${selectedTemplate === null ? 'template-item--active' : ''}`}
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <div className="template-icon">⬜</div>
                    <div className="template-name">ריק</div>
                  </button>
                  {TEMPLATE_DEFS.map((t, i) => (
                    <button
                      key={i}
                      className={`template-item ${selectedTemplate === i ? 'template-item--active' : ''}`}
                      onClick={() => setSelectedTemplate(i)}
                    >
                      <div className="template-icon">🏗️</div>
                      <div className="template-name">{t.name}</div>
                      <div className="template-desc">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowNew(false)}>ביטול</button>
              <button className="btn-primary" onClick={create} disabled={!clientName.trim()}>
                צור פרויקט
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
