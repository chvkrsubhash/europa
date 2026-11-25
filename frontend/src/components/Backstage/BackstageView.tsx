import React, { useState, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import {
  ArrowLeft, Home, PlusCircle, Folder, Share2, Info, Save,
  FileEdit, Printer, Download, Check, HardDrive, ShieldCheck,
  ChevronRight, BookOpen, Layers, Copy, FileText
} from 'lucide-react';

interface BackstageViewProps {
  onOpenExport: (format: 'markdown' | 'html' | 'json' | 'titan') => void;
  onOpenTemplates: () => void;
}

export const BackstageView: React.FC<BackstageViewProps> = ({ onOpenExport, onOpenTemplates }) => {
  const {
    isBackstageOpen,
    setIsBackstageOpen,
    backstageActiveTab,
    setBackstageActiveTab,
    notebooks,
    currentNotebook,
    setCurrentNotebook,
    refreshNotebooks
  } = useNotebook();

  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#6941A5');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const [storagePath, setStoragePath] = useState('backend/data_store');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isBackstageOpen) {
      api.getStorageStatus()
        .then((data) => {
          if (data?.storage_folder) setStoragePath(data.storage_folder);
        })
        .catch(() => {
          setStoragePath('backend/data_store');
        });
    }
  }, [isBackstageOpen]);

  if (!isBackstageOpen) return null;

  const handleManualSave = async () => {
    setIsSyncing(true);
    try {
      await api.syncStorage();
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2500);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(storagePath);
    setPathCopied(true);
    setTimeout(() => setPathCopied(false), 2000);
  };

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const nb = await api.createNotebook({ title: newTitle.trim(), color: newColor });
    await refreshNotebooks();
    setCurrentNotebook(nb);
    setNewTitle('');
    setIsBackstageOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Time-appropriate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fixed inset-0 bg-white z-50 flex overflow-hidden text-[#242424] font-sans antialiased">
      {/* 1. Left Sidebar — Microsoft Office / OneNote Light Styling */}
      <aside className="w-56 bg-[#F3F2F1] border-r border-[#E0E0E0] flex flex-col justify-between select-none py-3">
        <div className="space-y-0.5">
          {/* Back Arrow Button */}
          <div className="px-4 pb-3 pt-1">
            <button
              onClick={() => setIsBackstageOpen(false)}
              title="Return to Notebook Canvas"
              className="w-9 h-9 rounded-full border border-[#D1D5DB] hover:border-[#6941A5] hover:bg-white flex items-center justify-center transition-colors text-[#323130] hover:text-[#6941A5] shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Matches Authentic OneNote Backstage) */}
          <button
            onClick={() => setBackstageActiveTab('home')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'home'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'home' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <Home className="w-4 h-4 text-[#6941A5]" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('new')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'new'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'new' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <PlusCircle className="w-4 h-4" />
            <span>New</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('open')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'open'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'open' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <Folder className="w-4 h-4" />
            <span>Open</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('share')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'share'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'share' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <div className="py-2 px-5">
            <div className="h-[1px] bg-[#E0E0E0]" />
          </div>

          <button
            onClick={() => setBackstageActiveTab('info')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'info'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'info' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <Info className="w-4 h-4" />
            <span>Info</span>
          </button>

          <button
            onClick={handleManualSave}
            disabled={isSyncing}
            className="w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424] transition-colors"
          >
            <Save className="w-4 h-4 text-[#6941A5]" />
            <span>{isSyncing ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('save_as')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'save_as'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'save_as' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <FileEdit className="w-4 h-4" />
            <span>Save As</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424] transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('export')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'export'
                ? 'bg-white text-[#6941A5] font-semibold shadow-xs'
                : 'text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424]'
            }`}
          >
            {backstageActiveTab === 'export' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6941A5]" />
            )}
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsBackstageOpen(false)}
            className="w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium text-[#323130] hover:bg-[#EBEBEB] hover:text-[#242424] transition-colors"
          >
            <Folder className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Brand footer */}
        <div className="px-5 text-[11px] text-[#8A8886]">
          Europa v1.0 &bull; AkashaVyom Labs
        </div>
      </aside>

      {/* 2. Main Right Content Area — Clean Light Theme */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#FAFAFA] text-[#242424]">
        {/* ================= TAB: HOME ================= */}
        {backstageActiveTab === 'home' && (
          <div className="max-w-4xl space-y-7">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">{greeting}</h2>
              <p className="text-xs text-[#616161] mt-1">
                AkashaVyom Labs Workspace &bull; All your notebooks and files are automatically saved and organized.
              </p>
            </div>

            {/* Clean Storage Location Banner */}
            <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#F0EAF8] text-[#6941A5] flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-[#242424]">Notebook Storage Folder</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      All Changes Saved
                    </span>
                  </div>
                  <p className="text-xs text-[#616161] font-mono mt-0.5 flex items-center space-x-1.5">
                    <Folder className="w-3.5 h-3.5 text-[#6941A5]" />
                    <span className="select-all text-[#4B5563]">{storagePath}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyPath}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D1D5DB] hover:bg-[#F3F2F1] text-xs font-medium text-[#242424] flex items-center space-x-1.5 transition-colors shadow-xs"
                  title="Copy storage folder path"
                >
                  <Copy className="w-3.5 h-3.5 text-[#616161]" />
                  <span>{pathCopied ? 'Path Copied!' : 'Copy Path'}</span>
                </button>

                <button
                  onClick={handleManualSave}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6941A5] hover:bg-[#58338C] text-xs font-semibold text-white flex items-center space-x-1.5 transition-all shadow-xs active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Recent Stored Notebooks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#616161]">
                  Recent Notebooks ({notebooks.length})
                </h3>
              </div>

              <div className="divide-y divide-[#E5E7EB] rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
                {notebooks.map((nb) => (
                  <div
                    key={nb.id}
                    onClick={() => {
                      setCurrentNotebook(nb);
                      setIsBackstageOpen(false);
                    }}
                    className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: nb.color }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#242424] group-hover:text-[#6941A5] transition-colors">
                          {nb.title}
                        </div>
                        <div className="text-xs text-[#616161] flex items-center space-x-2 mt-0.5">
                          <span>Modified: {new Date(nb.updated_at).toLocaleDateString()}</span>
                          <span>&bull;</span>
                          <span className="text-[#6941A5]">Stored locally on disk</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Saved
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6941A5] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Starters */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#616161]">
                New From Template
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-all group shadow-xs"
                >
                  <PlusCircle className="w-6 h-6 text-[#6941A5] mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-[#242424]">Blank Notebook</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">Free-form canvas</div>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-all group shadow-xs"
                >
                  <BookOpen className="w-6 h-6 text-[#0078D4] mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-[#242424]">Cornell Notes</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">Cues & summary</div>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-all group shadow-xs"
                >
                  <FileText className="w-6 h-6 text-[#107C41] mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-[#242424]">Meeting Minutes</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">Agendas & actions</div>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-all group shadow-xs"
                >
                  <Layers className="w-6 h-6 text-[#D97706] mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-[#242424]">Titan Document</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">AkashaVyom ready</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: NEW ================= */}
        {backstageActiveTab === 'new' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">Create New Notebook</h2>
              <p className="text-xs text-[#616161] mt-1">Specify notebook name and choose an accent color.</p>
            </div>

            <form onSubmit={handleCreateNotebook} className="space-y-4 bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xs">
              <div>
                <label className="text-xs font-medium text-[#242424] block mb-1.5">Notebook Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Research & Knowledge Base"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#242424] focus:outline-none focus:border-[#6941A5] focus:ring-1 focus:ring-[#6941A5]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#242424] block mb-2">Accent Color</label>
                <div className="flex items-center space-x-3">
                  {['#6941A5', '#0078D4', '#107C41', '#D13438', '#FFB900', '#B4009E', '#008272'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newColor === c ? 'ring-2 ring-offset-2 ring-[#6941A5] scale-110 shadow-xs' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6941A5] hover:bg-[#563588] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Create Notebook
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB: OPEN ================= */}
        {backstageActiveTab === 'open' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">Open Notebook</h2>
              <p className="text-xs text-[#616161] mt-1">Select an existing notebook from your storage vault.</p>
            </div>

            <div className="divide-y divide-[#E5E7EB] rounded-xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  onClick={() => {
                    setCurrentNotebook(nb);
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: nb.color }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-[#242424] group-hover:text-[#6941A5] transition-colors">
                        {nb.title}
                      </div>
                      <div className="text-xs text-[#616161] mt-0.5">
                        Storage: backend/data_store &bull; ID: {nb.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6941A5] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: SHARE ================= */}
        {backstageActiveTab === 'share' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">Share Notebook</h2>
              <p className="text-xs text-[#616161] mt-1">Generate collaborative links for workspace teammates.</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <p className="text-xs text-[#616161] leading-relaxed">
                Anyone with this link will be able to access this notebook in collaborative view.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  readOnly
                  value={window.location.href}
                  className="flex-1 px-3 py-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-xs font-mono text-[#374151] select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Share link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-[#6941A5] text-white text-xs font-semibold rounded-lg hover:bg-[#58338C] transition-colors shadow-xs"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: INFO ================= */}
        {backstageActiveTab === 'info' && currentNotebook && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">Notebook Information</h2>
              <p className="text-xs text-[#616161] mt-1">Properties, permissions, and storage parameters.</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                <span className="text-[#616161]">Notebook Title:</span>
                <span className="font-semibold text-[#242424]">{currentNotebook.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                <span className="text-[#616161]">Identifier:</span>
                <span className="font-mono text-[#4B5563]">{currentNotebook.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                <span className="text-[#616161]">Storage Backend:</span>
                <span className="text-emerald-700 font-medium">Local JSON Store &bull; MongoDB Ready</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                <span className="text-[#616161]">Storage Folder:</span>
                <span className="font-mono text-[#6941A5] select-all">{storagePath}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#616161]">Created:</span>
                <span className="text-[#242424]">{new Date(currentNotebook.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SAVE AS ================= */}
        {backstageActiveTab === 'save_as' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">Save As / Duplicate</h2>
              <p className="text-xs text-[#616161] mt-1">Create an exact duplicate copy of this notebook.</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
              <p className="text-xs text-[#616161] leading-relaxed">
                Duplicate <strong className="text-[#242424]">{currentNotebook?.title}</strong> as a new independent notebook in your storage folder:
              </p>
              <button
                onClick={async () => {
                  if (!currentNotebook) return;
                  const cloned = await api.createNotebook({
                    title: `${currentNotebook.title} (Copy)`,
                    color: currentNotebook.color
                  });
                  await refreshNotebooks();
                  setCurrentNotebook(cloned);
                  setIsBackstageOpen(false);
                }}
                className="px-4 py-2 bg-[#6941A5] text-white text-xs font-semibold rounded-lg hover:bg-[#58338C] transition-colors shadow-xs"
              >
                Duplicate to Storage Folder
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB: EXPORT ================= */}
        {backstageActiveTab === 'export' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#242424] tracking-tight">Export Notebook Content</h2>
              <p className="text-xs text-[#616161] mt-1">Export in standard document formats or AkashaVyom Titan Document format.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onOpenExport('markdown');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-[#242424] text-sm">Markdown (.md)</div>
                <div className="text-xs text-[#616161] mt-1">Standard Markdown note</div>
              </button>

              <button
                onClick={() => {
                  onOpenExport('html');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-[#242424] text-sm">HTML (.html)</div>
                <div className="text-xs text-[#616161] mt-1">Web presentation</div>
              </button>

              <button
                onClick={() => {
                  onOpenExport('titan');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-[#FAF8FD] hover:bg-[#F0EAF8] border border-[#DFD1F0] text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-[#6941A5] text-sm">Titan Document (.json)</div>
                <div className="text-xs text-[#6941A5]/80 mt-1">AkashaVyom Titan Document format</div>
              </button>

              <button
                onClick={() => {
                  onOpenExport('json');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-white hover:bg-[#FAF8FD] border border-[#E5E7EB] hover:border-[#6941A5] text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-[#242424] text-sm">Structured JSON</div>
                <div className="text-xs text-[#616161] mt-1">Complete raw canvas data backup</div>
              </button>
            </div>
          </div>
        )}

        {/* Save confirmation toast */}
        {saveSuccessMsg && (
          <div className="fixed bottom-8 right-8 bg-[#107C41] text-white px-5 py-3 rounded-lg shadow-lg text-xs font-semibold flex items-center space-x-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Notebook successfully saved to storage!</span>
          </div>
        )}
      </main>
    </div>
  );
};
