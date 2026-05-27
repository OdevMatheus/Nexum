import api from './authService'
import type {
    CreateClientRequest,
    UpdateClientRequest,
    ClientResponse,
    PageResponse,
} from '../types/client'
import type { MessageResponse } from '../types/auth'

export const clientService = {
    findAll: async (page = 0, size = 10, search?: string): Promise<PageResponse<ClientResponse>> => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) params.append('search', search)
        const response = await api.get<PageResponse<ClientResponse>>(`/v1/clients?${params}`)
        return response.data
    },

    findById: async (id: string): Promise<ClientResponse> => {
        const response = await api.get<ClientResponse>(`/v1/clients/${id}`)
        return response.data
    },

    create: async (data: CreateClientRequest): Promise<ClientResponse> => {
        const response = await api.post<ClientResponse>('/v1/clients', data)
        return response.data
    },

    update: async (id: string, data: UpdateClientRequest): Promise<ClientResponse> => {
        const response = await api.put<ClientResponse>(`/v1/clients/${id}`, data)
        return response.data
    },

    deactivate: async (id: string): Promise<MessageResponse> => {
        const response = await api.delete<MessageResponse>(`/v1/clients/${id}`)
        return response.data
    },
}