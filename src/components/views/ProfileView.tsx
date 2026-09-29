import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  CheckCircle2,
  Calendar,
  MapPin,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { CampusItem } from '../../types/campus';

interface ProfileViewProps {
  myItems: CampusItem[];
  onSelectItem: (item: CampusItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ myItems, onSelectItem }) => {
  const [tab, setTab] = useState<'all' | 'lost' | 'found'>('all');

  const myFiltered = myItems.filter(
    (i) => i.reportedBy.name.includes('Divyansh') || i.reportedBy.studentId === 'ST-27120'
  );

  const displayedItems = tab === 'all'
    ? myFiltered
    : myFiltered.filter((i) => (tab === 'lost' ? i.type === 'Lost' : i.type === 'Found'));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
              DT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">Divyansh Tyagi</h1>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Department of Computer Science & Engineering
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> ID: ST-27120
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> divyansh@campus.edu
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-xs text-slate-500">Campus Reliability Score</span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              100%
            </span>
          </div>
        </div>
      </div>

      {/* Badges / Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-900">Good Samaritan</div>
            <div className="text-[11px] text-slate-500">Turned in 2+ items to campus posts</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-900">Fast Responder</div>
            <div className="text-[11px] text-slate-500">&lt; 15 min average message response</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold font-mono text-slate-900">Active Member</div>
            <div className="text-[11px] text-slate-500">Joined Fall 2026 Batch</div>
          </div>
        </div>
      </div>

      {/* My Reported Items */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Campus Reports</h2>
            <p className="text-[11px] text-slate-500">Items submitted under your account</p>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
            {(['all', 'lost', 'found'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 font-medium capitalize rounded-md transition-colors ${
                  tab === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {displayedItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No items reported in this category yet.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3.5 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                        item.type === 'Lost'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="font-semibold text-slate-900">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                    </span>
                    <span>·</span>
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  <span>View</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
