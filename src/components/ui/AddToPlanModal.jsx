import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import Button from './Button';

const AddToPlanModal = ({ isOpen, onClose, onSave, recipeTitle }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
  const [slot, setSlot] = useState('dinner');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(date, slot);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z- [60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-orange-600" size={20} />
            Add to Meal Plan
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500">
            Scheduling: <span className="font-bold text-gray-900">{recipeTitle}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal</label>
            <div className="grid grid-cols-3 gap-2">
              {['breakfast', 'lunch', 'dinner'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium capitalize border transition-all ${
                    slot === s 
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} isLoading={saving} className="w-full gap-2">
            <Check size={18} /> Save to Planner
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AddToPlanModal;