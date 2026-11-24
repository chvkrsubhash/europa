import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import {
  Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, CheckSquare, Sparkles, Highlighter, Palette,
  PenTool, Eraser, Square, Circle, ArrowRight, Minus, Maximize2,
  Table, Image, Paperclip, Link, Code, Mic, FileText, Layout,
  Sliders, Sun, Moon, Eye, ZoomIn, ZoomOut, Check, HelpCircle,
  Tag, Download, Upload, SplitSquareVertical, Layers
} from 'lucide-react';

interface RibbonNavProps {
  onOpenTemplates: () => void;
  onOpenExport: (format: 'markdown' | 'html' | 'json' | 'titan') => void;
}

export const RibbonNav: React.FC<RibbonNavProps> = ({ onOpenTemplates, onOpenExport }) => {
  const {
    activeRibbonTab,
    setActiveRibbonTab,
    createBlock,
    drawingTool,
    setDrawingTool,
    strokeColor,
    setStrokeColor,
    strokeThickness,
    setStrokeThickness,
    clearInkStrokes,
    paperStyle,
    setPaperStyle,
    ruleSpacing,
    setRuleSpacing,
    zoom,
    setZoom,
    setActiveSidebarPanel,
    activeSidebarPanel
  } = useNotebook();

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'insert', label: 'Insert' },
    { id: 'draw', label: 'Draw' },
    { id: 'view', label: 'View' },
    { id: 'review', label: 'Review' },
    { id: 'ai', label: 'AI' },
    { id: 'file', label: 'File' },
    { id: 'help', label: 'Help' },
  ];

  return (
    <div className="bg-[#FAF8FD] border-b border-[#E0E0E0] select-none text-[#242424]">
      {/* Tab Headers */}
      <div className="flex items-center px-2 space-x-1 border-b border-[#E5E0EE] bg-[#F5F5F5]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRibbonTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-all ${
              activeRibbonTab === tab.id
                ? 'border-[#6941A5] text-[#6941A5] bg-white font-semibold'
                : 'border-transparent text-[#616161] hover:text-[#242424] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Ribbon Content Controls */}
      <div className="h-16 px-3 flex items-center space-x-4 overflow-x-auto text-xs py-1">
        {/* ================= HOME TAB ================= */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center space-x-3 divide-x divide-[#E0E0E0]">
            {/* Clipboard & Text Actions */}
            <div className="flex items-center space-x-1 pr-2">
              <button
                title="New Text Note"
                onClick={() => createBlock('text', 60, 160)}
                className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
              >
                <Type className="w-4 h-4 text-[#6941A5]" />
                <span className="text-[10px] mt-0.5">Text</span>
              </button>
              <button
                title="New Checklist"
                onClick={() => createBlock('checklist', 60, 200)}
                className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
              >
                <CheckSquare className="w-4 h-4 text-[#6941A5]" />
                <span className="text-[10px] mt-0.5">Checklist</span>
              </button>
              <button
                title="New Callout Note"
                onClick={() => createBlock('callout', 60, 240)}
                className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
              >
                <Tag className="w-4 h-4 text-[#6941A5]" />
                <span className="text-[10px] mt-0.5">Callout</span>
              </button>
            </div>

            {/* Basic Formatting Buttons */}
            <div className="flex items-center space-x-1 px-2">
              <button
                title="Bold (Ctrl+B)"
                onClick={() => document.execCommand('bold')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <Bold className="w-3.5 h-3.5 font-bold" />
              </button>
              <button
                title="Italic (Ctrl+I)"
                onClick={() => document.execCommand('italic')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                title="Underline (Ctrl+U)"
                onClick={() => document.execCommand('underline')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                title="Strikethrough"
                onClick={() => document.execCommand('strikeThrough')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 px-2">
              <button
                title="Align Left"
                onClick={() => document.execCommand('justifyLeft')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                title="Align Center"
                onClick={() => document.execCommand('justifyCenter')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                title="Align Right"
                onClick={() => document.execCommand('justifyRight')}
                className="p-1.5 rounded hover:bg-[#EBEBEB] text-[#242424]"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tags & Task Summaries */}
            <div className="flex items-center space-x-2 px-2">
              <button
                onClick={() => setActiveSidebarPanel(activeSidebarPanel === 'tags' ? null : 'tags')}
                className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#F0EAF8] text-[#6941A5] font-medium hover:bg-[#DFD1F0]"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Tags Summary</span>
              </button>
              <button
                onClick={() => setActiveSidebarPanel(activeSidebarPanel === 'tasks' ? null : 'tasks')}
                className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#F0EAF8] text-[#6941A5] font-medium hover:bg-[#DFD1F0]"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks Vault</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= INSERT TAB ================= */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenTemplates}
              className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#6941A5] font-medium"
            >
              <Layout className="w-4 h-4 text-[#6941A5]" />
              <span className="text-[10px] mt-0.5">Templates</span>
            </button>
            <button
              onClick={() => createBlock('equation', 100, 150)}
              className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
            >
              <span className="font-mono font-bold text-sm text-[#6941A5]">∑x</span>
              <span className="text-[10px] mt-0.5">Equation</span>
            </button>
            <button
              onClick={() => createBlock('code', 100, 200)}
              className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
            >
              <Code className="w-4 h-4 text-[#6941A5]" />
              <span className="text-[10px] mt-0.5">Code</span>
            </button>
            <button
              onClick={() => createBlock('audio', 100, 250)}
              className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
            >
              <Mic className="w-4 h-4 text-[#6941A5]" />
              <span className="text-[10px] mt-0.5">Audio Note</span>
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter Image URL:');
                if (url) createBlock('image', 100, 200, url);
              }}
              className="flex flex-col items-center p-1.5 rounded hover:bg-[#F0EAF8] text-[#242424]"
            >
              <Image className="w-4 h-4 text-[#6941A5]" />
              <span className="text-[10px] mt-0.5">Picture</span>
            </button>
          </div>
        )}

        {/* ================= DRAW TAB ================= */}
        {activeRibbonTab === 'draw' && (
          <div className="flex items-center space-x-3 divide-x divide-[#E0E0E0]">
            <div className="flex items-center space-x-1 pr-2">
              <button
                onClick={() => setDrawingTool('select')}
                className={`p-1.5 rounded flex items-center space-x-1 ${
                  drawingTool === 'select' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB] text-[#242424]'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span className="text-[11px]">Select</span>
              </button>
              <button
                onClick={() => setDrawingTool('pen')}
                className={`p-1.5 rounded flex items-center space-x-1 ${
                  drawingTool === 'pen' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB] text-[#242424]'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="text-[11px]">Pen</span>
              </button>
              <button
                onClick={() => setDrawingTool('highlighter')}
                className={`p-1.5 rounded flex items-center space-x-1 ${
                  drawingTool === 'highlighter' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB] text-[#242424]'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">Highlighter</span>
              </button>
              <button
                onClick={() => setDrawingTool('eraser')}
                className={`p-1.5 rounded flex items-center space-x-1 ${
                  drawingTool === 'eraser' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB] text-[#242424]'
                }`}
              >
                <Eraser className="w-3.5 h-3.5 text-[#D13438]" />
                <span className="text-[11px]">Eraser</span>
              </button>
            </div>

            {/* Shapes */}
            <div className="flex items-center space-x-1 px-2">
              <button
                title="Line"
                onClick={() => setDrawingTool('line')}
                className={`p-1.5 rounded ${drawingTool === 'line' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB]'}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                title="Arrow"
                onClick={() => setDrawingTool('arrow')}
                className={`p-1.5 rounded ${drawingTool === 'arrow' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB]'}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                title="Rectangle"
                onClick={() => setDrawingTool('rectangle')}
                className={`p-1.5 rounded ${drawingTool === 'rectangle' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB]'}`}
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                title="Circle"
                onClick={() => setDrawingTool('circle')}
                className={`p-1.5 rounded ${drawingTool === 'circle' ? 'bg-[#6941A5] text-white' : 'hover:bg-[#EBEBEB]'}`}
              >
                <Circle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Color Palette & Thickness */}
            <div className="flex items-center space-x-2 px-2">
              {['#6941A5', '#0078D4', '#107C41', '#D13438', '#FFB900', '#242424'].map((c) => (
                <button
                  key={c}
                  onClick={() => setStrokeColor(c)}
                  className={`w-4 h-4 rounded-full border ${strokeColor === c ? 'ring-2 ring-offset-1 ring-[#6941A5]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="flex items-center space-x-1 ml-2">
                <span className="text-[10px] text-[#616161]">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={strokeThickness}
                  onChange={(e) => setStrokeThickness(Number(e.target.value))}
                  className="w-16 accent-[#6941A5]"
                />
              </div>
              <button
                onClick={clearInkStrokes}
                className="px-2 py-1 text-[11px] text-[#D13438] hover:bg-red-50 rounded"
              >
                Clear Ink
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW TAB ================= */}
        {activeRibbonTab === 'view' && (
          <div className="flex items-center space-x-3 divide-x divide-[#E0E0E0]">
            {/* Paper Styles */}
            <div className="flex items-center space-x-1.5 pr-2">
              <span className="text-[11px] font-medium text-[#616161] mr-1">Paper:</span>
              <button
                onClick={() => setPaperStyle('ruled')}
                className={`px-2 py-1 rounded text-xs ${
                  paperStyle === 'ruled' ? 'bg-[#6941A5] text-white font-medium' : 'hover:bg-[#EBEBEB]'
                }`}
              >
                Ruled
              </button>
              <button
                onClick={() => setPaperStyle('grid')}
                className={`px-2 py-1 rounded text-xs ${
                  paperStyle === 'grid' ? 'bg-[#6941A5] text-white font-medium' : 'hover:bg-[#EBEBEB]'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setPaperStyle('dotted')}
                className={`px-2 py-1 rounded text-xs ${
                  paperStyle === 'dotted' ? 'bg-[#6941A5] text-white font-medium' : 'hover:bg-[#EBEBEB]'
                }`}
              >
                Dotted
              </button>
              <button
                onClick={() => setPaperStyle('blank')}
                className={`px-2 py-1 rounded text-xs ${
                  paperStyle === 'blank' ? 'bg-[#6941A5] text-white font-medium' : 'hover:bg-[#EBEBEB]'
                }`}
              >
                Blank
              </button>
            </div>

            {/* Rule Spacing Slider */}
            <div className="flex items-center space-x-2 px-2">
              <span className="text-[10px] text-[#616161]">Spacing ({ruleSpacing}px):</span>
              <input
                type="range"
                min="20"
                max="60"
                step="4"
                value={ruleSpacing}
                onChange={(e) => setRuleSpacing(Number(e.target.value))}
                className="w-20 accent-[#6941A5]"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 px-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 rounded hover:bg-[#EBEBEB]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-[#616161]" />
              </button>
              <span className="text-xs font-mono font-medium px-1 text-[#242424]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 rounded hover:bg-[#EBEBEB]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#616161]" />
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="text-[11px] px-2 py-1 rounded hover:bg-[#EBEBEB] text-[#6941A5] font-medium"
              >
                Reset (100%)
              </button>
            </div>
          </div>
        )}

        {/* ================= REVIEW TAB ================= */}
        {activeRibbonTab === 'review' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSidebarPanel('info')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#6941A5]" />
              <span>Page Statistics & Word Count</span>
            </button>
            <div className="text-xs text-[#616161]">
              Document Language: <span className="font-medium text-[#242424]">English (US)</span> &bull; Spellcheck Active
            </div>
          </div>
        )}

        {/* ================= AI TAB ================= */}
        {activeRibbonTab === 'ai' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSidebarPanel('ai')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#6941A5] text-white font-medium hover:bg-[#563588] shadow-sm text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open AI Workspace</span>
            </button>
            <button
              onClick={() => {
                setActiveSidebarPanel('ai');
                // Could trigger instant summarize
              }}
              className="px-2.5 py-1.5 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs font-medium text-[#242424]"
            >
              Summarize Page
            </button>
            <button
              onClick={() => {
                setActiveSidebarPanel('ai');
              }}
              className="px-2.5 py-1.5 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs font-medium text-[#242424]"
            >
              Generate Practice Quiz
            </button>
            <button
              onClick={() => {
                setActiveSidebarPanel('ai');
              }}
              className="px-2.5 py-1.5 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs font-medium text-[#242424]"
            >
              Extract Action Items
            </button>
          </div>
        )}

        {/* ================= FILE TAB ================= */}
        {activeRibbonTab === 'file' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenExport('markdown')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs text-[#242424]"
            >
              <Download className="w-3.5 h-3.5 text-[#6941A5]" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={() => onOpenExport('html')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs text-[#242424]"
            >
              <Download className="w-3.5 h-3.5 text-[#6941A5]" />
              <span>Export HTML</span>
            </button>
            <button
              onClick={() => onOpenExport('titan')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#F0EAF8] border border-[#DFD1F0] hover:bg-[#DFD1F0] text-xs text-[#6941A5] font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-[#6941A5]" />
              <span>Export to Titan Document</span>
            </button>
            <button
              onClick={() => onOpenExport('json')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white border border-[#E0E0E0] hover:bg-[#F0EAF8] text-xs text-[#242424]"
            >
              <Download className="w-3.5 h-3.5 text-[#6941A5]" />
              <span>Export JSON</span>
            </button>
          </div>
        )}

        {/* ================= HELP TAB ================= */}
        {activeRibbonTab === 'help' && (
          <div className="flex items-center space-x-3 text-xs text-[#616161]">
            <div className="flex items-center space-x-1">
              <HelpCircle className="w-4 h-4 text-[#6941A5]" />
              <span>Shortcuts: Press <kbd className="px-1 py-0.5 bg-white border rounded">Ctrl+/</kbd> for cheat sheet.</span>
            </div>
            <span>&bull;</span>
            <span>Europa v1.0 &bull; AkashaVyom Labs Enterprise Architecture</span>
          </div>
        )}
      </div>
    </div>
  );
};

