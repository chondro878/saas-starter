'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Refs for focus management
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  
  // Address validation state
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean;
    result: any | null;
    showSuggestion: boolean;
    error: string | null;
  }>({
    isValidating: false,
    result: null,
    showSuggestion: false,
    error: null,
  });

  // ZIP code lookup state
  const [zipLookupLoading, setZipLookupLoading] = useState(false);

  // Notes mode: 'all' for same note to all occasions, 'custom' for per-occasion notes
  const [notesMode, setNotesMode] = useState<'all' | 'custom' | null>(null);

  // --- Form setup with react-hook-form and Zod resolver ---
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {},
  });

  // --- State tracking for selected occasions and their dates ---
  const [selectedCustomOccasions, setSelectedCustomOccasions] = useState<string[]>([]);
  const [selectedHolidayOccasions, setSelectedHolidayOccasions] = useState<string[]>([]);
  const [customDates, setCustomDates] = useState<{ [occasion: string]: Date | undefined }>({});

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

  // Get styling for occasion notes textarea (border and background)
  const getOccasionNotesStyle = (occasion: string) => {
    const occasionLower = occasion.toLowerCase();
    
    if (occasionLower.includes('birthday')) {
      return {
        border: 'border-transparent',
        bg: 'bg-gray-100',
        gradientBorder: true,
        gradientColors: 'linear-gradient(to right, #fb923c, #a78bfa, #34d399, #f472b6, #fbbf24)',
        focusGradientColors: 'linear-gradient(to right, #ea580c, #7c3aed, #059669, #db2777, #d97706)'
      };
    }
    if (occasionLower.includes('work')) {
      return {
        border: 'border-transparent',
        bg: 'bg-purple-50',
        gradientBorder: true,
        gradientColors: 'linear-gradient(to right, #a855f7, #7c3aed, #8b5cf6, #9333ea, #a78bfa)',
        focusGradientColors: 'linear-gradient(to right, #7c3aed, #5b21b6, #6d28d9, #7c3aed, #6d28d9)'
      };
    }
    if (occasionLower.includes('anniversary')) {
      return {
        border: 'border-transparent',
        bg: 'bg-pink-50',
        gradientBorder: true,
        gradientColors: 'linear-gradient(to right, #f472b6, #ec4899, #fb7185, #e11d48, #f9a8d4)',
        focusGradientColors: 'linear-gradient(to right, #db2777, #be123c, #e11d48, #9f1239, #db2777)'
      };
    }
    if (occasionLower.includes('new year')) {
      return {
        border: 'border-amber-400 focus:border-amber-700',
        bg: 'bg-amber-50/50'
      };
    }
    if (occasionLower.includes('valentine')) {
      return {
        border: 'border-red-400 focus:border-red-700',
        bg: 'bg-red-50/50'
      };
    }
    if (occasionLower.includes('patrick')) {
      return {
        border: 'border-green-400 focus:border-green-700',
        bg: 'bg-green-50/50'
      };
    }
    if (occasionLower.includes('easter')) {
      return {
        border: 'border-purple-300 focus:border-purple-600',
        bg: 'bg-purple-50/50'
      };
    }
    if (occasionLower.includes('mother')) {
      return {
        border: 'border-pink-300 focus:border-pink-600',
        bg: 'bg-pink-50/50'
      };
    }
    if (occasionLower.includes('father')) {
      return {
        border: 'border-blue-400 focus:border-blue-700',
        bg: 'bg-blue-50/50'
      };
    }
    if (occasionLower.includes('independence')) {
      return {
        border: 'border-red-400 focus:border-red-700',
        bg: 'bg-red-50/50'
      };
    }
    if (occasionLower.includes('halloween')) {
      return {
        border: 'border-orange-400 focus:border-orange-700',
        bg: 'bg-orange-50/50'
      };
    }
    if (occasionLower.includes('thanksgiving')) {
      return {
        border: 'border-amber-500 focus:border-amber-800',
        bg: 'bg-amber-50/50'
      };
    }
    if (occasionLower.includes('christmas')) {
      return {
        border: 'border-red-500 focus:border-red-800',
        bg: 'bg-gradient-to-br from-red-50/50 to-green-50/50'
      };
    }
    
    return {
      border: 'border-blue-300 focus:border-blue-600',
      bg: 'bg-blue-50/50'
    };
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
    // Step 1: Handle address validation flow
    if (currentStep === 1) {
      // If not yet validated, run validation first
      if (!addressValidation.result) {
        const validationResult = await validateAddressFields();
        
        // If validation failed (network/API error), show error but don't block
        if (!validationResult && addressValidation.error) {
          return; // Wait for user to retry or proceed anyway
        }
        
        // If validation succeeded, check verdict
        if (validationResult) {
          // If address is undeliverable, block progression
          if (validationResult.verdict === 'UNDELIVERABLE') {
            return;
          }
          
          // If address is correctable, let user decide
          if (validationResult.verdict === 'CORRECTABLE') {
            return; // Wait for user to accept or decline suggestion
          }
          
          // If valid, button now shows "Next" and user can review before proceeding
          // Just return here - user will click again to proceed
          return;
        }
      }
      
      // Address has been validated and user clicked "Next" again - proceed to step 2
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

  // Get step title for announcements
  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Step 1: Who is this for?';
      case 2: return 'Step 2: What kind of relationship is this?';
      case 3: return 'Step 3: What kind of card do you need?';
      case 4: return 'Step 4: When is it?';
      case 5: return 'Step 5: Review and add notes';
      case 6: return 'Success: Reminder created';
      default: return '';
    }
  };

  // Focus management when step changes
  useEffect(() => {
    if (stepHeadingRef.current) {
      stepHeadingRef.current.focus();
    }
    // Announce step change to screen readers
    if (announceRef.current) {
      announceRef.current.textContent = getStepTitle(currentStep);
    }
  }, [currentStep]);

  // Address validation function - returns the validation result
  const validateAddressFields = async () => {
    const addressData = watch('address');
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zip) {
      return null;
    }

    setAddressValidation({ isValidating: true, result: null, showSuggestion: false, error: null });

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        setAddressValidation({
          isValidating: false,
          result,
          showSuggestion: result.verdict === 'CORRECTABLE' || result.verdict === 'UNDELIVERABLE',
          error: null,
        });
        return result;
      } else {
        // Handle non-200 responses
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = response.status === 429 
          ? 'Too many requests. Please try again in a moment.'
          : response.status >= 500
          ? 'Address validation service is temporarily unavailable. You can proceed anyway or try again.'
          : errorData.error || 'Failed to validate address. You can proceed anyway or try again.';
        
        console.error('Address validation error:', { status: response.status, error: errorData });
        setAddressValidation({
          isValidating: false,
          result: null,
          showSuggestion: false,
          error: errorMessage,
        });
        return null;
      }
    } catch (error) {
      // Handle network errors and timeouts
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? 'Address validation is taking too long. You can proceed anyway or try again.'
        : 'Network error: Unable to validate address. You can proceed anyway or try again.';
      
      console.error('Address validation failed:', error);
      setAddressValidation({
        isValidating: false,
        result: null,
        showSuggestion: false,
        error: errorMessage,
      });
      return null;
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
      setAddressValidation({ ...addressValidation, showSuggestion: false, error: null });
      // Proceed to next step after applying suggestion
      setCurrentStep(2);
    }
  };

  const keepMyAddress = () => {
    // User chooses to keep their address despite suggestion
    setAddressValidation({ ...addressValidation, showSuggestion: false, error: null });
    // Proceed to next step
    setCurrentStep(2);
  };

  const proceedWithoutValidation = () => {
    // User chooses to proceed despite validation failure
    console.warn('User proceeding without address validation');
    setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
    // Proceed to next step
    setCurrentStep(2);
  };

  // Auto-fill city and state from ZIP code
  const handleZipChange = async (zip: string) => {
    setValue('address.zip', zip);
    
    // Reset validation if user changes ZIP after validating
    if (addressValidation.result) {
      setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
    }
    
    // Only lookup if we have a valid 5-digit ZIP
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      setZipLookupLoading(true);
      try {
        const response = await fetch(`/api/city-state-lookup?zip=${zip}`);
        if (response.ok) {
          const data = await response.json();
          if (data.city && data.state) {
            // Auto-fill city and state
            setValue('address.city', data.city);
            setValue('address.state', data.state);
          }
        }
      } catch (error) {
        // Silently fail - user can still enter manually
        console.log('ZIP lookup failed, user can enter manually');
      } finally {
        setZipLookupLoading(false);
      }
    }
  };

  const progressPalette = ['purple', 'blue', 'teal', 'indigo'] as const;
  type ProgressColor = typeof progressPalette[number];

  const progressMap: Record<ProgressColor, { text: string; bar: string }> = {
    purple: { text: 'text-purple-600', bar: 'bg-purple-500' },
    blue: { text: 'text-blue-600', bar: 'bg-blue-500' },
    teal: { text: 'text-teal-600', bar: 'bg-teal-500' },
    indigo: { text: 'text-indigo-600', bar: 'bg-indigo-500' }
  };

  const getProgressBarColor = (step: number, total: number, asText?: boolean) => {
    if (step === total) {
      return asText ? 'text-amber-500' : 'bg-amber-400';
    }

    const color = progressPalette[(step - 1) % progressPalette.length];

    return asText ? progressMap[color].text : progressMap[color].bar;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Screen reader announcements */}
        <div 
          ref={announceRef}
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        />
        
        <div className="absolute top-6 left-8 z-10">
          <button
            onClick={() => router.back()}
            className="text-sm font-semibold text-white hover:text-white/80 transition-colors"
            aria-label="Cancel and return to previous page"
          >
            Cancel
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-12">
          <form onSubmit={handleSubmit(handleFinish)}>
          {/* Step 1: Who is this for? */}
          {currentStep === 1 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8">
              <div className="space-y-4">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 mb-4 outline-none"
                >
                  Who are you sending cards to?
                </h2>
                <p className="text-gray-600">Tell us about the person you want to remember.</p>
              </div>

              <fieldset className="space-y-6">
                <legend className="sr-only">Recipient Information</legend>
                
                <div className="grid grid-cols-2 gap-4" role="group" aria-label="Recipient name">
                  <div>
                    <Label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500" aria-label="required">*</span>
                    </Label>
                    <Input
                      id="first-name"
                      placeholder="First Name"
                      {...register("firstPerson.first")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      aria-required="true"
                      aria-invalid={!!errors.firstPerson?.first}
                      aria-describedby={errors.firstPerson?.first ? "first-name-error" : undefined}
                    />
                    {errors.firstPerson?.first && (
                      <p id="first-name-error" role="alert" className="text-sm text-red-500 mt-1">
                        {errors.firstPerson.first.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500" aria-label="required">*</span>
                    </Label>
                    <Input
                      id="last-name"
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
                      aria-required="true"
                      aria-invalid={!!errors.firstPerson?.last}
                      aria-describedby={errors.firstPerson?.last ? "last-name-error" : undefined}
                    />
                    {errors.firstPerson?.last && (
                      <p id="last-name-error" role="alert" className="text-sm text-red-500 mt-1">
                        {errors.firstPerson.last.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm cursor-pointer text-gray-600 hover:text-gray-800 underline underline-offset-4"
                    onClick={() => setValue("secondPersonEnabled", !secondPersonEnabled)}
                    aria-pressed={secondPersonEnabled}
                    aria-label={secondPersonEnabled ? "Remove partner information" : "Add partner information for a couple"}
                  >
                    Is this a couple?
                  </button>
                </div>

                {secondPersonEnabled && (
                  <div className="grid grid-cols-2 gap-4" role="group" aria-label="Partner name">
                    <div>
                      <Label htmlFor="partner-first-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Partner's First Name
                      </Label>
                      <Input
                        id="partner-first-name"
                        placeholder="First Name"
                        {...register("secondPerson.first")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partner-last-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Partner's Last Name
                      </Label>
                      <Input
                        id="partner-last-name"
                        placeholder="Last Name"
                        {...register("secondPerson.last")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                    </div>
                  </div>
                )}
              </fieldset>

              <fieldset className="border-t border-gray-100 pt-6 mt-6">
                <legend className="block text-sm font-medium text-gray-700 mb-4">
                  Recipient's Address (US only) <span className="text-red-500" aria-label="required">*</span>
                </legend>
                <div className="mb-4">
                  <div className="flex items-center justify-end">
                    {addressValidation.result?.verdict === 'VALID' && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Check className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="street-address" className="sr-only">
                        Street Address
                      </Label>
                    <Input
                        id="street-address"
                      placeholder="Street Address"
                      {...register("address.street")}
                      onChange={(e) => {
                        setValue("address.street", e.target.value);
                        // Reset validation if user changes address after validating
                        if (addressValidation.result) {
                          setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                        }
                      }}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                        aria-required="true"
                        aria-invalid={!!errors.address?.street}
                        autoComplete="street-address"
                      />
                      {errors.address?.street && (
                        <p id="street-error" role="alert" className="text-sm text-red-500 mt-1">
                          {errors.address.street.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="apartment" className="sr-only">
                        Apartment, Suite, etc. (optional)
                      </Label>
                    <Input
                        id="apartment"
                      placeholder="Apt, Suite, etc. (optional)"
                      {...register("address.apartment")}
                      onChange={(e) => {
                        setValue("address.apartment", e.target.value);
                        // Reset validation if user changes address after validating
                        if (addressValidation.result) {
                          setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                        }
                      }}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                        autoComplete="address-line2"
                    />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="sr-only">
                          City
                        </Label>
                      <Input
                          id="city"
                        placeholder="City"
                        {...register("address.city")}
                        onChange={(e) => {
                          setValue("address.city", e.target.value);
                          // Reset validation if user changes address after validating
                          if (addressValidation.result) {
                            setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                          }
                        }}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                          aria-required="true"
                          aria-invalid={!!errors.address?.city}
                          autoComplete="address-level2"
                        />
                        {errors.address?.city && (
                          <p id="city-error" role="alert" className="text-sm text-red-500 mt-1">
                            {errors.address.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state" className="sr-only">
                          State
                        </Label>
                      <select
                          id="state"
                        {...register("address.state")}
                        onChange={(e) => {
                          setValue("address.state", e.target.value);
                          // Reset validation if user changes address after validating
                          if (addressValidation.result) {
                            setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-900"
                          aria-required="true"
                          aria-invalid={!!errors.address?.state}
                          autoComplete="address-level1"
                      >
                        <option value="">Select State</option>
                        {US_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                        {errors.address?.state && (
                          <p id="state-error" role="alert" className="text-sm text-red-500 mt-1">
                            {errors.address.state.message}
                          </p>
                        )}
                      </div>
                      <div className="relative">
                        <Label htmlFor="zip" className="sr-only">
                          Zip Code
                        </Label>
                        <Input
                          id="zip"
                          placeholder="Zip Code"
                          {...register("address.zip")}
                          onChange={(e) => handleZipChange(e.target.value)}
                          maxLength={5}
                          className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                          aria-required="true"
                          aria-invalid={!!errors.address?.zip}
                          autoComplete="postal-code"
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        {zipLookupLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          </div>
                        )}
                        {errors.address?.zip && (
                          <p id="zip-error" role="alert" className="text-sm text-red-500 mt-1">
                            {errors.address.zip.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Address Validation Messages */}
              {addressValidation.isValidating && (
                <div 
                  className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg mt-6"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" aria-hidden="true"></div>
                  <span>Validating address...</span>
                </div>
              )}

              {/* Address Valid Indicator */}
              {addressValidation.result?.verdict === 'VALID' && !addressValidation.showSuggestion && (
                <div 
                  className="flex items-center gap-2 text-sm text-green-700 p-4 bg-green-50 border border-green-200 rounded-lg mt-6"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <Check className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Address Verified by USPS</p>
                    <p className="text-xs text-green-600 mt-0.5">This address is deliverable and properly formatted.</p>
                  </div>
                </div>
              )}

              {addressValidation.showSuggestion && addressValidation.result?.verdict === 'CORRECTABLE' && (
                <div 
                  className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg mt-6"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-base font-medium text-blue-900 mb-3">
                        We found a suggested address
                      </p>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Your address:</p>
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
                          onClick={keepMyAddress}
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
                <div 
                  className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mt-6"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
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
                          setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                        }}
                        className="px-6 py-2 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Edit Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Network/API Error - Allow retry or proceed anyway */}
              {addressValidation.error && (
                <div 
                  className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg mt-6"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-base font-medium text-yellow-900 mb-2">
                        Validation Service Error
                      </p>
                      <p className="text-sm text-yellow-800 mb-4">
                        {addressValidation.error}
                      </p>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={async () => {
                            await validateAddressFields();
                          }}
                          variant="outline"
                          className="px-6 py-2 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                        >
                          Try Again
                        </Button>
                        <Button
                          type="button"
                          onClick={proceedWithoutValidation}
                          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Proceed Anyway
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !firstPerson.first ||
                    !firstPerson.last ||
                    !address.street ||
                    !address.city ||
                    !address.state ||
                    !address.zip ||
                    addressValidation.isValidating ||
                    (addressValidation.result?.verdict === 'UNDELIVERABLE')
                  }
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addressValidation.isValidating 
                    ? 'Validating...' 
                    : addressValidation.result?.verdict === 'VALID'
                    ? 'Next'
                    : 'Validate Address'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Relationship */}
          {currentStep === 2 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8">
              <div className="space-y-4">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 mb-4 outline-none"
                >
                  What kind of relationship is this?
                </h2>
                <p className="text-gray-600">This helps us personalize the card.</p>
              </div>

              <div 
                className="grid grid-cols-2 gap-3 auto-rows-fr"
                role="group"
                aria-label="Select relationship type"
              >
                {relationshipOptions.map((option) => {
                  const colors = getRelationshipColors(option);
                  const isSelected = relationship === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("relationship", option)}
                      className={cn(
                        "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left h-full",
                        isSelected 
                          ? colors.selected
                          : `${colors.bg} ${colors.text} border-gray-200 ${colors.hoverBorder}`
                      )}
                      aria-pressed={isSelected}
                      aria-label={`${option} relationship${isSelected ? ', selected' : ''}`}
                    >
                      {option}
                      {isSelected && <span className="sr-only">(selected)</span>}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8">
              <div className="space-y-4">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 mb-4 outline-none"
                >
                  What kind of cards do you need?
                </h2>
                <p className="text-gray-600">Select the occasions you want to remember.</p>
              </div>
              
              <div className="space-y-8">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-4">
                    Personal Occasions <span className="text-xs text-gray-500">(date required)</span>
                  </legend>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr"
                    role="group"
                    aria-label="Select personal occasions"
                  >
                    {customOccasions.map((item) => {
                      const colors = getOccasionColors(item.value);
                      const isSelected = isCustomOccasionSelected(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleCustomOccasion(item.value)}
                          className={cn(
                            "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left relative overflow-hidden h-full",
                            isSelected ? colors.selected : colors.default,
                            isSelected && colors.decoration === 'confetti' && "occasion-confetti",
                            isSelected && colors.decoration === 'hearts' && "occasion-hearts",
                            isSelected && colors.decoration === 'sparkles' && "occasion-sparkles",
                            isSelected && colors.decoration === 'professional' && "occasion-professional"
                          )}
                          aria-pressed={isSelected}
                          aria-label={`${item.label}${isSelected ? ', selected' : ''}`}
                        >
                          <span className="relative z-10">{item.label}</span>
                          {isSelected && <span className="sr-only">(selected)</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-4">
                    Holidays <span className="text-xs text-gray-500">(date is fixed)</span>
                  </legend>
                  <div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr"
                    role="group"
                    aria-label="Select holiday occasions"
                  >
                    {holidayOccasions.map((item) => {
                      const colors = getOccasionColors(item.value);
                      const isSelected = isHolidayOccasionSelected(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleHolidayOccasion(item.value)}
                          className={cn(
                            "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left relative overflow-hidden h-full",
                            isSelected ? colors.selected : colors.default,
                            isSelected && colors.decoration === 'confetti' && "occasion-confetti",
                            isSelected && colors.decoration === 'hearts' && "occasion-hearts",
                            isSelected && colors.decoration === 'sparkles' && "occasion-sparkles",
                            isSelected && colors.decoration === 'professional' && "occasion-professional"
                          )}
                          aria-pressed={isSelected}
                          aria-label={`${item.label}${isSelected ? ', selected' : ''}`}
                        >
                          <span className="relative z-10">{item.label}</span>
                          {isSelected && <span className="sr-only">(selected)</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
              
              <div className="flex justify-between pt-4">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-light text-gray-900">When is it?</h2>
                <p className="text-gray-600">Pick the month and day for each occasion.</p>
              </div>
              
              <div className={cn(
                "grid grid-cols-1 gap-6 auto-rows-fr",
                selectedCustomOccasions.length > 1 && "md:grid-cols-2"
              )}>
                {selectedCustomOccasions.map((oc) => {
                  const colors = getOccasionColors(oc);
                  return (
                    <div 
                      key={oc} 
                      className={cn(
                        "p-6 rounded-lg border-2 relative overflow-hidden flex flex-col",
                        colors.selected,
                        colors.decoration === 'confetti' && "occasion-confetti",
                        colors.decoration === 'hearts' && "occasion-hearts",
                        colors.decoration === 'sparkles' && "occasion-sparkles",
                        colors.decoration === 'professional' && "occasion-professional"
                      )}
                    >
                      <h3 className="text-xl font-medium mb-4 relative z-10">{oc}</h3>
                      <div className="relative z-10 flex-1 flex items-center justify-center">
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
              
              <div className="flex justify-between pt-4">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-light text-gray-900">Review & Your Personal Reminder</h2>
                <p className="text-gray-600">Review details and add reminders for your future self.</p>
              </div>

              {/* Recipient Review */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">Recipient</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                      setCurrentStep(1);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Edit Details
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Name & Address */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                      <p className="font-medium text-lg">
                        {firstPerson.first} {firstPerson.last}
                        {secondPersonEnabled && secondPerson.first && (
                          <> & {secondPerson.first} {secondPerson.last}</>
                        )}
                      </p>
                    </div>
                    
                    {/* Address */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="font-medium">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
                      <p>{address.city}, {address.state} {address.zip}</p>
                    </div>
                  </div>
                  
                  {/* Right Column: Relationship & Occasions */}
                  <div className="space-y-4">
                    {/* Relationship */}
                    {relationship && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Relationship</p>
                        <p className="font-medium">{relationship}</p>
                      </div>
                    )}
                    
                    {/* Occasions */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Occasions</p>
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
                <div className="flex items-center gap-2 text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Validating address...</span>
                </div>
              )}

              {addressValidation.showSuggestion && addressValidation.result?.verdict === 'CORRECTABLE' && (
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-4">
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
                          onClick={() => setAddressValidation({ ...addressValidation, showSuggestion: false, error: null })}
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
                <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg space-y-4">
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
                          setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
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

              {/* Notes Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Notes</h3>
                  <p className="text-sm text-gray-600">
                    These reminders will help you remember important details when it's time to send the card.
                  </p>
                  
                  {/* Two Button Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNotesMode('custom')}
                      className={cn(
                        "p-6 rounded-lg border-2 text-left transition-all",
                        notesMode === 'custom'
                          ? "bg-blue-50 border-blue-500 shadow-md"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          notesMode === 'custom' ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        )}>
                          {notesMode === 'custom' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">Personal reminder per occasion</p>
                          <p className="text-xs text-gray-600">
                            Write different reminders for each occasion (Birthday, Christmas, etc.)
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNotesMode('all')}
                      className={cn(
                        "p-6 rounded-lg border-2 text-left transition-all",
                        notesMode === 'all'
                          ? "bg-blue-50 border-blue-500 shadow-md"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                          notesMode === 'all' ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        )}>
                          {notesMode === 'all' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">Same reminder for all occasions</p>
                          <p className="text-xs text-gray-600">
                            Write one reminder that applies to every occasion.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Custom Notes Per Occasion */}
                  {notesMode === 'custom' && (
                    <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 mb-4">Add personal reminder for each occasion:</p>
                      {[...selectedCustomOccasions, ...selectedHolidayOccasions].map((oc) => {
                        const style = getOccasionNotesStyle(oc);
                        return (
                        <div key={oc}>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">{oc}</Label>
                            {style.gradientBorder ? (
                              <div 
                                className="p-[2px] rounded-md transition-all duration-200 group"
                                style={{
                                  background: style.gradientColors
                                }}
                              >
                          <Textarea
                            placeholder={`What should you remember when sending a card for ${oc}?`}
                                  className={cn(
                                    "w-full focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:border-transparent border-0 rounded-sm",
                                    style.bg
                                  )}
                                  rows={2}
                                  {...register(`occasionNotes.${oc}` as const, {
                                    onBlur: (e) => {
                                      const wrapper = e.target.closest('.group') as HTMLElement;
                                      if (wrapper && style.gradientColors) {
                                        wrapper.style.background = style.gradientColors;
                                      }
                                    }
                                  })}
                                  onFocus={(e) => {
                                    const wrapper = e.target.closest('.group') as HTMLElement;
                                    if (wrapper && style.focusGradientColors) {
                                      wrapper.style.background = style.focusGradientColors;
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <Textarea
                                placeholder={`What should you remember when sending a card for ${oc}?`}
                                className={cn(
                                  "w-full focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 border-2 transition-colors",
                                  style.border,
                                  style.bg
                                )}
                            rows={2}
                            {...register(`occasionNotes.${oc}` as const)}
                          />
                            )}
                        </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Same Note for All */}
                  {notesMode === 'all' && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Label className="text-sm font-medium text-gray-700">Personal reminder for All Occasions</Label>
                        <div className="group relative">
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute left-0 top-6 hidden group-hover:block z-20 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                            This reminder will accompany every card we send send to you this person, regardless of the occasion.
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Write yourself a reminder that applies to all occasions (e.g., favorite color, preferences, hobbies)..."
                        {...register("note")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0 bg-white"
                        rows={4}
                      />
                    </div>
                  )}

                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-12 text-center">
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
                    // Reset all form state
                    setCurrentStep(1);
                    setValue("firstPerson", { first: '', last: '' });
                    setValue("secondPersonEnabled", false);
                    setValue("secondPerson", { first: '', last: '' });
                    setValue("address", { street: '', apartment: '', city: '', state: '', zip: '' });
                    setValue("relationship", undefined);
                    setValue("note", '');
                    setValue("occasionNotes", {});
                    
                    // Reset occasion selections
                    setSelectedCustomOccasions([]);
                    setSelectedHolidayOccasions([]);
                    setCustomDates({});
                    
                    // Reset address validation state
                    setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
                    
                    // Reset notes mode
                    setNotesMode(null);
                    
                    // Reset error message
                    setErrorMessage('');
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

        {currentStep <= totalSteps && (
          <div className="absolute bottom-6 right-8" role="group" aria-label="Form progress">
            <span
              className={cn(
                "text-sm font-semibold",
                getProgressBarColor(currentStep, totalSteps, true)
              )}
            >
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
