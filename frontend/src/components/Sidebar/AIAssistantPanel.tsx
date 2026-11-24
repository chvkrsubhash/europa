import React, { useState, useRef, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import { AIMessage } from '../../types';
import {
  Sparkles, Send, X, Copy, PlusCircle, Check, ArrowRight,
  BookOpen, Layers, FileText, CheckSquare, RefreshCw, Cpu
} from 'lucide-react';

export const AIAssistantPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    currentPage,
    currentSection,
    currentNotebook,
    createBlock,
    refreshPages
  } = useNotebook();

  const [prompt, setPrompt] = useState('');
  const [contextScope, setContextScope] = useState<string>('current_page');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: 'Hello! I am your Europa AI Knowledge Assistant. Ask questions about your notes, summarize pages, extract action items, or generate quizzes.',
      created_at: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (userPromptText?: string) => {
    const textToSend = userPromptText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userPromptText) setPrompt('');
    setLoading(true);

    try {
      const res = await api.askAI({
        prompt: textToSend,
        context_scope: contextScope,
        current_page_id: currentPage?.id,
        current_section_id: currentSection?.id,
        current_notebook_id: currentNotebook?.id,
      });

      const assistantMsg: AIMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: res.response,
        citations: res.citations,
        provider: res.provider,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `Unable to complete AI request: ${err.message || 'Unknown error'}. Please check backend logs or provider key.`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertAsBlock = async (id: string, text: string) => {
    if (!currentPage) return;
    await createBlock('text', 80, 280, `<div class="ai-generated">${text.replace(/\n/g, '<br/>')}</div>`);
    setInsertedId(id);
    setTimeout(() => setInsertedId(null), 2500);
  };

  return (
    <aside className="w-80 bg-[#FAF8FD] border-l border-[#E0E0E0] flex flex-col h-full select-none text-[#242424] z-20">
      {/* Panel Header */}
      <div className="h-10 px-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F7F7F8]">
        <div className="flex items-center space-x-1.5 font-semibold text-xs text-[#6941A5]">
          <Sparkles className="w-4 h-4" />
          <span>Europa Knowledge Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AI Context Scope Selector */}
      <div className="p-2 border-b border-[#E0E0E0] bg-white text-xs">
        <label className="text-[10px] uppercase font-semibold text-[#8A8A8A] block mb-1">
          Knowledge Grounding Scope:
        </label>
        <select
          value={contextScope}
          onChange={(e) => setContextScope(e.target.value)}
          className="w-full px-2 py-1 bg-[#FAF8FD] border border-[#DFD1F0] rounded text-xs text-[#242424] focus:outline-none focus:border-[#6941A5]"
        >
          <option value="current_page">Current Page: {currentPage?.title || 'None'}</option>
          <option value="current_section">Current Section: {currentSection?.title || 'None'}</option>
          <option value="current_notebook">Current Notebook: {currentNotebook?.title || 'All'}</option>
          <option value="all_notebooks">All Authorized Notebooks (RAG Search)</option>
        </select>
      </div>

      {/* Quick Action Pills */}
      <div className="p-2 bg-[#F5F5F5] border-b border-[#E0E0E0] flex flex-wrap gap-1">
        <button
          onClick={() => handleSend('Summarize the key takeaways and main concepts')}
          className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#E0E0E0] hover:border-[#6941A5] hover:text-[#6941A5] text-[#616161]"
        >
          📝 Summarize
        </button>
        <button
          onClick={() => handleSend('Generate 3 practice quiz questions based on these notes')}
          className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#E0E0E0] hover:border-[#6941A5] hover:text-[#6941A5] text-[#616161]"
        >
          🎯 Quiz & MCQs
        </button>
        <button
          onClick={() => handleSend('Extract actionable tasks, deadlines, and decisions')}
          className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#E0E0E0] hover:border-[#6941A5] hover:text-[#6941A5] text-[#616161]"
        >
          ✅ Action Items
        </button>
        <button
          onClick={() => handleSend('Generate study flashcards for active recall revision')}
          className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#E0E0E0] hover:border-[#6941A5] hover:text-[#6941A5] text-[#616161]"
        >
          💡 Flashcards
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col text-xs leading-relaxed ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-[92%] select-text ${
                m.role === 'user'
                  ? 'bg-[#6941A5] text-white rounded-br-none'
                  : 'bg-[#F7F3FB] border border-[#DFD1F0] text-[#242424] rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Citations Footer */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#DFD1F0]/60 space-y-1">
                  <div className="text-[10px] font-semibold uppercase text-[#6941A5]">
                    Grounded Citations:
                  </div>
                  {m.citations.map((c) => (
                    <div
                      key={c.id}
                      className="text-[10px] bg-white px-2 py-1 rounded border border-[#DFD1F0] text-[#616161]"
                    >
                      <span className="font-semibold text-[#6941A5]">[Citation {c.id}]</span>{' '}
                      {c.page_title}: &quot;{c.snippet}&quot;
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assistant Actions */}
            {m.role === 'assistant' && m.id !== 'msg-init' && (
              <div className="flex items-center space-x-2 mt-1 px-1 text-[10px] text-[#8A8A8A]">
                <button
                  onClick={() => handleCopy(m.id, m.content)}
                  className="hover:text-[#6941A5] flex items-center space-x-1"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <span>&bull;</span>
                <button
                  onClick={() => handleInsertAsBlock(m.id, m.content)}
                  className="hover:text-[#6941A5] flex items-center space-x-1"
                >
                  {insertedId === m.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Inserted on page</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3 h-3" />
                      <span>Insert on page</span>
                    </>
                  )}
                </button>
                {m.provider && (
                  <>
                    <span>&bull;</span>
                    <span className="text-[9px] text-[#A47DD2]">via {m.provider}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 p-2.5 bg-[#F7F3FB] border border-[#DFD1F0] rounded-md text-xs text-[#6941A5]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing notebook context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-2 border-t border-[#E0E0E0] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-1.5"
        >
          <input
            type="text"
            placeholder="Ask AI about your notes..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF8FD] border border-[#E0E0E0] rounded-md focus:outline-none focus:border-[#6941A5]"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="p-1.5 bg-[#6941A5] text-white rounded-md hover:bg-[#563588] disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};

