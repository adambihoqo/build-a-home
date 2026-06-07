import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, DrawingObject, MaterialSpec, Extra } from '../types';
import { DEFAULT_LAYER_VISIBILITY } from '../types';

function makeId() {
  return Math.random().toString(36).slice(2, 11);
}

function nowISO() {
  return new Date().toISOString();
}

function todayStr() {
  return new Date().toLocaleDateString('he-IL');
}

interface ProjectStore {
  projects: Project[];
  createProject: (clientName: string, projectName: string) => string;
  createFromTemplate: (clientName: string, projectName: string, template: Omit<Project, 'id' | 'clientName' | 'projectName' | 'date' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string, newName?: string) => string;
  getProject: (id: string) => Project | undefined;
  saveObjects: (id: string, objects: DrawingObject[]) => void;
  saveMaterialSpecs: (id: string, specs: MaterialSpec[]) => void;
  saveExtras: (id: string, extras: Extra[]) => void;
  saveBackground: (id: string, image: string | undefined, opacity: number) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      createProject: (clientName, projectName) => {
        const id = makeId();
        const project: Project = {
          id,
          clientName,
          projectName,
          date: todayStr(),
          generalNotes: '',
          objects: [],
          layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
          materialSpecs: [],
          extras: [],
          backgroundOpacity: 0.4,
          scale: 100,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set(s => ({ projects: [project, ...s.projects] }));
        return id;
      },

      createFromTemplate: (clientName, projectName, template) => {
        const id = makeId();
        const project: Project = {
          ...template,
          id,
          clientName,
          projectName,
          date: todayStr(),
          createdAt: nowISO(),
          updatedAt: nowISO(),
          objects: template.objects.map(o => ({ ...o, id: makeId() })),
          materialSpecs: template.materialSpecs.map(m => ({ ...m, id: makeId() })),
          extras: template.extras.map(e => ({ ...e, id: makeId() })),
        };
        set(s => ({ projects: [project, ...s.projects] }));
        return id;
      },

      updateProject: (id, data) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id === id ? { ...p, ...data, updatedAt: nowISO() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set(s => ({ projects: s.projects.filter(p => p.id !== id) }));
      },

      duplicateProject: (id, newName) => {
        const orig = get().projects.find(p => p.id === id);
        if (!orig) return '';
        const newId = makeId();
        const copy: Project = {
          ...orig,
          id: newId,
          projectName: newName ?? orig.projectName + ' (עותק)',
          createdAt: nowISO(),
          updatedAt: nowISO(),
          objects: orig.objects.map(o => ({ ...o, id: makeId() })),
          materialSpecs: orig.materialSpecs.map(m => ({ ...m, id: makeId() })),
          extras: orig.extras.map(e => ({ ...e, id: makeId() })),
        };
        set(s => ({ projects: [copy, ...s.projects] }));
        return newId;
      },

      getProject: (id) => get().projects.find(p => p.id === id),

      saveObjects: (id, objects) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id === id ? { ...p, objects, updatedAt: nowISO() } : p
          ),
        }));
      },

      saveMaterialSpecs: (id, specs) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id === id ? { ...p, materialSpecs: specs, updatedAt: nowISO() } : p
          ),
        }));
      },

      saveExtras: (id, extras) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id === id ? { ...p, extras, updatedAt: nowISO() } : p
          ),
        }));
      },

      saveBackground: (id, image, opacity) => {
        set(s => ({
          projects: s.projects.map(p =>
            p.id === id ? { ...p, backgroundImage: image, backgroundOpacity: opacity, updatedAt: nowISO() } : p
          ),
        }));
      },
    }),
    { name: 'buildsketch-v1' }
  )
);
