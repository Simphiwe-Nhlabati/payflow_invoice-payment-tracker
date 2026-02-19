import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InvoiceSummary from '../../src/client/components/InvoiceSummary';

describe('InvoiceSummary Component', () => {
  const defaultProps = {
    subtotal: 10000, // R100.00
    vatAmount: 1500, // R15.00 (15% VAT)
    total: 11500,    // R115.00
  };

  it('displays correct amounts', () => {
    render(<InvoiceSummary {...defaultProps} />);

    expect(screen.getByTestId('subtotal-label')).toHaveTextContent(/subtotal:/i);
    expect(screen.getByTestId('vat-label')).toHaveTextContent(/vat \(15%\)/i);
    expect(screen.getByTestId('total-label')).toHaveTextContent(/total:/i);

    expect(screen.getByTestId('subtotal-amount')).toHaveTextContent('R100.00'); // Subtotal
    expect(screen.getByTestId('vat-amount')).toHaveTextContent('R15.00');  // VAT
    expect(screen.getByTestId('total-amount')).toHaveTextContent('R115.00'); // Total
  });

  it('uses custom currency when provided', () => {
    render(<InvoiceSummary {...defaultProps} currency="$" />);

    expect(screen.getByTestId('subtotal-amount')).toHaveTextContent('$100.00'); // Subtotal
    expect(screen.getByTestId('vat-amount')).toHaveTextContent('$15.00');  // VAT
    expect(screen.getByTestId('total-amount')).toHaveTextContent('$115.00'); // Total
  });

  it('applies correct styling classes', () => {
    render(<InvoiceSummary {...defaultProps} />);

    const summaryContainer = screen.getByTestId('invoice-summary');
    expect(summaryContainer).toHaveClass('invoice-summary');
    
    const totalRow = screen.getByTestId('total-label').closest('.summary-row');
    expect(totalRow).toHaveClass('font-bold');
  });
});