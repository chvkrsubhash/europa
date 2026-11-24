import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Double Click Canvas', desc: 'Place new text container anywhere' },
    { key: 'Ctrl + B', desc: 'Bold text' },
    { key: 'Ctrl + I', desc: 'Italic text' },
    { key: 'Ctrl + U', desc: 'Underline text' },
    { key: 'Ctrl + Z', desc: 'Undo note change' },
    { key: 'Ctrl + Y', desc: 'Redo note change' },
    { key: 'Ctrl + F / Ctrl + E', desc: 'Global notebook search' },
    { key: 'Ctrl + /', desc: 'Open keyboard shortcuts dialog' },
    { key: 'Escape', desc: 'Deselect container or close modal' }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 text-[#242424]">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-[#6941A5]" />
            <h3 className="font-semibold text-sm">Keyboard Shortcuts Reference</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-[#F5F5F5]">
              <span className="text-[#616161]">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-[#FAF8FD] border border-[#DFD1F0] rounded text-[11px] font-mono text-[#6941A5] font-semibold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#6941A5] text-white rounded text-xs font-medium hover:bg-[#563588]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

