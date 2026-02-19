import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export const authApi = {
  register: (userData: RegisterData) => {
    return api.post<AuthResponse>('/auth/register', userData);
  },

  login: (credentials: LoginCredentials) => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  getProfile: () => {
    return api.get<ProfileResponse>('/auth/profile');
  },

  updateProfile: (updateData: UpdateProfileData) => {
    return api.put<ProfileResponse>('/auth/profile', updateData);
  },

  logout: () => {
    return api.post('/auth/logout');
  },
};