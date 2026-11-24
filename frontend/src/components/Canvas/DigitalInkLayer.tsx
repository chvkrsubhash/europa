import React, { useRef, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { InkPoint, InkStroke } from '../../types';

export const DigitalInkLayer: React.FC = () => {
  const {
    inkStrokes,
    addInkStroke,
    drawingTool,
    strokeColor,
    strokeThickness,
    strokeOpacity,
    zoom
  } = useNotebook();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<InkPoint[]>([]);
  // Local synchronous ref of all committed strokes to eliminate any React re-render or async network lag
  const allStrokesRef = useRef<InkStroke[]>(inkStrokes);

  const isInkToolActive = drawingTool !== 'select';

  // Keep allStrokesRef in sync with external inkStrokes state changes
  useEffect(() => {
    allStrokesRef.current = inkStrokes;
    renderAllStrokes();
  }, [inkStrokes]);

  const drawShapeOrPath = (
    ctx: CanvasRenderingContext2D,
    tool: string,
    pts: InkPoint[],
    color: string,
    thickness: number,
    opacity: number
  ) => {
    if (!pts || pts.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pts.length === 1) {
      ctx.arc(pts[0].x, pts[0].y, thickness / 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
      return;
    }

    const from = pts[0];
    const to = pts[pts.length - 1];

    if (tool === 'line') {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    } else if (tool === 'arrow') {
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const headLen = Math.max(12, thickness * 3);
      ctx.lineTo(
        to.x - headLen * Math.cos(angle - Math.PI / 6),
        to.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - headLen * Math.cos(angle + Math.PI / 6),
        to.y - headLen * Math.sin(angle + Math.PI / 6)
      );
    } else if (tool === 'rectangle') {
      ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (tool === 'circle') {
      const radius = Math.hypot(to.x - from.x, to.y - from.y);
      ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI);
    } else if (tool === 'triangle') {
      ctx.moveTo((from.x + to.x) / 2, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineTo(from.x, to.y);
      ctx.closePath();
    } else {
      // Freehand smooth bezier curves for Pen, Pencil, Highlighter, Marker, Eraser
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(to.x, to.y);
    }

    ctx.stroke();
    ctx.restore();
  };

  // Redraw all committed strokes from allStrokesRef
  const renderAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of allStrokesRef.current) {
      if (!stroke.points || stroke.points.length === 0) continue;
      drawShapeOrPath(
        ctx,
        stroke.tool,
        stroke.points,
        stroke.color,
        stroke.thickness,
        stroke.opacity
      );
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInkToolActive) return;
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const pressure = e.pressure || 0.5;

    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y, pressure }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isInkToolActive) return;
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    const pressure = e.pressure || 0.5;

    currentPointsRef.current.push({ x, y, pressure });

    // Redraw: all committed strokes (from ref) + current live preview stroke
    renderAllStrokes();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentStrokeColor = drawingTool === 'eraser' ? '#FFFFFF' : strokeColor;
    const currentThickness = drawingTool === 'highlighter' ? strokeThickness * 3 : (drawingTool === 'eraser' ? strokeThickness * 4 : strokeThickness);
    const currentOpacity = drawingTool === 'highlighter' ? 0.35 : strokeOpacity;

    drawShapeOrPath(
      ctx,
      drawingTool,
      currentPointsRef.current,
      currentStrokeColor,
      currentThickness,
      currentOpacity
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }

    if (currentPointsRef.current.length > 0) {
      const finalColor = drawingTool === 'eraser' ? '#FFFFFF' : strokeColor;
      const finalThickness = drawingTool === 'highlighter' ? strokeThickness * 3 : (drawingTool === 'eraser' ? strokeThickness * 4 : strokeThickness);
      const finalOpacity = drawingTool === 'highlighter' ? 0.35 : strokeOpacity;

      const newStroke: InkStroke = {
        id: `ink_local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        page_id: '',
        tool: drawingTool,
        points: [...currentPointsRef.current],
        color: finalColor,
        thickness: finalThickness,
        opacity: finalOpacity
      };

      // 1. Immediately append to the synchronous strokes ref so subsequent strokes immediately see it
      allStrokesRef.current.push(newStroke);

      // 2. Render all strokes immediately
      renderAllStrokes();

      // 3. Persist to context and backend
      addInkStroke({
        tool: drawingTool,
        points: [...currentPointsRef.current],
        color: finalColor,
        thickness: finalThickness,
        opacity: finalOpacity
      });
    }
    currentPointsRef.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      width={4000}
      height={4000}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: isInkToolActive ? 'auto' : 'none',
        zIndex: 25,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    />
  );
};
