import React, { useState, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import { TemplateItem } from '../../types';
import { Layout, X, Check, BookOpen, GraduationCap, Users, Calendar, Code, Microscope, Briefcase } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const { currentSection, refreshPages, setCurrentPage } = useNotebook();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getTemplates().then(setTemplates).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Education', 'Business', 'Personal', 'Engineering', 'Research', 'AkashaVyom'];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleApply = async (tpl: TemplateItem) => {
    if (!currentSection) {
      alert('Please create or select a section first!');
      return;
    }
    setApplying(true);
    try {
      const newPage = await api.applyTemplate(tpl.id, currentSection.id);
      await refreshPages(currentSection.id);
      setCurrentPage(newPage);
      onClose();
    } catch (err: any) {
      alert(`Error creating template page: ${err.message}`);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden text-[#242424]">
        {/* Header */}
        <div className="h-12 px-5 border-b border-[#E0E0E0] flex items-center justify-between bg-[#FAF8FD]">
          <div className="flex items-center space-x-2">
            <Layout className="w-4 h-4 text-[#6941A5]" />
            <h3 className="font-semibold text-sm">Notebook Templates Vault</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1 px-5 py-2.5 border-b border-[#E0E0E0] bg-[#F7F7F8] overflow-x-auto text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#6941A5] text-white font-medium'
                  : 'text-[#616161] hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#FAF8FD]/40">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="p-3.5 rounded-lg border border-[#DFD1F0] hover:border-[#6941A5] hover:shadow-sm bg-white transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-xs text-[#242424]">{tpl.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EAF8] text-[#6941A5] font-medium">
                    {tpl.category}
                  </span>
                </div>
                <p className="text-xs text-[#616161] leading-relaxed mt-1">{tpl.description}</p>
                <div className="mt-2 text-[10px] text-[#8A8A8A]">
                  Paper: <span className="capitalize">{tpl.paper_style}</span> &bull; {tpl.blocks?.length || 1} pre-configured container(s)
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#F5F5F5] flex justify-end">
                <button
                  disabled={applying}
                  onClick={() => handleApply(tpl)}
                  className="px-3 py-1 text-xs bg-[#6941A5] hover:bg-[#563588] text-white rounded font-medium transition-colors disabled:opacity-50"
                >
                  Create Page from Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

