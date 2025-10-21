'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/browserClient';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/app/(dashboard)/components/ui/calendar';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';

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

  const relationshipOptions = ['Mother', 'Father', 'Boyfriend', 'Girlfriend', 'Friend', 'Wife', 'Husband', 'Partner', 'CoWorker'];

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
  const handleNext = () => {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error('User not logged in');

      const enrichedData = {
        ...data,
        customDates,
        selectedOccasions: [...selectedCustomOccasions, ...selectedHolidayOccasions],
      };

      const { error } = await supabase.from('reminders').insert([
        {
          user_id: userId,
          ...enrichedData,
        },
      ]);

      if (error) throw error;

      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to save reminder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = selectedCustomOccasions.length > 0 ? 5 : 4;

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
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
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
                  <Label className="block text-sm font-medium text-gray-700 mb-4">Recipient's Address</Label>
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
                      <Input
                        placeholder="State"
                        {...register("address.state")}
                        className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                      />
                      <Input
                        placeholder="Zip Code"
                        {...register("address.zip")}
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
                <h2 className="text-3xl font-light text-gray-900 mb-4">Who are they to you?</h2>
                <p className="text-gray-600">This helps us personalize the card.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {relationshipOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue("relationship", option)}
                    className={cn(
                      "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left",
                      relationship === option 
                        ? "bg-gray-900 text-white border-gray-900" 
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {option}
                  </button>
                ))}
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
                    {customOccasions.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleCustomOccasion(item.value)}
                        className={cn(
                          "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left",
                          isCustomOccasionSelected(item.value)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    Holidays <span className="text-xs text-gray-500">(date is fixed)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {holidayOccasions.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleHolidayOccasion(item.value)}
                        className={cn(
                          "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors text-left",
                          isHolidayOccasionSelected(item.value)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
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
                <p className="text-gray-600">Pick the dates for each occasion.</p>
              </div>
              
              <div className="space-y-6">
                {selectedCustomOccasions.map((oc) => (
                  <div key={oc}>
                    <Label className="block text-sm font-medium text-gray-700 mb-3">{oc} date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-gray-200",
                            !customDates[oc] && "text-gray-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDates[oc] ? format(customDates[oc]!, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customDates[oc]}
                          onSelect={(val: Date | undefined) => {
                            setCustomDates((prev) => ({
                              ...prev,
                              [oc]: val ?? undefined,
                            }));
                          }}
                          initialFocus
                          defaultMonth={new Date()}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear() + 1}
                          disabled={(date: Date) => date < new Date(new Date().setDate(new Date().getDate() + 10))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
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

          {/* Step 5: Notes */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">Add a reminder note?</h2>
                <p className="text-gray-600">Help us personalize the card with your thoughts.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">General Note</Label>
                  <Textarea
                    placeholder="Write a note that applies to all occasions..."
                    {...register("note")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    rows={4}
                  />
                </div>

                <div>
                  <details className="cursor-pointer">
                    <summary className="text-sm text-gray-600 hover:text-gray-800 underline underline-offset-4 mb-3">
                      Customize per occasion
                    </summary>
                    <div className="space-y-4">
                      {[...selectedCustomOccasions, ...selectedHolidayOccasions].map((oc) => (
                        <div key={oc}>
                          <Label className="block text-sm font-medium text-gray-700 mb-2">{oc} note</Label>
                          <Textarea
                            placeholder={`Optional note for ${oc}`}
                            className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                            rows={2}
                            {...register(`occasionNotes.${oc}` as const)}
                          />
                        </div>
                      ))}
                    </div>
                  </details>
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
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Reminder'}
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
