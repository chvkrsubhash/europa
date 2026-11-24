import React, { useState, useEffect } from 'react';
import { NotebookProvider, useNotebook } from './context/NotebookContext';
import { TopBar } from './components/TopBar/TopBar';
import { RibbonNav } from './components/Ribbon/RibbonNav';
import { LeftNav } from './components/Navigation/LeftNav';
import { NoteCanvas } from './components/Canvas/NoteCanvas';
import { AIAssistantPanel } from './components/Sidebar/AIAssistantPanel';
import { TagsSummaryPanel } from './components/Sidebar/TagsSummaryPanel';
import { TasksPanel } from './components/Sidebar/TasksPanel';
import { PageInfoPanel } from './components/Sidebar/PageInfoPanel';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { ShareModal } from './components/Modals/ShareModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { SearchModal } from './components/Modals/SearchModal';
import { BackstageView } from './components/Backstage/BackstageView';
import { api } from './services/api';

const MainLayout: React.FC = () => {
  const {
    activeSidebarPanel,
    setActiveSidebarPanel,
    currentPage,
    currentSection,
    currentNotebook,
    refreshNotebooks,
    refreshSections,
    refreshPages,
    undo,
    redo,
    setCurrentNotebook
  } = useNotebook();

  // Modals state
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // New item prompts
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState('#6941A5');

  const [isNewSectionOpen, setIsNewSectionOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionColor, setNewSectionColor] = useState('#6941A5');
  const [newSectionPassword, setNewSectionPassword] = useState('');

  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting while typing in form fields (except search / shortcuts)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && !isInput) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setActiveSidebarPanel(activeSidebarPanel === 'ai' ? null : 'ai');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !isInput) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !isInput) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSidebarPanel, undo, redo, setActiveSidebarPanel]);

  // Export File Download Handler
  const handleExport = async (format: 'markdown' | 'html' | 'json' | 'titan') => {
    if (!currentPage) {
      alert('Please select a page to export');
      return;
    }
    try {
      const res = await api.exportPage(currentPage.id, format);
      let blob: Blob;
      let filename = `${currentPage.title || 'Note'}`;

      if (format === 'json' || format === 'titan') {
        blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
        filename += format === 'titan' ? '.titan.json' : '.json';
      } else if (format === 'html') {
        blob = new Blob([res.content], { type: 'text/html' });
        filename += '.html';
      } else {
        blob = new Blob([res.content], { type: 'text/markdown' });
        filename += '.md';
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // Create Notebook
  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    try {
      const nb = await api.createNotebook({
        title: newNotebookTitle.trim(),
        color: newNotebookColor
      });
      await refreshNotebooks();
      setCurrentNotebook(nb);
      setIsNewNotebookOpen(false);
      setNewNotebookTitle('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNotebook || !newSectionTitle.trim()) return;
    try {
      await api.createSection({
        notebook_id: currentNotebook.id,
        title: newSectionTitle.trim(),
        color: newSectionColor,
        password: newSectionPassword || undefined
      });
      await refreshSections(currentNotebook.id);
      setIsNewSectionOpen(false);
      setNewSectionTitle('');
      setNewSectionPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSection) return;
    try {
      await api.createPage({
        section_id: currentSection.id,
        title: newPageTitle.trim() || 'Untitled Page'
      });
      await refreshPages(currentSection.id);
      setIsNewPageOpen(false);
      setNewPageTitle('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F5F5] font-sans antialiased text-[#242424]">
      {/* 1. Top Application Bar */}
      <TopBar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
      />

      {/* 2. Ribbon Navigation */}
      <RibbonNav
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenExport={handleExport}
      />

      {/* 3. Main Body: Left Nav + Free-form Canvas + Collapsible Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Hierarchical Navigation */}
        <LeftNav
          onOpenNewSection={() => setIsNewSectionOpen(true)}
          onOpenNewPage={() => setIsNewPageOpen(true)}
        />

        {/* Center: Infinite Note Canvas */}
        <NoteCanvas />

        {/* Right Collapsible Panel */}
        {activeSidebarPanel === 'ai' && (
          <AIAssistantPanel onClose={() => setActiveSidebarPanel(null)} />
        )}
        {activeSidebarPanel === 'tags' && (
          <TagsSummaryPanel onClose={() => setActiveSidebarPanel(null)} />
        )}
        {activeSidebarPanel === 'tasks' && (
          <TasksPanel onClose={() => setActiveSidebarPanel(null)} />
        )}
        {activeSidebarPanel === 'info' && (
          <PageInfoPanel onClose={() => setActiveSidebarPanel(null)} />
        )}
      </div>

      {/* Modals */}
      <TemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* New Notebook Modal */}
      {isNewNotebookOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateNotebook}
            className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full space-y-3"
          >
            <h3 className="font-semibold text-sm">Create New Notebook</h3>
            <input
              type="text"
              autoFocus
              placeholder="Notebook name (e.g. Research Vault)..."
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border rounded focus:outline-none focus:border-[#6941A5]"
            />
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#616161]">Color:</span>
              {['#6941A5', '#0078D4', '#107C41', '#D13438', '#FFB900', '#B4009E'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewNotebookColor(c)}
                  className={`w-5 h-5 rounded-full ${newNotebookColor === c ? 'ring-2 ring-offset-1 ring-[#6941A5]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewNotebookOpen(false)}
                className="px-3 py-1 text-xs text-[#616161]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-[#6941A5] text-white rounded font-medium hover:bg-[#563588]"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Section Modal */}
      {isNewSectionOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateSection}
            className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full space-y-3"
          >
            <h3 className="font-semibold text-sm">Create New Section</h3>
            <input
              type="text"
              autoFocus
              placeholder="Section title..."
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border rounded focus:outline-none focus:border-[#6941A5]"
            />
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#616161]">Color:</span>
              {['#6941A5', '#0078D4', '#107C41', '#D13438', '#FFB900', '#008272'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewSectionColor(c)}
                  className={`w-5 h-5 rounded-full ${newSectionColor === c ? 'ring-2 ring-offset-1 ring-[#6941A5]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div>
              <label className="text-[11px] text-[#616161] block mb-0.5">
                Password Protection (Optional):
              </label>
              <input
                type="password"
                placeholder="Leave blank for open access..."
                value={newSectionPassword}
                onChange={(e) => setNewSectionPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border rounded focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewSectionOpen(false)}
                className="px-3 py-1 text-xs text-[#616161]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-[#6941A5] text-white rounded font-medium hover:bg-[#563588]"
              >
                Create Section
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Page Modal */}
      {isNewPageOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreatePage}
            className="bg-white rounded-lg shadow-xl p-5 max-w-sm w-full space-y-3"
          >
            <h3 className="font-semibold text-sm">Add New Page</h3>
            <input
              type="text"
              autoFocus
              placeholder="Page title (e.g. Distributed Consensus)..."
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border rounded focus:outline-none focus:border-[#6941A5]"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewPageOpen(false)}
                className="px-3 py-1 text-xs text-[#616161]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-[#6941A5] text-white rounded font-medium hover:bg-[#563588]"
              >
                Add Page
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Backstage View (Office / OneNote Style File Menu) */}
      <BackstageView
        onOpenExport={handleExport}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NotebookProvider>
      <MainLayout />
    </NotebookProvider>
  );
};
export default App;

