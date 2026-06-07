import type { Project } from './types';
import { DEFAULT_LAYER_VISIBILITY } from './types';

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export const TEMPLATE_DEFS: Array<{ name: string; description: string; project: Omit<Project, 'id' | 'clientName' | 'projectName' | 'date' | 'createdAt' | 'updatedAt'> }> = [
  {
    name: 'משרד קטן',
    description: 'מבנה משרדי בסיסי עם מטבחון ושירותים',
    project: {
      generalNotes: '',
      objects: [
        // Outer walls (600x400 rectangle)
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 50, x2: 650, y2: 50, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 650, y1: 50, x2: 650, y2: 450, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 650, y1: 450, x2: 50, y2: 450, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 450, x2: 50, y2: 50, thickness: 8, notes: '' },
        // Interior divider
        { id: makeId(), objectType: 'wall', layer: 'walls-interior', x1: 450, y1: 50, x2: 450, y2: 450, thickness: 5, notes: '' },
        // Rooms
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'אזור עבודה', roomType: 'office', points: [52, 52, 448, 52, 448, 448, 52, 448], notes: '' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'מטבחון / שירותים', roomType: 'kitchen', points: [452, 52, 648, 52, 648, 448, 452, 448], notes: '' },
        // Door
        { id: makeId(), objectType: 'opening', layer: 'openings', openingType: 'door', x: 250, y: 50, width: 90, rotation: 0, direction: 'left', notes: '' },
        // Symbols
        { id: makeId(), objectType: 'symbol', layer: 'electrical', symbolType: 'EL', x: 80, y: 100, heightFromFloor: 160, placement: 'wall', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'electrical', symbolType: 'S', x: 150, y: 200, heightFromFloor: 40, placement: 'wall', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'water', symbolType: 'W', x: 550, y: 300, heightFromFloor: 80, placement: 'wall', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'lighting', symbolType: 'L', x: 250, y: 250, placement: 'ceiling', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'lighting', symbolType: 'L', x: 550, y: 250, placement: 'ceiling', notes: '' },
      ],
      layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
      materialSpecs: [
        { id: makeId(), area: 'קירות פנימיים', component: 'קירות פנים', material: 'גבס לבן', notes: '' },
        { id: makeId(), area: 'קיר חיצוני', component: 'חיפוי חוץ', material: 'שליכט צבעוני', notes: '' },
      ],
      extras: [],
      backgroundOpacity: 0.4,
      scale: 100,
    },
  },
  {
    name: 'יחידת דיור',
    description: 'יחידה קטנה עם חדר שינה, מטבח ושירותים',
    project: {
      generalNotes: '',
      objects: [
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 50, x2: 750, y2: 50, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 750, y1: 50, x2: 750, y2: 550, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 750, y1: 550, x2: 50, y2: 550, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 550, x2: 50, y2: 50, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-interior', x1: 500, y1: 50, x2: 500, y2: 550, thickness: 5, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-interior', x1: 500, y1: 350, x2: 750, y2: 350, thickness: 5, notes: '' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'חדר שינה / מגורים', roomType: 'bedroom', points: [52, 52, 498, 52, 498, 548, 52, 548], notes: '' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'מטבח', roomType: 'kitchen', points: [502, 52, 748, 52, 748, 348, 502, 348], notes: '' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'שירותים', roomType: 'bathroom', points: [502, 352, 748, 352, 748, 548, 502, 548], notes: '' },
        { id: makeId(), objectType: 'opening', layer: 'openings', openingType: 'door', x: 300, y: 50, width: 90, rotation: 0, direction: 'left', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'lighting', symbolType: 'L', x: 280, y: 300, placement: 'ceiling', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'lighting', symbolType: 'L', x: 620, y: 200, placement: 'ceiling', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'water', symbolType: 'WC', x: 620, y: 450, placement: 'wall', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'water', symbolType: 'SH', x: 700, y: 450, placement: 'wall', notes: '' },
      ],
      layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
      materialSpecs: [
        { id: makeId(), area: 'שירותים', component: 'קירות פנים', material: 'גבס ירוק', notes: '' },
        { id: makeId(), area: 'פנים המבנה', component: 'קירות פנים', material: 'גבס לבן', notes: '' },
        { id: makeId(), area: 'קיר חיצוני', component: 'חיפוי חוץ', material: 'שליכט צבעוני', notes: '' },
      ],
      extras: [],
      backgroundOpacity: 0.4,
      scale: 100,
    },
  },
  {
    name: 'מבנה עם ממ"ד',
    description: 'מבנה בנייה קלה הכולל ממ"ד',
    project: {
      generalNotes: 'עובי קירות ממ"ד: 30 ס"מ לפחות. יש לאשר עם מהנדס.',
      objects: [
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 50, x2: 700, y2: 50, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 700, y1: 50, x2: 700, y2: 500, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 700, y1: 500, x2: 50, y2: 500, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 500, x2: 50, y2: 50, thickness: 8, notes: '' },
        // Mamad walls
        { id: makeId(), objectType: 'wall', layer: 'mamad', x1: 50, y1: 300, x2: 300, y2: 300, thickness: 14, notes: 'קיר ממ"ד 30 ס"מ' },
        { id: makeId(), objectType: 'wall', layer: 'mamad', x1: 300, y1: 300, x2: 300, y2: 500, thickness: 14, notes: 'קיר ממ"ד 30 ס"מ' },
        { id: makeId(), objectType: 'room', layer: 'mamad', name: 'ממ"ד', roomType: 'mamad', points: [52, 302, 298, 302, 298, 498, 52, 498], isMamad: true, mamadWallThickness: 30, notes: 'ממ"ד — עובי קיר 30 ס"מ' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'מרחב עיקרי', roomType: 'office', points: [52, 52, 698, 52, 698, 298, 52, 298], notes: '' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'אזור נוסף', roomType: 'office', points: [302, 302, 698, 302, 698, 498, 302, 498], notes: '' },
        { id: makeId(), objectType: 'opening', layer: 'openings', openingType: 'mamad-door', x: 150, y: 300, width: 90, rotation: 0, direction: 'left', notes: 'דלת ממ"ד' },
        { id: makeId(), objectType: 'opening', layer: 'openings', openingType: 'door', x: 375, y: 50, width: 90, rotation: 0, direction: 'left', notes: '' },
      ],
      layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
      materialSpecs: [
        { id: makeId(), area: 'ממ"ד', component: 'קירות', material: 'בטון מזוין', thickness: '30 ס"מ', notes: 'לפי תקן' },
        { id: makeId(), area: 'פנים המבנה', component: 'קירות פנים', material: 'גבס לבן', notes: '' },
        { id: makeId(), area: 'קיר חיצוני', component: 'חיפוי חוץ', material: 'שליכט צבעוני', notes: '' },
      ],
      extras: [],
      backgroundOpacity: 0.4,
      scale: 100,
    },
  },
  {
    name: 'מחסן',
    description: 'מחסן פשוט ללא חלוקה פנימית',
    project: {
      generalNotes: '',
      objects: [
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 50, x2: 500, y2: 50, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 500, y1: 50, x2: 500, y2: 400, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 500, y1: 400, x2: 50, y2: 400, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'wall', layer: 'walls-exterior', x1: 50, y1: 400, x2: 50, y2: 50, thickness: 8, notes: '' },
        { id: makeId(), objectType: 'room', layer: 'rooms', name: 'מחסן', roomType: 'storage', points: [52, 52, 498, 52, 498, 398, 52, 398], notes: '' },
        { id: makeId(), objectType: 'opening', layer: 'openings', openingType: 'door', x: 200, y: 400, width: 100, rotation: 0, direction: 'left', notes: 'דלת כניסה' },
        { id: makeId(), objectType: 'symbol', layer: 'electrical', symbolType: 'EL', x: 80, y: 80, heightFromFloor: 160, placement: 'wall', notes: '' },
        { id: makeId(), objectType: 'symbol', layer: 'lighting', symbolType: 'L', x: 275, y: 225, placement: 'ceiling', notes: '' },
      ],
      layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
      materialSpecs: [
        { id: makeId(), area: 'קיר חיצוני', component: 'חיפוי חוץ', material: 'פנל מבודד 7 ס"מ', notes: '' },
      ],
      extras: [],
      backgroundOpacity: 0.4,
      scale: 100,
    },
  },
];
