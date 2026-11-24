import React, { useState, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import { TagItem } from '../../types';
import { Tag, X, ExternalLink, Bookmark } from 'lucide-react';

export const TagsSummaryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setCurrentPage, pages } = useNotebook();
  const [tagGroups, setTagGroups] = useState<Record<string, TagItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTagsSummary().then((res) => {
      setTagGroups(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tagLabels: Record<string, { title: string; color: string }> = {
    todo: { title: 'To-Do Items', color: '#6941A5' },
    important: { title: 'Important Points', color: '#D13438' },
    question: { title: 'Questions / Inquiries', color: '#0078D4' },
    remember: { title: 'Remember Keys', color: '#FFA000' },
    definition: { title: 'Definitions', color: '#107C41' },
    exam: { title: 'Exam Critical', color: '#B4009E' },
    idea: { title: 'Ideas & Insights', color: '#008272' },
    custom: { title: 'Custom Tags', color: '#616161' },
  };

  return (
    <aside className="w-80 bg-white border-l border-[#E0E0E0] flex flex-col h-full select-none text-[#242424] z-20">
      <div className="h-10 px-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F7F7F8]">
        <div className="flex items-center space-x-1.5 font-semibold text-xs text-[#242424]">
          <Tag className="w-3.5 h-3.5 text-[#6941A5]" />
          <span>Tags Summary Across Notebooks</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {loading ? (
          <div className="text-center text-xs text-[#8A8A8A] py-8">Loading tags...</div>
        ) : (
          Object.entries(tagGroups).map(([type, items]) => {
            if (!items || items.length === 0) return null;
            const meta = tagLabels[type] || { title: type, color: '#6941A5' };
            return (
              <div key={type} className="space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#242424]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span>{meta.title} ({items.length})</span>
                </div>
                <div className="space-y-1 pl-4 border-l-2 border-[#F0EAF8]">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      onClick={() => {
                        const targetPage = pages.find((p) => p.id === it.page_id);
                        if (targetPage) setCurrentPage(targetPage);
                      }}
                      className="p-2 rounded bg-[#FAF8FD] hover:bg-[#F0EAF8] border border-[#DFD1F0] cursor-pointer text-xs space-y-0.5"
                    >
                      <div className="font-medium text-[#242424] truncate">{it.label}</div>
                      <div className="text-[11px] text-[#616161] line-clamp-2">
                        {it.content_snippet || 'Tagged excerpt in note'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

