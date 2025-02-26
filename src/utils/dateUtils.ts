import { addDays, addHours, parseISO } from "date-fns";

/**
 * Adds days and hours to a given date.
 *
 * @param {Date | string} date - The base date (can be a Date object or an ISO string).
 * @param {number} days - Number of days to add (default: 0).
 * @param {number} hours - Number of hours to add (default: 0).
 * @returns {Date} - The updated date with the added time.
 *
 * @example
 * const updatedDate = addTimeToDate("2025-02-25T17:34:16.468Z", 2, 5);
 * console.log(updatedDate); // Adds 2 days and 5 hours
 */
export function addTimeToDate(
  date: Date | string,
  days: number = 0,
  hours: number = 0
): Date {
  // Convert string date to Date object if necessary
  const baseDate = typeof date === "string" ? parseISO(date) : date;

  // Add days and hours
  const updatedDate = addHours(addDays(baseDate, days), hours);

  return updatedDate;
}
