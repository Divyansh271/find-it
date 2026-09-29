import React, { useState } from 'react';
import { Bell, Shield, MapPin, Check, RotateCcw, Save } from 'lucide-react';

interface SettingsViewProps {
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [privacyMask, setPrivacyMask] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Account & Campus Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure notifications, matching alerts, and privacy settings
        </p>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Alerts & AI Matching */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            AI Matching & Notifications
          </h2>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
            <div>
              <p className="font-semibold text-slate-900">Instant AI Match Alerts</p>
              <p className="text-[11px] text-slate-500">Notify immediately when a found item matches keywords or location from your lost report</p>
            </div>
            <input
              type="checkbox"
              checked={matchAlerts}
              onChange={(e) => setMatchAlerts(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
            <div>
              <p className="font-semibold text-slate-900">Daily Campus Lost & Found Digest</p>
              <p className="text-[11px] text-slate-500">Receive morning summary of all new items reported across campus buildings</p>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Privacy & Safety */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Student Privacy & Verification
          </h2>

          <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50">
            <div>
              <p className="font-semibold text-slate-900">Mask Personal Contact Info in Public Feed</p>
              <p className="text-[11px] text-slate-500">Hide student ID and direct phone number. Students must message you through FindIt</p>
            </div>
            <input
              type="checkbox"
              checked={privacyMask}
              onChange={(e) => setPrivacyMask(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
