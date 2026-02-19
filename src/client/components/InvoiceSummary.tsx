import React from 'react';

interface InvoiceSummaryProps {
  subtotal: number; // in cents
  vatAmount: number; // in cents
  total: number; // in cents
  currency?: string;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ 
  subtotal, 
  vatAmount, 
  total, 
  currency = 'R' 
}) => {
  const formatCurrency = (cents: number): string => {
    const dollars = cents / 100;
    return `${currency}${dollars.toFixed(2)}`;
  };

  return (
    <div className="invoice-summary bg-gray-50 p-4 rounded-lg" data-testid="invoice-summary">
      <div className="summary-row flex justify-between py-2">
        <span data-testid="subtotal-label">Subtotal:</span>
        <span data-testid="subtotal-amount">{formatCurrency(subtotal)}</span>
      </div>
      <div className="summary-row flex justify-between py-2">
        <span data-testid="vat-label">VAT (15%):</span>
        <span data-testid="vat-amount">{formatCurrency(vatAmount)}</span>
      </div>
      <div className="summary-row flex justify-between py-2 font-bold border-t-2">
        <span data-testid="total-label">Total:</span>
        <span data-testid="total-amount">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default InvoiceSummary;