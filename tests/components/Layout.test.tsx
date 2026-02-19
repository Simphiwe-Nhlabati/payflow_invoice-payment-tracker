import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../src/client/components/Layout';

// Mock the useAuth hook properly
vi.mock('../../src/client/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
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
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  })),
}));

import { useAuth } from '../../src/client/context/AuthContext';

// Mock child component for testing
const MockChildComponent = () => <div data-testid="layout-child">Layout Child Content</div>;

// Wrapper component to provide router and auth context
const LayoutWrapper = ({ children = <MockChildComponent /> }) => (
  <MemoryRouter>
    <Layout>{children}</Layout>
  </MemoryRouter>
);

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders layout with header and sidebar', () => {
    render(<LayoutWrapper />);
    
    // Check that header is present
    expect(screen.getByText('PayFlow')).toBeInTheDocument();
    
    // Check that sidebar is present with navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    
    // Check that children are rendered
    expect(screen.getByTestId('layout-child')).toBeInTheDocument();
  });

  it('renders children content correctly', () => {
    render(<LayoutWrapper />);
    
    expect(screen.getByText('Layout Child Content')).toBeInTheDocument();
  });

  it('has correct CSS classes for layout structure', () => {
    render(<LayoutWrapper />);

    // Find the main container div that has the overflow-hidden class
    // The Layout component has a main div with class "flex h-screen bg-gray-50 overflow-hidden"
    const layoutContainer = screen.getByTestId('layout-child').closest('.flex.h-screen');
    
    // Check if the main div contains the overflow-hidden class
    expect(layoutContainer).toHaveClass('overflow-hidden');
  });

  it('passes children prop correctly', () => {
    const CustomChild = () => <div data-testid="custom-child">Custom Content</div>;
    
    render(
      <LayoutWrapper>
        <CustomChild />
      </LayoutWrapper>
    );
    
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('renders sidebar as always open on desktop', () => {
    render(<LayoutWrapper />);

    // Find the sidebar element by its test ID or by its content
    const sidebar = document.querySelector('aside');
    // Check that it has the desktop class (md:translate-x-0)
    // According to the component, when isOpen is true, the class should include 'md:translate-x-0'
    expect(sidebar).toHaveClass('md:translate-x-0');
  });
});