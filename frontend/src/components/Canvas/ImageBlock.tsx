import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';

interface ImageBlockProps {
  id: string;
  url: string;
  caption?: string;
  isLocked: boolean;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ id, url, caption = '', isLocked }) => {
  const { updateBlock } = useNotebook();
  const [cap, setCap] = useState(caption);

  return (
    <div className="space-y-1.5">
      <img
        src={url}
        alt={caption || 'Notebook image'}
        className="w-full h-auto rounded border border-[#E0E0E0] select-none object-contain max-h-[500px]"
      />
      <input
        type="text"
        disabled={isLocked}
        placeholder="Add caption..."
        value={cap}
        onChange={(e) => {
          setCap(e.target.value);
          updateBlock(id, { formatting: { caption: e.target.value } });
        }}
        className="w-full text-center text-xs text-[#616161] italic bg-transparent border-none focus:outline-none"
      />
    </div>
  );
};

