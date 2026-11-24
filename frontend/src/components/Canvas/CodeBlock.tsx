import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  id: string;
  code: string;
  isLocked: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ id, code = '', isLocked }) => {
  const { updateBlock } = useNotebook();
  const [copied, setCopied] = useState(false);
  const [val, setVal] = useState(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    updateBlock(id, { content: e.target.value });
  };

  return (
    <div className="relative rounded bg-[#1E1E1E] text-[#D4D4D4] font-mono text-xs overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#3C3C3C] text-[11px] text-[#858585]">
        <span>CODE SNIPPET</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <textarea
        disabled={isLocked}
        value={val}
        onChange={handleChange}
        rows={Math.max(4, val.split('\n').length)}
        spellCheck={false}
        className="w-full p-3 bg-transparent resize-y focus:outline-none leading-relaxed font-mono selection:bg-[#264F78]"
      />
    </div>
  );
};

