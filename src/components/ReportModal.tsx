import React, { useState } from 'react';
import {
  X,
  Plus,
  HelpCircle,
  PlusCircle,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Tag,
  AlertCircle
} from 'lucide-react';
import { CampusItem, ItemType, ItemCategory } from '../types/campus';

interface ReportModalProps {
  isOpen: boolean;
  initialType?: ItemType;
  onClose: () => void;
  onSubmit: (item: CampusItem) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  initialType = 'Lost',
  onClose,
  onSubmit
}) => {
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('2:00 PM');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an item name.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify the campus building or area.');
      return;
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newItem: CampusItem = {
      id: `ITM-${randomId}`,
      name: name.trim(),
      type: itemType,
      category,
      status: 'Active',
      location: location.trim(),
      date: date || new Date().toISOString().slice(0, 10),
      time: time || 'Today',
      description: description.trim() || 'No additional details provided.',
      reward: reward.trim() || undefined,
      reportedBy: {
        name: 'Divyansh Tyagi',
        studentId: 'ST-27120',
        avatar: 'DT',
        email: 'divyansh@campus.edu'
      },
      potentialMatches: itemType === 'Lost' ? 1 : 0
    };

    onSubmit(newItem);
    // Reset state
    setName('');
    setLocation('');
    setDescription('');
    setReward('');
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

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Report Campus Belonging
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit report to broadcast across university network
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Segmented Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setItemType('Lost')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  itemType === 'Lost'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>I Lost Something</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType('Found')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  itemType === 'Found'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>I Found Something</span>
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Item Name & Brand
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Navy Blue Hydro Flask 32oz, AirPods Pro Case, Stanford Lanyard..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ID & Cards">ID & Cards</option>
                <option value="Electronics">Electronics</option>
                <option value="Keys & Lanyards">Keys & Lanyards</option>
                <option value="Bottles & Tumblers">Bottles & Tumblers</option>
                <option value="Bags & Backpacks">Bags & Backpacks</option>
                <option value="Books & Notes">Books & Notes</option>
                <option value="Clothing & Accessories">Clothing & Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Date {itemType === 'Lost' ? 'Lost' : 'Found'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Campus Location / Building
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Main Library 3rd Floor, Student Union Cafe, Gym Rm 102..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Approximate Time
              </label>
              <input
                type="text"
                placeholder="e.g. 3:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Distinguishing Features, Marks & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Describe color, stickers, scratches, initials, case type, or drop-off location..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Photo Upload Area Placeholder */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Photo of Item (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 text-center bg-slate-50/50 cursor-pointer">
              <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-700">
                Click to attach photo or drag file here
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Supports JPG, PNG up to 10MB (Supabase Storage integration upcoming)
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-white shadow-xs transition-colors cursor-pointer ${
                itemType === 'Lost'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Submit {itemType} Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
