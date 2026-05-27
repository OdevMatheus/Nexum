import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from '../services/clientService'
import type { CreateClientRequest, UpdateClientRequest } from '../types/client'

export const useClients = (page = 0, size = 10, search?: string) => {
    return useQuery({
        queryKey: ['clients', page, size, search],
        queryFn: () => clientService.findAll(page, size, search),
    })
}

export const useClient = (id: string) => {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: () => clientService.findById(id),
        enabled: !!id,
    })
}

export const useCreateClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateClientRequest) => clientService.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    })
}

export const useUpdateClient = (id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateClientRequest) => clientService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    })
}

export const useDeactivateClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => clientService.deactivate(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    })
}