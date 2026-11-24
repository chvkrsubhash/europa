import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { Check, Plus, Trash2, GripVertical } from 'lucide-react';

interface ChecklistItem {
  text: string;
  checked: boolean;
}

interface ChecklistBlockProps {
  id: string;
  items: ChecklistItem[];
  isLocked: boolean;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({ id, items = [], isLocked }) => {
  const { updateBlock } = useNotebook();
  const [list, setList] = useState<ChecklistItem[]>(Array.isArray(items) ? items : []);
  const [newItemText, setNewItemText] = useState('');

  const syncItems = (nextItems: ChecklistItem[]) => {
    setList(nextItems);
    updateBlock(id, { content: nextItems });
  };

  const toggleItem = (idx: number) => {
    if (isLocked) return;
    const next = [...list];
    next[idx].checked = !next[idx].checked;
    syncItems(next);
  };

  const updateItemText = (idx: number, text: string) => {
    if (isLocked) return;
    const next = [...list];
    next[idx].text = text;
    syncItems(next);
  };

  const removeItem = (idx: number) => {
    if (isLocked) return;
    const next = list.filter((_, i) => i !== idx);
    syncItems(next);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || isLocked) return;
    const next = [...list, { text: newItemText.trim(), checked: false }];
    syncItems(next);
    setNewItemText('');
  };

  return (
    <div className="space-y-1.5 text-sm">
      <div className="space-y-1">
        {list.map((item, idx) => (
          <div key={idx} className="group flex items-center space-x-2 py-0.5">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => toggleItem(idx)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                item.checked
                  ? 'bg-[#6941A5] border-[#6941A5] text-white'
                  : 'border-[#B0B0B0] hover:border-[#6941A5] bg-white'
              }`}
            >
              {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <input
              type="text"
              disabled={isLocked}
              value={item.text}
              onChange={(e) => updateItemText(idx, e.target.value)}
              className={`flex-1 bg-transparent border-none focus:outline-none text-[#242424] ${
                item.checked ? 'line-through text-[#8A8A8A]' : ''
              }`}
            />
            {!isLocked && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8A8A8A] hover:text-[#D13438] transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!isLocked && (
        <form onSubmit={handleAddItem} className="flex items-center space-x-2 pt-1">
          <Plus className="w-4 h-4 text-[#6941A5]" />
          <input
            type="text"
            placeholder="Add new task and press Enter..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="flex-1 text-xs bg-transparent border-b border-dashed border-[#DFD1F0] focus:border-[#6941A5] focus:outline-none py-0.5"
          />
        </form>
      )}
    </div>
  );
};

