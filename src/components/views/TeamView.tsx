import React, { useState } from 'react';
import { Mail, Shield, UserPlus, Search, CheckCircle2, MoreVertical, Building } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Invited';
  projectsCount: number;
  initials: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@pulseboard.io',
    role: 'Principal Cloud Architect',
    department: 'Engineering',
    status: 'Active',
    projectsCount: 4,
    initials: 'ER'
  },
  {
    id: 'tm-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@pulseboard.io',
    role: 'Staff Product Designer',
    department: 'Design',
    status: 'Active',
    projectsCount: 2,
    initials: 'MC'
  },
  {
    id: 'tm-3',
    name: 'Sophia Patel',
    email: 'sophia.patel@pulseboard.io',
    role: 'Senior Distributed Systems Engineer',
    department: 'Engineering',
    status: 'Active',
    projectsCount: 3,
    initials: 'SP'
  },
  {
    id: 'tm-4',
    name: 'David Keller',
    email: 'david.keller@pulseboard.io',
    role: 'Lead Security & Compliance Auditor',
    department: 'Operations',
    status: 'Active',
    projectsCount: 2,
    initials: 'DK'
  },
  {
    id: 'tm-5',
    name: 'Hannah Brooks',
    email: 'hannah.brooks@pulseboard.io',
    role: 'Quantitative Data Analyst',
    department: 'Finance',
    status: 'On Leave',
    projectsCount: 1,
    initials: 'HB'
  },
  {
    id: 'tm-6',
    name: 'Liam Vance',
    email: 'liam.vance@hyperion.com',
    role: 'Growth Marketing Strategist',
    department: 'Marketing',
    status: 'Invited',
    projectsCount: 1,
    initials: 'LV'
  }
];

export const TeamView: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [search, setSearch] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Software Engineer');
  const [newDept, setNewDept] = useState('Engineering');

  const filteredTeam = team.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const initials = newName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDept,
      status: 'Invited',
      projectsCount: 0,
      initials
    };

    setTeam([...team, newMember]);
    setNewName('');
    setNewEmail('');
    setInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Team & Organization Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage workspace roles, permissions, and initiative ownership
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {filteredTeam.length} members
        </span>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{member.role}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      member.status === 'Active'
                        ? 'bg-emerald-500'
                        : member.status === 'On Leave'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>{member.status}</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1 mb-4">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{member.department}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>{member.projectsCount} active projects</span>
              <button className="text-slate-700 hover:text-slate-900 font-sans hover:underline">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setInviteModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 z-10 text-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Invite New Collaborator
            </h3>
            <p className="text-slate-500 mb-4">
              Send a secure workspace access link with assigned role.
            </p>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
