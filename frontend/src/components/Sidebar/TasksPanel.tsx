import React, { useState, useEffect } from 'react';
import { useNotebook } from '../../context/NotebookContext';
import { api } from '../../services/api';
import { TaskItem } from '../../types';
import { CheckSquare, X, Plus, Check, Clock, AlertTriangle } from 'lucide-react';

export const TasksPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentPage, currentNotebook } = useNotebook();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const loadTasks = () => {
    api.getTasks().then(setTasks).catch(console.error);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggle = async (t: TaskItem) => {
    await api.updateTask(t.id, { is_completed: !t.is_completed });
    loadTasks();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await api.createTask({
      title: newTitle.trim(),
      priority: newPriority,
      notebook_id: currentNotebook?.id || '',
      page_id: currentPage?.id || '',
      is_completed: false
    });
    setNewTitle('');
    loadTasks();
  };

  const priorityColors = {
    low: 'text-slate-500 bg-slate-100',
    medium: 'text-blue-700 bg-blue-50',
    high: 'text-amber-700 bg-amber-50',
    urgent: 'text-red-700 bg-red-50',
  };

  return (
    <aside className="w-80 bg-white border-l border-[#E0E0E0] flex flex-col h-full select-none text-[#242424] z-20">
      <div className="h-10 px-3 border-b border-[#E0E0E0] flex items-center justify-between bg-[#F7F7F8]">
        <div className="flex items-center space-x-1.5 font-semibold text-xs text-[#242424]">
          <CheckSquare className="w-3.5 h-3.5 text-[#6941A5]" />
          <span>Tasks & Checklist Vault</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-[#EBEBEB] text-[#616161]">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="p-3 border-b border-[#E0E0E0] space-y-2 bg-[#FAF8FD]">
        <input
          type="text"
          placeholder="New task title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full px-2.5 py-1 text-xs border border-[#DFD1F0] rounded focus:outline-none focus:border-[#6941A5]"
        />
        <div className="flex items-center justify-between">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="text-[11px] px-2 py-0.5 border border-[#DFD1F0] rounded bg-white text-[#616161]"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            type="submit"
            className="px-2.5 py-1 bg-[#6941A5] text-white rounded text-xs font-medium hover:bg-[#563588]"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="p-2.5 rounded border border-[#E0E0E0] hover:border-[#6941A5] transition-colors flex items-start space-x-2.5"
          >
            <button
              onClick={() => handleToggle(t)}
              className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center ${
                t.is_completed ? 'bg-[#6941A5] border-[#6941A5] text-white' : 'border-[#B0B0B0]'
              }`}
            >
              {t.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <div className="flex-1 truncate">
              <div className={`text-xs ${t.is_completed ? 'line-through text-[#8A8A8A]' : 'text-[#242424]'}`}>
                {t.title}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${priorityColors[t.priority]}`}>
                  {t.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-xs text-[#8A8A8A] py-8">
            No active tasks. Add one above!
          </div>
        )}
      </div>
    </aside>
  );
};

