/**
 * Utility functions for financial calculations
 */

/**
 * Calculate VAT amount from a given amount
 * @param amount - Amount in cents
 * @param vatRate - VAT rate as a decimal (e.g., 0.15 for 15%)
 * @returns VAT amount in cents
 */
export function calculateVat(amount: number, vatRate: number = 0.15): number {
  return Math.round(amount * vatRate);
}

/**
 * Calculate total amount including VAT
 * @param amount - Base amount in cents
 * @param vatRate - VAT rate as a decimal (e.g., 0.15 for 15%)
 * @returns Total amount in cents
 */
export function calculateTotalWithVat(amount: number, vatRate: number = 0.15): number {
  const vat = calculateVat(amount, vatRate);
  return amount + vat;
}

/**
 * Format cents to currency string
 * @param cents - Amount in cents
 * @param currency - Currency symbol (default: R)
 * @returns Formatted currency string
 */
export function formatCurrency(cents: number, currency: string = 'R'): string {
  const dollars = cents / 100;
  return `${currency}${dollars.toFixed(2)}`;
}

/**
 * Validate if an email address is properly formatted
 * @param email - Email address to validate
 * @returns True if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}