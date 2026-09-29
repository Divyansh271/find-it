export type ProjectStatus = 'Active' | 'In Review' | 'Completed' | 'Blocked' | 'Planning';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface ProjectRecord {
  id: string;
  name: string;
  client: string;
  category: 'Engineering' | 'Design' | 'Operations' | 'Marketing' | 'Finance';
  status: ProjectStatus;
  priority: PriorityLevel;
  budget: number;
  spent: number;
  dueDate: string;
  owner: {
    name: string;
    avatar: string;
    role: string;
  };
  progress: number;
  updatedAt: string;
  description: string;
}

export interface MetricSummary {
  id: string;
  label: string;
  value: string;
  rawNumber: number;
  changePercent: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  timeframe: string;
  sparkline: number[];
  unit?: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  operations: number;
  signups: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'project' | 'deploy' | 'user' | 'billing' | 'alert';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type ViewTab = 'overview' | 'analytics' | 'projects' | 'team' | 'reports' | 'settings';
