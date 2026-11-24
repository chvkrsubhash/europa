import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notebook, Section, Page, CanvasBlock, InkStroke, DrawingTool, PaperStyle, BlockType } from '../types';
import { api } from '../services/api';

export type SyncStatus = 'saved' | 'saving' | 'offline' | 'syncing' | 'error';

interface NotebookContextType {
  // Navigation State
  notebooks: Notebook[];
  currentNotebook: Notebook | null;
  sections: Section[];
  currentSection: Section | null;
  pages: Page[];
  currentPage: Page | null;
  
  // Selection & Actions
  setCurrentNotebook: (nb: Notebook) => void;
  setCurrentSection: (sec: Section) => void;
  setCurrentPage: (page: Page) => void;
  updatePageTitle: (title: string) => void;
  refreshNotebooks: () => Promise<void>;
  refreshSections: (nbId?: string) => Promise<void>;
  refreshPages: (secId?: string) => Promise<void>;
  
  // Canvas Blocks
  blocks: CanvasBlock[];
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  createBlock: (type: BlockType, x: number, y: number, content?: any) => Promise<CanvasBlock>;
  updateBlock: (id: string, updates: Partial<CanvasBlock>) => void;
  deleteBlock: (id: string) => Promise<void>;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  toggleLock: (id: string) => void;
  
  // Digital Ink State
  inkStrokes: InkStroke[];
  drawingTool: DrawingTool;
  setDrawingTool: React.Dispatch<React.SetStateAction<DrawingTool>>;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeThickness: number;
  setStrokeThickness: (thickness: number) => void;
  strokeOpacity: number;
  setStrokeOpacity: (opacity: number) => void;
  addInkStroke: (stroke: Omit<InkStroke, 'id' | 'page_id'>) => Promise<void>;
  clearInkStrokes: () => Promise<void>;
  
  // Canvas View & Paper Properties
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  paperStyle: PaperStyle;
  setPaperStyle: (style: PaperStyle) => void;
  ruleSpacing: number;
  setRuleSpacing: (spacing: number) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  
  // UI Panels
  activeRibbonTab: string;
  setActiveRibbonTab: (tab: string) => void;
  isLeftNavOpen: boolean;
  setIsLeftNavOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  activeSidebarPanel: 'ai' | 'tags' | 'tasks' | 'info' | 'search' | null;
  setActiveSidebarPanel: (panel: 'ai' | 'tags' | 'tasks' | 'info' | 'search' | null) => void;
  isBackstageOpen: boolean;
  setIsBackstageOpen: React.Dispatch<React.SetStateAction<boolean>>;
  backstageActiveTab: string;
  setBackstageActiveTab: React.Dispatch<React.SetStateAction<string>>;
  
  // Active Rich Text Editor instance for Ribbon formatting
  activeEditor: any | null;
  setActiveEditor: (editor: any | null) => void;
  
  // Sync & Undo/Redo
  syncStatus: SyncStatus;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const NotebookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  
  // Canvas Blocks
  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Ink
  const [inkStrokes, setInkStrokes] = useState<InkStroke[]>([]);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('select');
  const [strokeColor, setStrokeColor] = useState<string>('#6941A5');
  const [strokeThickness, setStrokeThickness] = useState<number>(2.5);
  const [strokeOpacity, setStrokeOpacity] = useState<number>(1.0);
  
  // Canvas View
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [ruleSpacing, setRuleSpacing] = useState<number>(32);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  
  // UI Panels
  const [activeRibbonTab, setActiveRibbonTab] = useState<string>('home');
  const [isLeftNavOpen, setIsLeftNavOpen] = useState<boolean>(true);
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<'ai' | 'tags' | 'tasks' | 'info' | 'search' | null>(null);
  const [isBackstageOpen, setIsBackstageOpen] = useState<boolean>(false);
  const [backstageActiveTab, setBackstageActiveTab] = useState<string>('home');
  const [activeEditor, setActiveEditor] = useState<any | null>(null);
  
  // Sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  
  // Undo / Redo history stack
  const historyRef = useRef<CanvasBlock[][]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  const saveHistory = useCallback((newBlocks: CanvasBlock[]) => {
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newBlocks)));
    if (nextHistory.length > 30) nextHistory.shift();
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevBlocks = historyRef.current[historyIndexRef.current];
      setBlocks(JSON.parse(JSON.stringify(prevBlocks)));
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      if (currentPage) {
        api.batchUpdateBlocks(currentPage.id, prevBlocks);
      }
    }
  }, [currentPage]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextBlocks = historyRef.current[historyIndexRef.current];
      setBlocks(JSON.parse(JSON.stringify(nextBlocks)));
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      if (currentPage) {
        api.batchUpdateBlocks(currentPage.id, nextBlocks);
      }
    }
  }, [currentPage]);

  // Load Notebooks
  const refreshNotebooks = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const nbs = await api.getNotebooks();
      setNotebooks(nbs);
      if (nbs.length > 0 && !currentNotebook) {
        setCurrentNotebook(nbs[0]);
      }
      setSyncStatus('saved');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  }, [currentNotebook]);

  // Load Sections
  const refreshSections = useCallback(async (nbId?: string) => {
    const targetNbId = nbId || currentNotebook?.id;
    if (!targetNbId) return;
    try {
      const secs = await api.getSections(targetNbId);
      setSections(secs);
      if (secs.length > 0) {
        // If currentSection not in new list, pick first
        if (!currentSection || !secs.some(s => s.id === currentSection.id)) {
          setCurrentSection(secs[0]);
        }
      } else {
        setCurrentSection(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentNotebook, currentSection]);

  // Load Pages
  const refreshPages = useCallback(async (secId?: string) => {
    const targetSecId = secId || currentSection?.id;
    if (!targetSecId) return;
    try {
      const pgs = await api.getPages(targetSecId);
      setPages(pgs);
      if (pgs.length > 0) {
        if (!currentPage || !pgs.some(p => p.id === currentPage.id)) {
          setCurrentPage(pgs[0]);
        }
      } else {
        setCurrentPage(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentSection, currentPage]);

  // Update Page Title
  const updatePageTitle = useCallback((title: string) => {
    if (!currentPage) return;
    setCurrentPage(prev => prev ? { ...prev, title } : null);
    setPages(prev => prev.map(p => p.id === currentPage.id ? { ...p, title } : p));
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await api.updatePage(currentPage.id, { title });
      } catch (e) {
        console.error(e);
      }
    }, 400);
  }, [currentPage]);

  // Initial load
  useEffect(() => {
    refreshNotebooks();
  }, []);

  // When currentNotebook changes, fetch sections
  useEffect(() => {
    if (currentNotebook) {
      refreshSections(currentNotebook.id);
    }
  }, [currentNotebook]);

  // When currentSection changes, fetch pages
  useEffect(() => {
    if (currentSection) {
      refreshPages(currentSection.id);
    }
  }, [currentSection]);

  // When currentPage changes, load blocks, ink, and page formatting
  useEffect(() => {
    if (currentPage) {
      setPaperStyle(currentPage.paper_style || 'ruled');
      setRuleSpacing(currentPage.rule_spacing || 32);
      setBackgroundColor(currentPage.background_color || '#FFFFFF');
      
      // Load blocks and ink
      setSyncStatus('syncing');
      Promise.all([
        api.getPageBlocks(currentPage.id),
        api.getPageInk(currentPage.id)
      ]).then(([blks, ink]) => {
        setBlocks(blks);
        setInkStrokes(ink);
        historyRef.current = [JSON.parse(JSON.stringify(blks))];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);
        setSyncStatus('saved');
      }).catch(err => {
        console.error(err);
        setSyncStatus('error');
      });
    } else {
      setBlocks([]);
      setInkStrokes([]);
    }
  }, [currentPage?.id]);

  // Block management
  const createBlock = useCallback(async (type: BlockType, x: number, y: number, content?: any): Promise<CanvasBlock> => {
    if (!currentPage) throw new Error("No active page");
    setSyncStatus('saving');
    
    let defaultContent = content;
    if (defaultContent === undefined) {
      if (type === 'text') defaultContent = '<p></p>';
      else if (type === 'checklist') defaultContent = [{ text: 'To do item', checked: false }];
      else if (type === 'callout') defaultContent = 'Important note or takeaway';
      else if (type === 'code') defaultContent = '// Code snippet\nfunction example() {\n  return true;\n}';
      else if (type === 'equation') defaultContent = 'E = mc^2';
      else defaultContent = '';
    }

    const newBlockData: Partial<CanvasBlock> = {
      page_id: currentPage.id,
      block_type: type,
      x: Math.max(20, Math.round(x)),
      y: Math.max(20, Math.round(y)),
      width: type === 'callout' ? 360 : (type === 'code' ? 460 : 400),
      height: undefined,
      layer_order: blocks.length,
      content: defaultContent,
      formatting: {},
      is_locked: false
    };

    const saved = await api.createBlock(currentPage.id, newBlockData);
    const updated = [...blocks, saved];
    setBlocks(updated);
    setSelectedBlockId(saved.id);
    saveHistory(updated);
    setSyncStatus('saved');
    return saved;
  }, [currentPage, blocks, saveHistory]);

  const debounceTimerRef = useRef<any>(null);

  const updateBlock = useCallback((id: string, updates: Partial<CanvasBlock>) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...updates, updated_at: new Date().toISOString() };
      return updated;
    });

    setSyncStatus('saving');
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await api.updateBlock(id, updates);
        setSyncStatus('saved');
      } catch (e) {
        setSyncStatus('error');
      }
    }, 400);
  }, []);

  const deleteBlock = useCallback(async (id: string) => {
    setSyncStatus('saving');
    await api.deleteBlock(id);
    setBlocks(prev => {
      const filtered = prev.filter(b => b.id !== id);
      saveHistory(filtered);
      return filtered;
    });
    if (selectedBlockId === id) setSelectedBlockId(null);
    setSyncStatus('saved');
  }, [selectedBlockId, saveHistory]);

  const bringForward = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const currentOrder = prev[idx].layer_order;
      const updated = prev.map(b => b.id === id ? { ...b, layer_order: currentOrder + 1 } : b);
      if (currentPage) api.updateBlock(id, { layer_order: currentOrder + 1 });
      return updated;
    });
  }, [currentPage]);

  const sendBackward = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const currentOrder = prev[idx].layer_order;
      const newOrder = Math.max(0, currentOrder - 1);
      const updated = prev.map(b => b.id === id ? { ...b, layer_order: newOrder } : b);
      if (currentPage) api.updateBlock(id, { layer_order: newOrder });
      return updated;
    });
  }, [currentPage]);

  const toggleLock = useCallback((id: string) => {
    setBlocks(prev => {
      const block = prev.find(b => b.id === id);
      if (!block) return prev;
      const newLock = !block.is_locked;
      if (currentPage) api.updateBlock(id, { is_locked: newLock });
      return prev.map(b => b.id === id ? { ...b, is_locked: newLock } : b);
    });
  }, [currentPage]);

  // Ink Strokes (Optimistic synchronous update so consecutive strokes never disappear)
  const addInkStroke = useCallback(async (strokeData: Omit<InkStroke, 'id' | 'page_id'>) => {
    if (!currentPage) return;
    const tempId = `ink_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newStroke: InkStroke = {
      id: tempId,
      page_id: currentPage.id,
      ...strokeData
    };
    // Immediately commit to local state synchronously
    setInkStrokes(prev => [...prev, newStroke]);

    try {
      const saved = await api.addInkStroke(currentPage.id, strokeData);
      // Replace temporary id with server id
      setInkStrokes(prev => prev.map(s => s.id === tempId ? saved : s));
    } catch (e) {
      console.error(e);
    }
  }, [currentPage]);

  const clearInkStrokes = useCallback(async () => {
    if (!currentPage) return;
    try {
      await api.clearPageInk(currentPage.id);
      setInkStrokes([]);
    } catch (e) {
      console.error(e);
    }
  }, [currentPage]);

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        currentNotebook,
        sections,
        currentSection,
        pages,
        currentPage,
        setCurrentNotebook,
        setCurrentSection,
        setCurrentPage,
        updatePageTitle,
        refreshNotebooks,
        refreshSections,
        refreshPages,
        blocks,
        selectedBlockId,
        setSelectedBlockId,
        createBlock,
        updateBlock,
        deleteBlock,
        bringForward,
        sendBackward,
        toggleLock,
        inkStrokes,
        drawingTool,
        setDrawingTool,
        strokeColor,
        setStrokeColor,
        strokeThickness,
        setStrokeThickness,
        strokeOpacity,
        setStrokeOpacity,
        addInkStroke,
        clearInkStrokes,
        zoom,
        setZoom,
        pan,
        setPan,
        paperStyle,
        setPaperStyle,
        ruleSpacing,
        setRuleSpacing,
        backgroundColor,
        setBackgroundColor,
        activeRibbonTab,
        setActiveRibbonTab,
        isLeftNavOpen,
        setIsLeftNavOpen,
        activeSidebarPanel,
        setActiveSidebarPanel,
        isBackstageOpen,
        setIsBackstageOpen,
        backstageActiveTab,
        setBackstageActiveTab,
        activeEditor,
        setActiveEditor,
        syncStatus,
        undo,
        redo,
        canUndo,
        canRedo
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

export const useNotebook = () => {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebook must be used within a NotebookProvider');
  }
  return context;
};
