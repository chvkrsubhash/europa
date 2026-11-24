import React, { useRef, useEffect, useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { BlockContainer } from './BlockContainer';
import { RichTextBlock } from './RichTextBlock';
import { ChecklistBlock } from './ChecklistBlock';
import { CodeBlock } from './CodeBlock';
import { EquationBlock } from './EquationBlock';
import { CalloutBlock } from './CalloutBlock';
import { AudioBlock } from './AudioBlock';
import { ImageBlock } from './ImageBlock';
import { DigitalInkLayer } from './DigitalInkLayer';
import { PenTool, MousePointer } from 'lucide-react';

export const NoteCanvas: React.FC = () => {
  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    createBlock,
    deleteBlock,
    zoom,
    pan,
    setPan,
    paperStyle,
    ruleSpacing,
    backgroundColor,
    drawingTool,
    setDrawingTool,
    currentPage,
    updatePageTitle
  } = useNotebook();

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [toolToast, setToolToast] = useState<{ message: string; icon: 'pen' | 'cursor' } | null>(null);
  const lastRightClickTimeRef = useRef<number>(0);

  // Disable Right Click & Handle Double Right-Click to Toggle Pen <-> Cursor
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Disable default browser right-click menu
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // Right click button
        e.preventDefault();
        const now = Date.now();
        const timeDiff = now - lastRightClickTimeRef.current;

        if (timeDiff > 0 && timeDiff < 400) {
          // Double right-click detected!
          setDrawingTool((prevTool: any) => {
            const nextTool = prevTool === 'pen' ? 'select' : 'pen';
            if (nextTool === 'pen') {
              setToolToast({ message: 'Pen Mode (Double right-click to return to cursor)', icon: 'pen' });
            } else {
              setToolToast({ message: 'Cursor Mode (Double right-click for Pen)', icon: 'cursor' });
            }
            setTimeout(() => setToolToast(null), 1800);
            return nextTool;
          });
          lastRightClickTimeRef.current = 0; // reset
        } else {
          lastRightClickTimeRef.current = now;
        }
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setDrawingTool]);

  // Keyboard shortcut: Delete or Backspace deletes the currently selected container (when not typing in an input/editor)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true' ||
        activeEl.closest('.ProseMirror') !== null
      );

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId && !isTyping) {
        e.preventDefault();
        deleteBlock(selectedBlockId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, deleteBlock]);

  // Click anywhere to start typing! (Section 5: Genuine free-form canvas)
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawingTool !== 'select') return;
    if ((e.target as HTMLElement).closest('.group')) return; // inside a block

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    createBlock('text', clickX, clickY, '<p></p>');
  };

  // Generate Paper Background CSS pattern
  const getPaperBackgroundStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      backgroundColor: backgroundColor || '#FFFFFF',
    };

    if (paperStyle === 'ruled') {
      base.backgroundImage = `
        linear-gradient(to right, transparent 54px, rgba(220, 38, 38, 0.25) 54px, rgba(220, 38, 38, 0.25) 55px, transparent 55px),
        repeating-linear-gradient(to bottom, transparent 0px, transparent ${ruleSpacing - 1}px, #E5E9F0 ${ruleSpacing - 1}px, #E5E9F0 ${ruleSpacing}px)
      `;
    } else if (paperStyle === 'grid') {
      base.backgroundImage = `
        repeating-linear-gradient(to bottom, transparent 0px, transparent ${ruleSpacing - 1}px, #E8EDF5 ${ruleSpacing - 1}px, #E8EDF5 ${ruleSpacing}px),
        repeating-linear-gradient(to right, transparent 0px, transparent ${ruleSpacing - 1}px, #E8EDF5 ${ruleSpacing - 1}px, #E8EDF5 ${ruleSpacing}px)
      `;
    } else if (paperStyle === 'dotted') {
      base.backgroundImage = `radial-gradient(#CBD5E1 1.2px, transparent 1.2px)`;
      base.backgroundSize = `${ruleSpacing}px ${ruleSpacing}px`;
    }

    return base;
  };

  if (!currentPage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F5F5] text-[#616161]">
        <div className="w-16 h-16 rounded-full bg-[#F0EAF8] flex items-center justify-center mb-3">
          <img src="/europa-logo.png" alt="Europa Logo" className="w-10 h-10 object-contain" />
        </div>
        <h2 className="text-base font-semibold text-[#242424]">No Page Selected</h2>
        <p className="text-xs text-[#8A8A8A] mt-1">Select a page from the left navigation or create a new page.</p>
      </div>
    );
  }

  return (
    <div
      ref={canvasContainerRef}
      onDoubleClick={handleCanvasDoubleClick}
      onClick={() => setSelectedBlockId(null)}
      className={`flex-1 relative bg-[#ECECF0] ${
        drawingTool !== 'select' ? 'overflow-hidden touch-none select-none' : 'overflow-auto cursor-text'
      }`}
      style={{
        cursor: drawingTool === 'select' ? 'text' : 'crosshair',
        touchAction: drawingTool !== 'select' ? 'none' : 'auto',
        overscrollBehavior: 'none'
      }}
    >
      {/* Visual Canvas Paper (Expansive infinite surface) */}
      <div
        className="canvas-paper-sheet"
        style={{
          ...getPaperBackgroundStyle(),
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '4000px',
          height: '4000px',
          position: 'relative',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Title & Timestamp Header (OneNote signature header) */}
        <div className="absolute left-[64px] top-[40px] w-[720px] border-b border-[#E0E0E0] pb-2 z-10 pointer-events-auto">
          <input
            type="text"
            value={currentPage.title}
            onChange={(e) => updatePageTitle(e.target.value)}
            placeholder="Untitled Page"
            className="text-2xl font-bold text-[#242424] bg-transparent border-none focus:outline-none w-full tracking-tight hover:bg-black/[0.02] rounded px-1 -mx-1 transition-colors"
          />
          <div className="text-xs text-[#8A8A8A] mt-1 px-1 flex items-center space-x-3 select-none font-medium">
            <span>{new Date(currentPage.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>&bull;</span>
            <span>{new Date(currentPage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Digital Ink Layer */}
        <DigitalInkLayer />

        {/* Canvas Blocks (Containers) */}
        {blocks.map((block) => (
          <BlockContainer
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={() => setSelectedBlockId(block.id)}
          >
            {block.block_type === 'text' && (
              <RichTextBlock id={block.id} initialContent={block.content} isLocked={block.is_locked} />
            )}
            {block.block_type === 'checklist' && (
              <ChecklistBlock id={block.id} items={block.content} isLocked={block.is_locked} />
            )}
            {block.block_type === 'code' && (
              <CodeBlock id={block.id} code={block.content} isLocked={block.is_locked} />
            )}
            {block.block_type === 'equation' && (
              <EquationBlock id={block.id} latex={block.content} isLocked={block.is_locked} />
            )}
            {block.block_type === 'callout' && (
              <CalloutBlock
                id={block.id}
                content={block.content}
                formatting={block.formatting}
                isLocked={block.is_locked}
              />
            )}
            {block.block_type === 'audio' && (
              <AudioBlock id={block.id} audioUrl={block.content} />
            )}
            {block.block_type === 'image' && (
              <ImageBlock
                id={block.id}
                url={block.content}
                caption={block.formatting?.caption}
                isLocked={block.is_locked}
              />
            )}
          </BlockContainer>
        ))}
      </div>

      {/* Double Right-Click Quick Mode Switch Toast */}
      {toolToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#242424]/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center space-x-2 text-xs font-medium pointer-events-none">
          {toolToast.icon === 'pen' ? (
            <PenTool className="w-4 h-4 text-[#A47DD2]" />
          ) : (
            <MousePointer className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toolToast.message}</span>
        </div>
      )}
    </div>
  );
};

