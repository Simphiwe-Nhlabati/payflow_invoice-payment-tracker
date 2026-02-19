import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../src/client/components/ProtectedRoute';

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

// Mock the useAuth hook properly
vi.mock('../../src/client/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../src/client/context/AuthContext';

// Mock child component for testing
const MockChildComponent = () => <div>Protected Content</div>;

// Wrapper component to provide router and auth context
const ProtectedRouteWrapper = ({ isAuthenticated = true, children = <MockChildComponent />, initialEntries = ['/dashboard'] }) => {
  // Mock the useAuth hook
  (useAuth as vi.Mock).mockReturnValue({
    state: { ...mockAuthState, isAuthenticated },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  });

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    render(<ProtectedRouteWrapper isAuthenticated={true} />);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    render(<ProtectedRouteWrapper isAuthenticated={false} />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('passes props correctly to children', () => {
    const ChildWithProps = () => <div data-testid="child-with-props">Child with Props</div>;

    render(
      <ProtectedRouteWrapper isAuthenticated={true}>
        <ChildWithProps />
      </ProtectedRouteWrapper>
    );

    expect(screen.getByTestId('child-with-props')).toBeInTheDocument();
  });
});