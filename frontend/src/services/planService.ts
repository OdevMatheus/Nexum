import api from './authService'
import type { CreatePlanRequest, UpdatePlanRequest, PlanResponse } from '../types/plan'
import type { PageResponse } from '../types/client'

export const planService = {
    findAll: async (page = 0, size = 10, search?: string, active?: boolean): Promise<PageResponse<PlanResponse>> => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (search) params.append('search', search)
        if (active !== undefined) params.append('active', String(active))
        const response = await api.get<PageResponse<PlanResponse>>(`/v1/plans?${params}`)
        return response.data
    },

    findById: async (id: string): Promise<PlanResponse> => {
        const response = await api.get<PlanResponse>(`/v1/plans/${id}`)
        return response.data
    },

    create: async (data: CreatePlanRequest): Promise<PlanResponse> => {
        const response = await api.post<PlanResponse>('/v1/plans', data)
        return response.data
    },

    update: async (id: string, data: UpdatePlanRequest): Promise<PlanResponse> => {
        const response = await api.put<PlanResponse>(`/v1/plans/${id}`, data)
        return response.data
    },

    toggleStatus: async (id: string): Promise<PlanResponse> => {
        const response = await api.patch<PlanResponse>(`/v1/plans/${id}/status`)
        return response.data
    },
}