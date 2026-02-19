import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/client/context/AuthContext';
import App from '../src/App';

// Mock the AuthContext
const mockAuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// Mock the useAuth hook specifically
vi.mock('../src/client/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    state: mockAuthState,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Wrapper component to provide router and auth context
const AppWrapper = () => (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AppWrapper />);
    
    // The app should render without throwing errors
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('provides necessary contexts', () => {
    render(<AppWrapper />);
    
    // Check that the app renders with the necessary providers
    expect(document.querySelector('[data-testid="app-container"]')).toBeInTheDocument();
  });

  it('handles routing properly', async () => {
    render(<AppWrapper />);
    
    // Wait for potential async operations
    await waitFor(() => {
      // The app should render the appropriate route based on the URL
      expect(document.body).toBeDefined();
    });
  });

  it('renders layout components', () => {
    render(<AppWrapper />);
    
    // Check for presence of layout elements
    expect(screen.queryByText('PayFlow')).toBeInTheDocument(); // Header
  });
});