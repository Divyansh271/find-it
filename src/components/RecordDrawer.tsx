import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Trash2,
  Tag,
  Briefcase
} from 'lucide-react';
import { ProjectRecord, ProjectStatus, PriorityLevel } from '../types/dashboard';

interface RecordDrawerProps {
  project: ProjectRecord | null;
  onClose: () => void;
  onSave: (updated: ProjectRecord) => void;
  onDelete: (id: string) => void;
}

export const RecordDrawer: React.FC<RecordDrawerProps> = ({
  project,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
    }
  }, [project]);

  if (!project || !formData) return null;

  const handleFieldChange = (field: keyof ProjectRecord, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave({
        ...formData,
        updatedAt: 'Just now'
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      onDelete(project.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
            <div>
              <div className="text-[11px] font-mono text-slate-500 mb-0.5">
                {formData.id} · {formData.category}
              </div>
              <h2 className="text-base font-semibold text-slate-900 truncate">
                Project Specification
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Form */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Title */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Project Title</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Client */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Client / Stakeholder</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => handleFieldChange('client', e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Active">Active</option>
                  <option value="In Review">In Review</option>
                  <option value="Planning">Planning</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Budget & Spent */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Budget Allocated ($)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleFieldChange('budget', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Capital Spent ($)</label>
                <input
                  type="number"
                  value={formData.spent}
                  onChange={(e) => handleFieldChange('spent', Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Target Due Date */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Delivery Target Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Completion Progress Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-medium text-slate-700">Completion Progress</label>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formData.progress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleFieldChange('progress', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            {/* Lead Assignee */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Project Lead</label>
              <input
                type="text"
                value={formData.owner.name}
                onChange={(e) =>
                  handleFieldChange('owner', { ...formData.owner, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Description Notes */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Scope Description & Invariants</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400 resize-none leading-relaxed"
              />
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
