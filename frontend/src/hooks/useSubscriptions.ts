import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionService } from '../services/subscriptionService'
import type { CreateSubscriptionRequest } from '../types/subscription'

export const useSubscriptions = (page: number = 0, size: number = 10, search?: string, status?: string, clientId?: string, planId?: string) => {
    return useQuery({
        queryKey: ['subscriptions', page, size, search, status, clientId, planId],
        queryFn: () => subscriptionService.findAll(page, size, search, status, clientId, planId),
    })
}

export const useSubscription = (id: string) => {
    return useQuery({
        queryKey: ['subscription', id],
        queryFn: () => subscriptionService.findById(id),
        enabled: !!id,
    })
}

export const useSubscriptionCycles = (id: string) => {
    return useQuery({
        queryKey: ['subscription-cycles', id],
        queryFn: () => subscriptionService.getCycles(id),
        enabled: !!id,
    })
}

export const useCreateSubscription = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateSubscriptionRequest) => subscriptionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            queryClient.invalidateQueries({ queryKey: ['subscription-cycles'] })
        },
    })
}

export const useCancelSubscription = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => subscriptionService.cancel(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            queryClient.invalidateQueries({ queryKey: ['subscription', id] })
        },
    })
}

export const useReactivateSubscription = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => subscriptionService.reactivate(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            queryClient.invalidateQueries({ queryKey: ['subscription', id] })
        },
    })
}
