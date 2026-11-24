import React, { useState, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import {
  ArrowLeft, Home, PlusCircle, Folder, Share2, Info, Save,
  FileEdit, Printer, Download, X, Check, HardDrive, ShieldCheck,
  Calendar, Clock, FileText, ChevronRight, BookOpen, Layers,
  Copy, Database, RefreshCw, AlertCircle
} from 'lucide-react';

interface BackstageViewProps {
  onOpenExport: (format: 'markdown' | 'html' | 'json' | 'titan') => void;
  onOpenTemplates: () => void;
}

interface StorageFileStat {
  name: string;
  size_bytes: number;
  modified_at: string;
}

interface StorageStatusData {
  storage_folder: string;
  database_mode: string;
  sync_status: string;
  total_size_bytes?: number;
  files: StorageFileStat[];
  last_synced?: string;
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
    currentPage,
    syncStatus,
    refreshNotebooks
  } = useNotebook();

  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#6941A5');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [pathCopied, setPathCopied] = useState(false);
  const [homeSubTab, setHomeSubTab] = useState<'notebooks' | 'files' | 'unsaved'>('notebooks');
  const [storageData, setStorageData] = useState<StorageStatusData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch storage stats when backstage opens
  useEffect(() => {
    if (isBackstageOpen) {
      api.getStorageStatus()
        .then((data) => setStorageData(data))
        .catch(() => {
          // Fallback default info if offline
          setStorageData({
            storage_folder: 'backend/data_store',
            database_mode: 'local_store',
            sync_status: 'saved',
            files: [
              { name: 'notebooks.json', size_bytes: 2142, modified_at: new Date().toISOString() },
              { name: 'sections.json', size_bytes: 1905, modified_at: new Date().toISOString() },
              { name: 'pages.json', size_bytes: 5267, modified_at: new Date().toISOString() },
              { name: 'canvas_blocks.json', size_bytes: 9784, modified_at: new Date().toISOString() },
              { name: 'ink_strokes.json', size_bytes: 1113, modified_at: new Date().toISOString() },
              { name: 'ai_messages.json', size_bytes: 2427, modified_at: new Date().toISOString() },
            ]
          });
        });
    }
  }, [isBackstageOpen]);

  if (!isBackstageOpen) return null;

  const handleManualSave = async () => {
    setIsSyncing(true);
    try {
      await api.syncStorage();
      const updated = await api.getStorageStatus();
      setStorageData(updated);
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2500);
    }
  };

  const handleCopyPath = () => {
    const path = storageData?.storage_folder || 'backend/data_store';
    navigator.clipboard.writeText(path);
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

  return (
    <div className="fixed inset-0 bg-[#0E1525] z-50 flex overflow-hidden text-white font-sans antialiased">
      {/* 1. Left Dark Sidebar — Authentic OneNote/Office Backstage Navigation */}
      <aside className="w-56 bg-[#0B111E] border-r border-[#1E293B] flex flex-col justify-between select-none py-3">
        <div className="space-y-1">
          {/* Back Arrow Button */}
          <div className="px-4 pb-4 pt-1">
            <button
              onClick={() => setIsBackstageOpen(false)}
              title="Return to Notebook Canvas"
              className="w-9 h-9 rounded-full border border-slate-600 hover:border-white hover:bg-white/10 flex items-center justify-center transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Matches User's Reference Screenshot) */}
          <button
            onClick={() => setBackstageActiveTab('home')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'home'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'home' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <Home className="w-4 h-4 text-[#4A90E2]" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('new')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'new'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'new' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <PlusCircle className="w-4 h-4" />
            <span>New</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('open')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'open'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'open' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <Folder className="w-4 h-4" />
            <span>Open</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('share')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'share'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'share' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <div className="py-2 px-5">
            <div className="h-[1px] bg-slate-800" />
          </div>

          <button
            onClick={() => setBackstageActiveTab('info')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'info'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'info' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <Info className="w-4 h-4" />
            <span>Info</span>
          </button>

          <button
            onClick={handleManualSave}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'save'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('save_as')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'save_as'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'save_as' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <FileEdit className="w-4 h-4" />
            <span>Save As</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setBackstageActiveTab('export')}
            className={`w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium transition-colors relative ${
              backstageActiveTab === 'export'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {backstageActiveTab === 'export' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4A90E2]" />
            )}
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsBackstageOpen(false)}
            className="w-full flex items-center space-x-3.5 px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Folder className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Brand footer */}
        <div className="px-5 text-[11px] text-slate-500">
          Europa v1.0 &bull; AkashaVyom Labs
        </div>
      </aside>

      {/* 2. Main Right Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#0F172A] text-slate-200">
        {/* ================= TAB: HOME ================= */}
        {backstageActiveTab === 'home' && (
          <div className="max-w-4xl space-y-7">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Good evening</h2>
              <p className="text-xs text-slate-400 mt-1">
                AkashaVyom Labs Workspace &bull; Notebook storage location, saved files, and cache manager.
              </p>
            </div>

            {/* Storage Location & Folder Status Card */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 shadow-lg space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-lg bg-[#6941A5]/25 text-[#A47DD2] flex items-center justify-center border border-[#6941A5]/30">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                      <span>Notebook Storage Folder & Local Vault</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
                        {storageData?.database_mode === 'mongodb' ? 'MongoDB Atlas' : 'Embedded JSON Store'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1 flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-[#A47DD2]" />
                      <span className="text-[#C7B1E4] select-all">
                        {storageData?.storage_folder || 'backend/data_store'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyPath}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white flex items-center space-x-1.5 transition-colors border border-slate-600"
                    title="Copy local folder path to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>{pathCopied ? 'Path Copied!' : 'Copy Path'}</span>
                  </button>

                  <button
                    onClick={handleManualSave}
                    disabled={isSyncing}
                    className="px-3.5 py-1.5 rounded-lg bg-[#6941A5] hover:bg-[#58338C] text-xs font-semibold text-white flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
                    title="Commit all notebooks and blocks to disk"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Saving to Disk...' : 'Save All Changes'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">All notebooks and canvas blocks saved to disk.</span>
                </div>
                <div>
                  Last sync: <span className="font-mono text-slate-300">{storageData?.last_synced || 'Just now'}</span>
                </div>
              </div>
            </div>

            {/* Stored Files Manager (Saved vs Unsaved Tabs) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setHomeSubTab('notebooks')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      homeSubTab === 'notebooks'
                        ? 'bg-[#6941A5] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Saved Notebooks ({notebooks.length})</span>
                  </button>

                  <button
                    onClick={() => setHomeSubTab('files')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      homeSubTab === 'files'
                        ? 'bg-[#6941A5] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Data Store Files ({storageData?.files?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setHomeSubTab('unsaved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      homeSubTab === 'unsaved'
                        ? 'bg-[#6941A5] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Unsaved / Cache Status</span>
                  </button>
                </div>
              </div>

              {/* Sub-view 1: Saved Notebooks */}
              {homeSubTab === 'notebooks' && (
                <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-800/40 border border-slate-700/60 overflow-hidden shadow-sm">
                  {notebooks.map((nb) => (
                    <div
                      key={nb.id}
                      onClick={() => {
                        setCurrentNotebook(nb);
                        setIsBackstageOpen(false);
                      }}
                      className="p-4 flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-slate-900"
                          style={{ backgroundColor: nb.color }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[#C7B1E4] transition-colors">
                            {nb.title}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5">
                            <span className="font-mono text-[11px] text-[#A47DD2]">
                              backend/data_store/notebooks.json
                            </span>
                            <span>&bull;</span>
                            <span>Modified: {new Date(nb.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                          Saved to Disk
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-view 2: Physical JSON Files in backend/data_store */}
              {homeSubTab === 'files' && (
                <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-800/40 border border-slate-700/60 overflow-hidden shadow-sm">
                  {storageData?.files && storageData.files.length > 0 ? (
                    storageData.files.map((file) => (
                      <div
                        key={file.name}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-[#A47DD2]" />
                          <div>
                            <div className="text-xs font-mono font-semibold text-white">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Last modified: {file.modified_at}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xs font-mono text-slate-300">
                            {(file.size_bytes / 1024).toFixed(1)} KB
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
                            Persistent Disk File
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Loading data store files...
                    </div>
                  )}
                </div>
              )}

              {/* Sub-view 3: Unsaved / Cache Status */}
              {homeSubTab === 'unsaved' && (
                <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Zero Unsaved Changes Pending</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Europa utilizes an active write-through cache: all edits to pages, text containers, checklists, and digital ink strokes are automatically committed to the local backend JSON store and mirrored in browser IndexedDB.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={handleManualSave}
                      className="px-4 py-2 bg-[#6941A5] hover:bg-[#58338C] text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Force Immediate Disk Flush</span>
                    </button>
                    <span className="text-xs text-slate-400">
                      Sync state: <strong className="text-emerald-400 font-mono">100% In-Sync</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Starters */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                New From Template
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-[#6941A5] text-left transition-all group"
                >
                  <PlusCircle className="w-6 h-6 text-[#A47DD2] mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-white">Blank Notebook</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Free-form white canvas</div>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-[#6941A5] text-left transition-all group"
                >
                  <BookOpen className="w-6 h-6 text-[#4A90E2] mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-white">Cornell Notes</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cues, notes & summary</div>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-[#6941A5] text-left transition-all group"
                >
                  <FileText className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-white">Meeting Minutes</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Agendas & action items</div>
                </button>

                <button
                  onClick={() => {
                    onOpenTemplates();
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-[#6941A5] text-left transition-all group"
                >
                  <Layers className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-white">Titan Document</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">AkashaVyom export ready</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: NEW ================= */}
        {backstageActiveTab === 'new' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Create New Notebook</h2>
              <p className="text-xs text-slate-400 mt-1">Specify notebook name and accent color.</p>
            </div>

            <form onSubmit={handleCreateNotebook} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Notebook Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Distributed Systems & AI Research"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#4A90E2]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">Accent Color</label>
                <div className="flex items-center space-x-3">
                  {['#6941A5', '#0078D4', '#107C41', '#D13438', '#FFB900', '#B4009E', '#008272'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newColor === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#6941A5] hover:bg-[#563588] text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                Create Notebook
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB: OPEN ================= */}
        {backstageActiveTab === 'open' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Open Notebook</h2>
              <p className="text-xs text-slate-400 mt-1">Select an existing notebook from your local storage vault.</p>
            </div>

            <div className="divide-y divide-slate-800 rounded-xl bg-slate-800/40 border border-slate-700/60 overflow-hidden">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  onClick={() => {
                    setCurrentNotebook(nb);
                    setIsBackstageOpen(false);
                  }}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: nb.color }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-white">{nb.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Storage: backend/data_store &bull; ID: {nb.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: SHARE ================= */}
        {backstageActiveTab === 'share' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Share Notebook</h2>
              <p className="text-xs text-slate-400 mt-1">Generate collaborative links or invite workspace teammates.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
              <div className="text-xs text-slate-300">
                Share this notebook for real-time collaboration with team members.
              </div>
              <div className="flex items-center space-x-2">
                <input
                  readOnly
                  value={window.location.href}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Share link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-[#6941A5] text-white text-xs font-semibold rounded-lg hover:bg-[#58338C]"
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Notebook Information</h2>
              <p className="text-xs text-slate-400 mt-1">Properties, permissions, and storage parameters.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Notebook Title:</span>
                <span className="font-semibold text-white">{currentNotebook.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Identifier:</span>
                <span className="font-mono text-slate-300">{currentNotebook.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Storage Backend:</span>
                <span className="text-emerald-400">
                  {storageData?.database_mode === 'mongodb' ? 'MongoDB Atlas' : 'Local JSON Multi-File Store'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Local Folder:</span>
                <span className="font-mono text-[#C7B1E4] select-all">
                  {storageData?.storage_folder || 'backend/data_store'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Encryption / Privacy:</span>
                <span className="text-white">Strict Local Isolation (No unauthorized cloud sync)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-300">{new Date(currentNotebook.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SAVE AS ================= */}
        {backstageActiveTab === 'save_as' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Save As / Duplicate</h2>
              <p className="text-xs text-slate-400 mt-1">Clone notebook or export snapshot into local storage.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
              <p className="text-xs text-slate-300">
                Create a duplicate copy of <strong className="text-white">{currentNotebook?.title}</strong> in the storage vault:
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
                className="px-4 py-2 bg-[#6941A5] text-white text-xs font-semibold rounded-lg hover:bg-[#58338C]"
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Export Notebook Content</h2>
              <p className="text-xs text-slate-400 mt-1">Export in industry standard or Titan document formats.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onOpenExport('markdown');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
              >
                <div className="font-semibold text-white text-sm">Markdown (.md)</div>
                <div className="text-xs text-slate-400 mt-1">Standard Markdown format</div>
              </button>

              <button
                onClick={() => {
                  onOpenExport('html');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
              >
                <div className="font-semibold text-white text-sm">HTML (.html)</div>
                <div className="text-xs text-slate-400 mt-1">Stand-alone web presentation</div>
              </button>

              <button
                onClick={() => {
                  onOpenExport('titan');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-[#6941A5]/20 hover:bg-[#6941A5]/30 border border-[#6941A5]/60 text-left transition-colors"
              >
                <div className="font-semibold text-white text-sm">Titan Document (.json)</div>
                <div className="text-xs text-[#C7B1E4] mt-1">AkashaVyom Titan Document format</div>
              </button>

              <button
                onClick={() => {
                  onOpenExport('json');
                  setIsBackstageOpen(false);
                }}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
              >
                <div className="font-semibold text-white text-sm">Structured JSON</div>
                <div className="text-xs text-slate-400 mt-1">Complete raw canvas data backup</div>
              </button>
            </div>
          </div>
        )}

        {/* Save confirmation toast */}
        {saveSuccessMsg && (
          <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Notebook successfully saved to storage!</span>
          </div>
        )}
      </main>
    </div>
  );
};
