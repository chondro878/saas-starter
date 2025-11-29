// Holiday definitions and utilities

export interface Holiday {
  name: string;
  month: number; // 0-indexed (0 = January)
  day: number;
  color: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export const HOLIDAYS: Holiday[] = [
  {
    name: "New Year's",
    month: 0,
    day: 1,
    color: {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-100',
      text: 'text-blue-700'
    }
  },
  {
    name: "Valentine's Day",
    month: 1,
    day: 14,
    color: {
      primary: 'bg-pink-500',
      secondary: 'bg-pink-100',
      text: 'text-pink-700'
    }
  },
  {
    name: "Easter",
    month: 3,
    day: 15, // Approximate
    color: {
      primary: 'bg-purple-500',
      secondary: 'bg-purple-100',
      text: 'text-purple-700'
    }
  },
  {
    name: "Mother's Day",
    month: 4,
    day: 12, // Second Sunday of May (approximate)
    color: {
      primary: 'bg-pink-500',
      secondary: 'bg-pink-100',
      text: 'text-pink-700'
    }
  },
  {
    name: "Father's Day",
    month: 5,
    day: 16, // Third Sunday of June (approximate)
    color: {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-100',
      text: 'text-blue-700'
    }
  },
  {
    name: "Independence Day",
    month: 6,
    day: 4,
    color: {
      primary: 'bg-red-500',
      secondary: 'bg-red-100',
      text: 'text-red-700'
    }
  },
  {
    name: "Halloween",
    month: 9,
    day: 31,
    color: {
      primary: 'bg-orange-500',
      secondary: 'bg-orange-100',
      text: 'text-orange-700'
    }
  },
  {
    name: "Thanksgiving",
    month: 10,
    day: 28, // Fourth Thursday of November (approximate)
    color: {
      primary: 'bg-amber-500',
      secondary: 'bg-amber-100',
      text: 'text-amber-700'
    }
  },
  {
    name: "Christmas",
    month: 11,
    day: 25,
    color: {
      primary: 'bg-red-500',
      secondary: 'bg-red-100',
      text: 'text-red-700'
    }
  }
];

export function getNextHolidays(count: number = 3): Array<Holiday & { date: Date; daysUntil: number }> {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Create dates for all holidays this year and next year
  const allHolidayDates = [];
  
  for (const holiday of HOLIDAYS) {
    // This year
    const thisYearDate = new Date(currentYear, holiday.month, holiday.day);
    allHolidayDates.push({
      ...holiday,
      date: thisYearDate,
      daysUntil: Math.ceil((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    // Next year
    const nextYearDate = new Date(currentYear + 1, holiday.month, holiday.day);
    allHolidayDates.push({
      ...holiday,
      date: nextYearDate,
      daysUntil: Math.ceil((nextYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    });
  }
  
  // Filter to only future holidays and sort by days until
  return allHolidayDates
    .filter(h => h.daysUntil > 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, count);
}

export function getDaysUntilHoliday(holiday: Holiday): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const holidayDate = new Date(currentYear, holiday.month, holiday.day);
  
  // If holiday has passed this year, use next year
  if (holidayDate < today) {
    holidayDate.setFullYear(currentYear + 1);
  }
  
  return Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

