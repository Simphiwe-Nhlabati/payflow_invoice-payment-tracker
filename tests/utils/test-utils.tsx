// tests/utils/test-utils.ts
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthState } from '../../src/client/context/AuthContext';

// Define a wrapper interface for custom render options
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authState?: Partial<AuthState>;
  initialEntries?: string[];
}

// Default auth state for testing
const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (
  ui: ReactElement,
  {
    authState = {},
    initialEntries = ['/'],
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  // Merge default and provided auth state
  const mergedAuthState: AuthState = {
    ...defaultAuthState,
    ...authState,
    ...(authState.user ? { isAuthenticated: true } : {}),
  };

  // Create a wrapper component with all necessary providers
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider initialState={mergedAuthState}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';

// Export our custom render function
export { customRender as render };