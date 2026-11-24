import React, { useState, useRef, useEffect } from 'react';
import { CanvasBlock } from '../../types';
import { useNotebook } from '../../context/NotebookContext';
import { Move, Trash2, Lock, Unlock, ArrowUp, ArrowDown, GripHorizontal, Eraser } from 'lucide-react';

interface BlockContainerProps {
  block: CanvasBlock;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

export const BlockContainer: React.FC<BlockContainerProps> = ({
  block,
  isSelected,
  onSelect,
  children
}) => {
  const { updateBlock, deleteBlock, bringForward, sendBackward, toggleLock, zoom } = useNotebook();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; blockX: number; blockY: number }>({ mouseX: 0, mouseY: 0, blockX: 0, blockY: 0 });
  const resizeStartRef = useRef<{ mouseX: number; initialWidth: number }>({ mouseX: 0, initialWidth: 0 });

  // Handle Dragging
  const handleDragMouseDown = (e: React.MouseEvent) => {
    if (block.is_locked) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      blockX: block.x,
      blockY: block.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;
        const newX = Math.max(10, Math.round(dragStartRef.current.blockX + dx));
        const newY = Math.max(10, Math.round(dragStartRef.current.blockY + dy));
        updateBlock(block.id, { x: newX, y: newY });
      } else if (isResizing) {
        const dx = (e.clientX - resizeStartRef.current.mouseX) / zoom;
        const newWidth = Math.max(220, Math.round(resizeStartRef.current.initialWidth + dx));
        updateBlock(block.id, { width: newWidth });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
      if (isResizing) setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, block.id, zoom, updateBlock]);

  // Handle Resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (block.is_locked) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      initialWidth: block.width
    };
  };

  const handleClearContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (block.is_locked) return;
    if (confirm('Clear all content inside this container?')) {
      let emptyVal: any = '<p></p>';
      if (block.block_type === 'checklist') emptyVal = [];
      else if (block.block_type === 'code') emptyVal = '';
      else if (block.block_type === 'equation') emptyVal = '';
      else if (block.block_type === 'callout') emptyVal = '';
      updateBlock(block.id, { content: emptyVal });
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        position: 'absolute',
        left: `${block.x}px`,
        top: `${block.y}px`,
        width: `${block.width}px`,
        zIndex: block.layer_order + (isSelected ? 50 : 2),
      }}
      className={`group transition-all duration-150 rounded-xs ${
        isSelected
          ? 'ring-1.5 ring-[#6941A5] shadow-md bg-white/98'
          : 'hover:ring-1 hover:ring-dashed hover:ring-[#A47DD2] hover:bg-white/90'
      }`}
    >
      {/* OneNote-style Container Drag Handle Bar */}
      <div
        onMouseDown={handleDragMouseDown}
        className={`h-6 px-2 flex items-center justify-between cursor-move bg-gradient-to-r from-[#F0EAF8] to-[#F7F3FB] border-b border-[#DFD1F0] rounded-t-xs transition-opacity duration-150 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex items-center space-x-1.5 text-[#6941A5]">
          <GripHorizontal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold tracking-wider uppercase select-none">
            {block.block_type}
          </span>
        </div>

        {/* Quick Block Actions */}
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            title="Clear container content"
            onClick={handleClearContent}
            className="p-1 hover:bg-white/80 rounded text-[#616161] hover:text-[#6941A5] transition-colors"
          >
            <Eraser className="w-3 h-3" />
          </button>
          <button
            title="Bring Forward"
            onClick={() => bringForward(block.id)}
            className="p-1 hover:bg-white/80 rounded text-[#616161] hover:text-[#242424] transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            title="Send Backward"
            onClick={() => sendBackward(block.id)}
            className="p-1 hover:bg-white/80 rounded text-[#616161] hover:text-[#242424] transition-colors"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            title={block.is_locked ? 'Unlock Container' : 'Lock Container'}
            onClick={() => toggleLock(block.id)}
            className="p-1 hover:bg-white/80 rounded text-[#616161] hover:text-[#242424] transition-colors"
          >
            {block.is_locked ? <Lock className="w-3 h-3 text-[#D13438]" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            title="Delete Container (or press Delete key)"
            onClick={() => deleteBlock(block.id)}
            className="p-1 hover:bg-red-50 rounded text-[#616161] hover:text-[#D13438] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 cursor-text">
        {children}
      </div>

      {/* Resize Handle */}
      {!block.is_locked && (
        <div
          onMouseDown={handleResizeMouseDown}
          className={`absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Drag to resize width"
        >
          <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#6941A5] rounded-full shadow-xs" />
        </div>
      )}
    </div>
  );
};
