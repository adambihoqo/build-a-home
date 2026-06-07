import { Group, Line, Rect, Text, Circle, Arc, Arrow } from 'react-konva';
import type Konva from 'konva';
import type { DrawingObject, LayerType, ToolType, Wall, Room, Opening, SymbolObject, Dimension, TextNote } from '../types';
import { getSymbolDef } from '../symbolDefs';
import { pxToLabel, wallLength, wallAngle } from '../utils';

interface Props {
  objects: DrawingObject[];
  layerVisibility: Record<LayerType, boolean>;
  selectedObjectId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, data: Partial<DrawingObject>) => void;
  activeTool: ToolType;
  scale?: number;
}

const SEL_COLOR = '#6366f1';
const SEL_WIDTH = 2;

const HANDLE_R = 7;

function WallShape({ wall, selected, onSelect, onUpdate, scale }: {
  wall: Wall; selected: boolean; scale: number;
  onSelect: () => void; onUpdate: (d: Partial<Wall>) => void;
}) {
  const color = wall.layer === 'mamad' ? '#1e40af' : wall.layer === 'walls-exterior' ? '#1f2937' : '#4b5563';
  const lenPx = wallLength(wall.x1, wall.y1, wall.x2, wall.y2);
  const angle = wallAngle(wall.x1, wall.y1, wall.x2, wall.y2);
  const mx = (wall.x1 + wall.x2) / 2;
  const my = (wall.y1 + wall.y2) / 2;
  const thicknessCm = Math.round((wall.thickness / scale) * 100);

  // Offset the label perpendicular to the wall
  const perpX = -Math.sin(angle * Math.PI / 180) * (wall.thickness / 2 + 16);
  const perpY = Math.cos(angle * Math.PI / 180) * (wall.thickness / 2 + 16);

  return (
    <Group>
      {/* Wall body — draggable to move entire wall */}
      <Line
        points={[wall.x1, wall.y1, wall.x2, wall.y2]}
        stroke={selected ? SEL_COLOR : color}
        strokeWidth={wall.thickness}
        lineCap="square"
        lineJoin="miter"
        onClick={() => onSelect()}
        onTap={() => onSelect()}
        draggable
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          const dx = e.target.x(); const dy = e.target.y();
          e.target.x(0); e.target.y(0);
          onUpdate({ x1: wall.x1 + dx, y1: wall.y1 + dy, x2: wall.x2 + dx, y2: wall.y2 + dy });
        }}
      />

      {/* Endpoint handles — drag to move just that endpoint */}
      {selected && (
        <>
          {/* Start handle */}
          <Circle
            x={wall.x1} y={wall.y1}
            radius={HANDLE_R}
            fill="white" stroke={SEL_COLOR} strokeWidth={2}
            draggable
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'crosshair'; }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default'; }}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              onUpdate({ x1: e.target.x(), y1: e.target.y() });
            }}
          />
          {/* End handle */}
          <Circle
            x={wall.x2} y={wall.y2}
            radius={HANDLE_R}
            fill="white" stroke="#f59e0b" strokeWidth={2}
            draggable
            onMouseEnter={e => { e.target.getStage()!.container().style.cursor = 'crosshair'; }}
            onMouseLeave={e => { e.target.getStage()!.container().style.cursor = 'default'; }}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              onUpdate({ x2: e.target.x(), y2: e.target.y() });
            }}
          />
        </>
      )}

      {/* Length + thickness label when selected */}
      {selected && lenPx > 20 && (
        <Group x={mx + perpX} y={my + perpY} listening={false}>
          <Rect
            x={-50} y={-12}
            width={100} height={24}
            fill="white" stroke={SEL_COLOR} strokeWidth={1}
            cornerRadius={4} opacity={0.95}
          />
          <Text
            x={-48} y={-9}
            width={96} align="center"
            text={wall.labelLength
              ? `${wall.labelLength}${wall.labelThickness ? `  |  ${wall.labelThickness}` : ''}`
              : `${pxToLabel(lenPx, scale)}  |  ${thicknessCm} ס"מ`}
            fontSize={10} fontStyle="bold" fill={SEL_COLOR}
          />
        </Group>
      )}
    </Group>
  );
}

function RoomShape({ room, selected, onSelect, onUpdate }: {
  room: Room; selected: boolean;
  onSelect: () => void; onUpdate: (d: Partial<Room>) => void;
}) {
  const isMamad = room.isMamad;
  const fill = isMamad ? 'rgba(30,64,175,0.12)' : 'rgba(59,130,246,0.06)';
  const stroke = selected ? SEL_COLOR : isMamad ? '#1e40af' : '#6b7280';
  const cx = room.points.reduce((s, v, i) => i % 2 === 0 ? s + v : s, 0) / (room.points.length / 2);
  const cy = room.points.reduce((s, v, i) => i % 2 !== 0 ? s + v : s, 0) / (room.points.length / 2);
  return (
    <Group>
      <Line
        points={room.points}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? SEL_WIDTH : 1}
        dash={isMamad ? undefined : [6, 4]}
        onClick={() => onSelect()}
        onTap={() => onSelect()}
        draggable
        onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
          const dx = e.target.x(); const dy = e.target.y();
          e.target.x(0); e.target.y(0);
          onUpdate({ points: room.points.map((v, i) => i % 2 === 0 ? v + dx : v + dy) });
        }}
      />
      <Text
        x={cx - 60} y={cy - 10}
        width={120} align="center"
        text={room.name + (isMamad ? '\nממ"ד' : '')}
        fontSize={isMamad ? 14 : 13}
        fontStyle={isMamad ? 'bold' : 'normal'}
        fill={isMamad ? '#1e40af' : '#374151'}
        listening={false}
      />
    </Group>
  );
}

function OpeningShape({ opening, selected, onSelect, onUpdate }: {
  opening: Opening; selected: boolean;
  onSelect: () => void; onUpdate: (d: Partial<Opening>) => void;
}) {
  const isDoor = opening.openingType === 'door' || opening.openingType === 'mamad-door';
  const color = selected ? SEL_COLOR : opening.openingType.includes('mamad') ? '#1e40af' : '#b45309';
  return (
    <Group
      x={opening.x} y={opening.y}
      rotation={opening.rotation}
      draggable
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        onUpdate({ x: e.target.x(), y: e.target.y() });
      }}
    >
      {isDoor ? (
        <>
          {/* Door frame */}
          <Line points={[0, 0, opening.width, 0]} stroke={color} strokeWidth={selected ? 3 : 2} />
          {/* Door arc */}
          <Arc
            x={opening.direction === 'left' ? 0 : opening.width}
            y={0}
            innerRadius={0}
            outerRadius={opening.width}
            angle={90}
            rotation={opening.direction === 'left' ? 0 : 90}
            stroke={color}
            strokeWidth={1}
            fill="rgba(180,87,9,0.07)"
          />
          {/* Label */}
          <Text x={opening.width / 2 - 10} y={4} text={opening.openingType.includes('mamad') ? 'ד-מ"מ' : 'דלת'} fontSize={9} fill={color} />
        </>
      ) : (
        <>
          {/* Window frame */}
          {(() => {
            const h = opening.height ?? 30;
            return (
              <>
                <Line points={[0, 0, opening.width, 0]} stroke={color} strokeWidth={selected ? 3 : 2} />
                <Line points={[0, -h, opening.width, -h]} stroke={color} strokeWidth={selected ? 3 : 2} />
                <Line points={[0, -h, 0, 0]} stroke={color} strokeWidth={selected ? 3 : 2} />
                <Line points={[opening.width, -h, opening.width, 0]} stroke={color} strokeWidth={selected ? 3 : 2} />
                {/* Glass pane line at center */}
                <Line points={[0, -h / 2, opening.width, -h / 2]} stroke={color} strokeWidth={1} dash={[4, 3]} />
                <Text x={opening.width / 2 - 20} y={-h / 2 - 8} width={40} align="center"
                  text={opening.isElectricShutter ? 'ח׳+תריס' : 'חלון'} fontSize={9} fill={color} />
              </>
            );
          })()}
        </>
      )}
    </Group>
  );
}

function SymbolShape({ sym, selected, onSelect, onUpdate }: {
  sym: SymbolObject; selected: boolean;
  onSelect: () => void; onUpdate: (d: Partial<SymbolObject>) => void;
}) {
  const def = getSymbolDef(sym.symbolType);
  const color = selected ? SEL_COLOR : (def?.color ?? '#374151');
  const r = 16;

  return (
    <Group
      x={sym.x} y={sym.y}
      draggable
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        onUpdate({ x: e.target.x(), y: e.target.y() });
      }}
    >
      <Circle radius={r} fill="white" stroke={color} strokeWidth={selected ? 2.5 : 1.5} />
      <Text
        x={-r} y={-8}
        width={r * 2} align="center"
        text={sym.symbolType}
        fontSize={sym.symbolType.length > 3 ? 7 : 10}
        fontStyle="bold"
        fill={color}
        listening={false}
      />
      {sym.heightFromFloor && (
        <Text
          x={-r} y={r + 2}
          width={r * 2} align="center"
          text={`${sym.heightFromFloor}ס"`}
          fontSize={7}
          fill="#6b7280"
          listening={false}
        />
      )}
    </Group>
  );
}

function DimensionShape({ dim, selected, onSelect, onUpdate }: {
  dim: Dimension; selected: boolean;
  onSelect: () => void; onUpdate: (d: Partial<Dimension>) => void;
}) {
  const dx = dim.x2 - dim.x1;
  const dy = dim.y2 - dim.y1;
  const mx = (dim.x1 + dim.x2) / 2;
  const my = (dim.y1 + dim.y2) / 2;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = len > 0 ? Math.atan2(dy, dx) * 180 / Math.PI : 0;
  const color = selected ? SEL_COLOR : '#6366f1';

  return (
    <Group
      draggable
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        const ddx = e.target.x(); const ddy = e.target.y();
        e.target.x(0); e.target.y(0);
        onUpdate({ x1: dim.x1 + ddx, y1: dim.y1 + ddy, x2: dim.x2 + ddx, y2: dim.y2 + ddy });
      }}
    >
      <Arrow
        points={[dim.x1, dim.y1, dim.x2, dim.y2]}
        stroke={color}
        strokeWidth={1.5}
        fill={color}
        pointerLength={8}
        pointerWidth={6}
        pointerAtBeginning
      />
      {/* Tick marks */}
      <Line points={[dim.x1 - 6 * Math.sin(angle * Math.PI / 180), dim.y1 + 6 * Math.cos(angle * Math.PI / 180),
        dim.x1 + 6 * Math.sin(angle * Math.PI / 180), dim.y1 - 6 * Math.cos(angle * Math.PI / 180)]}
        stroke={color} strokeWidth={1.5} listening={false} />
      <Line points={[dim.x2 - 6 * Math.sin(angle * Math.PI / 180), dim.y2 + 6 * Math.cos(angle * Math.PI / 180),
        dim.x2 + 6 * Math.sin(angle * Math.PI / 180), dim.y2 - 6 * Math.cos(angle * Math.PI / 180)]}
        stroke={color} strokeWidth={1.5} listening={false} />
      <Text
        x={mx - 60} y={my - 18}
        width={120} align="center"
        text={dim.label}
        fontSize={12}
        fill={color}
        listening={false}
      />
    </Group>
  );
}

function TextNoteShape({ note, selected, onSelect, onUpdate }: {
  note: TextNote; selected: boolean;
  onSelect: () => void; onUpdate: (d: Partial<TextNote>) => void;
}) {
  return (
    <Group
      x={note.x} y={note.y}
      draggable
      onClick={() => onSelect()}
      onTap={() => onSelect()}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        onUpdate({ x: e.target.x(), y: e.target.y() });
      }}
    >
      {selected && <Rect x={-4} y={-4} width={200} height={note.fontSize + 8} fill="#eff6ff" stroke={SEL_COLOR} strokeWidth={1} cornerRadius={3} />}
      <Text
        text={note.text}
        fontSize={note.fontSize}
        fill={note.color ?? '#1f2937'}
        width={220}
      />
    </Group>
  );
}

export function ShapeRenderer({ objects, layerVisibility, selectedObjectId, onSelect, onUpdate, activeTool, scale = 100 }: Props) {
  const canSelect = activeTool === 'select';

  const isVisible = (layer: string) => layerVisibility[layer as LayerType] !== false;

  return (
    <>
      {objects.map(obj => {
        if (!isVisible(obj.layer)) return null;
        const sel = obj.id === selectedObjectId;
        const noSel = () => {};

        if (obj.objectType === 'wall') {
          return (
            <WallShape key={obj.id} wall={obj as Wall} selected={sel} scale={scale}
              onSelect={canSelect ? () => onSelect(obj.id) : noSel}
              onUpdate={d => onUpdate(obj.id, d)} />
          );
        }
        if (obj.objectType === 'room') {
          return (
            <RoomShape key={obj.id} room={obj as Room} selected={sel}
              onSelect={canSelect ? () => onSelect(obj.id) : noSel}
              onUpdate={d => onUpdate(obj.id, d)} />
          );
        }
        if (obj.objectType === 'opening') {
          return (
            <OpeningShape key={obj.id} opening={obj as Opening} selected={sel}
              onSelect={canSelect ? () => onSelect(obj.id) : noSel}
              onUpdate={d => onUpdate(obj.id, d)} />
          );
        }
        if (obj.objectType === 'symbol') {
          return (
            <SymbolShape key={obj.id} sym={obj as SymbolObject} selected={sel}
              onSelect={canSelect ? () => onSelect(obj.id) : noSel}
              onUpdate={d => onUpdate(obj.id, d)} />
          );
        }
        if (obj.objectType === 'dimension') {
          return (
            <DimensionShape key={obj.id} dim={obj as Dimension} selected={sel}
              onSelect={canSelect ? () => onSelect(obj.id) : noSel}
              onUpdate={d => onUpdate(obj.id, d)} />
          );
        }
        if (obj.objectType === 'text') {
          return (
            <TextNoteShape key={obj.id} note={obj as TextNote} selected={sel}
              onSelect={canSelect ? () => onSelect(obj.id) : noSel}
              onUpdate={d => onUpdate(obj.id, d)} />
          );
        }
        return null;
      })}
    </>
  );
}
