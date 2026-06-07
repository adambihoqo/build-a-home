import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '../store/editorStore';
import { useProjectStore } from '../store/projectStore';
import { ShapeRenderer } from './ShapeRenderer';
import type { Wall, Room, Opening, SymbolObject } from '../types';
import { LAYER_FOR_SYMBOL, SYMBOL_DEFS } from '../symbolDefs';
import useImage from './useImage';

function makeId() { return Math.random().toString(36).slice(2, 11); }

function snapToGrid(v: number, grid: number) {
  return Math.round(v / grid) * grid;
}

interface Props {
  width: number;
  height: number;
}

export function CanvasStage({ width, height }: Props) {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    activeTool, drawingPhase, setDrawingPhase,
    objects, addObject, updateObject, deleteObject,
    selectedObjectId, setSelectedObjectId,
    layerVisibility, showGrid,
    pendingSymbol, setPendingSymbol,
    setActiveTool,
    setShowTextDialog, setPendingTextPos,
    setShowDimensionDialog, setPendingDimension,
    setStageTransform,
  } = useEditorStore();
  const { projectId } = useEditorStore();

  const project = useProjectStore(s => s.projects.find(p => p.id === projectId));
  const bgImage = useImage(project?.backgroundImage);
  const bgOpacity = project?.backgroundOpacity ?? 0.4;

  const GRID_SIZE = 50;

  const getPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    const scale = stage.scaleX();
    const x = (pos.x - stage.x()) / scale;
    const y = (pos.y - stage.y()) / scale;
    if (showGrid) {
      return { x: snapToGrid(x, GRID_SIZE / 5), y: snapToGrid(y, GRID_SIZE / 5) };
    }
    return { x, y };
  }, [showGrid]);

  // Auto-save objects when they change
  useEffect(() => {
    if (projectId) {
      const timer = setTimeout(() => {
        useProjectStore.getState().saveObjects(projectId, objects);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [objects, projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setDrawingPhase({ type: 'idle' });
        setPendingSymbol(null);
        if (activeTool !== 'select') setActiveTool('select');
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) deleteObject(selectedObjectId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedObjectId, activeTool, deleteObject, setActiveTool, setDrawingPhase, setPendingSymbol]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const dir = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1.08;
    const newScale = Math.min(Math.max(dir > 0 ? oldScale * factor : oldScale / factor, 0.1), 8);
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    setStageTransform(newScale, newPos.x, newPos.y);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = getPos();
    const clickedOnStage = e.target === stageRef.current;

    // Select tool
    if (activeTool === 'select') {
      if (clickedOnStage) setSelectedObjectId(null);
      return;
    }

    // Placing symbol
    if (activeTool === 'symbol' && pendingSymbol) {
      const symDef = pendingSymbol;
      const def = SYMBOL_DEFS.find(s => s.code === symDef);
      const layer: 'electrical' | 'water' | 'lighting' | 'furniture' =
        def ? (LAYER_FOR_SYMBOL[def.category] as 'electrical' | 'water' | 'lighting' | 'furniture') : 'electrical';
      const sym: SymbolObject = {
        id: makeId(), objectType: 'symbol', layer,
        symbolType: pendingSymbol, x: pos.x, y: pos.y,
        placement: 'wall', notes: '',
      };
      addObject(sym);
      return;
    }

    // Wall tools
    if (activeTool === 'wall-exterior' || activeTool === 'wall-interior' || activeTool === 'wall-mamad') {
      if (drawingPhase.type === 'idle') {
        setDrawingPhase({ type: 'wall', x1: pos.x, y1: pos.y });
      } else if (drawingPhase.type === 'wall') {
        const layerMap: Record<string, Wall['layer']> = {
          'wall-exterior': 'walls-exterior',
          'wall-interior': 'walls-interior',
          'wall-mamad': 'mamad',
        };
        const thicknessMap: Record<string, number> = {
          'wall-exterior': 8,
          'wall-interior': 5,
          'wall-mamad': 14,
        };
        const wall: Wall = {
          id: makeId(), objectType: 'wall',
          layer: layerMap[activeTool],
          x1: drawingPhase.x1, y1: drawingPhase.y1,
          x2: pos.x, y2: pos.y,
          thickness: thicknessMap[activeTool],
          notes: '',
        };
        addObject(wall);
        // Continue chain from this endpoint
        setDrawingPhase({ type: 'wall', x1: pos.x, y1: pos.y });
      }
      return;
    }

    // Room tool (polygon)
    if (activeTool === 'room') {
      if (drawingPhase.type === 'idle') {
        setDrawingPhase({ type: 'room', points: [pos.x, pos.y] });
      } else if (drawingPhase.type === 'room') {
        const pts = [...drawingPhase.points, pos.x, pos.y];
        setDrawingPhase({ type: 'room', points: pts });
      }
      return;
    }

    // Dimension tool
    if (activeTool === 'dimension') {
      if (drawingPhase.type === 'idle') {
        setDrawingPhase({ type: 'dimension', x1: pos.x, y1: pos.y });
      } else if (drawingPhase.type === 'dimension') {
        setPendingDimension({ x1: drawingPhase.x1, y1: drawingPhase.y1, x2: pos.x, y2: pos.y });
        setDrawingPhase({ type: 'idle' });
        setShowDimensionDialog(true);
      }
      return;
    }

    // Text tool
    if (activeTool === 'text') {
      setPendingTextPos({ x: pos.x, y: pos.y });
      setShowTextDialog(true);
      return;
    }

    // Door / Window
    if (activeTool === 'door' || activeTool === 'window') {
      const opening: Opening = {
        id: makeId(), objectType: 'opening', layer: 'openings',
        openingType: activeTool === 'door' ? 'door' : 'window',
        x: pos.x, y: pos.y,
        width: activeTool === 'door' ? 90 : 120,
        rotation: 0, direction: 'left', notes: '',
      };
      addObject(opening);
      return;
    }
  };

  // Double-click: close room polygon
  const handleDblClick = () => {
    if (activeTool === 'room' && drawingPhase.type === 'room' && drawingPhase.points.length >= 6) {
      const room: Room = {
        id: makeId(), objectType: 'room', layer: 'rooms',
        name: 'חדר',
        roomType: 'custom',
        points: drawingPhase.points,
        notes: '',
      };
      addObject(room);
      setDrawingPhase({ type: 'idle' });
    }
    if ((activeTool === 'wall-exterior' || activeTool === 'wall-interior' || activeTool === 'wall-mamad') && drawingPhase.type === 'wall') {
      setDrawingPhase({ type: 'idle' });
    }
  };

  // Preview mouse position
  const previewLineRef = useRef<Konva.Line | null>(null);

  const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = getPos();

    if (drawingPhase.type === 'wall') {
      if (previewLineRef.current) {
        previewLineRef.current.points([drawingPhase.x1, drawingPhase.y1, pos.x, pos.y]);
        previewLineRef.current.getLayer()?.batchDraw();
      }
    }
    if (drawingPhase.type === 'room' && drawingPhase.points.length >= 2) {
      const last2 = drawingPhase.points.slice(-2);
      if (previewLineRef.current) {
        previewLineRef.current.points([last2[0], last2[1], pos.x, pos.y]);
        previewLineRef.current.getLayer()?.batchDraw();
      }
    }
    if (drawingPhase.type === 'dimension') {
      if (previewLineRef.current) {
        previewLineRef.current.points([drawingPhase.x1, drawingPhase.y1, pos.x, pos.y]);
        previewLineRef.current.getLayer()?.batchDraw();
      }
    }
  };

  const showPreviewLine = drawingPhase.type === 'wall' || drawingPhase.type === 'room' || drawingPhase.type === 'dimension';

  const renderGrid = () => {
    if (!showGrid) return null;
    const lines = [];
    const scale = stageRef.current?.scaleX() ?? 1;
    const sx = stageRef.current?.x() ?? 0;
    const sy = stageRef.current?.y() ?? 0;
    const startX = Math.floor(-sx / scale / GRID_SIZE) * GRID_SIZE - GRID_SIZE;
    const startY = Math.floor(-sy / scale / GRID_SIZE) * GRID_SIZE - GRID_SIZE;
    const endX = startX + width / scale + GRID_SIZE * 2;
    const endY = startY + height / scale + GRID_SIZE * 2;
    const lw = 1 / scale;
    for (let x = startX; x <= endX; x += GRID_SIZE) {
      lines.push(<Line key={`gx${x}`} points={[x, startY, x, endY]} stroke="#e5e7eb" strokeWidth={lw} listening={false} />);
    }
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      lines.push(<Line key={`gy${y}`} points={[startX, y, endX, y]} stroke="#e5e7eb" strokeWidth={lw} listening={false} />);
    }
    return lines;
  };

  const getCursor = () => {
    if (activeTool === 'select') return 'default';
    if (activeTool === 'symbol' && pendingSymbol) return 'crosshair';
    return 'crosshair';
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      style={{ cursor: getCursor() }}
      draggable={activeTool === 'select' && drawingPhase.type === 'idle'}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onDblClick={handleDblClick}
      onMouseMove={handleMouseMove}
      onDragEnd={() => {
        const s = stageRef.current;
        if (s) setStageTransform(s.scaleX(), s.x(), s.y());
      }}
    >
      {/* Grid layer */}
      <Layer listening={false}>
        <Rect x={-10000} y={-10000} width={30000} height={30000} fill="#f9fafb" listening={false} />
        {renderGrid()}
      </Layer>

      {/* Background image layer */}
      <Layer listening={false}>
        {bgImage && (
          <KonvaImage
            image={bgImage}
            x={0} y={0}
            opacity={bgOpacity}
            listening={false}
          />
        )}
      </Layer>

      {/* Objects layer */}
      <Layer>
        <ShapeRenderer
          objects={objects}
          layerVisibility={layerVisibility}
          selectedObjectId={selectedObjectId}
          onSelect={setSelectedObjectId}
          onUpdate={updateObject}
          activeTool={activeTool}
          scale={project?.scale ?? 100}
        />

        {/* Preview line while drawing */}
        {showPreviewLine && (
          <Line
            ref={previewLineRef}
            points={[0, 0, 0, 0]}
            stroke={drawingPhase.type === 'dimension' ? '#6366f1' : '#3b82f6'}
            strokeWidth={drawingPhase.type === 'wall' ? (activeTool === 'wall-mamad' ? 14 : activeTool === 'wall-exterior' ? 8 : 5) : 2}
            dash={[10, 5]}
            listening={false}
          />
        )}

        {/* Room polygon preview */}
        {drawingPhase.type === 'room' && drawingPhase.points.length >= 2 && (
          <Line
            points={drawingPhase.points}
            stroke="#10b981"
            strokeWidth={2}
            dash={[6, 4]}
            listening={false}
          />
        )}

        {/* Wall start point indicator */}
        {drawingPhase.type === 'wall' && (
          <Line
            points={[drawingPhase.x1 - 8, drawingPhase.y1, drawingPhase.x1 + 8, drawingPhase.y1]}
            stroke="#22c55e"
            strokeWidth={2}
            listening={false}
          />
        )}
        {drawingPhase.type === 'wall' && (
          <Line
            points={[drawingPhase.x1, drawingPhase.y1 - 8, drawingPhase.x1, drawingPhase.y1 + 8]}
            stroke="#22c55e"
            strokeWidth={2}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}
