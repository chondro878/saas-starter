'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/browserClient';
import { US_STATES } from '@/lib/us-states';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MonthDayPicker } from '@/components/ui/month-day-picker';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { AlertCircle, Check, X, HelpCircle } from 'lucide-react';
import { calculateHolidayDate } from '@/lib/holiday-calculator';

// --- Schema definition for the reminder form using Zod ---
const reminderFormSchema = z.object({
  firstPerson: z.object({
    salutation: z.string().optional(),
    first: z.string().min(1, "First name is required"),
    last: z.string().min(1, "Last name is required"),
  }),
  secondPersonEnabled: z.boolean().optional(),
  secondPerson: z.object({
    salutation: z.string().optional(),
    first: z.string().optional(),
    last: z.string().optional(),
  }).optional(),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    apartment: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "Zip code is required"),
  }),
  date: z.date().optional(),
  occasion: z.string().optional(),
  relationship: z.string().optional(),
  note: z.string().optional(),
  occasionNotes: z.record(z.string(), z.string().optional()).optional(),
});

type ReminderFormData = z.infer<typeof reminderFormSchema>;

export default function CreateReminderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Address validation state
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean;
    result: any | null;
    showSuggestion: boolean;
  }>({
    isValidating: false,
    result: null,
    showSuggestion: false,
  });

  // --- Form setup with react-hook-form and Zod resolver ---
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {},
  });

  // --- State tracking for selected occasions and their dates ---
  const [selectedCustomOccasions, setSelectedCustomOccasions] = useState<string[]>([]);
  const [selectedHolidayOccasions, setSelectedHolidayOccasions] = useState<string[]>([]);
  const [customDates, setCustomDates] = useState<{ [occasion: string]: Date | undefined }>({});

  // Validate address when reaching step 5
  useEffect(() => {
    if (currentStep === 5 && !addressValidation.result) {
      validateAddressFields();
    }
  }, [currentStep]);

  // --- Watch form fields for dynamic updates ---
  const firstPerson = watch("firstPerson") || { first: '', last: '' };
  const secondPersonEnabled = watch("secondPersonEnabled") || false;
  const secondPerson = watch("secondPerson") || { first: '', last: '' };
  const address = watch("address") || { street: '', city: '', state: '', zip: '' };
  const relationship = watch("relationship");
  const note = watch("note") || '';

  // --- Occasion lists ---
  const customOccasions = [
    { value: "Birthday", label: "Birthday" },
    { value: "Anniversary (romantic)", label: "Anniversary (romantic)" },
    { value: "Anniversary (work)", label: "Anniversary (work)" },
  ];

  const holidayOccasions = [
    { value: "New Year's", label: "New Year's", dateLabel: "Jan 1" },
    { value: "Valentine's Day", label: "Valentine's Day", dateLabel: "Feb 14" },
    { value: "St. Patrick's Day", label: "St. Patrick's Day", dateLabel: "Mar 17" },
    { value: "Easter", label: "Easter", dateLabel: "Spring (varies)" },
    { value: "Mother's Day", label: "Mother's Day", dateLabel: "2nd Sunday of May" },
    { value: "Father's Day", label: "Father's Day", dateLabel: "3rd Sunday of June" },
    { value: "Independence Day", label: "Independence Day", dateLabel: "July 4" },
    { value: "Halloween", label: "Halloween", dateLabel: "Oct 31" },
    { value: "Thanksgiving", label: "Thanksgiving", dateLabel: "4th Thursday of Nov" },
    { value: "Christmas", label: "Christmas", dateLabel: "Dec 25" },
  ];

  const relationshipOptions = ['Friend', 'Family', 'Romantic', 'Professional'];

  // Get colors based on relationship
  const getRelationshipColors = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'family':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-500',
          hoverBorder: 'hover:border-green-400',
          selected: 'bg-green-500 text-white border-green-500'
        };
      case 'friend':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-500',
          hoverBorder: 'hover:border-blue-400',
          selected: 'bg-blue-500 text-white border-blue-500'
        };
      case 'romantic':
        return {
          bg: 'bg-pink-100',
          text: 'text-pink-700',
          border: 'border-pink-500',
          hoverBorder: 'hover:border-pink-400',
          selected: 'bg-pink-500 text-white border-pink-500'
        };
      case 'professional':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-500',
          hoverBorder: 'hover:border-purple-400',
          selected: 'bg-purple-500 text-white border-purple-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-500',
          hoverBorder: 'hover:border-gray-400',
          selected: 'bg-gray-900 text-white border-gray-900'
        };
    }
  };

  // Get colors for occasions based on relationship correlations
  const getOccasionColors = (occasion: string) => {
    const occasionLower = occasion.toLowerCase();
    
    // Personal occasions - correlate with relationships
    if (occasionLower.includes('birthday')) {
      return {
        selected: 'bg-gray-100 text-gray-800 border-gray-300',
        default: 'bg-gray-100 text-gray-800 border-gray-200 hover:border-gray-300',
        decoration: 'confetti' // Fizzy circle drop animation
      };
    }
    if (occasionLower.includes('anniversary')) {
      // Work anniversary - Professional colors
      if (occasionLower.includes('work')) {
        return {
          selected: 'bg-purple-50 text-purple-800 border-purple-300',
          default: 'bg-purple-50 text-purple-800 border-purple-200 hover:border-purple-300',
          decoration: 'professional' // Purple circles
        };
      }
      // Romantic anniversary - Romantic colors with hearts
      return {
        selected: 'bg-pink-50 text-pink-800 border-pink-300',
        default: 'bg-pink-50 text-pink-800 border-pink-200 hover:border-pink-300',
        decoration: 'hearts' // Floating hearts
      };
    }
    
    // Holiday occasions - correlate with relationships
    if (occasionLower.includes('new year')) {
      return {
        selected: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-white border-amber-500',
        default: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300',
        decoration: 'none' // No sparkles, just gold gradient
      };
    }
    if (occasionLower.includes('valentine')) {
      return {
        selected: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-500',
        default: 'bg-red-50 text-red-700 border-red-200 hover:border-red-300',
        decoration: 'none' // No decoration, just gradient like St. Patrick's
      };
    }
    if (occasionLower.includes('patrick')) {
      return {
        selected: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500',
        default: 'bg-green-50 text-green-700 border-green-200 hover:border-green-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('easter')) {
      return {
        selected: 'bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 text-white border-purple-400',
        default: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('mother')) {
      return {
        selected: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white border-pink-400',
        default: 'bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('father')) {
      return {
        selected: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500',
        default: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('independence')) {
      return {
        selected: 'bg-gradient-to-r from-red-500 via-white to-blue-500 text-gray-900 border-red-500',
        default: 'bg-red-50 text-red-700 border-red-200 hover:border-red-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('halloween')) {
      return {
        selected: 'bg-gradient-to-r from-orange-500 to-purple-600 text-white border-orange-500',
        default: 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('thanksgiving')) {
      return {
        selected: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-600',
        default: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300',
        decoration: 'none'
      };
    }
    if (occasionLower.includes('christmas')) {
      return {
        selected: 'bg-gradient-to-r from-red-600 to-green-600 text-white border-red-600',
        default: 'bg-red-50 text-red-700 border-red-200 hover:border-red-300',
        decoration: 'none'
      };
    }
    
    // Default - Friend colors
    return {
      selected: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500',
      default: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
      decoration: 'none'
    };
  };

  // --- Occasion selection handlers ---
  const toggleCustomOccasion = (val: string) => {
    setSelectedCustomOccasions(prev => {
      if (prev.includes(val)) {
        const next = prev.filter(item => item !== val);
        setCustomDates(cd => {
          const { [val]: _, ...rest } = cd;
          return rest;
        });
        return next;
      } else {
        return [...prev, val];
      }
    });
  };

  const toggleHolidayOccasion = (val: string) => {
    setSelectedHolidayOccasions(prev => {
      if (prev.includes(val)) {
        return prev.filter(item => item !== val);
      } else {
        return [...prev, val];
      }
    });
  };

  const isCustomOccasionSelected = (val: string) => selectedCustomOccasions.includes(val);
  const isHolidayOccasionSelected = (val: string) => selectedHolidayOccasions.includes(val);

  // --- Navigation logic ---
  const handleNext = async () => {
    // Validate address before leaving step 1
    if (currentStep === 1) {
      if (!addressValidation.result) {
        await validateAddressFields();
      }
      // Check if validation shows undeliverable
      if (addressValidation.result?.verdict === 'UNDELIVERABLE') {
        return; // Don't proceed if address is undeliverable
      }
      setCurrentStep(2);
      return;
    }
    
    if (currentStep === 3) {
      if (selectedCustomOccasions.length > 0) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 5 && selectedCustomOccasions.length > 0) {
      setCurrentStep(4);
    } else if (currentStep === 4 && selectedCustomOccasions.length > 0) {
      setCurrentStep(3);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Save logic ---
  const handleFinish = async (data: ReminderFormData) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage('You must be signed in to create a reminder. Please sign in and try again.');
        router.push('/sign-in?redirect=/create-reminder');
        return;
      }
      // Prepare recipient data
      const recipientData = {
        firstName: data.firstPerson.first,
        lastName: data.firstPerson.last,
        relationship: data.relationship || 'Friend',
        street: data.address.street,
        apartment: data.address.apartment || '',
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        country: 'United States',
        notes: data.note || '',
      };

      // Prepare occasions data
      const occasionsData = [];
      
      // Add custom occasions with their dates
      for (const occasion of selectedCustomOccasions) {
        if (customDates[occasion]) {
          // Ensure the date is a proper Date object
          const dateValue = customDates[occasion];
          const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue!);
          
          if (isNaN(dateObj.getTime())) {
            console.error(`Invalid date for ${occasion}:`, dateValue);
            continue; // Skip invalid dates
          }
          
          occasionsData.push({
            occasionType: occasion,
            occasionDate: dateObj.toISOString(),
            notes: data.occasionNotes?.[occasion] || '',
          });
        }
      }

      // Add holiday occasions with properly calculated dates
      for (const occasion of selectedHolidayOccasions) {
        const occasionDate = calculateHolidayDate(occasion);
        
        occasionsData.push({
          occasionType: occasion,
          occasionDate: occasionDate.toISOString(),
          notes: data.occasionNotes?.[occasion] || '',
        });
      }

      // Save via API
      console.log('Sending recipient data:', { recipientData, occasionsData });
      
      const response = await fetch('/api/recipients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientData,
          occasionsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to save recipient');
      }

      const result = await response.json();
      console.log('Recipient created successfully:', result);
      
      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to save reminder:', error);
      const message = error instanceof Error ? error.message : 'Failed to save reminder. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = selectedCustomOccasions.length > 0 ? 5 : 4;

  // Address validation function
  const validateAddressFields = async () => {
    const addressData = watch('address');
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zip) {
      return;
    }

    setAddressValidation({ isValidating: true, result: null, showSuggestion: false });

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: addressData.street,
          apartment: addressData.apartment || '',
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAddressValidation({
          isValidating: false,
          result,
          showSuggestion: result.verdict === 'CORRECTABLE' || result.verdict === 'UNDELIVERABLE',
        });
      }
    } catch (error) {
      console.error('Address validation failed:', error);
      setAddressValidation({ isValidating: false, result: null, showSuggestion: false });
    }
  };

  const applySuggestedAddress = () => {
    if (addressValidation.result?.suggestedAddress) {
      const suggested = addressValidation.result.suggestedAddress;
      setValue('address.street', suggested.street);
      setValue('address.apartment', suggested.apartment || '');
      setValue('address.city', suggested.city);
      setValue('address.state', suggested.state);
      setValue('address.zip', suggested.zip);
      setAddressValidation({ ...addressValidation, showSuggestion: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light text-gray-900">Create Your Reminder</h1>
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {/* Progress Bar - Only show for steps 1-5 */}
          {currentStep <= totalSteps && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-gray-600">
                  {currentStep === totalSteps ? '99' : Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${currentStep === totalSteps ? 99 : (currentStep / totalSteps) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <form onSubmit={handleSubmit(handleFinish)}>
          {/* Step 1: Who is this for? */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">Who is this for?</h2>
                <p className="text-gray-600">Tell us about the person you want to remember.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">First Name</Label>
                    <Input
                      placeholder="First Name"
                      {...register("firstPerson.first")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                    {errors.firstPerson?.first && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstPerson.first.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Last Name</Label>
                    <Input
                      placeholder="Last Name"
                      {...register("firstPerson.last")}
                      onChange={(e) => {
                        const newLast = e.target.value;
                        setValue("firstPerson.last", newLast);
                        if (secondPersonEnabled && !secondPerson.last) {
                          setValue("secondPerson.last", newLast);
                        }
                      }}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="text-sm cursor-pointer text-gray-600 hover:text-gray-800 underline underline-offset-4"
                    onClick={() => setValue("secondPersonEnabled", !secondPersonEnabled)}
                  >
                    Is this a couple?
                  </span>
                </div>

                {secondPersonEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">Partner's First Name</Label>
                      <Input
                        placeholder="First Name"
                        {...register("secondPerson.first")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">Partner's Last Name</Label>
                      <Input
                        placeholder="Last Name"
                        {...register("secondPerson.last")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6">
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    Recipient's Address (US only)
                  </Label>
                  <div className="space-y-4">
                    <Input
                      placeholder="Street Address"
                      {...register("address.street")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                    <Input
                      placeholder="Apt, Suite, etc. (optional)"
                      {...register("address.apartment")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        placeholder="City"
                        {...register("address.city")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                      <select
                        {...register("address.state")}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-900"
                      >
                        <option value="">Select State</option>
                        {US_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Zip Code"
                        {...register("address.zip")}
                        maxLength={5}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !firstPerson.first ||
                    !firstPerson.last ||
                    !address.street ||
                    !address.city ||
                    !address.state ||
                    !address.zip
                  }
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Relationship */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">What kind of relationship is this?</h2>
                <p className="text-gray-600">This helps us personalize the card.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {relationshipOptions.map((option) => {
                  const colors = getRelationshipColors(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("relationship", option)}
                      className={cn(
                        "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left",
                        relationship === option 
                          ? colors.selected
                          : `${colors.bg} ${colors.text} border-gray-200 ${colors.hoverBorder}`
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Occasions */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">What kind of card do you need?</h2>
                <p className="text-gray-600">Select the occasions you want to remember.</p>
              </div>
              
              <div className="space-y-8">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    Personal Occasions <span className="text-xs text-gray-500">(date required)</span>
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {customOccasions.map((item) => {
                      const colors = getOccasionColors(item.value);
                      const isSelected = isCustomOccasionSelected(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleCustomOccasion(item.value)}
                          className={cn(
                            "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left relative overflow-hidden",
                            isSelected ? colors.selected : colors.default,
                            isSelected && colors.decoration === 'confetti' && "occasion-confetti",
                            isSelected && colors.decoration === 'hearts' && "occasion-hearts",
                            isSelected && colors.decoration === 'sparkles' && "occasion-sparkles",
                            isSelected && colors.decoration === 'professional' && "occasion-professional"
                          )}
                        >
                          <span className="relative z-10">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    Holidays <span className="text-xs text-gray-500">(date is fixed)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {holidayOccasions.map((item) => {
                      const colors = getOccasionColors(item.value);
                      const isSelected = isHolidayOccasionSelected(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleHolidayOccasion(item.value)}
                          className={cn(
                            "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left relative overflow-hidden",
                            isSelected ? colors.selected : colors.default,
                            isSelected && colors.decoration === 'confetti' && "occasion-confetti",
                            isSelected && colors.decoration === 'hearts' && "occasion-hearts",
                            isSelected && colors.decoration === 'sparkles' && "occasion-sparkles",
                            isSelected && colors.decoration === 'professional' && "occasion-professional"
                          )}
                        >
                          <span className="relative z-10">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedCustomOccasions.length === 0 && selectedHolidayOccasions.length === 0}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Dates (only if custom occasions selected) */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">When is it?</h2>
                <p className="text-gray-600">Pick the month and day for each occasion.</p>
              </div>
              
              <div className="space-y-8">
                {selectedCustomOccasions.map((oc) => {
                  const colors = getOccasionColors(oc);
                  return (
                    <div 
                      key={oc} 
                      className={cn(
                        "p-6 rounded-lg border-2 relative overflow-hidden",
                        colors.selected,
                        colors.decoration === 'confetti' && "occasion-confetti",
                        colors.decoration === 'hearts' && "occasion-hearts",
                        colors.decoration === 'sparkles' && "occasion-sparkles",
                        colors.decoration === 'professional' && "occasion-professional"
                      )}
                    >
                      <h3 className="text-xl font-medium mb-4 relative z-10">{oc}</h3>
                      <div className="relative z-10">
                        <MonthDayPicker
                          value={customDates[oc]}
                          onChange={(date: Date) => {
                            setCustomDates((prev) => ({
                              ...prev,
                              [oc]: date,
                            }));
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between pt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedCustomOccasions.length > 0 && selectedCustomOccasions.some(oc => !customDates[oc])}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Notes & Review */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">Review & Add Notes</h2>
                <p className="text-gray-600">Review the details and add optional reminders for future you.</p>
              </div>

              {/* Recipient Review */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recipient</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Edit Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Name & Address */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                      <p className="font-medium text-lg">
                        {firstPerson.first} {firstPerson.last}
                        {secondPersonEnabled && secondPerson.first && (
                          <> & {secondPerson.first} {secondPerson.last}</>
                        )}
                      </p>
                    </div>
                    
                    {/* Address */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="font-medium">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
                      <p>{address.city}, {address.state} {address.zip}</p>
                    </div>
                  </div>
                  
                  {/* Right Column: Relationship & Occasions */}
                  <div className="space-y-4">
                    {/* Relationship */}
                    {relationship && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Relationship</p>
                        <p className="font-medium">{relationship}</p>
                      </div>
                    )}
                    
                    {/* Occasions */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Occasions</p>
                      <div className="space-y-2">
                        {selectedCustomOccasions.map((oc) => (
                          <div key={oc} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{oc}</span>
                            {customDates[oc] && (
                              <span className="text-xs text-gray-600">
                                ({customDates[oc]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                              </span>
                            )}
                          </div>
                        ))}
                        {selectedHolidayOccasions.map((oc) => (
                          <div key={oc} className="text-sm font-medium">
                            {oc}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Validation Messages */}
              {addressValidation.isValidating && (
                <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Validating address...</span>
                </div>
              )}

              {addressValidation.showSuggestion && addressValidation.result?.verdict === 'CORRECTABLE' && (
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-base font-medium text-blue-900 mb-3">
                        We found a suggested address
                      </p>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Original:</p>
                        <p className="text-sm text-gray-700">
                          {address.street}{address.apartment ? `, ${address.apartment}` : ''}<br />
                          {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Suggested:</p>
                        <p className="text-sm text-gray-700">
                          {addressValidation.result.suggestedAddress?.street}
                          {addressValidation.result.suggestedAddress?.apartment && `, ${addressValidation.result.suggestedAddress.apartment}`}<br />
                          {addressValidation.result.suggestedAddress?.city}, {addressValidation.result.suggestedAddress?.state} {addressValidation.result.suggestedAddress?.zip}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={applySuggestedAddress}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Use Suggested Address
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddressValidation({ ...addressValidation, showSuggestion: false })}
                          className="px-6 py-2"
                        >
                          Keep My Address
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {addressValidation.showSuggestion && addressValidation.result?.verdict === 'UNDELIVERABLE' && (
                <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-base font-medium text-red-900 mb-2">
                        Address Cannot Be Verified
                      </p>
                      <p className="text-sm text-red-800 mb-4">
                        {addressValidation.result.message || 'The address you entered cannot be validated. Please check for typos or formatting issues.'}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAddressValidation({ isValidating: false, result: null, showSuggestion: false });
                          setCurrentStep(1);
                        }}
                        className="px-6 py-2 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Go Back & Fix Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Label className="text-sm font-medium text-gray-700">General Note</Label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute left-0 top-6 hidden group-hover:block z-20 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        We'll send this to you with every card, for every occasion. Use it to remember things like their favorite color, preferences, or things they like/dislike.
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Write a note that applies to all occasions..."
                    {...register("note")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    rows={4}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <details className="cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 hover:border-blue-300 transition-colors">
                    <summary className="text-sm font-medium text-gray-800 hover:text-gray-900 flex items-center gap-2">
                      Customize reminders per occasion (optional)
                    </summary>
                    <div className="space-y-4 mt-4">
                      {[...selectedCustomOccasions, ...selectedHolidayOccasions].map((oc) => (
                        <div key={oc}>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">{oc} note</Label>
                          <Textarea
                            placeholder={`Optional note for ${oc}`}
                            className="w-full border-gray-200 focus:border-gray-400 focus:ring-0 bg-white"
                            rows={2}
                            {...register(`occasionNotes.${oc}` as const)}
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="flex justify-between pt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isLoading || addressValidation.isValidating}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || addressValidation.isValidating || (addressValidation.result?.verdict === 'UNDELIVERABLE')}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : addressValidation.isValidating ? 'Validating...' : 'Create Reminder'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {currentStep === 6 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-4">Reminder Created!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We'll send you beautiful cards before each occasion. You just need to sign and send them.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    // Reset form
                  }}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Create Another
                </Button>
                <Button 
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
