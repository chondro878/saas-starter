'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from '@/lib/utils';

import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Switch } from '../ui/switch';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';

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

export function ReminderForm({
  onSubmit,
  defaultValues = {},
}: {
  onSubmit?: (data: any) => void;
  defaultValues?: Partial<ReminderFormData>;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues,
  });
  const [step, setStep] = useState(1);
  // Occasions state
  const [selectedCustomOccasions, setSelectedCustomOccasions] = useState<string[]>(["Birthday"]);
  const [selectedHolidayOccasions, setSelectedHolidayOccasions] = useState<string[]>(["Thanksgiving", "Christmas"]);
  // For each custom occasion, store its date
  const [customDates, setCustomDates] = useState<{ [occasion: string]: Date | undefined }>({
    Birthday: new Date(new Date().setMonth(4, 10)), // May 10
  });

  const firstPerson = watch("firstPerson") || { first: '', last: '' };
  const secondPersonEnabled = watch("secondPersonEnabled") || false;
  const secondPerson = watch("secondPerson") || { first: '', last: '' };
  const address = watch("address") || { street: '', city: '', state: '', zip: '' };
  const date = watch("date");
  const note = watch("note") || '';
  const occasionNotes = watch("occasionNotes") || {};

  // relationship default to "Friend" in step 2
  const relationship = watch("relationship");

  // Force set to "Friend" if empty
  useEffect(() => {
    if (!relationship) {
      setValue("relationship", "Friend");
    }
  }, [relationship, setValue]);

  // Card preview text using new occasion/date logic
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

  // Occasion selection handlers
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

  // Navigation logic for new step flow
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
  const handleBack = () => {
    if (step === 5 && selectedCustomOccasions.length > 0) {
      setStep(4);
    } else if (step === 4 && selectedCustomOccasions.length > 0) {
      setStep(3);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  // Final list of all selected occasions (for preview)
  const selectedOccasions = [...selectedCustomOccasions, ...selectedHolidayOccasions];

  const handleFinish = (data: ReminderFormData) => {
    // Attach customDates and selectedOccasions to form data for submission
    setStep(6);
  };

  const relationshipOptions = ['Mother', 'Father', 'Boyfriend', 'Girlfriend', 'Friend', 'Wife', 'Husband', 'Partner', 'CoWorker'];

  return (
    <form
      onSubmit={handleSubmit(handleFinish)}
    >
    {/* Step 6: All done + preview */}
    {step === 6 && (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 w-full">
        <p className="text-2xl font-semibold">You're all set!</p>
        <p className="text-muted-foreground max-w-md">
          We'll take care of your reminders from here. Want to try another?
        </p>
        <img
          src="/cardmovie.gif"
          alt="Card sliding in animation"
          className="w-full max-w-sm rounded shadow-md"
        />
        <div className="p-4 border rounded bg-gray-50 whitespace-pre-line max-w-md">
          <p className="font-semibold mb-2">Card Preview:</p>
          <p>{formatCardText()}</p>
        </div>
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
    <div className={cn("flex flex-col md:flex-row border rounded-lg p-6 w-full gap-6", step === 6 ? "hidden" : "")}>
      <div className="w-full md:w-1/2 space-y-4">
        {step === 1 && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">1</div>
              <h2 className="text-sm font-semibold">Who is this for?</h2>
            </div>

            <div className="flex gap-2">
              <Input
                id="firstName"
                placeholder="First Name"
                {...register("firstPerson.first")}
                className="w-1/2"
              />
              {errors.firstPerson?.first && (
                <p className="text-sm text-red-500">{errors.firstPerson.first.message}</p>
              )}
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
                className="w-1/2"
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-xs underline cursor-pointer"
                onClick={() => setValue("secondPersonEnabled", !secondPersonEnabled)}
              >
                Is this a couple?
              </span>
            </div>
            {secondPersonEnabled && (
              <div className="flex gap-2">
                <Input
                  id="secondFirstName"
                  placeholder="First Name"
                  {...register("secondPerson.first")}
                  className="w-1/2"
                />
                <Input
                  id="secondLastName"
                  placeholder="Last Name"
                  {...register("secondPerson.last")}
                  className="w-1/2"
                />
              </div>
            )}
            <hr className="my-4" />
            <Label className="pt-4 block">Recipient's Address:</Label>

            <Input
              id="street"
              placeholder="Street Address"
              {...register("address.street")}
            />
            <Input
              id="apartment"
              placeholder="Apt, Suite, etc. (optional)"
              {...register("address.apartment")}
            />
            <div className="flex gap-2">
              <Input
                id="city"
                placeholder="City"
                {...register("address.city")}
                className="w-1/2"
              />
              <Input
                id="state"
                placeholder="State"
                {...register("address.state")}
                className="w-1/4"
              />
              <Input
                id="zip"
                placeholder="Zip Code"
                {...register("address.zip")}
                className="w-1/4"
              />
            </div>

            <div className="flex gap-2">
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
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">2</div>
              <h2 className="text-sm font-semibold">Who are they to you?</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {relationshipOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("relationship", option)}
                  className={cn(
                    "px-3 py-1 rounded-full border cursor-pointer select-none",
                    relationship === option ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
              <Button
                type="button"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold">3</div>
              <h2 className="text-sm font-semibold">What kind of card do you need?</h2>
            </div>
            <div>
              <Label className="block">Personal Occasions <span className="text-xs text-muted-foreground">(date required)</span></Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {customOccasions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleCustomOccasion(item.value)}
                    className={cn(
                      "px-3 py-1 rounded-full border cursor-pointer select-none",
                      isCustomOccasionSelected(item.value)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Label className="block">Holidays <span className="text-xs text-muted-foreground">(date is fixed)</span></Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {holidayOccasions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleHolidayOccasion(item.value)}
                    className={cn(
                      "px-3 py-1 rounded-full border cursor-pointer select-none",
                      isHolidayOccasionSelected(item.value)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={selectedCustomOccasions.length === 0 && selectedHolidayOccasions.length === 0}
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
              <h2 className="text-sm font-semibold">When is it?</h2>
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
                        onSelect={(val) => {
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
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() + 10))}
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
              <h2 className="text-sm font-semibold">Add a reminder note?</h2>
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

      <div className="w-full md:w-1/2 border-l md:pl-6 pt-4 md:pt-0">
        {step === 1 && (
          <p className="text-muted-foreground">Provide the recipient's name and address so we know who to send the card to.</p>
        )}
        {step === 2 && (
          <p className="text-muted-foreground">Tell us your relationship to the recipient. This helps personalize the card.</p>
        )}
        {step === 3 && (
          <p className="text-muted-foreground">
            Select one or more occasions for the card.<br />
            <span className="text-xs text-muted-foreground">Personal occasions require a date. Holidays use their fixed date.</span>
          </p>
        )}
        {step === 4 && selectedCustomOccasions.length > 0 && (
          <p className="text-muted-foreground">
            Pick the date for each occasion you selected.
          </p>
        )}
        {step === 5 && (
          <>
            <p className="text-muted-foreground mb-4">Add a personal note to your reminder to make it special.</p>
          </>
        )}
      </div>
    </div>
    </form>
  );
}