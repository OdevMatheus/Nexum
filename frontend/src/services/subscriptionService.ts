import api from './authService'
import type { Subscription, SubscriptionCycle, CreateSubscriptionRequest } from '../types/subscription'
import type { PageResponse } from '../types/client'

export interface SubscriptionFilters {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    clientId?: string;
    planId?: string;
    startDateFrom?: string;
    startDateTo?: string;
    nextDueDateFrom?: string;
    nextDueDateTo?: string;
}

export const subscriptionService = {
    findAll: async (filters: SubscriptionFilters = {}) => {
        const {
            page = 0,
            size = 10,
            search,
            status,
            clientId,
            planId,
            startDateFrom,
            startDateTo,
            nextDueDateFrom,
            nextDueDateTo
        } = filters;

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        })
        
        if (search) params.append('search', search)
        if (status) params.append('status', status)
        if (clientId) params.append('clientId', clientId)
        if (planId) params.append('planId', planId)
        if (startDateFrom) params.append('startDateFrom', startDateFrom)
        if (startDateTo) params.append('startDateTo', startDateTo)
        if (nextDueDateFrom) params.append('nextDueDateFrom', nextDueDateFrom)
        if (nextDueDateTo) params.append('nextDueDateTo', nextDueDateTo)

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

    pay: async (id: string) => {
        const response = await api.post<Subscription>(`/v1/subscriptions/${id}/pay`)
        return response.data
    },

    getCycles: async (id: string) => {
        const response = await api.get<SubscriptionCycle[]>(`/v1/subscriptions/${id}/cycles`)
        return response.data
    }
}
