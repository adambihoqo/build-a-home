export interface SymbolDef {
  code: string;
  name: string;
  category: 'electrical' | 'water' | 'lighting' | 'shutters' | 'furniture';
  color: string;
  description?: string;
}

export const SYMBOL_DEFS: SymbolDef[] = [
  // Electrical
  { code: 'S',     name: 'שקע רגיל',         category: 'electrical', color: '#dc2626' },
  { code: 'S2',    name: 'שקע כפול',          category: 'electrical', color: '#dc2626' },
  { code: 'S3P',   name: 'שקע תלת-פאזי',      category: 'electrical', color: '#7c3aed' },
  { code: 'TV',    name: 'שקע טלוויזיה',       category: 'electrical', color: '#dc2626' },
  { code: 'NET',   name: 'נקודת תקשורת',       category: 'electrical', color: '#dc2626' },
  { code: 'EL',    name: 'לוח חשמל',           category: 'electrical', color: '#1d4ed8' },
  { code: 'SW',    name: 'מפסק',               category: 'electrical', color: '#dc2626' },
  { code: 'AC',    name: 'שקע מזגן',           category: 'electrical', color: '#0891b2' },
  // Water
  { code: 'W',     name: 'נקודת מים',          category: 'water',      color: '#2563eb' },
  { code: 'WC',    name: 'אסלה',               category: 'water',      color: '#2563eb' },
  { code: 'SH',    name: 'מקלחון',             category: 'water',      color: '#2563eb' },
  { code: 'SK',    name: 'כיור',               category: 'water',      color: '#2563eb' },
  { code: 'KS',    name: 'כיור מטבח',          category: 'water',      color: '#2563eb' },
  // Lighting
  { code: 'L',     name: 'גוף תאורה בתקרה',    category: 'lighting',   color: '#d97706' },
  { code: 'LW',    name: 'גוף תאורה בקיר',     category: 'lighting',   color: '#d97706' },
  { code: 'LE',    name: 'תאורה חיצונית',       category: 'lighting',   color: '#d97706' },
  { code: 'LSW',   name: 'מפסק תאורה',          category: 'lighting',   color: '#d97706' },
  // Shutters
  { code: 'SHT',      name: 'תריס חשמלי',        category: 'shutters',   color: '#64748b' },
  { code: 'SHTSW',    name: 'מתג תריס',           category: 'shutters',   color: '#64748b' },
  { code: 'SHTB-IN',  name: 'ארגז תריס פנימי',    category: 'shutters',   color: '#64748b' },
  { code: 'SHTB-OUT', name: 'ארגז תריס חיצוני',   category: 'shutters',   color: '#64748b' },
  // Furniture & appliances
  { code: 'FRG',   name: 'מקרר',          category: 'furniture',  color: '#0369a1' },
  { code: 'OVEN',  name: 'תנור',          category: 'furniture',  color: '#0369a1' },
  { code: 'WM',    name: 'מכונת כביסה',   category: 'furniture',  color: '#0369a1' },
  { code: 'DW',    name: 'מדיח כלים',     category: 'furniture',  color: '#0369a1' },
  { code: 'KIT',   name: 'מטבח (שיש)',    category: 'furniture',  color: '#0369a1' },
  { code: 'TVSET', name: 'טלוויזיה',      category: 'furniture',  color: '#7c3aed' },
  { code: 'BED',   name: 'מיטה',          category: 'furniture',  color: '#7c3aed' },
  { code: 'SOFA',  name: 'ספה',           category: 'furniture',  color: '#7c3aed' },
  { code: 'TBL',   name: 'שולחן',         category: 'furniture',  color: '#7c3aed' },
];

export const SYMBOL_CATEGORY_LABELS: Record<string, string> = {
  electrical: 'חשמל',
  water: 'מים',
  lighting: 'תאורה',
  shutters: 'תריסים חשמליים',
  furniture: 'ריהוט ומכשירים',
};

export const LAYER_FOR_SYMBOL: Record<string, 'electrical' | 'water' | 'lighting' | 'furniture'> = {
  electrical: 'electrical',
  water: 'water',
  lighting: 'lighting',
  shutters: 'electrical',
  furniture: 'furniture',
};

export function getSymbolDef(code: string): SymbolDef | undefined {
  return SYMBOL_DEFS.find(s => s.code === code);
}

export const PLACEMENT_LABELS: Record<string, string> = {
  wall: 'קיר',
  ceiling: 'תקרה',
  exterior: 'חוץ',
  other: 'אחר',
};
