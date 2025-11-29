'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/browserClient';

import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Button } from './button';
import { Calendar } from './calendar';
import { Switch } from './switch';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
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

interface SplitTeaserProps {
  title?: string;
  imageUrl?: string;
}

export default function SplitTeaser({
  title = "Create Your Reminder",
  imageUrl = "/cardmovie.gif"
}: SplitTeaserProps) {
  // --- Form setup with react-hook-form and Zod resolver ---
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {},
  });

  // --- Step-by-step flow logic ---
  const [step, setStep] = useState(1);

  // --- State tracking for selected occasions and their dates ---
  // Track user-selected custom occasions (require a date)
  const [selectedCustomOccasions, setSelectedCustomOccasions] = useState<string[]>(["Birthday"]);
  // Track user-selected holiday occasions (fixed date)
  const [selectedHolidayOccasions, setSelectedHolidayOccasions] = useState<string[]>(["Thanksgiving", "Christmas"]);
  // For each custom occasion, store its selected date
  const [customDates, setCustomDates] = useState<{ [occasion: string]: Date | undefined }>({
    Birthday: new Date(new Date().setMonth(4, 10)), // May 10
  });

  // --- Watch form fields for dynamic updates ---
  const firstPerson = watch("firstPerson") || { first: '', last: '' };
  const secondPersonEnabled = watch("secondPersonEnabled") || false;
  const secondPerson = watch("secondPerson") || { first: '', last: '' };
  const address = watch("address") || { street: '', city: '', state: '', zip: '' };
  const date = watch("date");
  const note = watch("note") || '';
  const occasionNotes = watch("occasionNotes") || {};
  // relationship default to "Friend" in step 2
  const relationship = watch("relationship");

  // --- Default relationship logic ---
  // Force set to "Friend" if empty
  useEffect(() => {
    if (!relationship) {
      setValue("relationship", "Friend");
    }
  }, [relationship, setValue]);

  // --- How the preview text is built ---
  // This builds the preview card text using selected names, occasions, and notes
  const formatCardText = () => {
    const name = secondPersonEnabled
      ? `${firstPerson.first} & ${secondPerson.first} ${firstPerson.last?.[0] || ''}`
      : `${firstPerson.first} ${firstPerson.last?.[0] || ''}`;
    const previewLines: string[] = [];

    // Header
    previewLines.push(`Reminder for ${name}`);
    if (note) {
      previewLines.push(`"${note}"`);
    }

    // Occasions List
    if (selectedCustomOccasions.length > 0 || selectedHolidayOccasions.length > 0) {
      previewLines.push(`\nThey're set to receive cards for:`);

      if (selectedCustomOccasions.length > 0) {
        selectedCustomOccasions.forEach((oc) => {
          previewLines.push(`• Their ${oc}`);
        });
      }

      if (selectedHolidayOccasions.length > 0) {
        selectedHolidayOccasions.forEach((oc) => {
          previewLines.push(`• ${oc}`);
        });
      }
    }

    return previewLines.join('\n');
  };

  // --- Occasion lists ---
  // Custom date-required occasions
  const customOccasions = [
    { value: "Birthday", label: "Birthday" },
    { value: "Anniversary (romantic)", label: "Anniversary (romantic)" },
    { value: "Anniversary (work)", label: "Anniversary (work)" },
  ];
  // Fixed-date holidays
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

  // --- Occasion selection handlers ---
  // Add or remove a custom occasion, and manage its date state
  const toggleCustomOccasion = (val: string) => {
    setSelectedCustomOccasions(prev => {
      if (prev.includes(val)) {
        // Remove and delete date
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
  // Add or remove a holiday occasion (no date needed)
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

  // --- Navigation logic for step-by-step flow ---
  // Handles moving forward in the multi-step form
  const handleNext = () => {
    if (step === 3) {
      // If user selected any custom occasions, go to date step, else skip to note
      if (selectedCustomOccasions.length > 0) {
        setStep(4);
      } else {
        setStep(5);
      }
    } else {
      setStep(step + 1);
    }
  };
  // Handles moving backward in the multi-step form
  const handleBack = () => {
    if (step === 5 && selectedCustomOccasions.length > 0) {
      setStep(4);
    } else if (step === 4 && selectedCustomOccasions.length > 0) {
      setStep(3);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  // --- Final list of all selected occasions (for preview and save) ---
  const selectedOccasions = [...selectedCustomOccasions, ...selectedHolidayOccasions];

  // --- Reminder save logic using Supabase ---
  // Handles form submission, attaches dates/occasions, and saves the reminder
  const handleFinish = async (data: ReminderFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) throw new Error('User not logged in');

      // Attach customDates and selectedOccasions to the form data for saving
      const enrichedData = {
        ...data,
        customDates,
        selectedOccasions,
      };

      // Save directly to Supabase using the browser client
      const { error } = await supabase.from('reminders').insert([
        {
          user_id: userId,
          ...enrichedData,
        },
      ]);

      if (error) {
        console.error('Failed to save reminder:', error);
        throw error;
      }

      console.log('Reminder saved!');
      setStep(6);
    } catch (error) {
      console.error('Failed to save reminder:', error);
    }
  };

  // --- Relationship options for the relationship step ---
  const relationshipOptions = ['Mother', 'Father', 'Boyfriend', 'Girlfriend', 'Friend', 'Wife', 'Husband', 'Partner', 'CoWorker'];

  // Left side content - the form
  const leftContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600">
          Create personalized reminders for your loved ones. We'll send beautiful cards on their special occasions.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFinish)}>
        {/* Step 6: All done + preview */}
        {step === 6 && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 w-full">
            <p className="text-2xl font-semibold">You're all set!</p>
            <p className="text-muted-foreground max-w-md">
              We'll take care of your reminders from here. Want to try another?
            </p>
            <div className="flex gap-4">
              <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
                Try it again
              </Button>
              <Button type="button" onClick={() => window.location.href = '/sign-up'}>
                Sign up
              </Button>
            </div>
          </div>
        )}

        <div className={cn("space-y-8", step === 6 ? "hidden" : "")}>
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-sm flex items-center justify-center font-medium text-gray-700">1</div>
                <h3 className="text-xl font-light text-gray-900">Who is this for?</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    {...register("firstPerson.first")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                  />
                  {errors.firstPerson?.first && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstPerson.first.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="lastName"
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
                  <Input
                    id="secondFirstName"
                    placeholder="First Name"
                    {...register("secondPerson.first")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                  />
                  <Input
                    id="secondLastName"
                    placeholder="Last Name"
                    {...register("secondPerson.last")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                  />
                </div>
              )}
              <div className="border-t border-gray-100 pt-6">
                <Label className="block text-sm font-medium text-gray-700 mb-4">Recipient's Address</Label>

                <div className="space-y-4">
                  <Input
                    id="street"
                    placeholder="Street Address"
                    {...register("address.street")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                  />
                  <Input
                    id="apartment"
                    placeholder="Apt, Suite, etc. (optional)"
                    {...register("address.apartment")}
                    className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      id="city"
                      placeholder="City"
                      {...register("address.city")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                    <Input
                      id="state"
                      placeholder="State"
                      {...register("address.state")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                    <Input
                      id="zip"
                      placeholder="Zip Code"
                      {...register("address.zip")}
                      className="w-full border-gray-200 focus:border-gray-400 focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
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
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-sm flex items-center justify-center font-medium text-gray-700">2</div>
                <h3 className="text-xl font-light text-gray-900">Who are they to you?</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {relationshipOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValue("relationship", option)}
                    className={cn(
                      "px-4 py-3 rounded-lg border cursor-pointer select-none text-sm font-medium transition-colors",
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
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-sm flex items-center justify-center font-medium text-gray-700">3</div>
                <h3 className="text-xl font-light text-gray-900">What kind of card do you need?</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">
                    Personal Occasions <span className="text-xs text-gray-500">(date required)</span>
                  </Label>
                  <div className="grid grid-cols-1 gap-3 mb-6">
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
                  <Label className="block text-sm font-medium text-gray-700 mb-3">
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
                  disabled={selectedCustomOccasions.length === 0 && selectedHolidayOccasions.length === 0}
                  className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 border-0 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Date selection for each custom occasion, and show selected holidays with fixed dates */}
          {step === 4 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">4</div>
                <h3 className="text-lg font-semibold">When is it?</h3>
              </div>
              <div className="space-y-6 mt-2">
                {/* Custom occasion date pickers */}
                {selectedCustomOccasions.length > 0 && selectedCustomOccasions.map((oc) => (
                  <div key={oc}>
                    <Label className="block mb-2">{oc} date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !customDates[oc] && "text-muted-foreground"
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
                {/* Show selected holidays with fixed dates (read-only) */}
                {selectedHolidayOccasions.length > 0 && (
                  <div className="space-y-2">
                    {selectedHolidayOccasions.map((val) => {
                      const holiday = holidayOccasions.find(h => h.value === val);
                      return (
                        <div key={val} className="flex flex-col">
                          <Label className="mb-1">{holiday?.label}</Label>
                          <Input
                            value={holiday?.dateLabel || ""}
                            readOnly
                            disabled
                            className="w-full bg-gray-100 text-gray-600"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                <Button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={selectedCustomOccasions.length > 0 && selectedCustomOccasions.some(oc => !customDates[oc])}
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 5: Reminder note */}
          {step === 5 && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">5</div>
                <h3 className="text-lg font-semibold">Add a reminder note?</h3>
              </div>

              <Label className="block mb-2">Add a reminder note?</Label>
              <Textarea
                id="globalNote"
                placeholder="Write a note that applies to all occasions..."
                {...register("note")}
              />

              <div className="mt-4">
                <details className="mb-2">
                  <summary className="cursor-pointer text-blue-500 underline text-sm">Customize per occasion</summary>
                  <div className="mt-2 space-y-2">
                    {selectedOccasions.map((oc) => (
                      <div key={oc}>
                        <Label className="block text-xs mb-1">{oc} note</Label>
                        <Textarea
                          placeholder={`Optional note for ${oc}`}
                          className="text-sm"
                          {...register(`occasionNotes.${oc}` as const)}
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                <Button type="submit">Finish</Button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );

  // Right side content - the live preview
  const rightContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-gray-900 mb-3">Live Preview</h3>
        <p className="text-gray-600">See how your card will look</p>
      </div>
      
      <div className="space-y-6">
        <div className="text-center">
          <img
            src={imageUrl}
            alt="Card preview"
            className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
          />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
          <p className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">Card Preview</p>
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {formatCardText()}
          </div>
        </div>
        
        {step === 6 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <p className="text-green-800 font-medium">Reminder created successfully!</p>
            </div>
            <p className="text-green-600 text-sm">We'll send you notifications before each occasion.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Create Your Reminder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Craft personalized reminders for your loved ones. We'll send beautiful cards on their special occasions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">{leftContent}</div>
          <div className="space-y-8">{rightContent}</div>
        </div>
      </div>
    </section>
  );
}