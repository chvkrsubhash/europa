import React from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { FileText, X, Clock, Calendar, Hash, Type } from 'lucide-react';

export const PageInfoPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentPage, blocks, inkStrokes } = useNotebook();

  if (!currentPage) return null;

  // Calculate stats
  let totalWords = 0;
  let totalChars = 0;
  for (const b of blocks) {
    if (typeof b.content === 'string') {
      const plain = b.content.replace(/<[^>]+>/g, ' ').trim();
      totalChars += plain.length;
      totalWords += plain.split(/\s+/).filter(Boolean).length;
    }
  }

  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  return (
    <aside className="w-80 bg-white border-l border-[#E0E0E0] flex flex-col h-full select-none text-[#242424] z-20">
      <div className="h-10 px-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F7F7F8]">
        <div className="flex items-center space-x-1.5 font-semibold text-xs text-[#242424]">
          <FileText className="w-3.5 h-3.5 text-[#6941A5]" />
          <span>Page Information & Statistics</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs">
        <div>
          <h4 className="font-semibold text-sm text-[#242424]">{currentPage.title}</h4>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5">ID: {currentPage.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EAF8]">
          <div className="p-2.5 rounded bg-[#FAF8FD] border border-[#DFD1F0]">
            <div className="text-[10px] text-[#616161] uppercase font-semibold">Total Words</div>
            <div className="text-lg font-bold text-[#6941A5]">{totalWords}</div>
          </div>
          <div className="p-2.5 rounded bg-[#FAF8FD] border border-[#DFD1F0]">
            <div className="text-[10px] text-[#616161] uppercase font-semibold">Characters</div>
            <div className="text-lg font-bold text-[#6941A5]">{totalChars}</div>
          </div>
          <div className="p-2.5 rounded bg-[#FAF8FD] border border-[#DFD1F0]">
            <div className="text-[10px] text-[#616161] uppercase font-semibold">Reading Time</div>
            <div className="text-base font-bold text-[#242424]">~{readingTime} min</div>
          </div>
          <div className="p-2.5 rounded bg-[#FAF8FD] border border-[#DFD1F0]">
            <div className="text-[10px] text-[#616161] uppercase font-semibold">Containers</div>
            <div className="text-base font-bold text-[#242424]">{blocks.length} blocks</div>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-[#F0EAF8] text-[11px] text-[#616161]">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-[#6941A5]" />
            <span>Created: {new Date(currentPage.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-[#6941A5]" />
            <span>Last Modified: {new Date(currentPage.updated_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Hash className="w-3.5 h-3.5 text-[#6941A5]" />
            <span>Ink Strokes: {inkStrokes.length} vector paths</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

