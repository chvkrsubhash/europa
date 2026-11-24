import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { Lightbulb, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CalloutBlockProps {
  id: string;
  content: string;
  formatting?: Record<string, any>;
  isLocked: boolean;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ id, content, formatting = {}, isLocked }) => {
  const { updateBlock } = useNotebook();
  const [val, setVal] = useState(content);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    updateBlock(id, { content: e.target.value });
  };

  const bgColor = formatting.backgroundColor || '#F0EAF8';
  const borderColor = formatting.borderColor || '#6941A5';

  return (
    <div
      style={{ backgroundColor: bgColor, borderLeft: `4px solid ${borderColor}` }}
      className="p-3 rounded-r-md flex items-start space-x-2.5 shadow-sm"
    >
      <Lightbulb className="w-5 h-5 flex-shrink-0 text-[#6941A5] mt-0.5" />
      <textarea
        disabled={isLocked}
        value={val}
        onChange={handleChange}
        rows={Math.max(2, val.split('\n').length)}
        className="w-full bg-transparent resize-none focus:outline-none text-xs text-[#242424] leading-relaxed"
      />
    </div>
  );
};

