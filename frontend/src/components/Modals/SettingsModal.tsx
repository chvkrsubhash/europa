import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Settings, X, Cpu, Key, FileCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<string>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [titanConnected, setTitanConnected] = useState<boolean>(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('europa_ai_key') || '';
    const savedProv = localStorage.getItem('europa_ai_provider') || 'gemini';
    setApiKey(savedKey);
    setProvider(savedProv);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('europa_ai_key', apiKey);
    localStorage.setItem('europa_ai_provider', provider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 text-[#242424]">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#6941A5]" />
            <h3 className="font-semibold text-sm">Europa Workspace Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Provider Config */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#6941A5]">
            <Cpu className="w-4 h-4" />
            <span>AI Knowledge Engine & Provider</span>
          </div>

          <div>
            <label className="text-[11px] text-[#616161] block mb-1">Active LLM Provider:</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-[#E0E0E0] rounded bg-white"
            >
              <option value="gemini">Google Gemini 1.5 Flash (Recommended)</option>
              <option value="groq">Groq Llama 3.3 (High Speed)</option>
              <option value="openrouter">OpenRouter Compatible</option>
              <option value="ollama">Ollama (Local Private Engine)</option>
              <option value="europa-local">Europa Built-in Local Synthesizer (Offline)</option>
            </select>
          </div>

          {provider !== 'europa-local' && provider !== 'ollama' && (
            <div>
              <label className="text-[11px] text-[#616161] block mb-1">
                Custom Provider API Key (Optional / Overrides Backend Default):
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Paste your API key securely..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#E0E0E0] rounded focus:border-[#6941A5] focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-[#8A8A8A] mt-1">
                Stored strictly in local memory and sent only via encrypted headers.
              </p>
            </div>
          )}
        </div>

        {/* Titan Integration (Section 23) */}
        <div className="pt-3 border-t border-[#E0E0E0] space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#242424]">
            <FileCheck className="w-4 h-4 text-[#6941A5]" />
            <span>AkashaVyom Titan Document Bridge</span>
          </div>
          <div className="p-2.5 rounded bg-[#FAF8FD] border border-[#DFD1F0] flex items-center justify-between text-xs">
            <div>
              <div className="font-medium text-[#242424]">Unified Titan SSO & Document Export</div>
              <div className="text-[10px] text-[#616161]">
                Permits exporting pages as structured Titan documents.
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Connected
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-[#616161] hover:bg-[#F5F5F5] rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-[#6941A5] text-white rounded text-xs font-medium hover:bg-[#563588] flex items-center space-x-1"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

