import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../src/client/pages/Register';
import { AuthProvider } from '../src/client/context/AuthContext';

// Mock the authApi
vi.mock('../src/client/api', () => ({
  authApi: {
    register: vi.fn(),
  },
}));

const MockedRegister = () => (
  <BrowserRouter>
    <AuthProvider>
      <Register />
    </AuthProvider>
  </BrowserRouter>
);

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form correctly', () => {
    render(<MockedRegister />);
    
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Business name (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<MockedRegister />);
    
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/First name is required/)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/)).toBeInTheDocument();
      expect(screen.getByText(/Invalid email address/)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 6 characters/)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const { authApi } = await import('../src/client/api');
    const mockRegister = vi.mocked(authApi.register);
    
    mockRegister.mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      },
    });

    render(<MockedRegister />);
    
    fireEvent.change(screen.getByPlaceholderText('First name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last name'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    
    const submitButton = screen.getByRole('button', { name: 'Create account' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        businessName: '',
      });
    });
  });
});
