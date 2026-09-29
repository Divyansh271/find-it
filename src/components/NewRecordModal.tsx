import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { ProjectRecord, ProjectStatus, PriorityLevel } from '../types/dashboard';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (record: ProjectRecord) => void;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState<'Engineering' | 'Design' | 'Operations' | 'Marketing' | 'Finance'>('Engineering');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [budget, setBudget] = useState<number>(25000);
  const [dueDate, setDueDate] = useState<string>('2026-11-30');
  const [ownerName, setOwnerName] = useState('Divyansh Tyagi');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project title.');
      return;
    }
    if (!client.trim()) {
      setError('Please provide a client or department name.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newRecord: ProjectRecord = {
      id: `PRJ-${randomNum}`,
      name: name.trim(),
      client: client.trim(),
      category,
      status,
      priority,
      budget: Number(budget) || 0,
      spent: 0,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      owner: {
        name: ownerName || 'Assigned Lead',
        avatar: (ownerName || 'AL').slice(0, 2).toUpperCase(),
        role: 'Initiative Owner'
      },
      progress: 0,
      updatedAt: 'Just now',
      description: description.trim() || 'No explicit scope defined yet.'
    };

    onCreate(newRecord);
    // Reset form
    setName('');
    setClient('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Create New Initiative
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a new operational project to the workspace ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Project Title</label>
            <input
              type="text"
              placeholder="e.g. Distributed Ingress Edge Gateway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Client / Stakeholder</label>
              <input
                type="text"
                placeholder="e.g. Acme Enterprise"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Discipline</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="In Review">In Review</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Budget ($)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Target Completion Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Assigned Lead</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Summary Scope & Invariants</label>
            <textarea
              rows={3}
              placeholder="Outline deliverables, constraints, or expected SLA criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
