import api from './authService'
import type { Subscription, SubscriptionCycle, CreateSubscriptionRequest } from '../types/subscription'
import type { PageResponse } from '../types/client'

export const subscriptionService = {
    findAll: async (page: number = 0, size: number = 10, search?: string, status?: string, clientId?: string, planId?: string) => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        })
        
        if (search) params.append('search', search)
        if (status) params.append('status', status)
        if (clientId) params.append('clientId', clientId)
        if (planId) params.append('planId', planId)

        const response = await api.get<PageResponse<Subscription>>(`/v1/subscriptions?${params.toString()}`)
        return response.data
    },

    findById: async (id: string) => {
        const response = await api.get<Subscription>(`/v1/subscriptions/${id}`)
        return response.data
    },

    create: async (data: CreateSubscriptionRequest) => {
        const response = await api.post<Subscription>('/v1/subscriptions', data)
        return response.data
    },

    cancel: async (id: string) => {
        const response = await api.patch<Subscription>(`/v1/subscriptions/${id}/cancel`)
        return response.data
    },

    reactivate: async (id: string) => {
        const response = await api.patch<Subscription>(`/v1/subscriptions/${id}/reactivate`)
        return response.data
    },

    getCycles: async (id: string) => {
        const response = await api.get<SubscriptionCycle[]>(`/v1/subscriptions/${id}/cycles`)
        return response.data
    }
}
