import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  GitCommit,
  CreditCard,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { ActivityItem } from '../types/dashboard';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

interface QuickTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [tasks, setTasks] = useState<QuickTask[]>([
    { id: 't1', title: 'Approve edge egress load balancing PR', completed: false, dueDate: 'Today' },
    { id: 't2', title: 'Review Q3 SOC2 compliance vulnerability audit', completed: true, dueDate: 'Completed' },
    { id: 't3', title: 'Verify staging cluster rollback procedure', completed: false, dueDate: 'Tomorrow' },
    { id: 't4', title: 'Reconcile Stripe merchant ledger with banking balance', completed: false, dueDate: 'Oct 2' }
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([
      ...tasks,
      {
        id: `t-${Date.now()}`,
        title: newTaskInput.trim(),
        completed: false,
        dueDate: 'Upcoming'
      }
    ]);
    setNewTaskInput('');
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'deploy':
        return <GitCommit className="w-3.5 h-3.5 text-slate-700" />;
      case 'billing':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Real-time Activity Stream */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-900">
              Operations Audit Stream
            </h3>
            <span className="text-[11px] text-slate-400">· Realtime</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            5 latest events
          </span>
        </div>

        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg mt-0.5 shrink-0">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 leading-snug">
                  <span className="font-semibold text-slate-900">{act.user}</span>{' '}
                  {act.action}{' '}
                  <span className="font-medium text-slate-900">{act.target}</span>
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{act.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Executive Tasks */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-slate-900">
                Priority Action Items
              </h3>
              <span className="text-[11px] text-slate-400">
                · {tasks.filter(t => !t.completed).length} pending
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 tabular-nums">
              {tasks.filter(t => t.completed).length}/{tasks.length} resolved
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors cursor-pointer group ${
                  task.completed
                    ? 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className={`truncate ${task.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">
                    {task.dueDate}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Quick Task Input */}
        <form onSubmit={addTask} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new high-priority milestone..."
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
};
