'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Search, Plus, Calendar, MapPin, Trash2, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { RecipientWithOccasions } from '@/lib/db/schema';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { US_STATES } from '@/lib/us-states';
import { MonthDayPicker } from '@/components/ui/month-day-picker';
import { CardAllocation } from '@/lib/card-allocation';
import { CardLimitWarning } from '@/components/ui/card-limit-warning';
import { useRouter } from 'next/navigation';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }
  
  return data;
};

const RELATIONSHIP_OPTIONS = ['Friend', 'Family', 'Romantic', 'Professional'];

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

// Calculate fixed holiday dates for current year
const getHolidayDate = (holiday: string): Date => {
  const year = new Date().getFullYear();
  switch (holiday) {
    case "New Year's":
      return new Date(year, 0, 1);
    case "Valentine's Day":
      return new Date(year, 1, 14);
    case "Independence Day":
      return new Date(year, 6, 4);
    case "Halloween":
      return new Date(year, 9, 31);
    case "Christmas":
      return new Date(year, 11, 25);
    default:
      return new Date(year, 0, 1);
  }
};

// Get colors based on relationship
const getRelationshipColors = (relationship: string) => {
  switch (relationship.toLowerCase()) {
    case 'family':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: 'text-green-600',
        avatar: 'bg-green-500'
      };
    case 'friend':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        avatar: 'bg-blue-500'
      };
    case 'romantic':
      return {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        icon: 'text-pink-600',
        avatar: 'bg-pink-500'
      };
    case 'professional':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        avatar: 'bg-purple-500'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        avatar: 'bg-gray-500'
      };
  }
};

interface RecipientCardProps {
  recipient: RecipientWithOccasions;
  onEdit: (recipient: RecipientWithOccasions) => void;
}

function RecipientCard({ recipient, onEdit }: RecipientCardProps) {
  const colors = getRelationshipColors(recipient.relationship);
  
  // Get next upcoming occasion
  const nextOccasion = recipient.occasions?.[0];
  
  return (
    <div 
      onClick={() => onEdit(recipient)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">
            {recipient.firstName} {recipient.lastName}
          </h3>
          <span className={`text-xs ${colors.text} ${colors.bg} px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2`}>
            {recipient.relationship}
          </span>
        </div>
        
        <div className="space-y-1">
          {/* Address */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className={`w-4 h-4 ${colors.icon}`} />
            <span>{recipient.city}, {recipient.state}</span>
          </div>
          
          {/* Next Occasion */}
          {nextOccasion && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className={`w-4 h-4 ${colors.icon}`} />
              <span>{nextOccasion.occasionType} - {new Date(nextOccasion.occasionDate).toLocaleDateString()}</span>
            </div>
          )}
          
          {/* Occasions count */}
          {recipient.occasions && recipient.occasions.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {recipient.occasions.length} occasion{recipient.occasions.length !== 1 ? 's' : ''} tracked
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  recipient: RecipientWithOccasions;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteModal({ recipient, isOpen, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-medium text-gray-900">Delete Recipient</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{recipient.firstName} {recipient.lastName}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium mb-2">⚠️ Warning</p>
            <p className="text-red-700 text-sm">
              This action cannot be undone. All {recipient.occasions?.length || 0} occasion{recipient.occasions?.length !== 1 ? 's' : ''} and reminders for this recipient will be permanently deleted.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Recipient'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EditRecipientModalProps {
  recipient: RecipientWithOccasions;
  onClose: () => void;
  onSave: () => void;
  onDelete: (recipient: RecipientWithOccasions) => void;
}

function EditRecipientModal({ recipient, onClose, onSave, onDelete }: EditRecipientModalProps) {
  const router = useRouter();
  const { data: allocation, mutate: mutateAllocation } = useSWR<CardAllocation>('/api/card-allocation', fetcher);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessWithWarning, setShowSuccessWithWarning] = useState(false);
  const [formData, setFormData] = useState({
    firstName: recipient.firstName,
    lastName: recipient.lastName,
    relationship: recipient.relationship,
    street: recipient.street,
    apartment: recipient.apartment || '',
    city: recipient.city,
    state: recipient.state,
    zip: recipient.zip,
    notes: recipient.notes || '',
  });

  const [occasions, setOccasions] = useState(
    recipient.occasions?.map(occ => ({
      ...occ,
      occasionDate: new Date(occ.occasionDate),
    })) || []
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [newOccasion, setNewOccasion] = useState({
    type: '',
    date: new Date(),
    notes: '',
  });

  const [editingNotes, setEditingNotes] = useState<{ [key: number]: boolean }>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [expandedOccasions, setExpandedOccasions] = useState<{ [key: number]: boolean }>({});

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('[EditRecipientModal] Saving with occasions:', occasions);
      
      const response = await fetch(`/api/recipients/${recipient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            relationship: formData.relationship,
            street: formData.street,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            notes: formData.notes,
          },
          occasionsData: occasions.map(occ => ({
            occasionType: occ.occasionType,
            occasionDate: occ.occasionDate.toISOString(),
            notes: occ.notes || '',
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update recipient');
      }

      // Refresh card allocation and recipients list
      await mutateAllocation();
      onSave(); // Always refresh the list so the new occasion appears
      
      // Check if we should show warning
      const updatedAllocation = await mutateAllocation();
      if (updatedAllocation && updatedAllocation.isOverLimit) {
        setShowSuccessWithWarning(true);
      }
    } catch (error) {
      console.error('Error updating recipient:', error);
      alert('Failed to update recipient. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addOccasion = () => {
    if (!newOccasion.type) return;

    // Check for duplicates
    const isDuplicate = occasions.some(
      (occ) => occ.occasionType.toLowerCase() === newOccasion.type.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicateWarning(`You already have a ${newOccasion.type} occasion for this recipient. Are you sure you want to add another?`);
      return;
    }

    // For holidays, use the fixed date
    const occasionDate = HOLIDAY_OCCASIONS.includes(newOccasion.type)
      ? getHolidayDate(newOccasion.type)
      : newOccasion.date;

    const newOcc = {
      id: -Date.now(), // Temporary ID
      recipientId: recipient.id,
      occasionType: newOccasion.type,
      occasionDate,
      notes: newOccasion.notes,
      createdAt: new Date(),
      isJustBecause: false,
      computedSendDate: null,
      cardVariation: null,
      lastSentYear: null,
    };
    
    setOccasions([
      ...occasions,
      newOcc,
    ]);
    
    setNewOccasion({ type: '', date: new Date(), notes: '' });
    setDuplicateWarning(null);
  };

  const confirmAddDuplicateOccasion = () => {
    if (!newOccasion.type) return;

    // For holidays, use the fixed date
    const occasionDate = HOLIDAY_OCCASIONS.includes(newOccasion.type)
      ? getHolidayDate(newOccasion.type)
      : newOccasion.date;

    setOccasions([
      ...occasions,
      {
        id: -Date.now(), // Temporary ID
        recipientId: recipient.id,
        occasionType: newOccasion.type,
        occasionDate,
        notes: newOccasion.notes,
        createdAt: new Date(),
        isJustBecause: false,
        computedSendDate: null,
        cardVariation: null,
        lastSentYear: null,
      },
    ]);
    setNewOccasion({ type: '', date: new Date(), notes: '' });
    setDuplicateWarning(null);
  };

  const removeOccasion = (index: number) => {
    setOccasions(occasions.filter((_, i) => i !== index));
  };

  if (!mounted) return null;

  // Show success screen with card limit warning
  if (showSuccessWithWarning && allocation) {
    const successContent = (
      <>
        <div className="fixed inset-0 bg-white z-[9999]" />
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 z-[10000] overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-4">Recipient Updated!</h2>
                <p className="text-gray-600 mb-8">
                  Your changes have been saved successfully.
                </p>

                {allocation.isOverLimit && (
                  <div className="mb-8">
                    <CardLimitWarning 
                      allocation={allocation}
                      showDismiss={true}
                      onDismiss={() => {
                        onSave();
                        router.push('/dashboard');
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSave}
                    className="px-6"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
    return createPortal(successContent, document.body);
  }

  const modalContent = (
    <>
      {/* Overlay to hide everything behind */}
      <div className="fixed inset-0 bg-white z-[9999]" />
      
      {/* Modal content */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 z-[10000] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <h2 className="text-xl sm:text-2xl font-medium text-gray-900">Edit Recipient</h2>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

        <div className="space-y-6 pb-24">
          {/* Personal Info */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="relationship">Relationship</Label>
              <select
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none"
              >
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="apartment"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    maxLength={5}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Occasions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Occasions ({occasions.length})</h3>
            <div className="space-y-3 mb-4">
              {occasions.map((occ, index) => {
                const isHoliday = HOLIDAY_OCCASIONS.includes(occ.occasionType);
                const isExpanded = expandedOccasions[index];
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    {/* Occasion Header - Always Visible */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{occ.occasionType}</p>
                          {isHoliday && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Fixed Date
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(occ.occasionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedOccasions({ ...expandedOccasions, [index]: !isExpanded })}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
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
                      <div className="px-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
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

                {newOccasion.type && (
                  <>
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
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">
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
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-1"
              placeholder="Add any additional notes..."
            />
          </div>
        </div>

        {/* Sticky bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20 p-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                onDelete(recipient);
                onClose();
              }}
              disabled={isSaving}
              className="px-6 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Recipient
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="px-6 flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.firstName || !formData.lastName || !formData.street || !formData.city || !formData.state || !formData.zip}
                className="px-6 bg-gray-900 hover:bg-gray-800 text-white flex-1 sm:flex-initial"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
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
    </>
  );

  return createPortal(modalContent, document.body);
}

export default function FriendsAndFamilyPage() {
  const { data: recipients, error, isLoading, mutate } = useSWR<RecipientWithOccasions[]>('/api/recipients', fetcher);
  const { mutate: mutateAllocation } = useSWR<CardAllocation>('/api/card-allocation', fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [filterOccasion, setFilterOccasion] = useState('all');
  
  // Edit/Delete state
  const [recipientToEdit, setRecipientToEdit] = useState<RecipientWithOccasions | null>(null);
  const [recipientToDelete, setRecipientToDelete] = useState<RecipientWithOccasions | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Ensure recipients is an array (handle API errors that return objects)
  const recipientsList = Array.isArray(recipients) ? recipients : [];

  // Get unique relationships and occasions for filters
  const relationships = Array.from(new Set(recipientsList.map(r => r.relationship)));
  const occasions = Array.from(new Set(
    recipientsList.flatMap(r => r.occasions?.map(o => o.occasionType) || [])
  ));

  // Filter recipients
  const filteredRecipients = recipientsList.filter(recipient => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      `${recipient.firstName} ${recipient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Relationship filter
    const matchesRelationship = filterRelationship === 'all' || 
      recipient.relationship === filterRelationship;
    
    // Occasion filter
    const matchesOccasion = filterOccasion === 'all' || 
      recipient.occasions?.some(o => o.occasionType === filterOccasion);
    
    return matchesSearch && matchesRelationship && matchesOccasion;
  });

  // Handlers
  const handleDelete = async () => {
    if (!recipientToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipients/${recipientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete error:', errorData);
        throw new Error(errorData.error || 'Failed to delete recipient');
      }

      // Refresh the list
      await mutate();
      mutateAllocation(); // Refresh card allocation after deletion
      setRecipientToDelete(null);
    } catch (error) {
      console.error('Error deleting recipient:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete recipient. Please try again.';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900">
          Friends & Family
        </h1>
        <Link
          href="/create-reminder"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-base font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Recipient
        </Link>
      </div>

      {/* Recipients Container with Colorful Background */}
      <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl p-4 sm:p-6 lg:p-8">
        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-600">
            Manage all your recipients and their special occasions in one place
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={filterRelationship}
                onChange={(e) => setFilterRelationship(e.target.value)}
                className="appearance-none w-full px-4 py-3 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer text-sm font-medium sm:min-w-[180px]"
              >
                <option value="all">All Relationships</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={filterOccasion}
                onChange={(e) => setFilterOccasion(e.target.value)}
                className="appearance-none w-full px-4 py-3 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer text-sm font-medium sm:min-w-[180px]"
              >
                <option value="all">All Occasions</option>
                {occasions.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">Failed to load recipients</p>
                <p className="text-sm text-red-700 mb-2">
                  {typeof error === 'object' && error.message ? error.message : 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => mutate()}
                  className="text-sm text-red-700 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && recipientsList.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No recipients yet</h3>
            <p className="text-gray-600 mb-6">Start by adding people you'd like to send cards to</p>
            <Link
              href="/create-reminder"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-base font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Your First Recipient
            </Link>
          </div>
        )}

        {/* Recipients Grid */}
        {!isLoading && !error && filteredRecipients && filteredRecipients.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredRecipients.length} of {recipientsList.length} recipient{recipientsList.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {filteredRecipients.map((recipient) => (
                <RecipientCard 
                  key={recipient.id} 
                  recipient={recipient}
                  onEdit={setRecipientToEdit}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* No Results State */}
      {!isLoading && !error && filteredRecipients && filteredRecipients.length === 0 && recipients && recipients.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterRelationship('all');
              setFilterOccasion('all');
            }}
            className="text-gray-900 underline hover:text-gray-700"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {recipientToDelete && (
        <DeleteModal
          recipient={recipientToDelete}
          isOpen={!!recipientToDelete}
          onClose={() => setRecipientToDelete(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Edit Recipient Modal */}
      {recipientToEdit && (
        <EditRecipientModal
          recipient={recipientToEdit}
          onClose={() => setRecipientToEdit(null)}
          onSave={async () => {
            await mutate();
            mutateAllocation(); // Refresh card allocation
            setRecipientToEdit(null);
          }}
          onDelete={setRecipientToDelete}
        />
      )}
    </div>
  );
}
