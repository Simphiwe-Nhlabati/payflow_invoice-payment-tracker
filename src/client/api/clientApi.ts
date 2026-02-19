import api from './api';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ClientFilters {
  search?: string;
}

export interface ClientsResponse {
  success: boolean;
  message: string;
  data: {
    clients: Client[];
  };
}

export interface SingleClientResponse {
  success: boolean;
  message: string;
  data: {
    client: Client;
  };
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  vatNumber?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {}

export const clientApi = {
  getAll: (filters?: ClientFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    return api.get<ClientsResponse>('/clients', { params });
  },

  getById: (id: string) => {
    return api.get<SingleClientResponse>(`/clients/${id}`);
  },

  create: (clientData: CreateClientData) => {
    return api.post<SingleClientResponse>('/clients', clientData);
  },

  update: (id: string, clientData: UpdateClientData) => {
    return api.put<SingleClientResponse>(`/clients/${id}`, clientData);
  },

  delete: (id: string) => {
    return api.delete(`/clients/${id}`);
  },
};