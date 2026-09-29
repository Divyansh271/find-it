import { ProjectRecord, MetricSummary, ChartDataPoint, ActivityItem, NotificationItem } from '../types/dashboard';

export const INITIAL_METRICS: MetricSummary[] = [
  {
    id: 'm-revenue',
    label: 'Total Revenue',
    value: '$148,290.00',
    rawNumber: 148290,
    changePercent: 12.8,
    changeType: 'increase',
    timeframe: 'vs last month',
    sparkline: [42, 48, 55, 51, 64, 72, 79, 86, 94]
  },
  {
    id: 'm-customers',
    label: 'Active Accounts',
    value: '3,842',
    rawNumber: 3842,
    changePercent: 8.4,
    changeType: 'increase',
    timeframe: 'vs last month',
    sparkline: [210, 218, 225, 230, 248, 252, 269, 281, 294]
  },
  {
    id: 'm-throughput',
    label: 'System Uptime & SLA',
    value: '99.94%',
    rawNumber: 99.94,
    changePercent: 0.12,
    changeType: 'increase',
    timeframe: 'last 30-day window',
    sparkline: [99.8, 99.85, 99.9, 99.91, 99.92, 99.93, 99.94]
  },
  {
    id: 'm-backlog',
    label: 'Active Work Orders',
    value: '24',
    rawNumber: 24,
    changePercent: -14.3,
    changeType: 'decrease',
    timeframe: 'vs last 7 days',
    sparkline: [38, 34, 32, 29, 30, 28, 26, 24]
  }
];

export const INITIAL_PROJECTS: ProjectRecord[] = [
  {
    id: 'PRJ-1082',
    name: 'Cloud Infrastructure Migration',
    client: 'Acme Enterprise Solutions',
    category: 'Engineering',
    status: 'Active',
    priority: 'High',
    budget: 48000,
    spent: 31200,
    dueDate: '2026-10-15',
    owner: {
      name: 'Elena Rostova',
      avatar: 'ER',
      role: 'Principal Architect'
    },
    progress: 65,
    updatedAt: '2 hours ago',
    description: 'Relocating hybrid compute nodes to distributed edge clusters with zero downtime and automated failover validation.'
  },
  {
    id: 'PRJ-1083',
    name: 'Unified Design System v3.0',
    client: 'Global Media Group',
    category: 'Design',
    status: 'In Review',
    priority: 'Medium',
    budget: 24500,
    spent: 22800,
    dueDate: '2026-10-05',
    owner: {
      name: 'Marcus Chen',
      avatar: 'MC',
      role: 'Design Lead'
    },
    progress: 92,
    updatedAt: '4 hours ago',
    description: 'Component architecture refresh including WCAG AA contrast audit, token synchronizer, and responsive canvas presets.'
  },
  {
    id: 'PRJ-1084',
    name: 'Payment Gateway Integration',
    client: 'Starlight Retailers',
    category: 'Engineering',
    status: 'Active',
    priority: 'High',
    budget: 36000,
    spent: 18500,
    dueDate: '2026-10-28',
    owner: {
      name: 'Sophia Patel',
      avatar: 'SP',
      role: 'Backend Engineer'
    },
    progress: 52,
    updatedAt: 'Yesterday',
    description: 'Multi-currency settlement pipeline supporting SEPA, FedNow, and instant merchant reconciliation.'
  },
  {
    id: 'PRJ-1085',
    name: 'Quarterly Security Audit & Pen Test',
    client: 'Internal Operations',
    category: 'Operations',
    status: 'Completed',
    priority: 'High',
    budget: 18000,
    spent: 17400,
    dueDate: '2026-09-24',
    owner: {
      name: 'David Keller',
      avatar: 'DK',
      role: 'Security Specialist'
    },
    progress: 100,
    updatedAt: '3 days ago',
    description: 'SOC2 Type II compliance check and automated red-team vulnerability testing across ingress microservices.'
  },
  {
    id: 'PRJ-1086',
    name: 'Customer Success Analytics Pipeline',
    client: 'Apex Fintech',
    category: 'Finance',
    status: 'Planning',
    priority: 'Low',
    budget: 15000,
    spent: 2400,
    dueDate: '2026-11-12',
    owner: {
      name: 'Hannah Brooks',
      avatar: 'HB',
      role: 'Data Analyst'
    },
    progress: 18,
    updatedAt: '5 days ago',
    description: 'Ingesting churn signals and daily active user cohorts into BigQuery with automated threshold alert notifications.'
  },
  {
    id: 'PRJ-1087',
    name: 'Brand Repositioning Campaign',
    client: 'Hyperion Logistics',
    category: 'Marketing',
    status: 'Blocked',
    priority: 'Medium',
    budget: 29000,
    spent: 11000,
    dueDate: '2026-10-18',
    owner: {
      name: 'Liam Vance',
      avatar: 'LV',
      role: 'Growth Lead'
    },
    progress: 38,
    updatedAt: '1 day ago',
    description: 'Awaiting client approval for digital outdoor placements and interactive demonstration narrative scripts.'
  },
  {
    id: 'PRJ-1088',
    name: 'Warehouse Automation Telemetry',
    client: 'NorthVantage Freight',
    category: 'Operations',
    status: 'Active',
    priority: 'High',
    budget: 52000,
    spent: 39800,
    dueDate: '2026-11-01',
    owner: {
      name: 'Elena Rostova',
      avatar: 'ER',
      role: 'Principal Architect'
    },
    progress: 74,
    updatedAt: 'Just now',
    description: 'MQTT sensor cluster sync across regional distribution centers with real-time temperature and battery health logging.'
  }
];

export const CHART_DATA_7D: ChartDataPoint[] = [
  { date: 'Sep 22', revenue: 14200, operations: 1420, signups: 84 },
  { date: 'Sep 23', revenue: 16800, operations: 1640, signups: 92 },
  { date: 'Sep 24', revenue: 19100, operations: 1890, signups: 110 },
  { date: 'Sep 25', revenue: 15400, operations: 1510, signups: 78 },
  { date: 'Sep 26', revenue: 21300, operations: 2120, signups: 135 },
  { date: 'Sep 27', revenue: 24900, operations: 2380, signups: 152 },
  { date: 'Sep 28', revenue: 22800, operations: 2240, signups: 141 }
];

export const CHART_DATA_30D: ChartDataPoint[] = [
  { date: 'Week 1', revenue: 84200, operations: 8120, signups: 540 },
  { date: 'Week 2', revenue: 96400, operations: 9450, signups: 620 },
  { date: 'Week 3', revenue: 112000, operations: 10800, signups: 745 },
  { date: 'Week 4', revenue: 128500, operations: 12400, signups: 890 }
];

export const CHART_DATA_90D: ChartDataPoint[] = [
  { date: 'Jul 2026', revenue: 320000, operations: 31000, signups: 2100 },
  { date: 'Aug 2026', revenue: 384000, operations: 36500, signups: 2450 },
  { date: 'Sep 2026', revenue: 428000, operations: 41200, signups: 2840 }
];

export const CHART_DATA_1Y: ChartDataPoint[] = [
  { date: 'Q4 25', revenue: 840000, operations: 78000, signups: 5200 },
  { date: 'Q1 26', revenue: 960000, operations: 92000, signups: 6100 },
  { date: 'Q2 26', revenue: 1140000, operations: 108000, signups: 7400 },
  { date: 'Q3 26', revenue: 1320000, operations: 126000, signups: 8800 }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'Elena Rostova',
    action: 'promoted staging build to production cluster',
    target: 'Cluster US-West-2',
    timestamp: '12 minutes ago',
    type: 'deploy'
  },
  {
    id: 'act-2',
    user: 'Marcus Chen',
    action: 'submitted design audit review for approval',
    target: 'Unified Design System v3.0',
    timestamp: '45 minutes ago',
    type: 'project'
  },
  {
    id: 'act-3',
    user: 'Starlight Retailers',
    action: 'settled milestone invoice payment ($18,500.00)',
    target: 'Invoice #INV-4921',
    timestamp: '2 hours ago',
    type: 'billing'
  },
  {
    id: 'act-4',
    user: 'Sophia Patel',
    action: 'merged branch webhook-signature-verification',
    target: 'Payment Gateway',
    timestamp: '3 hours ago',
    type: 'project'
  },
  {
    id: 'act-5',
    user: 'System Monitor',
    action: 'completed scheduled backup and snapshot rotation',
    target: 'Primary Postgres DB',
    timestamp: '6 hours ago',
    type: 'alert'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High Throughput Alert',
    description: 'API gateway reached 88% capacity during peak flash sale traffic.',
    timestamp: '18 minutes ago',
    read: false,
    type: 'warning'
  },
  {
    id: 'notif-2',
    title: 'Invoice Settled',
    description: 'Acme Enterprise cleared $31,200.00 via direct wire transfer.',
    timestamp: '1 hour ago',
    read: false,
    type: 'success'
  },
  {
    id: 'notif-3',
    title: 'New Team Invitation Accepted',
    description: 'Liam Vance joined workspace as Senior Marketing Strategist.',
    timestamp: '3 hours ago',
    read: true,
    type: 'info'
  },
  {
    id: 'notif-4',
    title: 'SSL Certificate Renewed',
    description: 'Auto-renewal for wildcard *.pulseboard.dev completed successfully.',
    timestamp: 'Yesterday',
    read: true,
    type: 'success'
  }
];
