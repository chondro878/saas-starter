'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { useForm, useWatch } from "react-hook-form";
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
import { AlertCircle, Check, X, HelpCircle, Info } from 'lucide-react';
import { calculateHolidayDate } from '@/lib/holiday-calculator';
import { getCardVariation, getJustBecauseLabel } from '@/lib/just-because-utils';
import { checkOccasionDeliveryStatus } from '@/lib/delivery-window';
import { UnauthenticatedSuccess } from './components/unauthenticated-success';
import { CardLimitWarning } from '@/components/ui/card-limit-warning';
import { CardAllocation } from '@/lib/card-allocation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Schema definition for the reminder form using Zod ---
const reminderFormSchema = z.object({
  firstPerson: z.object({
    salutation: z.string().optional(),
    first: z.string()
      .min(1, "First name is required")
      .max(50, "First name must be 50 characters or less")
      .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
    last: z.string()
      .min(1, "Last name is required")
      .max(50, "Last name must be 50 characters or less")
      .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  }),
  secondPersonEnabled: z.boolean().optional(),
  secondPerson: z.object({
    salutation: z.string().optional(),
    first: z.string()
      .max(50, "First name must be 50 characters or less")
      .regex(/^[a-zA-Z\s'-]*$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
      .optional(),
    last: z.string()
      .max(50, "Last name must be 50 characters or less")
      .regex(/^[a-zA-Z\s'-]*$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
      .optional(),
  }).optional(),
  address: z.object({
    street: z.string()
      .min(1, "Street is required")
      .max(100, "Street address must be 100 characters or less")
      .regex(/^[a-zA-Z0-9\s.,#'-]+$/, "Street address contains invalid characters"),
    apartment: z.string()
      .max(50, "Apartment/Unit must be 50 characters or less")
      .regex(/^[a-zA-Z0-9\s.,#'-]*$/, "Apartment/Unit contains invalid characters")
      .optional(),
    city: z.string()
      .min(1, "City is required")
      .max(50, "City must be 50 characters or less")
      .regex(/^[a-zA-Z\s'-]+$/, "City can only contain letters, spaces, hyphens, and apostrophes"),
    state: z.string().min(1, "State is required"),
    zip: z.string()
      .min(5, "Zip code must be at least 5 digits")
      .max(10, "Zip code must be 10 characters or less")
      .regex(/^\d{5}(-\d{4})?$/, "Zip code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)"),
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
  
  // Fetch card allocation data
  const { data: allocation, mutate: mutateAllocation } = useSWR<CardAllocation>(
    '/api/card-allocation',
    fetcher
  );
  
  // Unauthenticated success screen state
  const [showUnauthSuccess, setShowUnauthSuccess] = useState(false);
  const [savedRecipientName, setSavedRecipientName] = useState('');
  
  // Refs for focus management
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  
  // Address validation state
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean;
    result: {
      isValid: boolean;
      verdict: 'VALID' | 'UNDELIVERABLE' | 'CORRECTABLE' | 'ERROR';
      originalAddress?: any;
      suggestedAddress?: any;
      message?: string;
    } | null;
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
  const [notesMode, setNotesMode] = useState<'all' | 'custom' | null>('all');

  // Tooltip visibility state (mobile-friendly full-screen modals)
  const [showJustBecauseTooltip, setShowJustBecauseTooltip] = useState(false);
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);

  // --- Form setup with react-hook-form and Zod resolver ---
  const { register, handleSubmit, watch, setValue, getValues, control, formState } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {},
    mode: 'onChange', // Validate on change for better reactivity
  });
  
  const { errors, isDirty, touchedFields } = formState;

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
  // Watch all form values to ensure reactivity - this will trigger re-renders on any change
  const allFormValues = watch();
  // Use useWatch for better reactivity with nested objects
  const watchedOccasionNotes = useWatch({
    control,
    name: "occasionNotes",
    defaultValue: {}
  }) || {};
  // Merge both sources - prefer watched values as they're more reactive
  const occasionNotes = { ...watchedOccasionNotes, ...(allFormValues.occasionNotes || {}) };

  // Helper function to get the display label for an occasion
  const getOccasionDisplayLabel = (occasion: string) => {
    if (occasion === "Anniversary") {
      return relationship === "Romantic" ? "Your Anniversary" : "Their Anniversary";
    }
    if (occasion === "JustBecause") {
      return getJustBecauseLabel(relationship || '');
    }
    return occasion;
  };

  // Check if couple is complete (both first and last names filled)
  const isCoupleComplete = secondPersonEnabled && 
    firstPerson.first?.trim() && firstPerson.last?.trim() && 
    secondPerson.first?.trim() && secondPerson.last?.trim();

  // --- Occasion lists ---
  const customOccasions = [
    { value: "Birthday", label: "Birthday" },
    { value: "Anniversary", label: "Anniversary" },
    { value: "JustBecause", label: "Just Because" },
  ].filter(item => {
    // Remove Birthday when couple is complete
    if (isCoupleComplete && item.value === "Birthday") {
      return false;
    }
    return true;
  });

  const holidayOccasions = [
    { value: "New Year's", label: "New Year's", dateLabel: "Jan 1" },
    { value: "Valentine's Day", label: "Valentine's Day", dateLabel: "Feb 14" },
    { value: "Easter", label: "Easter", dateLabel: "Spring (varies)" },
    { value: "Mother's Day", label: "Mother's Day", dateLabel: "2nd Sunday of May" },
    { value: "Father's Day", label: "Father's Day", dateLabel: "3rd Sunday of June" },
    { value: "Independence Day", label: "Independence Day", dateLabel: "July 4" },
    { value: "Halloween", label: "Halloween", dateLabel: "Oct 31" },
    { value: "Thanksgiving", label: "Thanksgiving", dateLabel: "4th Thursday of Nov" },
    { value: "Christmas", label: "Christmas", dateLabel: "Dec 25" },
  ];

  const relationshipOptions = ['Friend', 'Family', 'Romantic', 'Professional'].filter(option => {
    // Remove Romantic when couple is complete
    if (isCoupleComplete && option === 'Romantic') {
      return false;
    }
    return true;
  });

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
    if (occasionLower.includes('anniversary')) {
      // Romantic relationship - Pink gradient
      if (relationship === 'Romantic') {
        return {
          border: 'border-transparent',
          bg: 'bg-pink-50',
          gradientBorder: true,
          gradientColors: 'linear-gradient(to right, #f472b6, #ec4899, #fb7185, #e11d48, #f9a8d4)',
          focusGradientColors: 'linear-gradient(to right, #db2777, #be123c, #e11d48, #9f1239, #db2777)'
        };
      }
      // All other relationships - Purple gradient
      return {
        border: 'border-transparent',
        bg: 'bg-purple-50',
        gradientBorder: true,
        gradientColors: 'linear-gradient(to right, #a855f7, #7c3aed, #8b5cf6, #9333ea, #a78bfa)',
        focusGradientColors: 'linear-gradient(to right, #7c3aed, #5b21b6, #6d28d9, #7c3aed, #6d28d9)'
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
      // Romantic relationship - Pink/hearts styling
      if (relationship === 'Romantic') {
        return {
          selected: 'bg-pink-50 text-pink-800 border-pink-300',
          default: 'bg-pink-50 text-pink-800 border-pink-200 hover:border-pink-300',
          decoration: 'hearts' // Floating hearts
        };
      }
      // All other relationships - Professional purple dots styling
      return {
        selected: 'bg-purple-50 text-purple-800 border-purple-300',
        default: 'bg-purple-50 text-purple-800 border-purple-200 hover:border-purple-300',
        decoration: 'professional' // Purple circles
      };
    }
    
    // Just Because - use relationship-based colors
    if (occasionLower.includes('justbecause')) {
      if (!relationship) {
        return {
          selected: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          default: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:border-indigo-300',
          decoration: 'sparkles'
        };
      }
      
      const rel = relationship.toLowerCase();
      switch (rel) {
        case 'friend':
          return {
            selected: 'bg-blue-50 text-blue-800 border-blue-300',
            default: 'bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-300',
            decoration: 'sparkles'
          };
        case 'family':
          return {
            selected: 'bg-green-50 text-green-800 border-green-300',
            default: 'bg-green-50 text-green-800 border-green-200 hover:border-green-300',
            decoration: 'hearts'
          };
        case 'romantic':
          return {
            selected: 'bg-pink-50 text-pink-800 border-pink-300',
            default: 'bg-pink-50 text-pink-800 border-pink-200 hover:border-pink-300',
            decoration: 'hearts'
          };
        case 'professional':
          return {
            selected: 'bg-purple-50 text-purple-800 border-purple-300',
            default: 'bg-purple-50 text-purple-800 border-purple-200 hover:border-purple-300',
            decoration: 'professional'
          };
        default:
          return {
            selected: 'bg-indigo-50 text-indigo-800 border-indigo-300',
            default: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:border-indigo-300',
            decoration: 'sparkles'
          };
      }
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
        decoration: 'none'
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
        
        // Note: validateAddressFields() now always returns VALID and automatically
        // advances to the next step, so we just return here.
        return;
      }
      
      // Address has been validated and user clicked "Next" again - proceed to step 2
      setCurrentStep(2);
      return;
    }
    
    if (currentStep === 3) {
      // Filter out Just Because from occasions needing dates
      const occasionsNeedingDates = selectedCustomOccasions.filter(
        oc => oc !== "JustBecause"
      );
      
      if (occasionsNeedingDates.length > 0) {
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
      
      // Check if this is a couple (both first and last names filled)
      const isCouple = data.secondPersonEnabled && 
        data.firstPerson.first.trim() && data.firstPerson.last.trim() && 
        data.secondPerson?.first?.trim() && data.secondPerson?.last?.trim();

      // Prepare recipient data
      const recipientData = {
        firstName: data.firstPerson.first,
        lastName: data.firstPerson.last,
        secondFirstName: isCouple ? data.secondPerson?.first : null,
        secondLastName: isCouple ? data.secondPerson?.last : null,
        isCouple: isCouple,
        relationship: data.relationship || 'Friend',
        street: data.address.street,
        apartment: data.address.apartment || '',
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        country: 'United States',
        // Notes are stored per-occasion, not on the recipient
      };

      // Prepare occasions data
      const occasionsData = [];
      
      // Determine which notes to use for each occasion
      // If notesMode is 'all', use the shared note for all occasions
      // If notesMode is 'custom', use individual occasionNotes
      const getOccasionNote = (occasionType: string) => {
        if (notesMode === 'all') {
          return data.note || '';
        } else if (notesMode === 'custom') {
          return data.occasionNotes?.[occasionType] || '';
        }
        return '';
      };

      // Add custom occasions with their dates
      for (const occasion of selectedCustomOccasions) {
        if (occasion === "JustBecause") {
          // Special handling for Just Because
          const cardVariation = getCardVariation(data.relationship || 'Friend');
          
          // Just Because will have computed_send_date calculated on the backend
          occasionsData.push({
            type: 'JustBecause',
            date: null, // Will be computed server-side
            isJustBecause: true,
            cardVariation: cardVariation,
            notes: getOccasionNote('JustBecause'),
          });
        } else if (customDates[occasion]) {
          // Regular occasions with user-selected dates
          // Ensure the date is a proper Date object
          const dateValue = customDates[occasion];
          const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue!);
          
          if (isNaN(dateObj.getTime())) {
            console.error(`Invalid date for ${occasion}:`, dateValue);
            continue; // Skip invalid dates
          }
          
          occasionsData.push({
            type: occasion,
            date: dateObj.toISOString(),
            isJustBecause: false,
            notes: getOccasionNote(occasion),
          });
        }
      }

      // Add holiday occasions with properly calculated dates
      for (const occasion of selectedHolidayOccasions) {
        const occasionDate = calculateHolidayDate(occasion);
        
        occasionsData.push({
          type: occasion,
          date: occasionDate.toISOString(),
          isJustBecause: false,
          notes: getOccasionNote(occasion),
        });
      }

      // Create full reminder data object
      const fullReminderData = {
        recipient: recipientData,
        occasions: occasionsData,
        timestamp: new Date().toISOString(),
      };

      if (!user) {
        // User is NOT authenticated - save to localStorage and show success screen
        
        // Store in localStorage with expiration (24 hours)
        const storageData = {
          ...fullReminderData,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        };
        
        localStorage.setItem('pendingReminder', JSON.stringify(storageData));
        
        // Show success screen
        setSavedRecipientName(`${recipientData.firstName} ${recipientData.lastName}`);
        setShowUnauthSuccess(true);
        setIsLoading(false);
        return;
      }

      // User IS authenticated - proceed with normal save
      
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
      
      // Refresh card allocation after creating recipient
      mutateAllocation();
      
      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to save reminder:', error);
      const message = error instanceof Error ? error.message : 'Failed to save reminder. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all required notes fields are filled (reactive validation)
  // Compute directly on each render to ensure we get the latest form values
  const areNotesComplete = (() => {
    if (!notesMode) {
      return false; // Notes mode not selected
    }
    
    if (notesMode === 'all') {
      // For "Same reminder for all", check if the 'note' field has content
      return note && note.trim().length > 0;
    } else if (notesMode === 'custom') {
      // For "Personal reminder per occasion", check all occasion notes
      const allOccasions = [...selectedCustomOccasions, ...selectedHolidayOccasions];
      
      if (allOccasions.length === 0) {
        return false;
      }
      
      // Filter out "JustBecause" as it doesn't require a note
      const occasionsNeedingNotes = allOccasions.filter(oc => oc !== 'JustBecause');
      
      if (occasionsNeedingNotes.length === 0) {
        return true; // No occasions need notes
      }
      
      // Get the current form values directly - this ensures we have the latest data
      const currentOccasionNotes = getValues('occasionNotes') || {};
      // Also watch each individual field to ensure we catch all values
      const individualNotes: Record<string, string> = {};
      occasionsNeedingNotes.forEach(occasion => {
        const fieldName = `occasionNotes.${occasion}` as any;
        const value = watch(fieldName);
        if (value) {
          individualNotes[occasion] = value;
        }
      });
      
      // Merge all sources - individual watched fields are most reliable
      const allOccasionNotes = { 
        ...currentOccasionNotes, 
        ...watchedOccasionNotes, 
        ...occasionNotes, 
        ...individualNotes 
      };
      
      // Check if all occasions have notes
      const allComplete = occasionsNeedingNotes.every(occasion => {
        // Try multiple ways to access the value, prioritizing individual watched fields
        const noteValue = individualNotes[occasion] ||
                         allOccasionNotes[occasion] || 
                         currentOccasionNotes[occasion] || 
                         watchedOccasionNotes[occasion] || 
                         occasionNotes[occasion] ||
                         (allFormValues.occasionNotes && allFormValues.occasionNotes[occasion]);
        
        return noteValue && typeof noteValue === 'string' && noteValue.trim().length > 0;
      });
      return allComplete;
    }
    
    return false;
  })();

  const totalSteps = selectedCustomOccasions.length > 0 ? 5 : 4;

  // Get step title for announcements
  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1: return 'Step 1: Who is this for?';
      case 2: return 'Step 2: What kind of relationship is this?';
      case 3: return 'Step 3: What kind of card do you need?';
      case 4: return 'Step 4: When is it?';
      case 5: return 'Step 5: Review and add reminders';
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

    // Skip validation entirely - USPS API not configured
    // Just accept the address and proceed immediately
    const result = {
      isValid: true,
      verdict: 'VALID' as const,
      originalAddress: addressData,
    };
    
    setAddressValidation({
      isValidating: false,
      result,
      showSuggestion: false,
      error: null,
    });
    
    // Immediately proceed to next step
    setCurrentStep(2);
    
    return result;
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

  // Auto-fill city and state from ZIP code - DISABLED for beta
  // USPS API not configured, user enters manually
  const handleZipChange = async (zip: string) => {
    setValue('address.zip', zip);
    
    // Reset validation if user changes ZIP after validating
    if (addressValidation.result) {
      setAddressValidation({ isValidating: false, result: null, showSuggestion: false, error: null });
    }
    
    // ZIP lookup disabled - user enters city/state manually
    // Address will be verified before shipping (15 days before occasion)
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
      {showUnauthSuccess ? (
        <UnauthenticatedSuccess recipientName={savedRecipientName} />
      ) : (
        <>
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
        <div className="w-full max-w-2xl mx-auto px-8 py-12 flex flex-col gap-12">
          <form onSubmit={handleSubmit(handleFinish)}>
          {/* Step 1: Who is this for? */}
          {currentStep === 1 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8 w-full min-h-[600px] flex flex-col">
              <div className="space-y-4 flex-shrink-0">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 mb-4 outline-none"
                >
                  Who are you sending cards to?
                </h2>
                <p className="text-gray-600">Tell us about the person you want to remember.</p>
              </div>

              <fieldset className="space-y-6 flex-grow">
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
                      maxLength={50}
                      pattern="[a-zA-Z\s'-]+"
                      onKeyPress={(e) => {
                        if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
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
                      maxLength={50}
                      pattern="[a-zA-Z\s'-]+"
                      onKeyPress={(e) => {
                        if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.firstPerson?.last && (
                      <p id="last-name-error" role="alert" className="text-sm text-red-500 mt-1">
                        {errors.firstPerson.last.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-couple"
                    checked={secondPersonEnabled}
                    onChange={(e) => setValue("secondPersonEnabled", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500 cursor-pointer"
                  />
                  <Label htmlFor="is-couple" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Is this a couple?
                  </Label>
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
                        maxLength={50}
                        pattern="[a-zA-Z\s'-]+"
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
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
                        maxLength={50}
                        pattern="[a-zA-Z\s'-]+"
                        onKeyPress={(e) => {
                          if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
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
                      maxLength={100}
                      pattern="[a-zA-Z0-9\s.,#'-]+"
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
                        maxLength={50}
                        pattern="[a-zA-Z0-9\s.,#'-]+"
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
                          maxLength={50}
                          pattern="[a-zA-Z\s'-]+"
                          onKeyPress={(e) => {
                            if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
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
                          placeholder="Zip Code (12345 or 12345-6789)"
                          {...register("address.zip")}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d-]/g, ''); // Only allow digits and hyphens
                            // Format: allow 5 digits or 5+4 format
                            if (value.length > 5 && !value.includes('-')) {
                              value = value.slice(0, 5) + '-' + value.slice(5, 9);
                            }
                            if (value.length > 10) value = value.slice(0, 10);
                            e.target.value = value;
                            handleZipChange(value);
                          }}
                          maxLength={10}
                          className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                          aria-required="true"
                          aria-invalid={!!errors.address?.zip}
                          autoComplete="postal-code"
                          inputMode="numeric"
                          pattern="\d{5}(-\d{4})?"
                          onKeyPress={(e) => {
                            if (!/^[\d-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
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

              {/* Address Valid Indicator - removed, only show errors */}

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

              <div className="flex justify-end pt-4 flex-shrink-0">
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
                    : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Relationship */}
          {currentStep === 2 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8 w-full min-h-[600px] flex flex-col">
              <div className="space-y-4 flex-shrink-0">
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
                className="grid grid-cols-2 gap-4 flex-grow content-start"
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
                        "px-6 py-4 rounded-lg border cursor-pointer select-none text-base font-medium transition-colors text-center",
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

              <div className="flex justify-between pt-4 flex-shrink-0 mt-auto">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8 w-full min-h-[600px] flex flex-col">
              <div className="space-y-4 flex-shrink-0">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 mb-4 outline-none"
                >
                  What kind of cards do you need?
                </h2>
                <p className="text-gray-600">Select the occasions you want to remember.</p>
              </div>
              
              <div className="space-y-8 flex-grow overflow-auto">
                {/* Personal Occasions Section */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-4">
                    Personal Occasions <span className="text-xs text-gray-500">(date required)</span>
                  </legend>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    role="group"
                    aria-label="Select personal occasions"
                  >
                    {customOccasions.filter(item => item.value !== "JustBecause").map((item) => {
                      const colors = getOccasionColors(item.value);
                      const isSelected = isCustomOccasionSelected(item.value);
                      const displayLabel = getOccasionDisplayLabel(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleCustomOccasion(item.value)}
                          className={cn(
                            "px-5 py-4 rounded-lg border-2 cursor-pointer select-none text-base font-medium transition-colors text-center relative overflow-hidden",
                            isSelected ? colors.selected : colors.default,
                            isSelected && colors.decoration === 'confetti' && "occasion-confetti",
                            isSelected && colors.decoration === 'hearts' && "occasion-hearts",
                            isSelected && colors.decoration === 'sparkles' && "occasion-sparkles",
                            isSelected && colors.decoration === 'professional' && "occasion-professional"
                          )}
                          aria-pressed={isSelected}
                          aria-label={`${displayLabel}${isSelected ? ', selected' : ''}`}
                        >
                          <span className="relative z-10">{displayLabel}</span>
                          {isSelected && <span className="sr-only">(selected)</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                
                {/* Just Because Section */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <span>
                      Just Because <span className="text-xs text-gray-500">(random date)</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowJustBecauseTooltip(true);
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-0.5"
                      aria-label="More information about Just Because"
                    >
                      <Info className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors" />
                    </button>
                  </legend>
                  <div 
                    className="grid grid-cols-1 gap-3"
                    role="group"
                    aria-label="Select just because option"
                  >
                    {customOccasions.filter(item => item.value === "JustBecause").map((item) => {
                      const colors = getOccasionColors(item.value);
                      const isSelected = isCustomOccasionSelected(item.value);
                      const displayLabel = getOccasionDisplayLabel(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleCustomOccasion(item.value)}
                          className={cn(
                            "px-5 py-4 rounded-lg border-2 cursor-pointer select-none text-base font-medium transition-colors text-center relative overflow-hidden",
                            isSelected ? colors.selected : colors.default,
                            isSelected && colors.decoration === 'confetti' && "occasion-confetti",
                            isSelected && colors.decoration === 'hearts' && "occasion-hearts",
                            isSelected && colors.decoration === 'sparkles' && "occasion-sparkles",
                            isSelected && colors.decoration === 'professional' && "occasion-professional"
                          )}
                          aria-pressed={isSelected}
                          aria-label={`${displayLabel}${isSelected ? ', selected' : ''}`}
                        >
                          <span className="relative z-10">{displayLabel}</span>
                          {isSelected && <span className="sr-only">(selected)</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                
                {/* Holidays Section */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-4">
                    Holidays <span className="text-xs text-gray-500">(date is fixed)</span>
                  </legend>
                  <div 
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
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
                            "px-4 py-4 rounded-lg border-2 cursor-pointer select-none text-sm font-medium transition-colors text-center relative overflow-hidden min-h-[60px] flex items-center justify-center",
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
                
                {/* Holiday Delivery Window Warnings */}
                {selectedHolidayOccasions.length > 0 && (
                  <div className="space-y-2">
                    {selectedHolidayOccasions.map(holiday => {
                      const status = checkOccasionDeliveryStatus(holiday);
                      
                      if (!status.isTooSoon) return null;
                      
                      return (
                        <div key={holiday} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-medium text-amber-900">{holiday}</span>
                              <span className="text-amber-700"> is only {status.daysUntil} days away. </span>
                              <span className="text-amber-700">
                                We'll send the card for {format(status.fulfillmentDate, 'MMMM yyyy')}.
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4 flex-shrink-0 mt-auto">
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8 w-full min-h-[600px] flex flex-col">
              <div className="space-y-4 flex-shrink-0">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 outline-none"
                >
                  When is it?
                </h2>
                <p className="text-gray-600">Pick the month and day for each occasion.</p>
              </div>
              
              <div className="space-y-6 flex-grow overflow-auto">
                {selectedCustomOccasions
                  .filter(oc => oc !== "JustBecause") // Exclude Just Because from date selection
                  .map((oc) => {
                    const colors = getOccasionColors(oc);
                    const displayLabel = getOccasionDisplayLabel(oc);
                    return (
                      <div 
                        key={oc} 
                        className={cn(
                          "p-6 rounded-xl border-2 relative overflow-hidden",
                          colors.selected,
                          colors.decoration === 'confetti' && "occasion-confetti",
                          colors.decoration === 'hearts' && "occasion-hearts",
                          colors.decoration === 'sparkles' && "occasion-sparkles",
                          colors.decoration === 'professional' && "occasion-professional"
                        )}
                      >
                        <h3 className="text-2xl font-medium mb-6 relative z-10">{displayLabel}</h3>
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
                          
                          {/* Delivery Window Warning for Custom Occasions */}
                          {customDates[oc] && (() => {
                            const status = checkOccasionDeliveryStatus(oc, customDates[oc]);
                            
                            if (!status.isTooSoon) return null;
                            
                            return (
                              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-amber-900 mb-1">
                                      We'll send this card next year
                                    </p>
                                    <p className="text-sm text-amber-700">
                                      This {displayLabel.toLowerCase().replace(/^(their|your) /, '')} is only {status.daysUntil} days away, 
                                      but we need 15 days to ship your card. We'll make sure it gets sent out next year!
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              <div className="flex justify-between pt-4 flex-shrink-0 mt-auto">
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
                  disabled={selectedCustomOccasions.filter(oc => oc !== "JustBecause").some(oc => !customDates[oc])}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Notes & Review */}
          {currentStep === 5 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 space-y-8 w-full min-h-[600px] flex flex-col">
              <div className="space-y-4 flex-shrink-0">
                <h2 
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-3xl font-light text-gray-900 outline-none"
                >
                  Review & Your Personal Reminder
                </h2>
                <p className="text-gray-600">Review details and add reminders for your future self.</p>
              </div>

              {/* Recipient Review */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4 flex-shrink-0">
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
                        {selectedCustomOccasions.map((oc) => {
                          const displayLabel = getOccasionDisplayLabel(oc);
                          const isJustBecause = oc === "JustBecause";
                          return (
                            <div key={oc} className="flex items-center gap-2">
                              <span className="text-sm font-medium">{displayLabel}</span>
                              {isJustBecause ? (
                                <span className="text-xs text-gray-600">
                                  (🎉 Surprise date!)
                                </span>
                              ) : customDates[oc] ? (
                                <span className="text-xs text-gray-600">
                                  ({customDates[oc]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
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

              {/* Delivery Timeline Warning - Consolidated Review */}
              {(() => {
                // Check all occasions for delivery window issues
                const tooSoonOccasions: Array<{
                  type: string;
                  displayLabel: string;
                  currentDate: Date;
                  fulfillmentDate: Date;
                  daysUntil: number;
                }> = [];
                
                // Check custom occasions
                selectedCustomOccasions
                  .filter(oc => oc !== "JustBecause")
                  .forEach(occasion => {
                    const date = customDates[occasion];
                    if (date) {
                      const status = checkOccasionDeliveryStatus(occasion, date);
                      if (status.isTooSoon) {
                        tooSoonOccasions.push({
                          type: occasion,
                          displayLabel: getOccasionDisplayLabel(occasion),
                          currentDate: date,
                          fulfillmentDate: status.fulfillmentDate,
                          daysUntil: status.daysUntil,
                        });
                      }
                    }
                  });
                
                // Check holiday occasions
                selectedHolidayOccasions.forEach(holiday => {
                  const status = checkOccasionDeliveryStatus(holiday);
                  if (status.isTooSoon) {
                    const holidayDate = calculateHolidayDate(holiday);
                    tooSoonOccasions.push({
                      type: holiday,
                      displayLabel: holiday,
                      currentDate: holidayDate,
                      fulfillmentDate: status.fulfillmentDate,
                      daysUntil: status.daysUntil,
                    });
                  }
                });
                
                if (tooSoonOccasions.length === 0) return null;
                
                return (
                  <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Delivery Timeline
                    </h3>
                    <p className="text-blue-800 mb-3">
                      {tooSoonOccasions.length === 1 
                        ? "This occasion is within our 15-day fulfillment window." 
                        : "These occasions are within our 15-day fulfillment window."
                      }
                      {" "}We'll send {tooSoonOccasions.length === 1 ? "this card" : "these cards"} next year:
                    </p>
                    <ul className="space-y-2">
                      {tooSoonOccasions.map((occ, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <div className="text-blue-700">
                            <span className="font-medium">{occ.displayLabel}</span>
                            <span> ({format(occ.currentDate, 'MMM d')} - only {occ.daysUntil} days away)</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-blue-600 mt-3">
                      💡 Don't worry - we'll automatically send these cards next year so you don't forget!
                    </p>
                  </div>
                );
              })()}

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
              <div className="space-y-6 flex-grow overflow-auto">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Reminders</h3>
                  <p className="text-sm text-gray-600">
                    These reminders will help you remember important details when it's time to send the card.
                  </p>
                  
                  {/* Two Button Options - Same reminder on LEFT, Personal reminder on RIGHT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* LEFT: Same reminder for all occasions */}
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

                    {/* RIGHT: Personal reminder per occasion */}
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
                  </div>

                  {/* Custom Notes Per Occasion */}
                  {notesMode === 'custom' && (
                    <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 mb-4">Add personal reminder for each occasion (required):</p>
                      {[...selectedCustomOccasions, ...selectedHolidayOccasions].map((oc) => {
                        const style = getOccasionNotesStyle(oc);
                        const displayLabel = getOccasionDisplayLabel(oc);
                        const fieldName = `occasionNotes.${oc}` as const;
                        const currentValue = watch(fieldName);
                        const error = errors.occasionNotes?.[oc];
                        
                        return (
                        <div key={oc}>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">{displayLabel} *</Label>
                            {style.gradientBorder ? (
                              <div>
                                <div 
                                  className="p-[2px] rounded-md transition-all duration-200 group"
                                  style={{
                                    background: style.gradientColors
                                  }}
                                >
                                  <Textarea
                                    placeholder={`What should you remember when sending a card for ${displayLabel}?`}
                                    className={cn(
                                      "w-full focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:border-transparent border-0 rounded-sm",
                                      style.bg
                                    )}
                                    rows={2}
                                    maxLength={150}
                                    {...register(fieldName, {
                                      required: `Please add a reminder for ${displayLabel}`,
                                      maxLength: {
                                        value: 150,
                                        message: "Reminder must be 150 characters or less"
                                      },
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
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500">
                                    {currentValue?.length || 0}/150 characters
                                  </span>
                                  {error && (
                                    <span className="text-xs text-red-600">{error.message}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Textarea
                                  placeholder={`What should you remember when sending a card for ${displayLabel}?`}
                                  className={cn(
                                    "w-full focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 border-2 transition-colors",
                                    style.border,
                                    style.bg
                                  )}
                                  rows={2}
                                  maxLength={150}
                                  {...register(fieldName, {
                                    required: `Please add a reminder for ${displayLabel}`,
                                    maxLength: {
                                      value: 150,
                                      message: "Reminder must be 150 characters or less"
                                    }
                                  })}
                                />
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500">
                                    {currentValue?.length || 0}/150 characters
                                  </span>
                                  {error && (
                                    <span className="text-xs text-red-600">{error.message}</span>
                                  )}
                                </div>
                              </div>
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
                        <Label className="text-sm font-medium text-gray-700">Personal reminder for All Occasions *</Label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNoteTooltip(true);
                          }}
                          className="focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-0.5"
                          aria-label="More information about personal reminder"
                        >
                          <HelpCircle className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                        </button>
                      </div>
                      <Textarea
                        placeholder="Write yourself a reminder that applies to all occasions (e.g., favorite color, preferences, hobbies)..."
                        {...register("note", {
                          required: "Please add a reminder for this recipient",
                          maxLength: {
                            value: 150,
                            message: "Reminder must be 150 characters or less"
                          }
                        })}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0 bg-white"
                        rows={4}
                        maxLength={150}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {watch("note")?.length || 0}/150 characters
                        </span>
                        {errors.note && (
                          <span className="text-xs text-red-600">{errors.note.message}</span>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6 flex-shrink-0">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="flex justify-between pt-4 flex-shrink-0 mt-auto">
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
                  disabled={
                    isLoading || 
                    addressValidation.isValidating || 
                    (addressValidation.result?.verdict === 'UNDELIVERABLE') ||
                    !areNotesComplete
                  }
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : addressValidation.isValidating ? 'Validating...' : 'Create Reminder'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Success */}
          {currentStep === 6 && (
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-12 text-center w-full min-h-[600px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-4">Reminder Created!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We'll send you beautiful cards before each occasion. You just need to sign and send them.
              </p>
              
              {/* Card Limit Warning */}
              {allocation && allocation.isOverLimit && (
                <div className="w-full max-w-2xl mx-auto mb-8">
                  <CardLimitWarning 
                    allocation={allocation}
                    showDismiss={true}
                    onDismiss={() => {
                      router.push('/dashboard');
                    }}
                  />
                </div>
              )}
              
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
      </>
    )}

    {/* Full-screen overlay modals for tooltips */}
    {showJustBecauseTooltip && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
        onClick={() => setShowJustBecauseTooltip(false)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Just Because</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowJustBecauseTooltip(false)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We'll pick a random date to send a surprise card, avoiding holidays and other occasions. 
            This way, your recipient gets an unexpected, thoughtful card when they least expect it!
          </p>
        </div>
      </div>
    )}

    {showNoteTooltip && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
        onClick={() => setShowNoteTooltip(false)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Reminder</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowNoteTooltip(false)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">
            This reminder will accompany every card we send to you for this person, regardless of the occasion. 
            Use it to remember important details like their favorite color, preferences, hobbies, or anything else 
            that will help you write a more personal and thoughtful message.
          </p>
        </div>
      </div>
    )}
    </div>
  );
}
