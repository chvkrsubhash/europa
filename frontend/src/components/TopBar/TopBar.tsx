import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { Notebook } from '../../types';
import {
  Search,
  RotateCcw,
  RotateCw,
  Share2,
  Sparkles,
  Settings,
  User,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  Book,
  Plus
} from 'lucide-react';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  onOpenNewNotebook: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenShare,
  onOpenSettings,
  onOpenNewNotebook,
}) => {
  const {
    currentNotebook,
    notebooks,
    setCurrentNotebook,
    undo,
    redo,
    canUndo,
    canRedo,
    syncStatus,
    activeSidebarPanel,
    setActiveSidebarPanel
  } = useNotebook();

  const [isNotebookMenuOpen, setIsNotebookMenuOpen] = useState(false);

  return (
    <header className="h-12 bg-[#F5F5F5] border-b border-[#E0E0E0] px-3 flex items-center justify-between select-none z-30">
      {/* Left: Product Logo & Brand Attribution */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img
            src="/europa-logo.png"
            alt="Europa"
            className="w-8 h-8 rounded-md object-contain shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-[#242424]">Europa</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-[#F0EAF8] text-[#6941A5] rounded">
                Pro
              </span>
            </div>
            <div className="text-[10px] text-[#616161] -mt-1 font-medium">
              AkashaVyom Labs
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-[#E0E0E0] mx-1" />

        {/* Notebook Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsNotebookMenuOpen(!isNotebookMenuOpen)}
            className="flex items-center space-x-2 px-2.5 py-1 rounded text-xs font-medium text-[#242424] hover:bg-[#EBEBEB] transition-colors"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentNotebook?.color || '#6941A5' }}
            />
            <span className="max-w-[140px] truncate">{currentNotebook?.title || 'Select Notebook'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#616161]" />
          </button>

          {isNotebookMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-[#E0E0E0] rounded-md shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                Your Notebooks
              </div>
              {notebooks.map((nb: Notebook) => (
                <button
                  key={nb.id}
                  onClick={() => {
                    setCurrentNotebook(nb);
                    setIsNotebookMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F0EAF8] hover:text-[#6941A5] ${
                    currentNotebook?.id === nb.id ? 'bg-[#F0EAF8] text-[#6941A5] font-medium' : 'text-[#242424]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: nb.color }} />
                    <span className="truncate">{nb.title}</span>
                  </div>
                </button>
              ))}
              <div className="border-t border-[#E0E0E0] my-1" />
              <button
                onClick={() => {
                  setIsNotebookMenuOpen(false);
                  onOpenNewNotebook();
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#6941A5] font-medium hover:bg-[#F0EAF8] flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Notebook...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center space-x-2 bg-white hover:bg-white/90 border border-[#E0E0E0] rounded-md px-3 py-1 text-xs text-[#8A8A8A] shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#6941A5]"
        >
          <Search className="w-3.5 h-3.5 text-[#616161]" />
          <span className="flex-1 text-left">Search notes, tags, sections (Ctrl+F)</span>
          <kbd className="text-[10px] bg-[#F5F5F5] border border-[#E0E0E0] px-1.5 py-0.5 rounded text-[#616161]">
            Ctrl+E
          </kbd>
        </button>
      </div>

      {/* Right Controls: Undo/Redo, Sync Status, Share, AI Toggle, Settings, User */}
      <div className="flex items-center space-x-2">
        {/* Undo & Redo */}
        <div className="flex items-center space-x-0.5 mr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-[#EBEBEB] disabled:opacity-40 text-[#616161] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-[#EBEBEB] disabled:opacity-40 text-[#616161] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-white border border-[#E0E0E0] rounded text-[11px] text-[#616161]">
          {syncStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Saved</span>
            </>
          )}
          {syncStatus === 'saving' && (
            <>
              <RefreshCw className="w-3 h-3 text-[#6941A5] animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {syncStatus === 'syncing' && (
            <>
              <RefreshCw className="w-3 h-3 text-[#6941A5] animate-spin" />
              <span>Syncing</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <AlertCircle className="w-3 h-3 text-[#D13438]" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-[#242424] hover:bg-[#EBEBEB] border border-[#E0E0E0] rounded bg-white transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-[#616161]" />
          <span>Share</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setActiveSidebarPanel(activeSidebarPanel === 'ai' ? null : 'ai')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            activeSidebarPanel === 'ai'
              ? 'bg-[#6941A5] text-white shadow-sm'
              : 'bg-[#F0EAF8] text-[#6941A5] hover:bg-[#DFD1F0]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Assistant</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Workspace Settings"
          className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#616161] transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="w-7 h-7 rounded-full bg-[#6941A5] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
          A
        </div>
      </div>
    </header>
  );
};
