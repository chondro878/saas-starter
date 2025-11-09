'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MonthDayPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  className?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (month: number) => {
  // Use current year for calculating days (leap years)
  const year = new Date().getFullYear();
  return new Date(year, month + 1, 0).getDate();
};

export function MonthDayPicker({ value, onChange, className }: MonthDayPickerProps) {
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() ?? new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(value?.getDate() ?? 1);

  const daysInMonth = getDaysInMonth(selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    // If current day is invalid for new month, set to last day of month
    const maxDay = getDaysInMonth(month);
    const newDay = selectedDay > maxDay ? maxDay : selectedDay;
    setSelectedDay(newDay);
    
    // Use current year
    const year = new Date().getFullYear();
    onChange(new Date(year, month, newDay));
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    const year = new Date().getFullYear();
    onChange(new Date(year, selectedMonth, day));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Month Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Month</label>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              type="button"
              onClick={() => handleMonthChange(index)}
              className={cn(
                "py-3 px-4 rounded-lg text-sm font-medium transition-colors relative z-10",
                selectedMonth === index
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              )}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Day</label>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayChange(day)}
              className={cn(
                "py-3 px-2 rounded-lg text-sm font-medium transition-colors relative z-10",
                selectedDay === day
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Date Display */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Selected Date</p>
        <p className="text-lg font-medium text-gray-900">
          {months[selectedMonth]} {selectedDay}
        </p>
      </div>
    </div>
  );
}

