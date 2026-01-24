import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard date format for display: M/D/YY
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "1/5/25")
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "M/d/yy");
}

/**
 * Standard date-time format for display: M/D/YY h:mm a
 * @param date - Date string or Date object
 * @returns Formatted date-time string (e.g., "1/5/25 3:30 PM")
 */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "M/d/yy h:mm a");
}

/**
 * Standard percentage format for display
 * Shows whole percentages without decimals (e.g., "5%")
 * Shows 1 decimal place if needed (e.g., "5.5%")
 * Shows up to 2 decimal places maximum (e.g., "5.55%")
 * @param value - Percentage value (e.g., 5, 5.5, 5.55, 0.055)
 * @param isDecimal - If true, value is treated as decimal (0.05 = 5%)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number | null | undefined, isDecimal = false): string {
  if (value === null || value === undefined) return "—";
  
  const percent = isDecimal ? value * 100 : value;
  
  // Round to 2 decimal places first
  const rounded = Math.round(percent * 100) / 100;
  
  // Check if it's a whole number
  if (rounded === Math.floor(rounded)) {
    return `${Math.floor(rounded)}%`;
  }
  
  // Check if it has only 1 decimal place
  if (rounded * 10 === Math.floor(rounded * 10)) {
    return `${rounded.toFixed(1)}%`;
  }
  
  // Otherwise show 2 decimal places
  return `${rounded.toFixed(2)}%`;
}

/**
 * Standard currency format for display
 * @param value - Numeric value
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "$0.00";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format US phone numbers as (###) ###-####
 * @param phone - Raw phone string
 * @returns Formatted phone string or original if not a valid US number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Handle US numbers (10 digits or 11 with leading 1)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if not a standard US number
  return phone;
}
