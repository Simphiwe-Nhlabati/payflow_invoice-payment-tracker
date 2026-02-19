import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User } from '../../types/models';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthAction {
  type: string;
  payload?: any;
}

interface AuthContextType {
  state: AuthState;
  login: (userData: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer to handle auth state changes
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export interface AuthProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AuthState>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialState: propsInitialState = {} }) => {
  const [state, dispatch] = useReducer(authReducer, { ...initialState, ...propsInitialState });

  // Check for existing tokens on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('userData');

        if (accessToken && refreshToken && userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            dispatch({
              type: 'LOGIN',
              payload: {
                user: parsedUserData,
                accessToken,
                refreshToken,
              },
            });
          } catch (error) {
            console.error('Failed to parse user data from localStorage:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        // Handle any errors during initialization
        console.error('Error during auth initialization:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: { user: User; accessToken: string; refreshToken: string }) => {
    const { user, accessToken, refreshToken } = userData;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
        accessToken,
        refreshToken,
      },
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const value = {
    state,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};