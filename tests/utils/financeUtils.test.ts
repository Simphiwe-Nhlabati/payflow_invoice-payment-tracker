import { describe, it, expect } from 'vitest';
import { calculateVat, calculateTotalWithVat, formatCurrency, isValidEmail } from '../../src/client/utils/financeUtils';

describe('Finance Utilities', () => {
  describe('calculateVat', () => {
    it('should calculate VAT correctly', () => {
      expect(calculateVat(10000)).toBe(1500); // 15% of 10000 cents = 1500 cents
      expect(calculateVat(20000, 0.10)).toBe(2000); // 10% of 20000 cents = 2000 cents
      expect(calculateVat(5000, 0.20)).toBe(1000); // 20% of 5000 cents = 1000 cents
    });

    it('should handle edge cases', () => {
      expect(calculateVat(0)).toBe(0); // 0 amount should return 0 VAT
      expect(calculateVat(1)).toBe(0); // Small amounts should round appropriately
      expect(calculateVat(7)).toBe(1); // Should round to nearest cent
    });
  });

  describe('calculateTotalWithVat', () => {
    it('should calculate total with VAT correctly', () => {
      expect(calculateTotalWithVat(10000)).toBe(11500); // 10000 + 1500 = 11500
      expect(calculateTotalWithVat(20000, 0.10)).toBe(22000); // 20000 + 2000 = 22000
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(10000)).toBe('R100.00'); // 10000 cents = R100.00
      expect(formatCurrency(12345)).toBe('R123.45'); // 12345 cents = R123.45
      expect(formatCurrency(1)).toBe('R0.01'); // 1 cent = R0.01
      expect(formatCurrency(0)).toBe('R0.00'); // 0 cents = R0.00
      expect(formatCurrency(10000, '$')).toBe('$100.00'); // Custom currency symbol
    });
  });

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.za')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user.example.com')).toBe(false);
    });
  });
});