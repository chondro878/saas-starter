export function occasionsForMonth(month?: string | number): { label: string; value: string }[] {
    const staticOptions = [
      { label: "Birthday", value: "birthday" },
      { label: "Anniversary", value: "anniversary" },
      { label: "Thinking of You", value: "thinking_of_you" },
      { label: "Congratulations", value: "congratulations" },
      { label: "Get Well Soon", value: "get_well_soon" },
    ]
  
    const holidayMap: Record<number, { label: string; value: string }[]> = {
      0: [{ label: "New Year's Day", value: "new_years_day" }],
      1: [{ label: "Valentine's Day", value: "valentines_day" }, { label: "Presidents' Day", value: "presidents_day" }],
      2: [{ label: "St. Patrick's Day", value: "st_patricks_day" }],
      3: [{ label: "Easter", value: "easter" }, { label: "April Fool's Day", value: "april_fools" }],
      4: [{ label: "Mother's Day", value: "mothers_day" }, { label: "Memorial Day", value: "memorial_day" }],
      5: [{ label: "Father's Day", value: "fathers_day" }, { label: "Juneteenth", value: "juneteenth" }],
      6: [{ label: "Independence Day", value: "independence_day" }],
      7: [],  // August
      8: [{ label: "Labor Day", value: "labor_day" }],
      9: [{ label: "Halloween", value: "halloween" }],
      10: [{ label: "Veterans Day", value: "veterans_day" }, { label: "Thanksgiving", value: "thanksgiving" }],
      11: [{ label: "Christmas", value: "christmas" }, { label: "New Year's Eve", value: "new_years_eve" }],
    }
  
    const parsedMonth = typeof month === "string" ? parseInt(month, 10) : typeof month === "number" ? month : -1;
    const monthIndex = parsedMonth >= 0 && parsedMonth <= 11 ? parsedMonth : -1;
    const holidayOptions = monthIndex >= 0 ? holidayMap[monthIndex] || [] : [];
  
    return [...holidayOptions, ...staticOptions];
  }

// Export holidayMap for internal use in getNextHoliday
const holidayMap: Record<number, { label: string; value: string }[]> = {
  0: [{ label: "New Year's Day", value: "new_years_day" }],
  1: [{ label: "Valentine's Day", value: "valentines_day" }, { label: "Presidents' Day", value: "presidents_day" }],
  2: [{ label: "St. Patrick's Day", value: "st_patricks_day" }],
  3: [{ label: "Easter", value: "easter" }, { label: "April Fool's Day", value: "april_fools" }],
  4: [{ label: "Mother's Day", value: "mothers_day" }, { label: "Memorial Day", value: "memorial_day" }],
  5: [{ label: "Father's Day", value: "fathers_day" }, { label: "Juneteenth", value: "juneteenth" }],
  6: [{ label: "Independence Day", value: "independence_day" }],
  7: [],  // August
  8: [{ label: "Labor Day", value: "labor_day" }],
  9: [{ label: "Halloween", value: "halloween" }],
  10: [{ label: "Veterans Day", value: "veterans_day" }, { label: "Thanksgiving", value: "thanksgiving" }],
  11: [{ label: "Christmas", value: "christmas" }, { label: "New Year's Eve", value: "new_years_eve" }],
};

export function getNextHoliday(): { label: string; value: string; date: Date } | null {
  const today = new Date();
  const currentYear = today.getFullYear();

  for (let month = today.getMonth(); month < 12; month++) {
    const holidays = holidayMap[month] || [];
    for (const holiday of holidays) {
      // Use default fixed dates for simplicity; extend logic if needed for dynamic dates
      const holidayDates: Record<string, number> = {
        new_years_day: 1,
        valentines_day: 14,
        presidents_day: 19,
        st_patricks_day: 17,
        april_fools: 1,
        easter: 9, // Placeholder
        mothers_day: 12,
        memorial_day: 27,
        fathers_day: 16,
        juneteenth: 19,
        independence_day: 4,
        labor_day: 2,
        halloween: 31,
        veterans_day: 11,
        thanksgiving: 28,
        christmas: 25,
        new_years_eve: 31,
      };

      const holidayDay = holidayDates[holiday.value];
      if (!holidayDay) continue;

      const holidayDate = new Date(currentYear, month, holidayDay);
      if (holidayDate > today) {
        return { ...holiday, date: holidayDate };
      }
    }
  }

  return null;
}