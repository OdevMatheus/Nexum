import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planService } from '../services/planService'
import type { CreatePlanRequest, UpdatePlanRequest } from '../types/plan'

export const usePlans = (page = 0, size = 10, search?: string, active?: boolean) => {
    return useQuery({
        queryKey: ['plans', page, size, search, active],
        queryFn: () => planService.findAll(page, size, search, active),
    })
}

export const usePlan = (id: string) => {
    return useQuery({
        queryKey: ['plans', id],
        queryFn: () => planService.findById(id),
        enabled: !!id,
    })
}

export const useCreatePlan = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreatePlanRequest) => planService.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
    })
}

export const useUpdatePlan = (id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdatePlanRequest) => planService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
    })
}

export const useTogglePlanStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => planService.toggleStatus(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
    })
}