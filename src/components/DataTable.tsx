import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckSquare,
  Square,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ProjectRecord, ProjectStatus } from '../types/dashboard';

interface DataTableProps {
  projects: ProjectRecord[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProject: (project: ProjectRecord) => void;
  onDeleteProjects: (ids: string[]) => void;
  onUpdateStatus: (ids: string[], newStatus: ProjectStatus) => void;
  onOpenNewRecord: () => void;
}

type SortField = 'name' | 'client' | 'budget' | 'dueDate' | 'progress';
type SortOrder = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  projects,
  searchQuery,
  onSearchChange,
  onSelectProject,
  onDeleteProjects,
  onUpdateStatus,
  onOpenNewRecord
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  // Sort list
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortField === 'client') comparison = a.client.localeCompare(b.client);
      else if (sortField === 'budget') comparison = a.budget - b.budget;
      else if (sortField === 'dueDate') comparison = a.dueDate.localeCompare(b.dueDate);
      else if (sortField === 'progress') comparison = a.progress - b.progress;

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredProjects, sortField, sortOrder]);

  // Paginated slice
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProjects.slice(start, start + itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProjects.map(p => p.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    onDeleteProjects(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBatchStatus = (newStatus: ProjectStatus) => {
    onUpdateStatus(Array.from(selectedIds), newStatus);
    setSelectedIds(new Set());
  };

  const getStatusIndicator = (status: ProjectStatus) => {
    switch (status) {
      case 'Active':
        return <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />;
      case 'In Review':
        return <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />;
      case 'Blocked':
        return <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />;
      case 'Completed':
        return <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5" />;
      case 'Planning':
        return <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs (Buttons, not static pills) */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            {['All', 'Active', 'In Review', 'Completed', 'Blocked'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">All Disciplines</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {/* Selected Batch Actions or Count */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-xs">
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                {selectedIds.size} selected
              </span>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => handleBatchStatus('Completed')}
                className="text-slate-700 hover:text-slate-900 font-medium hover:underline"
              >
                Complete
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={handleBatchDelete}
                className="text-rose-600 hover:text-rose-700 font-medium hover:underline"
              >
                Delete
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Showing {sortedProjects.length} records
            </span>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginatedProjects.length > 0 && selectedIds.size === paginatedProjects.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 cursor-pointer select-none hover:text-slate-900" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1.5">
                  <span>Project & Identifier</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none hover:text-slate-900" onClick={() => toggleSort('client')}>
                <div className="flex items-center gap-1.5">
                  <span>Client / Department</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Status & Priority</th>
              <th className="py-3 px-4 cursor-pointer select-none hover:text-slate-900 text-right" onClick={() => toggleSort('budget')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Budget & Spent</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none hover:text-slate-900 text-right" onClick={() => toggleSort('dueDate')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Target Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer select-none hover:text-slate-900" onClick={() => toggleSort('progress')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Progress</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center w-12">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700 mb-1">No matching projects found</p>
                    <p className="text-xs text-slate-500 mb-3">Adjust your search filters or create a new project entry.</p>
                    <button
                      onClick={onOpenNewRecord}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Create Project Entry
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedProjects.map((p) => {
                const isSelected = selectedIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center" onClick={(e) => toggleSelectOne(p.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 hover:text-slate-700 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{p.id}</span>
                        <span className="text-slate-300">·</span>
                        <span>{p.category}</span>
                      </div>
                    </td>

                    {/* Client & Owner */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{p.client}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>Lead: {p.owner.name}</span>
                      </div>
                    </td>

                    {/* Status & Priority - Clean unboxed text with dot */}
                    <td className="py-3 px-4">
                      <div className="flex items-center text-slate-700 font-medium">
                        {getStatusIndicator(p.status)}
                        <span>{p.status}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Priority: <span className={p.priority === 'High' ? 'text-rose-600 font-medium' : 'text-slate-600'}>{p.priority}</span>
                      </div>
                    </td>

                    {/* Budget & Spent */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="font-semibold text-slate-900">
                        ${p.budget.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ${p.spent.toLocaleString()} spent
                      </div>
                    </td>

                    {/* Target Date */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span className="text-slate-800">{p.dueDate}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Updated {p.updatedAt}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.progress === 100 ? 'bg-emerald-600' : 'bg-slate-900'
                            }`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-slate-700 w-8 text-right font-medium">
                          {p.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectProject(p)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div>
          Page <span className="font-semibold text-slate-900 font-mono tabular-nums">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-900 font-mono tabular-nums">{totalPages}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
