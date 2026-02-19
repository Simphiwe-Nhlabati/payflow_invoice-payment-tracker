import { describe, it, expect } from 'vitest';
import { 
  calculateVat, 
  calculateTotalWithVat, 
  formatCurrency, 
  isValidEmail
} from '../../src/client/utils/financeUtils';

describe('Enhanced Finance Utilities', () => {
  describe('calculateVat edge cases', () => {
    it('should handle zero amounts', () => {
      expect(calculateVat(0)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(calculateVat(-10000)).toBe(-1500);
    });

    it('should handle different VAT rates', () => {
      expect(calculateVat(10000, 0.125)).toBe(1250); // 12.5%
      expect(calculateVat(10000, 0)).toBe(0); // 0%
      expect(calculateVat(10000, 0.25)).toBe(2500); // 25%
    });

    it('should handle precision correctly', () => {
      // Test with amounts that could cause floating point precision issues
      expect(calculateVat(33333)).toBe(5000); // 15% of 33333 should be 4999.95, rounded to 5000
    });
  });

  describe('calculateTotalWithVat edge cases', () => {
    it('should handle zero amounts', () => {
      expect(calculateTotalWithVat(0)).toBe(0);
    });

    it('should handle negative amounts', () => {
      expect(calculateTotalWithVat(-10000)).toBe(-11500);
    });

    it('should handle different VAT rates', () => {
      expect(calculateTotalWithVat(10000, 0.125)).toBe(11250); // 12.5%
      expect(calculateTotalWithVat(10000, 0)).toBe(10000); // 0%
      expect(calculateTotalWithVat(10000, 0.25)).toBe(12500); // 25%
    });
  });

  describe('formatCurrency edge cases', () => {
    it('should handle zero amounts', () => {
      expect(formatCurrency(0)).toBe('R0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-10000)).toBe('R-100.00');
    });

    it('should handle single digit cents', () => {
      expect(formatCurrency(5)).toBe('R0.05');
      expect(formatCurrency(1)).toBe('R0.01');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('R10000.00');
      expect(formatCurrency(12345678)).toBe('R123456.78');
    });

    it('should work with different currency symbols', () => {
      expect(formatCurrency(10000, '$')).toBe('$100.00');
      expect(formatCurrency(10000, '€')).toBe('€100.00');
      expect(formatCurrency(10000, '¥')).toBe('¥100.00');
    });
  });

  describe('isValidEmail edge cases', () => {
    it('should validate international domains', () => {
      expect(isValidEmail('user@domain.co.za')).toBe(true);
      expect(isValidEmail('user@domain.de')).toBe(true);
    });

    it('should validate emails with numbers', () => {
      expect(isValidEmail('user123@test.com')).toBe(true);
      expect(isValidEmail('123user@test.com')).toBe(true);
    });

    it('should validate emails with special characters', () => {
      expect(isValidEmail('user.name@test.com')).toBe(true);
      expect(isValidEmail('user+tag@test.com')).toBe(true);
      expect(isValidEmail('user_name@test.com')).toBe(true);
      expect(isValidEmail('user-name@test.com')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user')).toBe(false);
      expect(isValidEmail('@test.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user name@test.com')).toBe(false);
    });
  });
});