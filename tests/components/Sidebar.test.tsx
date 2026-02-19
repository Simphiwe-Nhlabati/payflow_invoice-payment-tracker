import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/client/context/AuthContext';
import Sidebar from '../../src/client/components/Sidebar';

// Mock the AuthContext
const mockAuthState = {
  isAuthenticated: true,
  user: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    businessName: 'JD Consulting',
  },
  token: 'mock-token',
};
const mockLogout = vi.fn();

vi.mock('../../src/client/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    state: mockAuthState,
    logout: mockLogout,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Wrapper component to provide router and auth context
const SidebarWrapper = ({ isOpen = true }) => (
  <MemoryRouter initialEntries={['/dashboard']}>
    <AuthProvider>
      <Sidebar isOpen={isOpen} />
    </AuthProvider>
  </MemoryRouter>
);

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with navigation items', () => {
    render(<SidebarWrapper />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<SidebarWrapper />);
    
    // Check that dashboard link is highlighted as active
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-blue-100');
  });

  it('does not highlight inactive routes', () => {
    render(<SidebarWrapper />);
    
    const clientsLink = screen.getByText('Clients').closest('a');
    expect(clientsLink).not.toHaveClass('bg-blue-100');
    expect(clientsLink).toHaveClass('text-gray-600');
  });

  it('calls logout function when logout button is clicked', () => {
    render(<SidebarWrapper />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes for open/closed states', () => {
    // Test open state
    const { rerender } = render(<SidebarWrapper isOpen={true} />);
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('translate-x-0');

    // Test closed state
    rerender(<SidebarWrapper isOpen={false} />);
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('has correct navigation links', () => {
    render(<SidebarWrapper />);
    
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    
    const clientsLink = screen.getByRole('link', { name: /Clients/i });
    expect(clientsLink).toHaveAttribute('href', '/clients');
    
    const invoicesLink = screen.getByRole('link', { name: /Invoices/i });
    expect(invoicesLink).toHaveAttribute('href', '/invoices');
    
    const paymentsLink = screen.getByRole('link', { name: /Payments/i });
    expect(paymentsLink).toHaveAttribute('href', '/payments');
    
    const settingsLink = screen.getByRole('link', { name: /Settings/i });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });
});