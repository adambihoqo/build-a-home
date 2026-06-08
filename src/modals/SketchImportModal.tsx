import { useState, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { Wall, Room, Dimension } from '../types';

const API_KEY_STORAGE = 'anthropic-api-key';

const PARSE_PROMPT = `You are an expert architectural sketch analyzer. Analyze this hand-drawn floor plan sketch and extract all structural elements.

Identify:
1. Walls — straight lines forming the structure. "exterior" = outer building boundary, "interior" = internal partitions/dividers
2. Rooms — enclosed labeled spaces. Use the Hebrew name written in the sketch if visible. Otherwise guess from size/shape: large open space = סלון, medium = חדר שינה, small with plumbing = שירותים or מטבח, entrance = כניסה/מסדרון
3. Dimensions — any measurements written on the sketch (numbers with units like מ/מ'/ס"מ/m/cm)

Return ONLY a valid JSON object — no markdown, no explanations, just the JSON:
{
  "walls": [
    { "type": "exterior", "x1": 10, "y1": 10, "x2": 90, "y2": 10, "labelLength": "8.5מ'" }
  ],
  "rooms": [
    { "name": "סלון", "type": "custom", "points": [10,10,50,10,50,60,10,60] }
  ],
  "dimensions": [
    { "x1": 10, "y1": 5, "x2": 90, "y2": 5, "label": "8.5מ'" }
  ]
}

Rules:
- All coordinates are 0-100 percentages of the image (0,0 = top-left corner)
- Wall "type": "exterior" or "interior" only
- Room "type": one of "bedroom", "bathroom", "kitchen", "office", "storage", "mamad", "custom"
- Room "points": polygon vertices [x1,y1, x2,y2, x3,y3, ...] in clockwise order
- Only add "labelLength" to a wall if a measurement text is physically written near that wall
- If no measurements are visible, return "dimensions": []
- If rooms are not clearly delineated, return "rooms": []
- Return valid JSON only — nothing else`;

function makeId() { return Math.random().toString(36).slice(2, 11); }

interface ParsedWall {
  type: 'exterior' | 'interior';
  x1: number; y1: number; x2: number; y2: number;
  labelLength?: string;
}
interface ParsedRoom {
  name: string;
  type: string;
  points: number[];
}
interface ParsedDim {
  x1: number; y1: number; x2: number; y2: number;
  label: string;
}
interface ParsedSketch {
  walls: ParsedWall[];
  rooms: ParsedRoom[];
  dimensions: ParsedDim[];
}

interface Props {
  canvasW: number;
  canvasH: number;
  onClose: () => void;
}

// Scale percentage (0-100) to canvas pixels with a 10% margin on each side
function pct(v: number, total: number): number {
  return 0.1 * total + (v / 100) * 0.8 * total;
}

export function SketchImportModal({ canvasW, canvasH, onClose }: Props) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [parsed, setParsed] = useState<ParsedSketch | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mime = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as string[]).includes(file.type)
      ? file.type : 'image/jpeg';
    setImageMime(mime);
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setImageUrl(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      setParsed(null);
      setStatus('idle');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || !apiKey.trim()) return;
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    setStatus('analyzing');
    setErrorMsg('');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-8',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: imageMime, data: imageBase64 },
              },
              { type: 'text', text: PARSE_PROMPT },
            ],
          }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `שגיאת שרת ${res.status}`);
      }

      const data = await res.json() as { content?: Array<{ text?: string }> };
      const text = data.content?.[0]?.text ?? '';

      // Extract JSON block from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('התשובה לא הכילה JSON תקין. נסה שוב.');

      const result = JSON.parse(jsonMatch[0]) as ParsedSketch;
      if (!Array.isArray(result.walls) || !Array.isArray(result.rooms) || !Array.isArray(result.dimensions)) {
        throw new Error('פורמט ה-JSON לא תקין. נסה שוב.');
      }

      setParsed(result);
      setStatus('done');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  const handleAddToCanvas = () => {
    if (!parsed) return;
    const { addObject } = useEditorStore.getState();

    for (const w of parsed.walls) {
      const wall: Wall = {
        id: makeId(),
        objectType: 'wall',
        layer: w.type === 'exterior' ? 'walls-exterior' : 'walls-interior',
        x1: pct(w.x1, canvasW), y1: pct(w.y1, canvasH),
        x2: pct(w.x2, canvasW), y2: pct(w.y2, canvasH),
        thickness: w.type === 'exterior' ? 8 : 5,
        labelLength: w.labelLength,
      };
      addObject(wall);
    }

    for (const r of parsed.rooms) {
      const scaledPoints = r.points.map((v, i) =>
        i % 2 === 0 ? pct(v, canvasW) : pct(v, canvasH)
      );
      const room: Room = {
        id: makeId(),
        objectType: 'room',
        layer: 'rooms',
        name: r.name,
        roomType: ['bedroom','bathroom','kitchen','office','storage','mamad','custom'].includes(r.type) ? r.type : 'custom',
        points: scaledPoints,
      };
      addObject(room);
    }

    for (const d of parsed.dimensions) {
      const dim: Dimension = {
        id: makeId(),
        objectType: 'dimension',
        layer: 'dimensions',
        x1: pct(d.x1, canvasW), y1: pct(d.y1, canvasH),
        x2: pct(d.x2, canvasW), y2: pct(d.y2, canvasH),
        label: d.label,
      };
      addObject(dim);
    }

    onClose();
  };

  const totalObjects = parsed ? parsed.walls.length + parsed.rooms.length + parsed.dimensions.length : 0;
  const canAnalyze = !!imageBase64 && !!apiKey.trim() && status !== 'analyzing';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">ייבוא סקיצה ידנית עם AI</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1: API Key */}
          <div>
            <div className="panel-section-title" style={{ marginBottom: 8 }}>שלב 1 — מפתח Anthropic API</div>
            <input
              type="password"
              className="prop-input"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ marginBottom: 4 }}
            />
            <p className="wall-meas-hint">
              המפתח נשמר בדפדפן שלך בלבד (localStorage) ולא עובר לשרת.
              לקבלת מפתח: console.anthropic.com
            </p>
          </div>

          {/* Step 2: Image upload */}
          <div>
            <div className="panel-section-title" style={{ marginBottom: 8 }}>שלב 2 — צלם/ייבא תמונת סקיצה</div>
            <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
              📷 בחר תמונה...
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <p className="wall-meas-hint" style={{ marginTop: 4 }}>
              תומך ב-JPG, PNG, WebP — סריקת דף, צילום מצלמה, או כל תמונה של סקיצה
            </p>
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={imageUrl}
                alt="תצוגת סקיצה"
                style={{
                  maxWidth: '100%', maxHeight: 260,
                  border: '2px solid #e5e7eb', borderRadius: 8,
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* Step 3: Analyze */}
          {imageBase64 && (
            <div>
              <div className="panel-section-title" style={{ marginBottom: 8 }}>שלב 3 — נתח עם AI</div>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {status === 'analyzing' ? '⏳ מנתח סקיצה... (10-20 שניות)' : '🔍 נתח סקיצה'}
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 6, padding: '10px 14px', color: '#dc2626', fontSize: 13
            }}>
              שגיאה: {errorMsg}
            </div>
          )}

          {/* Results */}
          {status === 'done' && parsed && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 8, padding: '14px 16px'
            }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: '#166534', fontSize: 14 }}>
                ✅ הניתוח הושלם בהצלחה
              </div>
              <ul style={{ fontSize: 13, lineHeight: 2.0, margin: 0, padding: 0, listStyle: 'none' }}>
                <li>
                  🧱 <strong>קירות:</strong> {parsed.walls.length}
                  {parsed.walls.length > 0 && (
                    <span style={{ color: '#4b5563' }}>
                      {' '}({parsed.walls.filter(w => w.type === 'exterior').length} חיצוניים,{' '}
                      {parsed.walls.filter(w => w.type === 'interior').length} פנימיים)
                    </span>
                  )}
                </li>
                <li>
                  🏠 <strong>חדרים:</strong> {parsed.rooms.length}
                  {parsed.rooms.length > 0 && (
                    <span style={{ color: '#4b5563' }}> — {parsed.rooms.map(r => r.name).join(', ')}</span>
                  )}
                </li>
                <li>
                  📐 <strong>מידות:</strong> {parsed.dimensions.length}
                  {parsed.dimensions.length > 0 && (
                    <span style={{ color: '#4b5563' }}> — {parsed.dimensions.map(d => d.label).join(', ')}</span>
                  )}
                </li>
              </ul>
              <p style={{ fontSize: 11, color: '#15803d', marginTop: 8, marginBottom: 0 }}>
                לאחר הוספה לחץ על כל אובייקט (קיר/חדר/מידה) לעריכה, שינוי מידות וגרירה
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>ביטול</button>
          {status === 'done' && parsed && (
            <button className="btn-primary" onClick={handleAddToCanvas}>
              ✅ הוסף לשרטוט ({totalObjects} אובייקטים)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
