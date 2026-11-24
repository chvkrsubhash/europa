import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { Section, Page } from '../../types';
import {
  Folder, Plus, MoreVertical, Lock, Star, Pin, Trash2,
  ChevronRight, ChevronDown, FileText, Palette, KeyRound, Copy
} from 'lucide-react';
import { api } from '../../services/api';

interface LeftNavProps {
  onOpenNewSection: () => void;
  onOpenNewPage: () => void;
}

export const LeftNav: React.FC<LeftNavProps> = ({ onOpenNewSection, onOpenNewPage }) => {
  const {
    currentNotebook,
    sections,
    currentSection,
    setCurrentSection,
    pages,
    currentPage,
    setCurrentPage,
    refreshSections,
    refreshPages,
    isLeftNavOpen,
    setIsLeftNavOpen
  } = useNotebook();

  const [sectionFilter, setSectionFilter] = useState('');
  const [pageFilter, setPageFilter] = useState('');
  const [passwordPromptSection, setPasswordPromptSection] = useState<Section | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSelectSection = async (sec: Section) => {
    if (sec.has_password && sec.is_locked) {
      setPasswordPromptSection(sec);
      setPasswordInput('');
      setPasswordError('');
      return;
    }
    setCurrentSection(sec);
  };

  const handleUnlockPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPromptSection) return;
    try {
      const res = await api.verifySectionPassword(passwordPromptSection.id, passwordInput);
      if (res.unlocked) {
        setCurrentSection({ ...passwordPromptSection, is_locked: false });
        setPasswordPromptSection(null);
      }
    } catch (err: any) {
      setPasswordError('Invalid password. Please try again.');
    }
  };

  const handleDeleteSection = async (secId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this section?')) {
      await api.deleteSection(secId);
      refreshSections();
    }
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      await api.deletePage(pageId);
      refreshPages();
    }
  };

  const togglePinPage = async (page: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.updatePage(page.id, { is_pinned: !page.is_pinned });
    refreshPages();
  };

  const toggleFavoritePage = async (page: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.updatePage(page.id, { is_favorite: !page.is_favorite });
    refreshPages();
  };

  if (!isLeftNavOpen) {
    return (
      <div className="w-10 bg-[#FAF8FD] border-r border-[#E0E0E0] flex flex-col items-center py-2 select-none">
        <button
          onClick={() => setIsLeftNavOpen(true)}
          title="Expand Notebook Navigation"
          className="p-2 rounded hover:bg-[#F0EAF8] text-[#6941A5]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Filter & sort pages (pinned on top)
  const sortedPages = [...pages].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return a.order - b.order;
  });

  const filteredPages = sortedPages.filter((p) =>
    p.title.toLowerCase().includes(pageFilter.toLowerCase())
  );

  return (
    <aside className="w-72 bg-[#FBFBFB] border-r border-[#E0E0E0] flex flex-col select-none text-[#242424] relative z-20">
      {/* Top Header */}
      <div className="h-10 px-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F7F7F8]">
        <div className="flex items-center space-x-1.5 font-semibold text-xs tracking-tight text-[#242424]">
          <Folder className="w-3.5 h-3.5 text-[#6941A5]" />
          <span className="truncate">{currentNotebook?.title || 'Notebook'}</span>
        </div>
        <button
          onClick={() => setIsLeftNavOpen(false)}
          title="Collapse Panel"
          className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* Sections Bar (OneNote colored section tabs) */}
      <div className="border-b border-[#E0E0E0] p-2 bg-[#F9F8FB]">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">
            Sections ({sections.length})
          </span>
          <button
            onClick={onOpenNewSection}
            className="flex items-center space-x-1 text-[11px] text-[#6941A5] font-semibold hover:underline"
          >
            <Plus className="w-3 h-3" />
            <span>New Section</span>
          </button>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
          {sections.map((sec) => {
            const isActive = currentSection?.id === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => handleSelectSection(sec)}
                className={`group relative flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-xs transition-all ${
                  isActive
                    ? 'bg-white shadow-xs font-semibold text-[#242424] border border-[#E0E0E0]'
                    : 'hover:bg-white/80 text-[#616161] hover:text-[#242424]'
                }`}
              >
                <div
                  className="absolute left-0 top-1 bottom-1 w-1 rounded-r"
                  style={{ backgroundColor: sec.color }}
                />
                <div className="flex items-center space-x-2 pl-1 truncate">
                  <span className="truncate">{sec.title}</span>
                  {sec.has_password && <Lock className="w-3 h-3 text-[#D13438]" />}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                  <button
                    onClick={(e) => handleDeleteSection(sec.id, e)}
                    title="Delete Section"
                    className="p-1 text-[#8A8A8A] hover:text-[#D13438] rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pages Explorer Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="p-2 border-b border-[#E0E0E0] flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#616161]">
            Pages ({pages.length})
          </span>
          <button
            onClick={onOpenNewPage}
            className="flex items-center space-x-1 text-xs text-[#6941A5] font-medium hover:underline bg-[#F0EAF8] px-2 py-0.5 rounded"
          >
            <Plus className="w-3 h-3" />
            <span>Add Page</span>
          </button>
        </div>

        {/* Filter input */}
        <div className="px-2 py-1.5 border-b border-[#F0EAF8]">
          <input
            type="text"
            placeholder="Filter pages..."
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-[#F7F7F8] border border-[#E0E0E0] rounded focus:outline-none focus:border-[#6941A5]"
          />
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F5]">
          {filteredPages.map((p) => (
            <div
              key={p.id}
              onClick={() => setCurrentPage(p)}
              className={`group px-3 py-2 cursor-pointer transition-colors ${
                p.parent_page_id ? 'pl-6' : ''
              } ${
                currentPage?.id === p.id
                  ? 'bg-[#F0EAF8] border-r-2 border-[#6941A5]'
                  : 'hover:bg-[#FAF8FD]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 truncate pr-1">
                  <div
                    className={`text-xs truncate ${
                      currentPage?.id === p.id ? 'font-semibold text-[#6941A5]' : 'text-[#242424]'
                    }`}
                  >
                    {p.title || 'Untitled Page'}
                  </div>
                  <div className="text-[10px] text-[#8A8A8A] mt-0.5">
                    {new Date(p.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => togglePinPage(p, e)}
                    className={`p-1 rounded ${p.is_pinned ? 'text-[#6941A5]' : 'text-[#8A8A8A] hover:text-[#242424]'}`}
                    title={p.is_pinned ? 'Unpin page' : 'Pin page'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => toggleFavoritePage(p, e)}
                    className={`p-1 rounded ${p.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-[#8A8A8A] hover:text-amber-500'}`}
                    title="Favorite"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeletePage(p.id, e)}
                    className="p-1 rounded text-[#8A8A8A] hover:text-[#D13438]"
                    title="Delete page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPages.length === 0 && (
            <div className="p-4 text-center text-xs text-[#8A8A8A]">
              No pages found. Click "+ Add Page" above.
            </div>
          )}
        </div>
      </div>

      {/* Password Unlock Modal for Locked Sections */}
      {passwordPromptSection && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleUnlockPassword}
            className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full space-y-4"
          >
            <div className="flex items-center space-x-2 text-[#6941A5]">
              <Lock className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Protected Section</h3>
            </div>
            <p className="text-xs text-[#616161]">
              Enter the password to unlock section &quot;{passwordPromptSection.title}&quot;.
            </p>
            <input
              type="password"
              autoFocus
              placeholder="Section password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-[#E0E0E0] rounded focus:border-[#6941A5] focus:outline-none"
            />
            {passwordError && <p className="text-[11px] text-[#D13438]">{passwordError}</p>}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPasswordPromptSection(null)}
                className="px-3 py-1 text-xs text-[#616161] hover:bg-[#F5F5F5] rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-[#6941A5] text-white rounded hover:bg-[#563588] font-medium"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
};

