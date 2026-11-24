import React, { useState, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import { Search, X, FileText, Folder, Tag, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { currentNotebook, currentSection, currentPage, pages, setCurrentPage } = useNotebook();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(
          query,
          scope,
          currentPage?.id,
          currentNotebook?.id
        );
        setResults(res.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, scope, currentPage, currentNotebook]);

  if (!isOpen) return null;

  const handleSelectResult = (res: any) => {
    if (res.page_id) {
      const p = pages.find((page) => page.id === res.page_id);
      if (p) setCurrentPage(p);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-16 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full flex flex-col overflow-hidden text-[#242424]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#E0E0E0] flex items-center space-x-2 bg-[#FAF8FD]">
          <Search className="w-4 h-4 text-[#6941A5]" />
          <input
            type="text"
            autoFocus
            placeholder="Search across all notebooks, sections, notes, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-xs text-[#242424] focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Pills */}
        <div className="px-3 py-1.5 bg-[#F7F7F8] border-b border-[#E0E0E0] flex items-center space-x-2 text-[11px]">
          <span className="text-[#8A8A8A]">Search In:</span>
          {['all', 'current_notebook', 'current_section'].map((sc) => (
            <button
              key={sc}
              onClick={() => setScope(sc)}
              className={`px-2 py-0.5 rounded capitalize ${
                scope === sc
                  ? 'bg-[#6941A5] text-white font-medium'
                  : 'text-[#616161] hover:bg-white'
              }`}
            >
              {sc.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F5F5F5]">
          {loading && (
            <div className="text-center py-6 text-xs text-[#8A8A8A]">Searching...</div>
          )}

          {!loading && results.map((r, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectResult(r)}
              className="p-2.5 rounded hover:bg-[#F0EAF8] cursor-pointer text-xs space-y-1 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#242424] flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#6941A5]" />
                  <span>{r.title}</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-[#DFD1F0] text-[#6941A5]">
                  {r.match_type}
                </span>
              </div>
              <div className="text-[11px] text-[#616161] line-clamp-2">
                {r.snippet}
              </div>
              <div className="text-[10px] text-[#8A8A8A]">
                {r.notebook_title} &bull; {r.section_title}
              </div>
            </div>
          ))}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-xs text-[#8A8A8A]">
              No matching notes found for &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

