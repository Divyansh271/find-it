import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Share2,
  ShieldCheck,
  User,
  Mail,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import { CampusItem } from '../types/campus';

interface ItemDetailModalProps {
  item: CampusItem | null;
  onClose: () => void;
  onMarkRecovered: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onMarkRecovered
}) => {
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  if (!item) return null;

  const isLost = item.type === 'Lost';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowMessageBox(false);
      setMessageText('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isLost
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {item.type} Item
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {item.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Title & Category */}
          <div>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              {item.category}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {item.name}
            </h2>
          </div>

          {/* Location & Time Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Campus Location</span>
                <span>{item.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-600 pt-2 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.date}</span>
              </div>
              {item.time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h3 className="font-bold text-slate-900 mb-1.5">
              Description & Identifying Marks
            </h3>
            <p className="text-slate-700 leading-relaxed bg-white border border-slate-100 rounded-xl p-3.5 text-xs">
              {item.description}
            </p>
          </div>

          {/* Potential AI Match Callout if available */}
          {item.potentialMatches && item.potentialMatches > 0 ? (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-900">
                  {item.potentialMatches} Potential AI Similarities Detected
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Our campus matching engine found reports with matching keywords and building proximity.
                </p>
              </div>
            </div>
          ) : null}

          {/* Reporter Details */}
          <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
                {item.reportedBy.avatar}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{item.reportedBy.name}</p>
                <p className="text-[11px] text-slate-500">
                  {item.reportedBy.studentId || 'Verified Student'} · {item.reportedBy.email}
                </p>
              </div>
            </div>

            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Campus Verified
            </span>
          </div>

          {/* Message form trigger */}
          {showMessageBox ? (
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
              <label className="block font-semibold text-slate-800">
                Message {item.reportedBy.name}
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Hi, I believe this is my item! I can describe the sticker..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMessageBox(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs"
                >
                  Send Message
                </button>
              </div>
            </form>
          ) : null}

          {messageSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Message dispatched to {item.reportedBy.name}'s campus inbox.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onMarkRecovered(item.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mark Recovered</span>
          </button>

          <div className="flex items-center gap-2">
            {!showMessageBox && (
              <button
                type="button"
                onClick={() => setShowMessageBox(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Student</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
