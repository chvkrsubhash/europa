import React, { useState } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import { Share2, X, Copy, Check, Users, Shield, Link } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { currentNotebook } = useNotebook();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'commenter' | 'viewer'>('editor');
  const [copied, setCopied] = useState(false);
  const [shareResult, setShareResult] = useState<string | null>(null);

  if (!isOpen || !currentNotebook) return null;

  const shareableUrl = `${window.location.origin}/notebooks/${currentNotebook.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await api.shareNotebook(currentNotebook.id, email, role);
      setShareResult(`Invitation generated for ${email} as ${role}!`);
      setEmail('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 text-[#242424]">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0]">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#6941A5]" />
            <h3 className="font-semibold text-sm">Share Notebook: {currentNotebook.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#616161] uppercase tracking-wider block">
            Direct Shareable Workspace Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF8FD] border border-[#DFD1F0] rounded font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#6941A5] text-white rounded text-xs font-medium hover:bg-[#563588] flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Invite by Email */}
        <form onSubmit={handleSendInvite} className="space-y-3 pt-2 border-t border-[#E0E0E0]">
          <label className="text-[11px] font-semibold text-[#616161] uppercase tracking-wider block">
            Invite Collaborators by Email
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="colleague@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs border border-[#E0E0E0] rounded focus:border-[#6941A5] focus:outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="text-xs px-2 py-1.5 border border-[#E0E0E0] rounded bg-white text-[#242424]"
            >
              <option value="editor">Editor (Can edit notes)</option>
              <option value="commenter">Commenter</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-[#F0EAF8] text-[#6941A5] font-semibold text-xs rounded hover:bg-[#DFD1F0] transition-colors"
          >
            Send Notebook Invitation
          </button>
          {shareResult && (
            <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-200">
              {shareResult}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

