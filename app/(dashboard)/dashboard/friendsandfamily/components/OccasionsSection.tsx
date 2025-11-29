'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MonthDayPicker } from '@/components/ui/month-day-picker';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { calculateHolidayDate } from '@/lib/holiday-calculator';

const CUSTOM_OCCASIONS = [
  'Birthday',
  'Anniversary (romantic)',
  'Anniversary (work)',
];

const HOLIDAY_OCCASIONS = [
  "New Year's",
  "Valentine's Day",
  "Easter",
  "Mother's Day",
  "Father's Day",
  "Independence Day",
  "Halloween",
  "Thanksgiving",
  "Christmas"
];

const OCCASION_TYPES = [...CUSTOM_OCCASIONS, ...HOLIDAY_OCCASIONS];

// Get color scheme for occasion type - matches /create-reminder gradients
const getOccasionColors = (occasionType: string, relationship?: string) => {
  const type = occasionType.toLowerCase();
  
  // Custom occasions
  if (type.includes('birthday')) {
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      badge: 'bg-gray-100 text-gray-700',
      accent: 'bg-gray-300'
    };
  }
  if (type.includes('anniversary')) {
    // Romantic relationship - Pink gradient
    if (relationship?.toLowerCase() === 'romantic' || type.includes('romantic')) {
      return {
        bg: 'bg-gradient-to-r from-pink-400 to-rose-500',
        border: 'border-pink-400',
        text: 'text-white',
        badge: 'bg-white/20 text-white',
        accent: 'bg-pink-500'
      };
    }
    // All other relationships - Purple gradient
    return {
      bg: 'bg-gradient-to-r from-purple-400 to-purple-600',
      border: 'border-purple-400',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-purple-500'
    };
  }
  
  // Holidays - using same gradients as /create-reminder
  if (type.includes("new year")) {
    return {
      bg: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500',
      border: 'border-amber-500',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-amber-500'
    };
  }
  if (type.includes("valentine")) {
    return {
      bg: 'bg-gradient-to-r from-red-500 to-pink-500',
      border: 'border-red-500',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-red-500'
    };
  }
  if (type.includes("easter")) {
    return {
      bg: 'bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300',
      border: 'border-purple-400',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-purple-400'
    };
  }
  if (type.includes("mother")) {
    return {
      bg: 'bg-gradient-to-r from-pink-400 to-rose-500',
      border: 'border-pink-400',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-pink-400'
    };
  }
  if (type.includes("father")) {
    return {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      border: 'border-blue-500',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-blue-500'
    };
  }
  if (type.includes("independence")) {
    return {
      bg: 'bg-gradient-to-r from-red-500 via-white to-blue-500',
      border: 'border-red-500',
      text: 'text-gray-900',
      badge: 'bg-gray-900/20 text-gray-900',
      accent: 'bg-red-500'
    };
  }
  if (type.includes("halloween")) {
    return {
      bg: 'bg-gradient-to-r from-orange-500 to-purple-600',
      border: 'border-orange-500',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-orange-500'
    };
  }
  if (type.includes("thanksgiving")) {
    return {
      bg: 'bg-gradient-to-r from-amber-600 to-orange-600',
      border: 'border-amber-600',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-amber-600'
    };
  }
  if (type.includes("christmas")) {
    return {
      bg: 'bg-gradient-to-r from-red-600 to-green-600',
      border: 'border-red-600',
      text: 'text-white',
      badge: 'bg-white/20 text-white',
      accent: 'bg-red-600'
    };
  }
  
  // Default
  return {
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    border: 'border-blue-500',
    text: 'text-white',
    badge: 'bg-white/20 text-white',
    accent: 'bg-blue-500'
  };
};

const getHolidayDate = (holiday: string): Date => {
  return calculateHolidayDate(holiday);
};

interface Occasion {
  id: number;
  recipientId: number;
  occasionType: string;
  occasionDate: Date;
  notes: string | null;
  createdAt: Date;
  isJustBecause: boolean;
  computedSendDate: Date | null;
  cardVariation: string | null;
  lastSentYear: number | null;
}

interface OccasionsSectionProps {
  occasions: Occasion[];
  setOccasions: (occasions: Occasion[]) => void;
  relationship: string;
  onDuplicateWarning?: (message: string) => void;
}

export function OccasionsSection({ occasions, setOccasions, relationship, onDuplicateWarning }: OccasionsSectionProps) {
  const [newOccasion, setNewOccasion] = useState({
    type: '',
    date: new Date(),
    notes: '',
  });
  const [expandedOccasions, setExpandedOccasions] = useState<{ [key: number]: boolean }>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [pendingOccasion, setPendingOccasion] = useState<{ type: string; date: Date; notes: string } | null>(null);

  const addOccasionInternal = (occasion: { type: string; date: Date; notes: string }) => {
    // For holidays, use the fixed date
    const occasionDate = HOLIDAY_OCCASIONS.includes(occasion.type)
      ? getHolidayDate(occasion.type)
      : occasion.date;

    const newOcc: Occasion = {
      id: -Date.now(), // Temporary ID
      recipientId: 0, // Will be set on save
      occasionType: occasion.type,
      occasionDate,
      notes: occasion.notes,
      createdAt: new Date(),
      isJustBecause: false,
      computedSendDate: null,
      cardVariation: null,
      lastSentYear: null,
    };
    
    setOccasions([...occasions, newOcc]);
    setNewOccasion({ type: '', date: new Date(), notes: '' });
    setDuplicateWarning(null);
    setPendingOccasion(null);
  };

  const addOccasion = () => {
    if (!newOccasion.type) return;

    // Check for duplicates
    const existingOccasion = occasions.find(occ => occ.occasionType === newOccasion.type);
    if (existingOccasion) {
      const message = `You already have ${newOccasion.type} added. Would you like to add it anyway?`;
      setDuplicateWarning(message);
      setPendingOccasion(newOccasion);
      if (onDuplicateWarning) {
        onDuplicateWarning(message);
      }
      return;
    }

    // No duplicate, add the occasion
    addOccasionInternal(newOccasion);
  };

  const confirmAddDuplicateOccasion = () => {
    if (pendingOccasion) {
      addOccasionInternal(pendingOccasion);
    }
  };

  const removeOccasion = (index: number) => {
    setOccasions(occasions.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Occasions ({occasions.length})</h3>
      <div className="space-y-3 mb-4">
        {occasions.map((occ, index) => {
          const isHoliday = HOLIDAY_OCCASIONS.includes(occ.occasionType);
          const isExpanded = expandedOccasions[index];
          const colors = getOccasionColors(occ.occasionType, relationship);
          
          return (
            <div key={index} className={`border-2 ${colors.border} ${colors.bg} rounded-lg overflow-hidden transition-all`}>
              {/* Occasion Header - Always Visible */}
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Color accent bar */}
                    <div className={`w-1 h-12 ${colors.accent} rounded-full`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${colors.text}`}>{occ.occasionType}</p>
                        {isHoliday && (
                          <span className={`text-xs ${colors.badge} px-2 py-0.5 rounded-full font-medium`}>
                            Fixed Date
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${colors.text} opacity-75 mt-1`}>
                        {new Date(occ.occasionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedOccasions({ ...expandedOccasions, [index]: !isExpanded })}
                    className={`p-2 ${colors.text} opacity-60 hover:opacity-100 rounded transition-colors`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeOccasion(index)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Expanded Content */}
              {isExpanded && (
                <div className={`px-4 pb-4 border-t ${colors.border} pt-4 space-y-3`}>
                  {/* If custom occasion, allow date editing */}
                  {!isHoliday && (
                    <div>
                      <Label className="text-sm mb-2">Edit Date</Label>
                      <MonthDayPicker
                        value={new Date(occ.occasionDate)}
                        onChange={(date) => {
                          const updated = [...occasions];
                          updated[index].occasionDate = date;
                          setOccasions(updated);
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Notes section */}
                  <div>
                    <Label className="text-sm mb-2">Notes for this occasion</Label>
                    <Textarea
                      value={occ.notes || ''}
                      onChange={(e) => {
                        const updated = [...occasions];
                        updated[index].notes = e.target.value;
                        setOccasions(updated);
                      }}
                      rows={2}
                      className="text-sm"
                      placeholder="Add notes for this occasion..."
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Occasion */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add Occasion</h4>
        <div className="space-y-3">
          <select
            value={newOccasion.type}
            onChange={(e) => setNewOccasion({ ...newOccasion, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none"
          >
            <option value="">Select occasion type</option>
            {OCCASION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {newOccasion.type && (() => {
            const previewColors = getOccasionColors(newOccasion.type, relationship);
            const isHoliday = HOLIDAY_OCCASIONS.includes(newOccasion.type);
            
            return (
              <>
                {/* Preview of how the occasion will look */}
                <div className={`border-2 ${previewColors.border} ${previewColors.bg} rounded-lg p-3 transition-all`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-10 ${previewColors.accent} rounded-full`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${previewColors.text}`}>{newOccasion.type}</p>
                        {isHoliday && (
                          <span className={`text-xs ${previewColors.badge} px-2 py-0.5 rounded-full font-medium`}>
                            Fixed Date
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${previewColors.text} opacity-75 mt-1`}>
                        {CUSTOM_OCCASIONS.includes(newOccasion.type)
                          ? newOccasion.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                          : getHolidayDate(newOccasion.type).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Show date picker only for custom occasions */}
                {CUSTOM_OCCASIONS.includes(newOccasion.type) ? (
                  <div>
                    <Label className="text-sm mb-2">Select Date</Label>
                    <MonthDayPicker
                      value={newOccasion.date}
                      onChange={(date) => setNewOccasion({ ...newOccasion, date })}
                    />
                  </div>
                ) : (
                  <div className={`p-3 ${previewColors.bg} ${previewColors.border} border rounded-md`}>
                    <p className={`text-sm ${previewColors.text}`}>
                      {newOccasion.type} is on{' '}
                      {getHolidayDate(newOccasion.type).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
                
                {/* Notes field for new occasion */}
                <div>
                  <Label className="text-sm mb-1">Notes (optional)</Label>
                  <Textarea
                    value={newOccasion.notes}
                    onChange={(e) => setNewOccasion({ ...newOccasion, notes: e.target.value })}
                    rows={2}
                    className="text-sm"
                    placeholder="Add notes for this occasion..."
                  />
                </div>
                
                <Button
                  type="button"
                  onClick={addOccasion}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Occasion
                </Button>
              </>
            );
          })()}
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 m-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Duplicate Occasion</h3>
                <p className="text-sm text-gray-600">{duplicateWarning}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDuplicateWarning(null);
                  setPendingOccasion(null);
                  setNewOccasion({ type: '', date: new Date(), notes: '' });
                }}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAddDuplicateOccasion}
                className="px-4 bg-amber-500 hover:bg-amber-600 text-white"
              >
                Add Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

