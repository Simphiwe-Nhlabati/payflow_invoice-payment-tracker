import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../../src/client/components/Header';

// Create a mock implementation that can be changed
const mockUseAuth = vi.fn();

vi.mock('../../src/client/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Header Component', () => {
  const mockSetSidebarOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set default mock return value
    mockUseAuth.mockReturnValue({
      state: {
        isAuthenticated: true,
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          businessName: 'JD Consulting',
        },
        token: 'mock-token',
      },
      logout: vi.fn(),
    });
  });

  it('renders header with company name', () => {
    const { container } = render(
      <Header sidebarOpen={false} setSidebarOpen={mockSetSidebarOpen} />
    );
    
    expect(screen.getByText('PayFlow')).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    render(<Header sidebarOpen={false} setSidebarOpen={mockSetSidebarOpen} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('JD Consulting')).toBeInTheDocument();
  });

  it('shows menu button on mobile', () => {
    const setSidebarOpen = vi.fn();
    render(<Header sidebarOpen={false} setSidebarOpen={setSidebarOpen} />);
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
    
    fireEvent.click(menuButton);
    expect(setSidebarOpen).toHaveBeenCalledWith(true);
  });

  it('changes icon when sidebar is open', () => {
    const setSidebarOpen = vi.fn();
    render(<Header sidebarOpen={true} setSidebarOpen={setSidebarOpen} />);
    
    // When sidebar is open, the button should show the close (X) icon
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('does not show user info when not authenticated', () => {
    // Change the mock to return unauthenticated state
    mockUseAuth.mockReturnValue({
      state: { 
        isAuthenticated: false, 
        user: null, 
        token: null 
      },
      logout: vi.fn(),
    });
    
    render(<Header sidebarOpen={false} setSidebarOpen={mockSetSidebarOpen} />);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('JD Consulting')).not.toBeInTheDocument();
  });
});