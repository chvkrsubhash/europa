import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { useNotebook } from '../../context/NotebookContext';
import { Edit3, Check } from 'lucide-react';

interface EquationBlockProps {
  id: string;
  latex: string;
  isLocked: boolean;
}

export const EquationBlock: React.FC<EquationBlockProps> = ({ id, latex = 'E = mc^2', isLocked }) => {
  const { updateBlock } = useNotebook();
  const [formula, setFormula] = useState(latex);
  const [isEditing, setIsEditing] = useState(false);
  const mathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mathRef.current) {
      try {
        katex.render(formula || 'f(x)', mathRef.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {
        mathRef.current.innerText = formula;
      }
    }
  }, [formula, isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    updateBlock(id, { content: formula });
  };

  return (
    <div className="p-2 border border-[#DFD1F0] rounded bg-[#FAF8FD]">
      <div className="flex items-center justify-between pb-1 text-[11px] text-[#6941A5] font-medium border-b border-[#F0EAF8] mb-2">
        <span>MATH EQUATION (KaTeX)</span>
        {!isLocked && (
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center space-x-1 text-xs hover:text-[#563588]"
          >
            {isEditing ? <Check className="w-3 h-3 text-emerald-600" /> : <Edit3 className="w-3 h-3" />}
            <span>{isEditing ? 'Done' : 'Edit LaTeX'}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="w-full px-2 py-1 text-xs font-mono border border-[#6941A5] rounded focus:outline-none"
            placeholder="e.g. \\int_{a}^{b} f(x)dx = F(b) - F(a)"
          />
          <div ref={mathRef} className="py-2 text-center overflow-x-auto" />
        </div>
      ) : (
        <div
          ref={mathRef}
          onDoubleClick={() => !isLocked && setIsEditing(true)}
          className="py-3 text-center cursor-pointer overflow-x-auto"
          title="Double click to edit LaTeX"
        />
      )}
    </div>
  );
};

