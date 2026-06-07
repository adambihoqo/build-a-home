export type LayerType =
  | 'walls-exterior'
  | 'walls-interior'
  | 'mamad'
  | 'rooms'
  | 'openings'
  | 'electrical'
  | 'water'
  | 'lighting'
  | 'furniture'
  | 'roof'
  | 'dimensions'
  | 'notes';

export type ToolType =
  | 'select'
  | 'wall-exterior'
  | 'wall-interior'
  | 'wall-mamad'
  | 'room'
  | 'door'
  | 'window'
  | 'symbol'
  | 'dimension'
  | 'text';

export interface Wall {
  id: string;
  objectType: 'wall';
  layer: 'walls-exterior' | 'walls-interior' | 'mamad';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  labelLength?: string; // user-typed real-world length, e.g. "8 מ'" or "350 ס\"מ"
  labelThickness?: string; // user-typed real-world thickness, e.g. "12 ס\"מ"
  material?: string;
  notes?: string;
}

export interface Room {
  id: string;
  objectType: 'room';
  layer: 'rooms' | 'mamad';
  name: string;
  roomType: string;
  points: number[];
  isMamad?: boolean;
  mamadWallThickness?: number;
  notes?: string;
}

export interface Opening {
  id: string;
  objectType: 'opening';
  layer: 'openings';
  openingType: 'door' | 'window' | 'mamad-door' | 'mamad-window' | 'special';
  x: number;
  y: number;
  width: number;
  height?: number; // visual height of window symbol in px
  rotation: number;
  direction: 'left' | 'right';
  isElectricShutter?: boolean;
  shutterBoxType?: 'internal' | 'external';
  notes?: string;
}

export interface SymbolObject {
  id: string;
  objectType: 'symbol';
  layer: 'electrical' | 'water' | 'lighting' | 'furniture';
  symbolType: string;
  x: number;
  y: number;
  heightFromFloor?: number;
  placement: 'wall' | 'ceiling' | 'exterior' | 'other';
  notes?: string;
}

export interface Dimension {
  id: string;
  objectType: 'dimension';
  layer: 'dimensions';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  notes?: string;
}

export interface TextNote {
  id: string;
  objectType: 'text';
  layer: 'notes';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface RoofAnnotation {
  id: string;
  objectType: 'roof';
  layer: 'roof';
  x: number;
  y: number;
  slopeDirection: string;
  overhang: number;
  notes?: string;
}

export type DrawingObject = Wall | Room | Opening | SymbolObject | Dimension | TextNote | RoofAnnotation;

export interface MaterialSpec {
  id: string;
  area: string;
  component: string;
  material: string;
  thickness?: string;
  density?: string;
  extraLayer?: string;
  notes?: string;
}

export interface Extra {
  id: string;
  description: string;
  notes?: string;
}

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  date: string;
  generalNotes: string;
  objects: DrawingObject[];
  layerVisibility: Record<LayerType, boolean>;
  materialSpecs: MaterialSpec[];
  extras: Extra[];
  backgroundImage?: string;
  backgroundOpacity: number;
  scale: number; // px per meter, default 100 (1px = 1cm)
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_LAYER_VISIBILITY: Record<LayerType, boolean> = {
  'walls-exterior': true,
  'walls-interior': true,
  'mamad': true,
  'rooms': true,
  'openings': true,
  'electrical': true,
  'water': true,
  'lighting': true,
  'furniture': true,
  'roof': true,
  'dimensions': true,
  'notes': true,
};

export const LAYER_LABELS: Record<LayerType, string> = {
  'walls-exterior': 'קירות חיצוניים',
  'walls-interior': 'קירות פנימיים',
  'mamad': 'ממ"ד',
  'rooms': 'חדרים / אזורים',
  'openings': 'פתחים (דלתות/חלונות)',
  'electrical': 'חשמל',
  'water': 'מים',
  'lighting': 'תאורה',
  'furniture': 'ריהוט ומכשירים',
  'roof': 'גג',
  'dimensions': 'מידות',
  'notes': 'הערות',
};
